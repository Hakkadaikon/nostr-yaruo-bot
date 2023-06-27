/**
 * @summary デバッグ用のログ出力
 */
const debug = (msg) => {
  console.log("debug: " + msg);
};

/**
 * @summary 情報用のログ出力
 */
const info = (msg) => {
  console.log("info : " + msg);
};

/**
 * @summary 警告用のログ出力
 */
const warn = (msg) => {
  console.warn("warn : " + msg);
};

/**
 * @summary エラー用のログ出力
 */
const error = (msg) => {
  console.error("error: " + msg);
};

module.exports = {
  debug,
  info,
  warn,
  error,
};
