const NewsAPI = require("newsapi");
const config = require("../utils/config.js");

const getGameNews = (callback) => {
    // NewsAPI
    const newsapi = new NewsAPI(config.BOT_NEWS_API_KEY);

    // キーワード検索
    newsapi.v2
        .everything({
            q: "ゲーム",
        })
        .then((response) => {
            var news = response.articles;
            callback(news);
        });
};

module.exports = {
    getGameNews,
};
