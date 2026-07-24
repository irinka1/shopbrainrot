export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Only POST' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer || {};

    const formattedItems = items.map(i => `${i.name} × ${i.quantity} — ${i.price * i.quantity} грн`).join('\n') || 'нет товаров';
    const text = [
      'Новый заказ (Web):',
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

    const token = env.TELEGRAM_BOT_TOKEN;
    const adminId = env.ADMIN_CHAT_ID;

    if (!token || !adminId) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing TELEGRAM_BOT_TOKEN or ADMIN_CHAT_ID' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
      const res = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: adminId, text })
      });
      const data = await res.json();
      if (!data.ok) {
        return new Response(JSON.stringify({ ok: false, error: data }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ ok: true, result: data.result }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
  }
};
