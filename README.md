# How’s AI Going?

An anonymous live global map showing how everyday people around the world actually use AI across work and daily life — or choose not to — with a 12-month "then & now" comparison.

## Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Create local SQLite D1 database and apply migrations (0001–0004)
pnpm db:migrate:local

# 3. Seed local database with baseline data & 12-month history
pnpm db:seed:local

# 4. Run frontend (Vite :5173) + Cloudflare Worker API (:8787)
pnpm dev
```

Open `http://localhost:5173` in your browser.

Reset the local D1 database to an empty state:
```bash
pnpm db:reset:local
```

## Deploy to Cloudflare Workers

```bash
# 1. Sign in to Cloudflare (one-time)
npx wrangler login

# 2. Set production hash salt for anonymous tokens & daily IP hashes (one-time)
npx wrangler secret put HASH_SALT

# 3. Build and deploy Worker + static assets
pnpm deploy
```

Production URL: `https://howsaigoing.org` (staging: `https://hows-ai-going.sponom.workers.dev`)

## Documentation
- [docs/CONCEPT.md](./docs/CONCEPT.md) — product concept, taxonomy, and backlog.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Cloudflare Workers + D1 architecture, analytics, and feedback queries.
