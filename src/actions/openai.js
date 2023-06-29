const { Configuration, OpenAIApi } = require("openai");
config = require("../utils/config.js");

const configuration = new Configuration({
  apiKey: config.BOT_OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * @summary Send message to GPT-3.5
 */
const send = async (callback, prompt) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k-0613",
    //model: "gpt-3.5-turbo",
    //model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
  });

  callback(completion.data.choices[0].message.content.trim());
};

module.exports = {
  send,
};
