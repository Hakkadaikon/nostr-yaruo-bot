const logger = require("./utils/logger.js");
const command = require("./commands/command.js");

/**
 * @summary メイン処理
 */
const main = async () => {
  await command.init();
};

/**
 * @summary エントリポイント
 */
main().catch((e) => logger.error(e));
