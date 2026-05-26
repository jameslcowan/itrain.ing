-- Custom product events (builder, programs grid, share, etc.).

CREATE TABLE IF NOT EXISTS custom_events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  event_type_id SMALLINT NOT NULL REFERENCES event_types(id),
  path_id BIGINT REFERENCES paths(id),
  occurred_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  template_id TEXT,
  label TEXT,
  value_num DOUBLE PRECISION,
  extras JSONB NOT NULL DEFAULT '{}',
  extras_schema_version SMALLINT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS custom_events_site_id_occurred_at_idx
  ON custom_events (site_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS custom_events_event_type_id_idx
  ON custom_events (event_type_id, occurred_at DESC);
