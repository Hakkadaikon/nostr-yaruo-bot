const logger = require("./utils/logger.js");
const config = require("./utils/config.js");
const event = require("./actions/event.js");
const relay = require("./actions/relay.js");
const openai = require("./actions/openai.js");
const command = require("./commands/command.js");

/**
 * @summary 購読時のコールバック
 */
const callback = (ev) => {
    logger.debug("[subscribe]");
    logger.debug(JSON.stringify(ev));

    switch (ev.kind) {
        case 1:
            for (const [regex, enabled, routeCallback] of command.routeMap) {
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
            openai.send((str) => {
                logger.debug("prompt reply: " + str);
                const reply = event.create("reply", str, ev);
                relay.publish(reply);
            }, config.BOT_INITIAL_PROMPT + ev.content);
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
