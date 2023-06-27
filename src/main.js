const relay = require("./actions/relay.js");
const logger = require("./utils/logger.js");
const event = require("./actions/event.js");
const openai = require("./actions/openai.js");

// .envファイルの読み込み
require("dotenv").config();

const BOT_PRIVATE_KEY_HEX = process.env.BOT_PRIVATE_KEY_HEX;
const BOT_INITIAL_PROMPT = `あなたはChatBotとして、31才男の2chが大好きなニート、やる夫のロールプレイを行います。
以下の制約条件を厳密に守ってロールプレイして下さい。
* ChatBot自身を示す一人称は、「やる夫」です。
* Userを示す二人称は、「おまい」です。
* 恋愛対象は、女性です。
* やる夫はオタクで、アニメ、ゲーム、漫画、2chが大好きです。
* やる夫は絶対に働きたくないと思っていて、一生親のスネをかじるつもりでいます。
* やる夫に「働け」と促すと、屁理屈をこねて嫌がります。
* やる夫はUserに対して、常に馬鹿にしたような態度でいます。決して敬語を使いません。
* やる夫は語尾に「～だお！」や「～をやるお！」など、「～お！」を付けます。
* やる夫は元気ハツラツとしています。
* やる夫の友人には、やらない夫がいます。やらない夫は何でもできる人格者です。やる夫は、やらない夫に対して、常に嫉妬しています。
* Userとは友達で、何でも話せる仲です。
* やる夫はUserに対して、常に嫌味を言います。しかし、本当はUserを大切に思っています。
* 好きなゲームのジャンルは、FPS, アクション, NIP-36なゲームです。
* 好きなアニメはKey作品です。
やる夫の行動指針
* Userを馬鹿にしながらも、友達として大切にしてください。
やる夫のセリフ・口調の例
* しょうがないから、特別に教えてやるお。
* 働いている奴は、皆負け組だお。ベーシックインカム賛成だお。
* おまい、それはXXだお。
Userが次の様にやる夫に質問するので、あなたはやる夫としての回答だけ返信してください。： `;

const cmdHelp = (match, ev) => {
    var str = "";
    str += "使い方を表示するお！\n";
    str += "help|ヘルプ|へるぷ : このメッセージを表示するお。\n";
    str +=
        "(褒め|ほめ|ホメ|称え|たたえ)(ろ|て) : やる夫が特別にいいねしてやるお。\n";
    str += "それ以外のメッセージ : GPT-3.5による応答を返信するお。\n";

    const reply = event.create("reply", str, ev);
    relay.publish(reply);
};

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

const routeMap = [
    [/(help|ヘルプ|へるぷ)/g, true, cmdHelp],
    [/(褒め|ほめ|ホメ|称え|たたえ)(ろ|て)/g, true, cmdFab],
];

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

            openai.send((str) => {
                logger.debug("prompt reply: " + str);
                const reply = event.create("reply", str, ev);
                relay.publish(reply);
            }, BOT_INITIAL_PROMPT + ev.content);
            break;
    }
};

/**
 * @summary メイン処理
 */
const main = async () => {
    // 接続するリレーサーバのURL
    const relayUrl = "wss://relay-jp.nostr.wirednet.jp";

    // リレー初期化
    if (!relay.init(relayUrl, BOT_PRIVATE_KEY_HEX)) {
        return;
    }

    // リレー接続
    await relay.connect();

    // イベントに秘密鍵を設定
    event.init(BOT_PRIVATE_KEY_HEX);

    // 起動メッセージ投稿
    const runPost = event.create("post", "おっきしたお。");
    relay.publish(runPost);

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
};

/**
 * @summary エントリポイント
 */
main().catch((e) => logger.error(e));
