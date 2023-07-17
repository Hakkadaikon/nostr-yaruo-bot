import NewsAPI from "newsapi";
import * as env from "dotenv";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import * as config from "../utils/config.mjs";
import * as logger from "../utils/logger.mjs";
env.config();

/**
 * @summary Get game news from NewsAPI.
 */
export async function getGameNews(callback) {
  const newsapi = new NewsAPI(config.BOT_NEWS_API_KEY);
  await newsapi.v2
    .everything({
      q: "ゲーム",
      sortBy: "publishedAt",
    })
    .then((response) => {
      var news = response.articles;
      callback(news);
    });
}

export function selectNews(newsList) {
  const arrayMax = newsList.length - 1;
  const arrayMin = 0;
  const arrayNo =
    Math.floor(Math.random() * (arrayMax + 1 - arrayMin)) + arrayMin;
  return newsList[arrayNo];
}

export function selectNewsRetry(newsList, publishedNewsUrls) {
  while (true) {
    const selectedNews = selectNews(newsList);
    if (publishedNewsUrls.includes(selectedNews["url"])) {
      continue;
    }
    return selectedNews;
  }
}

function validateStr(str, ngWords) {
  for (let i = 0; i < ngWords.length; i++) {
    if (str.includes(ngWords[i])) {
      return false;
    }
  }

  return true;
}

export function validateNewsThoughts(thoughts) {
  return validateStr(thoughts, config.NEWS_THOUGHTS_NG_WORDS);
}

export function validateNewsContent(content) {
  return validateStr(content, config.NEWS_CONTENT_NG_WORDS);
}

/**
 * @summary Get news content from news URL
 */
export async function getNewsContent(newsurl, callback) {
  const response = await axios.get(newsurl).catch(function (error) {
    logger.error("Failed news summary error.");
    logger.error(JSON.stringify(error));
    if (error.response) {
      logger.error("Error response.");
      logger.error("- data   :" + error.response.data);
      logger.error("- status :" + error.response.status);
      logger.error("- headers:" + error.response.headers);
    } else if (error.request) {
      logger.error("Not response.");
      logger.error("- request:" + error.request);
    } else {
      logger.error("Other error.");
      logger.error("- message:" + error.message);
    }
  });

  let dom = new JSDOM(response.data, { url: newsurl });
  let article = new Readability(dom.window.document).parse();
  //logger.debug("document:" + JSON.stringify(dom.window.document));
  //logger.debug("article:" + article.textContent);
  await callback(article.textContent);
}
