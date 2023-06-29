import NewsAPI from "newsapi";
import * as config from "../utils/config.mjs";

/**
 * @summary Get game news from NewsAPI.
 */
export function getGameNews(callback) {
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
}
