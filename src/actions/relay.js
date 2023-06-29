const nostrTool = require("nostr-tools");
const time = require("../utils/time.js");
const logger = require("../utils/logger.js");
require("websocket-polyfill");

/**
 * @summary Relay object.
 */
let relay = null;

/**
 * @summary Private key in hex string in nostr.
 */
let botPrivateKeyHex = null;

/**
 * @summary Get subscribe filter.
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
 * @summary Finalize relay object.
 */
const finalize = () => {
  if (relay) {
    relay.close();
    relay = null;
  }
};

/**
 * @summary Returns whether or not it has been initialized.
 */
const isInit = () => {
  return relay !== null;
};

/**
 * @summary Initialize relay object.
 */
const init = (relayUrl, prikey) => {
  logger.debug("init start!");

  botPrivateKeyHex = prikey;

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
 * @summary Connect to relay.
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
 * @summary Determine whether the event is a Reply target
 */
const matchEvent = (ev) => {
  //logger.debug(JSON.stringify(ev));
  switch (ev.kind) {
    case 1: // Post
      if (!time.isNewEvent(ev.created_at)) {
        //logger.debug("Not new event.");
        return false;
      }

      if (!time.passedReplyCoolTime(ev.pubkey)) {
        //logger.debug("Not passed reply cool time.");
        return false;
      }

      return true;
    case 7: // Reaction
      if (!time.isNewEvent(ev.created_at)) {
        return false;
      }

      if (!time.passedReplyCoolTime(ev.pubkey)) {
        return false;
      }

      return true;

    case 3: // Follow
      if (!time.isNewEvent(ev.created_at)) {
        return false;
      }

      return true;
  }

  return false;
};

/**
 * @summary Subscribe event from relay.
 */
const subscribe = (callback) => {
  if (!isInit()) {
    logger.error("[subscribe] Relay is not initialized.");
    return;
  }

  // 購読開始
  const sub = relay.sub(getFilter());
  sub.on("event", (ev) => {
    if (matchEvent(ev)) {
      callback(ev);
    }
  });
};

/**
 * @summary Publish event to relay.
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
