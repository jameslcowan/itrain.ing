-- Sessions and page_views (core analytics facts).

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL REFERENCES sites(id),
  visitor_id UUID NOT NULL,
  user_agent_id BIGINT NOT NULL REFERENCES user_agents(id),
  first_referrer_id BIGINT REFERENCES referrers(id),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  entry_path_id BIGINT REFERENCES paths(id),
  ip_hash BYTEA,
  country_code CHAR(2),
  region TEXT,
  city TEXT,
  timezone TEXT,
  language TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  extras JSONB NOT NULL DEFAULT '{}',
  extras_schema_version SMALLINT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS sessions_site_id_started_at_idx
  ON sessions (site_id, started_at DESC);

CREATE INDEX IF NOT EXISTS sessions_visitor_id_idx
  ON sessions (visitor_id);

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  path_id BIGINT NOT NULL REFERENCES paths(id),
  referrer_id BIGINT REFERENCES referrers(id),
  occurred_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_url TEXT,
  query_string TEXT,
  document_title TEXT,
  is_entry BOOLEAN NOT NULL DEFAULT false,
  is_exit BOOLEAN NOT NULL DEFAULT false,
  viewport_w SMALLINT,
  viewport_h SMALLINT,
  screen_w SMALLINT,
  screen_h SMALLINT,
  device_pixel_ratio REAL,
  connection_type TEXT,
  load_time_ms INTEGER,
  dom_ready_ms INTEGER,
  duration_ms INTEGER,
  scroll_depth_pct SMALLINT,
  extras JSONB NOT NULL DEFAULT '{}',
  extras_schema_version SMALLINT NOT NULL DEFAULT 1,
  CONSTRAINT page_views_scroll_depth_chk CHECK (
    scroll_depth_pct IS NULL OR (scroll_depth_pct >= 0 AND scroll_depth_pct <= 100)
  )
);

CREATE INDEX IF NOT EXISTS page_views_site_id_occurred_at_idx
  ON page_views (site_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS page_views_session_id_occurred_at_idx
  ON page_views (session_id, occurred_at);

CREATE INDEX IF NOT EXISTS page_views_path_id_occurred_at_idx
  ON page_views (path_id, occurred_at DESC);
