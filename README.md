# Hakkadaikon/nostr-yaruo-bot

## 概要
やる夫っぽいことをいうbot。
GPT3.5-turboで動くよ。

## 動かし方
1. .env.exampleをコピーして、.envを作成
2. .envの以下キー(OpenAIのAPIキーとbotの秘密鍵[16進数])を正しいキーに置き換える。

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BOT_PRIVATE_KEY_HEX="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

3. node src/main.js でbotを起動

## 作者
Hakkadaikon
