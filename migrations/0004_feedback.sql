-- Anonymous user feedback submissions (ideas, bug reports, data corrections)
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('idea', 'bug', 'data', 'other')),
  message TEXT NOT NULL,
  contact TEXT,
  context_json TEXT,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_ip_created ON feedback(ip_hash, created_at DESC);
