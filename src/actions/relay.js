const nostrTool = require("nostr-tools");
const time = require("../utils/time.js");
const logger = require("../utils/logger.js");
require("websocket-polyfill");

/**
 * @summary リレーオブジェクト
 */
let relay = null;

/**
 * @summary BOTの秘密鍵
 */
let botPrivateKeyHex = null;

/**
 * @summary 購読用のフィルターを取得
 */
const getFilter = () => {
  const filters = [];

  // 自分への返信
  filters.push({
    "#p": [nostrTool.getPublicKey(botPrivateKeyHex)],
    kinds: [1],
    limit: 10,
  });

  // 自分への@投稿
  filters.push({
    "#t": [nostrTool.getPublicKey(botPrivateKeyHex)],
    kinds: [1],
    limit: 10,
  });

  logger.debug("filters:" + JSON.stringify(filters));
  return filters;
};

/**
 * @summary リレーオブジェクトの後始末処理
 */
const finalize = () => {
  if (relay) {
    relay.close();
    relay = null;
  }
};

/**
 * @summary リレーオブジェクトの初期化有無を確認
 */
const isInit = () => {
  return relay !== null;
};

/**
 * @summary リレーを初期化する
 */
const init = (relayUrl, prikey) => {
  logger.debug("init start!");

  // 秘密鍵を退避
  botPrivateKeyHex = prikey;

  // リレー初期化
  relay = nostrTool.relayInit(relayUrl);
  relay.on("error", (e) => {
    logger.error("Failed to init. : " + e);
    finalize();
    return false;
  });

  logger.debug("init success!");
  return true;
};

/**
 * @summary リレーに接続する
 */
const connect = async () => {
  if (!isInit()) {
    logger.error("[connect] Relay is not initialized.");
    return false;
  }

  logger.debug("connect start!");
  await relay.connect();
  logger.info("[connect] Connected to relay.");
};

/**
 * @summary 購読対象のイベントかどうかを判定する
 */
const matchEvent = (ev) => {
  switch (ev.kind) {
    case 1: // ポスト
      // 対象イベントがbotの起動後より新しいイベントかどうか
      if (!time.isNewEvent(ev.created_at)) {
        return false;
      }

      // 対象先へのイベントの送信から一定時間経過しているかどうか
      if (!time.passedReplyCoolTime(ev.pubkey)) {
        return false;
      }

      return true;
    case 7: // メンション
      // 対象イベントがbotの起動後より新しいイベントかどうか
      if (!time.isNewEvent(ev.created_at)) {
        return false;
      }

      // 対象先へのイベントの送信から一定時間経過しているかどうか
      if (!time.passedReplyCoolTime(ev.pubkey)) {
        return false;
      }

      return true;

    case 3: // フォロー
      // 対象イベントがbotの起動後より新しいイベントかどうか
      if (!time.isNewEvent(ev.created_at)) {
        return false;
      }

      return true;
  }

  return false;
};

/**
 * @summary リレーからイベントを購読する
 */
const subscribe = (callback) => {
  if (!isInit()) {
    logger.error("[subscribe] Relay is not initialized.");
    return;
  }

  // 購読開始
  const sub = relay.sub(getFilter());
  sub.on("event", (ev) => {
    if (!matchEvent(ev)) {
      return;
    }

    callback(ev);
  });
};

/**
 * @summary イベントを配信する
 */
const publish = (ev) => {
  if (!isInit()) {
    logger.error("[publish] Relay is not initialized.");
    return;
  }

  const pub = relay.publish(ev);
  pub.on("ok", () => {
    logger.info("[publish] Success! : ");
    logger.info(JSON.stringify(ev));
  });
  pub.on("failed", () => {
    logger.info("[publish] Failed.");
  });
};

module.exports = {
  isInit,
  init,
  connect,
  subscribe,
  publish,
};
