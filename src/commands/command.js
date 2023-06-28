require("dotenv").config();

const logger = require("../utils/logger.js");
const config = require("../utils/config.js");
const openai = require("../actions/openai.js");
const event = require("../actions/event.js");
const relay = require("../actions/relay.js");
const news = require("../actions/news.js");

/**
 * @summary 使い方を表示する
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
 * @summary 指定された投稿にリプライ + メンションする
 */
const cmdFab = (match, ev) => {
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
 * @summary ニュースの内容を取得する
 */
const getNewsContent = (newsurl, callback) => {
  const axios = require("axios");
  const { JSDOM } = require("jsdom");
  const { Readability } = require("@mozilla/readability");

  axios
    .get(newsurl)
    .then(function (r2) {
      let dom = new JSDOM(r2.data, { url: newsurl });
      let article = new Readability(dom.window.document).parse();
      //logger.debug("document:" + JSON.stringify(dom.window.document));
      //logger.debug("article:" + article.textContent);
      callback(article.textContent);
    })
    .catch(function (error) {
      logger.error("Failed news summary error.");
      if (error.response) {
        logger.error("Error response.");
        logger.error("- data   :" + error.response.data);
        logger.error("- status :" + error.response.status);
        logger.error("- headers:" + error.response.headers);
      } else if (error.request) {
        logger.error("Not response.");
        logger.error("- request:" + error.request);
      } else {
        logger.error("Other error.");
        logger.error("- message:" + error.message);
      }
    });
};

const cmdNews = (callback) => {
  news.getGameNews((news) => {
    const prompt = config.BOT_INITIAL_PROMPT + config.BOT_NEWS_PROMPT;
    if (news.length == 0) {
      return;
    }

    const arrayMax = news.length - 1;
    const arrayMin = 0;
    const arrayNo =
      Math.floor(Math.random() * (arrayMax + 1 - arrayMin)) + arrayMin;
    latestNews = news[arrayNo];

    // 記事の内容を取得
    getNewsContent(latestNews["url"], (content) => {
      // 記事の内容から要約を取得
      openai.send((str) => {
        const responseStr =
          str +
          "\n\n" +
          "タイトル：[" +
          latestNews["title"] +
          "]\n" +
          "概要：\n" +
          latestNews["description"] +
          "\n" +
          "URL：\n" +
          latestNews["url"];

        //logger.debug("response: " + responseStr);
        callback(responseStr);
        //const reply = event.create("reply", replyStr, ev);
        //relay.publish(reply);
      }, prompt + content);
    });
  });
};

const cmdNewsPost = () => {
  cmdNews((str) => {
    const post = event.create("post", str);
    relay.publish(post);
  });
};

/**
 * @summary 最新ニュースの感想を返信する
 */
const cmdNewsReply = (match, ev) => {
  cmdNews((str) => {
    const reply = event.create("reply", str, ev);
    relay.publish(reply);
  });
};

/**
 * @summary コマンドのregexとcallbackのMap
 */
const routeMap = [
  [/(help|ヘルプ|へるぷ)/g, true, cmdHelp],
  [/(褒め|ほめ|ホメ|称え|たたえ)(ろ|て)/g, true, cmdFab],
  [/(ニュース|News|NEWS|news)/g, true, cmdNewsReply],
];

/**
 * @summary GPT-3.5による応答を返信する
 */
const cmdOpenAI = (ev) => {
  openai.send((str) => {
    logger.debug("prompt reply: " + str);
    const reply = event.create("reply", str, ev);
    relay.publish(reply);
  }, config.BOT_INITIAL_PROMPT + ev.content);
};

/**
 * @summary 購読時のコールバック
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

      // コマンドにマッチしなかった場合は、GPT-3.5による応答を返信する
      cmdOpenAI(ev);
      break;
  }
};

/**
 * @summary リレーとイベントを設定
 */
const init = async () => {
  // 接続するリレーサーバのURL
  const relayUrl = "wss://relay-jp.nostr.wirednet.jp";

  // リレー初期化
  if (!relay.init(relayUrl, config.BOT_PRIVATE_KEY_HEX)) {
    return;
  }

  // リレー接続
  await relay.connect();

  // イベントに秘密鍵を設定
  event.init(config.BOT_PRIVATE_KEY_HEX);

  // 起動メッセージ投稿
  const runPost = event.create("post", "おっきしたお。");
  relay.publish(runPost);

  // 定期的なニュース投稿
  const cron = require("node-cron");
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

  // 購読処理
  relay.subscribe(callback);

  // 起動時にニュース投稿
  cmdNewsPost();
};

module.exports = {
  init,
};
