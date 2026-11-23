# How’s AI Going?

Анонимная живая карта использования ИИ по всему миру: как обычные люди реально используют искусственный интеллект в работе и повседневной жизни (или обходятся без него), плюс сравнение «тогда и сейчас» за последние 12 месяцев.

## Быстрый локальный старт

```bash
# 1. Установить зависимости
pnpm install

# 2. Создать локальную SQLite D1 базу и применить миграции (0001–0004)
pnpm db:migrate:local

# 3. Заполнить локальную базу стартовыми данными с 12-месячной историей
pnpm db:seed:local

# 4. Запустить веб-приложение (Vite :5173 + Cloudflare Worker API :8787)
pnpm dev
```

Открыть в браузере: `http://localhost:5173`

Сбросить локальную базу обратно в чистый ноль:
```bash
pnpm db:reset:local
```

## Деплой на Cloudflare Workers

```bash
# 1. Авторизоваться в Wrangler (один раз)
npx wrangler login

# 2. Задать продовую соль для хеширования анонимных токенов и IP (один раз)
npx wrangler secret put HASH_SALT

# 3. Собрать и задеплоить Worker + статику
pnpm deploy
```

Тестовый домен: `https://hows-ai-going.sponom.workers.dev`

## Документация
- [docs/CONCEPT.md](./docs/CONCEPT.md) — продуктовый концепт, сферы, кейсы и бэклог.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — архитектура Cloudflare Workers + D1, аналитика и чтение фидбека.
