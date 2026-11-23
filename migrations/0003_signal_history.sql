-- Append-only anonymous history of responses & updates (supports up to 12-month lookback and Before/After comparisons)
CREATE TABLE IF NOT EXISTS signal_history (
  id TEXT PRIMARY KEY,
  anon_token_hash TEXT NOT NULL,
  country_code TEXT NOT NULL,
  city_name TEXT,
  lat REAL,
  lng REAL,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 3),
  context TEXT NOT NULL CHECK (context IN ('none', 'personal', 'work', 'both')),
  role TEXT NOT NULL,
  domains TEXT,
  symptoms TEXT NOT NULL,
  recorded_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_recorded ON signal_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_token_time ON signal_history(anon_token_hash, recorded_at DESC);

-- Backfill existing signals so no current data is lost
INSERT OR IGNORE INTO signal_history (
  id, anon_token_hash, country_code, city_name, lat, lng,
  level, context, role, domains, symptoms, recorded_at
)
SELECT
  id, anon_token_hash, country_code, city_name, lat, lng,
  level, context, role, domains, symptoms, updated_at
FROM signals;
