const fetch = global.fetch || require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'TELEGRAM_BOT_TOKEN or ADMIN_CHAT_ID not set' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) };
  }

  const { items = [], customer = {} } = payload;

  if (!items.length) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Cart is empty' }) };
  }

  const formattedItems = items.map(i => `${i.name} × ${i.quantity} — ${i.price * i.quantity} грн`).join('\n');

  const text = [
    'Новый заказ (Netlify Function):',
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
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: data.description || 'Telegram error' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, message: 'Sent' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
