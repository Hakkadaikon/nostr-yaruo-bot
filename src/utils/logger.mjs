/**
 * @summary Log output for debugging
 */
export const debug = (msg) => {
  console.log("debug: " + msg);
};

/**
 * @summary Log output for information
 */
export function info(msg) {
  console.log("info : " + msg);
}

/**
 * @summary Log output for warnings
 */
export function warn(msg) {
  console.warn("warn : " + msg);
}

/**
 * @summary Log output for errors
 */
export function error(msg) {
  console.error("error: " + msg);
}
