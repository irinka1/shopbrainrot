# Продажа брейнротов

Миниапп для продажи товаров из игры Grow a Garden 2.

## Структура проекта

- `index.html` — главная страница магазина
- `styles.css` — стили страницы
- `app.js` — логика корзины и отправки заказа
- `server.js` — локальный сервер, принимающий заказ и отправляющий сообщение в Telegram
- `bot.js` — Telegram-бот, который отправляет ссылку на сайт
- `keys.env/.env` — секреты: токен бота и ID администратора
- `фото товара/` — изображения товаров

## Запуск

1. Установите зависимости:
```bash
npm install
```
2. Запустите сайт:
```bash
node server.js
```
3. В другом терминале запустите бота:
```bash
node bot.js
```

### Запуск через npm scripts

```bash
npm run start   # запускает сервер
npm run bot     # запускает Telegram-бот
```

### Web App

Если пользователь открыл магазин внутри клиента Telegram (Web App), кнопка в боте откроет страницу внутри Telegram, и оплачивать/отправлять заказ можно прямо из Web App — тогда данные отправляются боту через `Telegram.WebApp.sendData`.

Важно: `http://localhost:3000` будет доступен в Telegram только если вы используете Telegram на той же машине (Desktop) или пробросите порт (ngrok и т.д.).

## Деплой на Netlify

1. Зарегистрируйтесь и создайте новый сайт на Netlify (Connect to Git repository) и укажите репозиторий `irinka1/shopbrainrot`.
2. В разделе Site settings → Build & deploy → Environment → Environment variables добавьте:

	- `TELEGRAM_BOT_TOKEN` — токен вашего бота
	- `ADMIN_CHAT_ID` — ID администратора (например, `507692983`)

3. Убедитесь, что `publish directory` установлен в `/` (корень), а `Functions directory` — `netlify/functions`.
4. После деплоя откроется HTTPS-адрес вида `https://your-site.netlify.app` — используйте его в боте (в `keys.env/.env` или как переменная окружения `SHOP_URL`) для Web App.

Примечание: бот должен использовать HTTPS-ссылку для `web_app` кнопки — Netlify даёт HTTPS по умолчанию.

## Важное

- Токен и ID администратора находятся в `keys.env/.env`.
- Не загружайте `keys.env/.env` в публичный репозиторий.
