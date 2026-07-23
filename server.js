const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

function loadEnvFile() {
  const envPath = path.join(__dirname, 'keys.env', '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

const envValues = loadEnvFile();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || envValues.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || envValues.ADMIN_CHAT_ID;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Сервер готов' });
});

app.post('/api/order', async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
    return res.status(500).json({ ok: false, error: 'Токен бота или ID администратора не настроены.' });
  }

  const { items = [], customer = {} } = req.body;

  if (!items.length) {
    return res.status(400).json({ ok: false, error: 'Корзина пуста.' });
  }

  const formattedItems = items
    .map((item) => `${item.name} × ${item.quantity} — ${item.price * item.quantity} грн`)
    .join('\n');

  const text = [
    'Новый заказ из миниаппа:',
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

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.description || 'Не удалось отправить сообщение');
    }

    res.json({ ok: true, message: 'Заказ отправлен администратору.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
