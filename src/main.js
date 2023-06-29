const logger = require("./utils/logger.js");
const command = require("./commands/command.js");

/**
 * @summary Main function.
 */
const main = async () => {
  await command.init();
};

/**
 * @summary Entry point.
 */
main().catch((e) => logger.error(e));
