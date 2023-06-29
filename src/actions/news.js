const NewsAPI = require("newsapi");
const config = require("../utils/config.js");

/**
 * @summary Get game news from NewsAPI.
 */
const getGameNews = (callback) => {
  // NewsAPI
  const newsapi = new NewsAPI(config.BOT_NEWS_API_KEY);

  newsapi.v2
    .everything({
      q: "ゲーム",
      sortBy: "publishedAt",
    })
    .then((response) => {
      var news = response.articles;
      callback(news);
    });
};

module.exports = {
  getGameNews,
};
