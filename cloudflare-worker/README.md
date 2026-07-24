Cloudflare Worker для приёма заказов и пересылки в Telegram

Что делает:
- Принимает POST JSON с телом { items: [...], customer: {...} }
- Формирует текст заказа и вызывает Telegram Bot API `sendMessage`

Как развернуть (быстро):
1. Установи wrangler (Node.js/npm):
   `npm install -g wrangler`
2. Авторизуй wrangler в аккаунте Cloudflare:
   `wrangler login` (откроет браузер)
3. Установи секреты (введи значения локально):
   `wrangler secret put TELEGRAM_BOT_TOKEN`  # вставь токен
   `wrangler secret put ADMIN_CHAT_ID`      # вставь 507692983
4. Опубликуй Worker:
   `wrangler publish` — в ответе будет URL вида `https://<name>.<workers.dev>`

После деплоя обнови фронтенд `ORDER_URL` на полученный URL.

Примечание: если хочешь, я подготовил `index.js` и `wrangler.toml` в этой папке. Я не могу сам залогиниться в твой Cloudflare или сохранить секреты — сделай шаги 2–4 на своей машине или дай временный API‑токен, если хочешь, чтобы я выполнил `wrangler publish` за тебя (не рекомендуется публиковать токен здесь).
