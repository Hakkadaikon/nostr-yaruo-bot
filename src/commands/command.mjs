import * as env from "dotenv";
import * as cron from "node-cron";
import * as logger from "../utils/logger.mjs";
import * as config from "../utils/config.mjs";
import * as openai from "../actions/openai.mjs";
import * as event from "../actions/event.mjs";
import * as relay from "../actions/relay.mjs";
import * as news from "../actions/news.mjs";
env.config();

/**
 * @summary Show help message
 */
const cmdHelp = (match, ev) => {
  var str = "";
  str += "使い方を表示するお！\n";
  str += "help|ヘルプ|へるぷ : このメッセージを表示するお。\n";
  str +=
    "(褒め|ほめ|ホメ|称え|たたえ)(ろ|て) : やる夫が特別にいいねしてやるお。\n";
  str += "[/(ニュース|News|NEWS|news) : ゲーム関連のニュースを表示するお。\n";
  str += "それ以外のメッセージ : GPT-3.5による応答を返信するお。\n";

  const reply = event.create("reply", str, ev);
  relay.publish(reply);
};

/**
 * @summary Fav to the specified post
 */
const cmdFav = (match, ev) => {
  const reply = event.create(
    "reply",
    "おまいはよく頑張ったお。特別に、やる夫がいいねしてやるお。",
    ev
  );
  relay.publish(reply);

  const reaction = event.create("reaction", "+", ev);
  relay.publish(reaction);
};

/**
 * @summary Array of news URLs once posted
 */
const publishedNewsUrls = [];

/**
 * @summary Post a news review
 */
const cmdNews = async (callback) => {
  const postCallback = (thoughts, news, callback) => {
    const outStr = (label, value) => {
      return label + " :\n" + value + "\n";
    };

    const responseStr =
      thoughts +
      "\n\n" +
      outStr(config.NEWS_TITLE_LABEL, news["title"]) +
      outStr(config.NEWS_DESCRIPTION_LABEL, news["description"]) +
      outStr(config.NEWS_URL_LABEL, news["url"]);

    callback(responseStr);
  };

  await news.getGameNews(async (newsList) => {
    if (newsList.length == 0) {
      return;
    }

    let retryCount = 0;
    let completed = false;
    while (!completed && retryCount < 5) {
      logger.debug("retryCount:" + retryCount);
      retryCount++;

      const selectedNews = news.selectNewsRetry(newsList, publishedNewsUrls);
      publishedNewsUrls.push(selectedNews["url"]);
      logger.debug("selectedNews:" + JSON.stringify(selectedNews));

      const prompt = config.BOT_INITIAL_PROMPT + config.BOT_NEWS_PROMPT;

      await news.getNewsContent(selectedNews["url"], async (content) => {
        logger.debug("get news content");
        if (!news.validateNewsContent(content)) {
          logger.warn("content contains ng words.");
          return;
        }

        await openai.send((thoughts) => {
          if (!news.validateNewsThoughts(thoughts)) {
            logger.warn("thoughts contains ng words.");
            return;
          }

          postCallback(thoughts, selectedNews, callback);
          logger.info("Send completed!");
          completed = true;
        }, prompt + content);
      });
    }
  });
};

/**
 * @summary Post a news review
 */
const cmdNewsPost = () => {
  cmdNews((str) => {
    const post = event.create("post", str);
    relay.publish(post);
  });
};

/**
 * @summary Reply a news review
 */
const cmdNewsReply = (match, ev) => {
  cmdNews((str) => {
    const reply = event.create("reply", str, ev);
    relay.publish(reply);
  });
};

/**
 * @summary Command Regex and callback correspondence table
 */
const routeMap = [
  [/(help|ヘルプ|へるぷ)/g, true, cmdHelp],
  [/(褒め|ほめ|ホメ|称え|たたえ)(ろ|て)/g, true, cmdFav],
  [/(ニュース|News|NEWS|news)/g, true, cmdNewsReply],
];

/**
 * @summary Reply the response by OpenAI
 */
const cmdOpenAI = (ev) => {
  openai.send((str) => {
    logger.debug("prompt reply: " + str);
    const reply = event.create("reply", str, ev);
    relay.publish(reply);
  }, config.BOT_INITIAL_PROMPT + config.BOT_REPLY_PROMPT + ev.content);
};

/**
 * @summary Subscribe callback
 */
const callback = (ev) => {
  logger.debug("[subscribe]");
  logger.debug(JSON.stringify(ev));

  switch (ev.kind) {
    case 1:
      for (const [regex, enabled, routeCallback] of routeMap) {
        if (!enabled) {
          continue;
        }

        const match = ev.content.match(regex);
        if (match) {
          routeCallback(match, ev);
          return;
        }
      }

      cmdOpenAI(ev);
      break;
  }
};

/**
 * @summary Connect to relay.
 */
export async function connect() {
  const relayUrl = "wss://relay-jp.nostr.wirednet.jp";

  // Initialize relay
  if (!relay.init(relayUrl, config.BOT_PRIVATE_KEY_HEX)) {
    return;
  }

  await relay.connect();
}

/**
 * @summary Perform relay connection processing and event initialization
 */
export async function init() {
  await connect();

  event.init(config.BOT_PRIVATE_KEY_HEX);

  // Post a startup message
  const runPost = event.create("post", "おっきしたお。");
  relay.publish(runPost);

  // Post a news review every 30 minutes
  cron.schedule("0,30 * * * *", () => cmdNewsPost());

  process.on("SIGINT", () => {
    logger.info("SIGINT");
    const exitPost = event.create("post", "寝るお。(SIGINT)");
    relay.publish(exitPost);
    process.exit(0);
  });

  process.on("SIGHUP", () => {
    logger.info("SIGHUP");
    const exitPost = event.create("post", "寝るお。(SIGHUP)");
    relay.publish(exitPost);
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM");
    const exitPost = event.create("post", "寝るお。(SIGTERM)");
    relay.publish(exitPost);
    process.exit(0);
  });

  relay.subscribe(callback);

  // Post news review on startup
  cmdNewsPost();
}
