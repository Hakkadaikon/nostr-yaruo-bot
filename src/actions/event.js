const nostrTool = require("nostr-tools");
const time = require("../utils/time.js");
const logger = require("../utils/logger.js");
require("websocket-polyfill");

/**
 * @summary Private key in hex string in nostr.
 */
let privateKeyHex = null;

/**
 * @summary Return post event.
 */
const post = (content) => {
  const postEvent = {
    kind: 1,
    content: content,
    tags: [],
    created_at: time.currUnixTime(),
  };

  return nostrTool.finishEvent(postEvent, privateKeyHex);
};

/**
 * @summary Return reaction event.
 */
const reaction = (content, targetEvent) => {
  const reactionEvent = {
    kind: 7,
    content: content,
    tags: [
      ["e", targetEvent.id, ""],
      ["p", targetEvent.pubkey, ""],
    ],
    created_at: time.currUnixTime(),
  };

  return nostrTool.finishEvent(reactionEvent, privateKeyHex);
};

/**
 * @summary Return reply event.
 */
const reply = (content, targetEvent) => {
  const replyEvent = {
    kind: 1,
    content: content,
    tags: [
      ["e", targetEvent.id, ""],
      ["p", targetEvent.pubkey, ""],
    ],
    created_at: time.currUnixTime(),
  };

  return nostrTool.finishEvent(replyEvent, privateKeyHex);
};

/**
 * @summary Initialize event.
 */
const init = (key) => {
  privateKeyHex = key;
};

/**
 * @summary Create event. kind is "post", "reaction", "reply".
 */
const create = (kind, content, event = null) => {
  switch (kind) {
    case "post":
      return post(content);
    case "reaction":
      if (event === null) {
        logger.error("[createEvent] event is null.");
        return null;
      }
      return reaction(content, event);
    case "reply":
      if (event === null) {
        logger.error("[createEvent] event is null.");
        return null;
      }
      return reply(content, event);
  }
  return null;
};

module.exports = {
  init,
  create,
};
