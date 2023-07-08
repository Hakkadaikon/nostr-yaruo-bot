import { Configuration, OpenAIApi } from "openai";
import * as config from "../utils/config.mjs";
import * as logger from "../utils/logger.mjs";

const configuration = new Configuration({
  apiKey: config.BOT_OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * @summary Send message to GPT-3.5
 */
export async function send(callback, prompt) {
  let str = "";

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k-0613",
      //model: "gpt-3.5-turbo",
      //model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    str += completion.data.choices[0].message.content.trim();
  } catch (e) {
    logger.error(e);
    str += config.BOT_OPENAI_ERROR_PROMPT;
    if (error.response) {
      // str += "\n";
      // str += "\n" + error.response.status;
      // str += "\n" + error.response.data;
    } else {
      str += "\n";
      str += "\n" + error.message;
    }
  }

  callback(str);
}
