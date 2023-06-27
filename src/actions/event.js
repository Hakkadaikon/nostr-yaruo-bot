const nostrTool = require("nostr-tools");
const time = require("../utils/time.js");
const logger = require("../utils/logger.js");
require("websocket-polyfill");

/**
 * @summary BOTの秘密鍵
 */
let privateKeyHex = null;

/**
 * @summary ポストを行う
 */
const post = (content) => {
  const postEvent = {
    kind: 1,
    content: content,
    tags: [],
    created_at: time.currUnixTime(),
  };

  // イベントID(ハッシュ値)計算・署名
  return nostrTool.finishEvent(postEvent, privateKeyHex);
};

/**
 * @summary リアクションを行う
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

  // イベントID(ハッシュ値)計算・署名
  return nostrTool.finishEvent(reactionEvent, privateKeyHex);
};

/**
 * @summary 特定のイベントに対して返信する
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

  // イベントID(ハッシュ値)計算・署名
  return nostrTool.finishEvent(replyEvent, privateKeyHex);
};

/**
 * @summary イベントを初期化する
 */
const init = (key) => {
  privateKeyHex = key;
};

/**
 * @summary イベントを作成する
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
