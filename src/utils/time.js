/**
 * @summary 現在のUNIX時間を取得する
 */
const currUnixTime = () => {
  return Math.floor(Date.now() / 1000);
};

/**
 * @summary 返信のクールタイム
 */
const COOL_TIME_DUR_SEC = 10;

/**
 * @summary 最後に返信した時間
 */
const lastReplyTimePerId = new Map();

/**
 * @summary BOTの起動時間
 */
const initTime = currUnixTime();

/**
 * @summary 返信してから一定時間超えたかを確認する
 */
const passedReplyCoolTime = (id) => {
  const now = currUnixTime();
  const lastReplyTime = lastReplyTimePerId.get(id);
  if (lastReplyTime === undefined) {
    lastReplyTimePerId.set(id, now);
    return true;
  }

  if (now - lastReplyTime > COOL_TIME_DUR_SEC) {
    lastReplyTimePerId.set(id, now);
    return true;
  }

  return false;
};

/**
 * @summary 対象のイベントがbotの起動後より新しいイベントかどうかを判定する
 */
const isNewEvent = (eventTime) => {
  if (initTime > eventTime) {
    return false;
  }
  return true;
};

module.exports = {
  initTime,
  currUnixTime,
  passedReplyCoolTime,
  isNewEvent,
};
