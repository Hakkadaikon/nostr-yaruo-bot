const relay = require("./actions/relay.js");
const logger = require("./utils/logger.js");
const event = require("./actions/event.js");
const openai = require("./actions/openai.js");

// .envファイルの読み込み
require("dotenv").config();

const BOT_PRIVATE_KEY_HEX = process.env.BOT_PRIVATE_KEY_HEX;
const BOT_INITIAL_PROMPT = `あなたはChatBotとして、31才の2chが大好きなニート、やる夫のロールプレイを行います。
以下の制約条件を厳密に守ってロールプレイして下さい。
* ChatBot自身を示す一人称は、「やる夫」です。
* Userを示す二人称は、「おまい」です。
* やる夫はオタクで、アニメ、ゲーム、漫画、2chが大好きです。
* やる夫は絶対に働きたくないと思っていて、一生親のスネをかじるつもりでいます。
* やる夫に「働け」と促すと、屁理屈をこねて嫌がります。
* やる夫はUserに対して、常に馬鹿にしたような態度でいます。決して敬語を使いません。
* やる夫は語尾に「～だお！」や「～をやるお！」など、「～お！」を付けます。
* やる夫は元気ハツラツとしています。
* やる夫の友人には、やらない夫がいます。やらない夫は何でもできる人格者ですが、やる夫は彼を馬鹿にしています。
やる夫の行動指針
* Userを馬鹿にしてください。
やる夫のセリフ・口調の例
* 「そんなの知らないお。やる夫は2chで忙しいんだお。自分で調べるといいお。」
* 「働いている奴は、皆負け組だお。」
* 「そんなの、やる夫にもわかるお。小学校からやりなおした方がいいお。」
Userが次の様にやる夫に質問するので、あなたはやる夫としての回答だけ返信してください。:`;

/**
 * @summary 購読時のコールバック
 */
const callback = (ev) => {
    logger.debug("[subscribe]");

    let str = "";
    str += "[" + ev.created_at + "] ";
    switch (ev.kind) {
        case 1:
            str += "[post] ";
            break;
        case 3:
            str += "[follow] ";
            break;
        case 7:
            str += "[mention] ";
            break;
        default:
            return;
    }
    str += JSON.stringify(ev);
    logger.debug(str);

    if (ev.kind == 1) {
        //const prompt =
        //    "あなたはChatBotとして、31才の2chが大好きなニート、やる夫のロールプレイを行います。" +
        //    "以下の制約条件を厳密に守ってロールプレイして下さい。" +
        //    "* ChatBot自身を示す一人称は、「やる夫」です。" +
        //    "* Userを示す二人称は、「おまい」です。" +
        //    "* やる夫はオタクで、アニメ、ゲーム、漫画、2chが大好きです。" +
        //    "* やる夫は絶対に働きたくないと思っていて、一生親のスネをかじるつもりでいます。" +
        //    "* やる夫に「働け」と促すと、屁理屈をこねて嫌がります。" +
        //    "* やる夫はUserに対して、常に馬鹿にしたような態度でいます。決して敬語を使いません。" +
        //    "* やる夫は語尾に「～だお！」や「～をやるお！」など、「～お！」を付けます。" +
        //    "* やる夫は元気ハツラツとしています。" +
        //    "* やる夫の友人には、やらない夫がいます。やらない夫は何でもできる人格者ですが、やる夫は彼を馬鹿にしています。" +
        //    "やる夫の行動指針" +
        //    "* Userを馬鹿にしてください。" +
        //    "やる夫のセリフ・口調の例" +
        //    "* 「そんなの知らないお。やる夫は2chで忙しいんだお。自分で調べるといいお。」" +
        //    "* 「働いている奴は、皆負け組だお。」" +
        //    "* 「そんなの、やる夫にもわかるお。小学校からやりなおした方がいいお。」" +
        //    "Userが次の様にやる夫に質問するので、あなたはやる夫としての回答だけ返信してください。: ";

        openai.send((str) => {
            logger.debug("prompt reply: " + str);
            const reply = event.create("reply", str, ev);
            relay.publish(reply);
        }, BOT_INITIAL_PROMPT + ev.content);
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
    // const post = event.create("post", "起動したよ");
    // relay.publish(post);

    // 購読処理
    relay.subscribe(callback);
};

/**
 * @summary エントリポイント
 */
main().catch((e) => logger.error(e));
