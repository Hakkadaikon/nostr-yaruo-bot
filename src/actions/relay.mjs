import * as nostrTool from "nostr-tools";
import { nip19 } from "nostr-tools";
import * as time from "../utils/time.mjs";
import * as logger from "../utils/logger.mjs";
import "websocket-polyfill";

/**
 * @summary Relay object.
 */
let relay = null;

/**
 * @summary Private key in hex string in nostr.
 */
let botPrivateKeyHex = null;

/**
 * @summary Relay URL.
 */
let relayUrl = null;

/**
 * @summary Get subscribe filter.
 */
const getFilter = () => {
  const filters = [];
  // Reply
  filters.push({
    "#p": [nostrTool.getPublicKey(botPrivateKeyHex)],
    kinds: [1],
    limit: 10,
  });

  // mention (@)
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
export function isInit() {
  return relay !== null;
}

/**
 * @summary Initialize relay object.
 */
export function init(relayUrl, prikey) {
  logger.debug("init start!");

  botPrivateKeyHex = prikey;

  relay = nostrTool.relayInit(relayUrl);
  relay.on('connect', () => {
    logger.info(`Relay connected to ${relay.url}`);
  });
  relay.on('error', () => {
    logger.error(`Relay encountered error!! ${relay.url}`);
    process.exit(1);
  });
  relay.on('disconnect', () => {
    logger.info(`Relay is disconnected. ${relay.url}`);
    process.exit(1);
  });

  logger.debug("init success!");
  return true;
}

/**
 * @summary Reconnect to relay.
 */
export async function reconnect() {
  if (!isInit()) {
    logger.debug("[reconnect] reconnect start!");
    relay = nostrTool.relayInit(relayUrl);
    relay.on("error", () => {
      logger.error("Failed to reconnect. (relayInit)");
      finalize();
      return false;
    });
  }

  if (!(await relay.connect())) {
    return false;
  }

  logger.info("[reconnect] Reconnected to relay.");
  return true;
}

/**
 * @summary Connect to relay.
 */
export async function connect() {
  if (!isInit()) {
    logger.error("[connect] Relay is not initialized.");
    return false;
  }

  logger.debug("connect start!");
  await relay.connect();
  logger.info("[connect] Connected to relay.");
  return true;
}

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

      const myPubKey = nip19.npubEncode(
        nostrTool.getPublicKey(botPrivateKeyHex)
      );

      //logger.debug("myPubKey:" + myPubKey);
      if (ev.content.indexOf("nostr:" + myPubKey) < 0) {
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
export function subscribe(callback) {
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
}

/**
 * @summary Publish event to relay.
 */
export function publish(ev) {
  if (!isInit()) {
    logger.error("[publish] Relay is not initialized.");
    if (!relay.reconnect()) {
      return;
    }
  }

  const pub = relay.publish(ev);
  pub.on("ok", () => {
    logger.info("[publish] Success! : ");
    logger.info(JSON.stringify(ev));
  });
  pub.on("failed", (reason) => {
    logger.info(`[publish] Failed. : ${reason}`);
  });
}
