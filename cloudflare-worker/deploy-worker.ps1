# Скрипт для упрощённого деплоя Cloudflare Worker
param()

Write-Host "Проверяю наличие wrangler..."
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
  Write-Host "wrangler не найден. Устанавливаю глобально через npm (требуются права)..."
  npm install -g wrangler
}

Write-Host "Пожалуйста, залогинься в Cloudflare если ещё не залогинен(о): wrangler login"
Read-Host "Нажми Enter после успешного логина"

$token = Read-Host "Вставь TELEGRAM_BOT_TOKEN (бота)"
if ($token) { $token | wrangler secret put TELEGRAM_BOT_TOKEN }

$admin = Read-Host "Вставь ADMIN_CHAT_ID (например 507692983)"
if ($admin) { $admin | wrangler secret put ADMIN_CHAT_ID }

Write-Host "Публикую Worker..."
wrangler publish

Write-Host "Готово. Внимательно посмотри вывод wrangler — там будет URL Worker'а. Обнови frontend ORDER_URL на этот URL."
