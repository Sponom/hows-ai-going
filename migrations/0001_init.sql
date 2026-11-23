-- AI Cover initial D1 schema
-- Strictly anonymous: no user accounts, no raw IPs, coordinates rounded to ~11km (0.1 deg).

CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  anon_token_hash TEXT NOT NULL UNIQUE,
  ip_hash TEXT NOT NULL,
  country_code TEXT NOT NULL,
  city_name TEXT,
  lat REAL,
  lng REAL,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 3),
  context TEXT NOT NULL CHECK (context IN ('none', 'personal', 'work', 'both')),
  role TEXT NOT NULL,
  symptoms TEXT NOT NULL, -- JSON array of 1..2 symptom/reason ids
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_signals_country ON signals(country_code);
CREATE INDEX IF NOT EXISTS idx_signals_city ON signals(country_code, city_name);
CREATE INDEX IF NOT EXISTS idx_signals_role ON signals(role);
CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_ip_updated ON signals(ip_hash, updated_at);
