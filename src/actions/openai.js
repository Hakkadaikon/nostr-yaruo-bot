const { Configuration, OpenAIApi } = require("openai");
config = require("../utils/config.js");

const configuration = new Configuration({
  apiKey: config.BOT_OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * @summary OpenAIのChatGPTを使って、promptに対する応答を返す
 */
const send = async (callback, prompt) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    //model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
  });

  // 生成された応答文章をコールバックに渡す
  callback(completion.data.choices[0].message.content.trim());
};

// テスト用
//send((str) => {
//    console.log(str);
//}, "ChatGPTについて教えてください。");

module.exports = {
  send,
};
