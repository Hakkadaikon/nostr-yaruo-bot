/**
 * @summary Log output for debugging
 */
const debug = (msg) => {
  console.log("debug: " + msg);
};

/**
 * @summary Log output for information
 */
const info = (msg) => {
  console.log("info : " + msg);
};

/**
 * @summary Log output for warnings
 */
const warn = (msg) => {
  console.warn("warn : " + msg);
};

/**
 * @summary Log output for errors
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
