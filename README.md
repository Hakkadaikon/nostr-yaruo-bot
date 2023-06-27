# Hakkadaikon/nostr-yaruo-bot

## 概要

やる夫っぽいことをいう bot。
GPT3.5-turbo で動くよ。

## 動かし方

1. .env.example をコピーして、.env を作成
2. .env の以下キー(OpenAI の API キーと bot の秘密鍵[16 進数])を正しいキーに置き換える。

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BOT_PRIVATE_KEY_HEX="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
BOT_NEWS_API_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

3. node src/main.js で bot を起動

## 作者

Hakkadaikon
