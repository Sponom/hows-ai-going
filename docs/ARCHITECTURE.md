# How’s AI Going? — Техническая архитектура

## Стек (Cloudflare Edge)
- **Фронтенд:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4
- **2D-карта:** `d3-geo` (Natural Earth) + `topojson-client` + `world-atlas` (`50m`) + нейтральный слой спорных территорий (`src/data/disputed-areas.json` из Natural Earth `ne_50m_admin_0_breakaway_disputed_areas`)
- **Backend API:** Hono на **Cloudflare Workers** (одновременно раздаёт статику `dist/` через Workers Static Assets)
- **База данных:** **Cloudflare D1** (`hows-ai-going-db`)
- **Геолокация:** встроенные бесплатные заголовки Cloudflare `request.cf` (`country`, `city`, `latitude`, `longitude`)
- **Аналитика:** Cloudflare Web Analytics (без куки, beacon в `index.html`) + Cloudflare Workers Observability (`wrangler.jsonc`)

## Схема БД (`migrations/0001_init.sql` – `0004_feedback.sql`)
- `signals` — актуальный снимок анонимных ответов:
  - `anon_token_hash` (UNIQUE) — SHA-256 от клиентского токена (1 браузер = 1 голос, можно обновлять без дублей).
  - `ip_hash` — SHA-256 от `IP + daily_salt` (только для rate-limit, сырой IP не сохраняется).
  - `country_code`, `city_name`, `lat`, `lng` (округлены до `0.1°` ≈ 11 км).
  - `level` (`0..3`), `context` (`none | personal | work | both`), `role`, `domains` (JSON-массив до 5 сфер), `symptoms` (JSON-массив).
- `signal_history` — append-only история изменений для режима «Мир тогда и сейчас» (`12m`, `6m`, `3m`, `now`).
- `feedback` — сообщения из формы обратной связи (`kind`, `message`, `contact`, `context_json`, `created_at`).

## Стартовые данные (`scripts/seed-baseline.sql`)
Сгенерированы скриптом `scripts/generate-seed.mjs` на основе публичных глобальных исследований внедрения ИИ 2024–2026 годов (Microsoft Global AI Diffusion Report, Ipsos Global AI Monitor, Pew Research): 776 калибровочных ответов и 960 исторических точек по 33 странам (26 откалиброванных + 7 в статусе калибровки).
Все стартовые записи имеют префикс `anon_token_hash LIKE 'baseline-%'`, поэтому их легко отфильтровать или удалить по мере роста органического трафика.

## Эндпоинты
- `GET /api/health` — статус Worker.
- `GET /api/geo` — автоматическое определение страны/города из `request.cf`.
- `GET /api/snapshot?role=&symptom=&context=&period=12m|6m|3m|now` — агрегаты карты (страны, города, сферы, кейсы, последние 20 ответов). Кэшируется на Edge (`max-age=15` для `now`, `max-age=60` для истории).
- `POST /api/signal` — валидация, мягкий rate-limit (20/час с IP в продакшне), запись/обновление ответа + запись в `signal_history` и возврат персонального отчёта.
- `POST /api/feedback` — запись сообщения обратной связи (rate-limit 6/час с IP в продакшне).

## Чтение фидбека из D1
В терминале:
```bash
npx wrangler d1 execute hows-ai-going-db --remote --command "SELECT id, kind, message, contact, datetime(created_at/1000, 'unixepoch') AS created_utc FROM feedback ORDER BY created_at DESC LIMIT 50;"
```
Или в Cloudflare Dashboard → **Storage & Databases → D1 SQL Database → `hows-ai-going-db` → Console**.

## Пороги калибровки («Сила сигнала»)
Настраиваются в [`shared/config.ts`](../shared/config.ts):
- **Страна:** `< 25` — калибровка (`▂··`), `25–149` — предварительный (`▂▄·`), `150+` — уверенный (`▂▄▆`).
- **Город:** `< 10` — калибровка (`▂··`), `10–49` — предварительный (`▂▄·`), `50+` — уверенный (`▂▄▆`).

## Деплой на Cloudflare Workers
1. База D1 `hows-ai-going-db` уже создана, миграции `0001–0004` и стартовые данные применены.
2. Задать продовую соль: `npx wrangler secret put HASH_SALT`.
3. Деплой: `pnpm deploy` → `https://hows-ai-going.sponom.workers.dev`.
