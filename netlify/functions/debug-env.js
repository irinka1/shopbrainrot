exports.handler = async function (event, context) {
  try {
    const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
    const hasAdmin = !!process.env.ADMIN_CHAT_ID;
    const hasShop = !!process.env.SHOP_URL;

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        TELEGRAM_BOT_TOKEN_set: hasToken,
        ADMIN_CHAT_ID_set: hasAdmin,
        SHOP_URL_set: hasShop
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(err) })
    };
  }
};
