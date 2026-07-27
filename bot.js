const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');

function loadEnv() {
  const envPath = path.join(__dirname, 'keys.env', '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const result = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    result[key] = value;
  }

  return result;
}

const env = loadEnv();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || env.ADMIN_CHAT_ID;
const SHOP_URL = process.env.SHOP_URL || env.SHOP_URL || 'http://localhost:3000';

if (!BOT_TOKEN) {
  console.error('Ошибка: не задан TELEGRAM_BOT_TOKEN. Поместите его в keys.env/.env.');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Отправляем кнопку Web App (если клиент поддерживает Web App)
bot.start(async (ctx) => {
  try {
    await ctx.reply('Привет! Я открою тебе магазин Grow a Garden 2. Нажми кнопку, чтобы перейти к сайту.', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Открыть магазин', web_app: { url: SHOP_URL } }]]
      }
    });
  } catch (e) {
    console.error('Ошибка при отправке кнопки:', e);
  }
});

bot.command('shop', async (ctx) => {
  await ctx.reply('Вот ссылка на магазин:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Открыть магазин', web_app: { url: SHOP_URL } }]]
    }
  });
});

// Обработка данных из Web App (tg.WebApp.sendData)
bot.on('message', async (ctx) => {
  try {
    const msg = ctx.message;
    if (msg && msg.web_app_data && msg.web_app_data.data) {
      const payload = JSON.parse(msg.web_app_data.data);
      const items = payload.items || [];
      const customer = payload.customer || {};

      const formattedItems = items
        .map((i) => `${i.name} × ${i.quantity} — ${i.price * i.quantity} грн`)
        .join('\n');

      const text = [
        'Новый заказ (WebApp):',
        '',
        'Товары:',
        formattedItems,
        '',
        'Покупатель:',
        `Имя: ${customer.name || 'не указано'}`,
        `Телефон: ${customer.phone || 'не указано'}`,
        `Telegram: ${customer.telegram || 'не указано'}`,
        `Комментарий: ${customer.comment || 'без комментария'}`
      ].join('\n');

      // Отправляем админу
      if (ADMIN_CHAT_ID) {
        await ctx.telegram.sendMessage(ADMIN_CHAT_ID, text);
        await ctx.reply('✅ Ваш заказ отправлен администратору. Спасибо!');
      } else {
        console.warn('ADMIN_CHAT_ID не задан, заказ не отправлен.');
        await ctx.reply('❌ Ошибка: администратор не настроен.');
      }
    }
  } catch (err) {
    console.error('Ошибка при обработке web_app_data:', err);
  }
});

bot.catch((err, ctx) => {
  console.error('Ошибка Telegraf:', err);
  if (ctx) console.error('Контекст:', ctx.updateType);
});

bot.launch().then(() => {
  console.log('✅ Telegram-бот запущен.');
  console.log('🔗 Магазин открыт по адресу:', SHOP_URL);
  if (SHOP_URL.includes('localhost')) {
    console.log('⚠️ Для работы с телефоном в одной сети замените SHOP_URL на IP ноутбука в keys.env/.env.');
  }
}).catch((error) => {
  console.error('Не удалось запустить бота:', error);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
