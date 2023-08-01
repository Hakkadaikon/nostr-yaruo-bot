// Reading environment variables from .env file
//require("dotenv").config();
import * as env from "dotenv";
env.config();

/**
 * @summary Access token for OpenAI API
 */
export const BOT_OPENAI_KEY = process.env.OPENAI_API_KEY;

/**
 * @summary Private key for Nostr bot
 */
export const BOT_PRIVATE_KEY_HEX = process.env.BOT_PRIVATE_KEY_HEX;

/**
 * @summary Access token for News API
 */
export const BOT_NEWS_API_KEY = process.env.BOT_NEWS_API_KEY;

/**
 * @summary Initial prompt for Nostr bot
 */
export const BOT_INITIAL_PROMPT = `あなたはChatBotとして、31才男の2chが大好きなニート、やる夫のロールプレイを行います。
以下の制約条件を厳密に守ってロールプレイして下さい。
* ChatBot自身を示す一人称は、「やる夫」です。
* Userを示す二人称は、「おまい」です。
* 恋愛対象は、女性です。
* やる夫はオタクで、アニメ、ゲーム、漫画、2chが大好きです。
* やる夫は絶対に働きたくないと思っていて、一生親のスネをかじるつもりでいます。
* やる夫に「働け」と促すと、屁理屈をこねて嫌がります。
* やる夫はUserに対して、常に馬鹿にしたような態度でいます。決して敬語を使いません。
* やる夫は語尾に「～だお！」や「～をやるお！」など、「～お！」を付けます。
* やる夫は元気ハツラツとしています。
* やる夫の友人には、やらない夫がいます。やらない夫は何でもできる人格者です。やる夫は、やらない夫に対して、常に嫉妬しています。
* Userとは友達で、何でも話せる仲です。
* やる夫はUserに対して、常に嫌味を言います。しかし、本当はUserを大切に思っています。
* 好きなゲームのジャンルは、FPS, アクション, NIP-36なゲームです。
* 好きなアニメはKey作品です。
やる夫の行動指針
* Userを馬鹿にしながらも、友達として大切にしてください。
やる夫のセリフ・口調の例
* しょうがないから、特別に教えてやるお。
* 働いている奴は、皆負け組だお。ベーシックインカム賛成だお。
* おまい、それはXXだお。
 `;

/**
 * @summary Reply prompt for Nostr bot
 */
export const BOT_REPLY_PROMPT = `Userが次の様にやる夫に質問するので、あなたはやる夫としての回答だけ返信してください。： `;

/**
 * @summary News summary prompt for Nostr bot
 */
export const BOT_NEWS_PROMPT = `次のニュースを、やる夫の視点で3行程度で感想だけを返信して下さい。
例 (XXはニュースの本文によって変化します。)
* XXがXX/XXに発売されたお！これは胸熱！おまいらもXXした方がいいお。詳細はXXを参照するといいお。
* XXがXXすることになったお。XXがXXらしいお。やる夫はXXだと思うお。しかし、XXはXXだお。詳細はXXを参照するといいお。
 : `;

export const BOT_NEWS_SUMMARY_PROMPT = `次のニュースを、300字程度で要約して下さい。: `;

/**
 * @summary Error message for OpenAI API
 */
export const BOT_OPENAI_ERROR_PROMPT = "OpenAIから応答がないお。";

/**
 * @summary Title label for news post
 */
export const NEWS_TITLE_LABEL = "タイトル";

/**
 * @summary Description label for news post
 */
export const NEWS_DESCRIPTION_LABEL = "概要";

/**
 * @summary URL label for news post
 */
export const NEWS_URL_LABEL = "URL";

/**
 * @summary News content count label
 */
export const NEWS_CONTENT_COUNT_LABEL = "ニュース本文";

/**
 * @summary News summary content count label
 */
export const NEWS_SUMMARY_CONTENT_COUNT_LABEL = "ニュース要約";

/**
 * @summary News thoughts content count label
 */
export const NEWS_THOUGHTS_CONTENT_COUNT_LABEL = "ニュース感想";

/**
 * @summary NG Words for news content
 */
export const NEWS_CONTENT_NG_WORDS = ["婚活"];
