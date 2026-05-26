-- Platforms (umbrella) and extend sites for multisite tenancy.

CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platforms (id, slug, display_name) VALUES
  ('itrain', 'itrain', 'itrain.ing platform')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS platform_id TEXT REFERENCES platforms(id),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

UPDATE sites SET platform_id = 'itrain' WHERE platform_id IS NULL;

ALTER TABLE sites
  ALTER COLUMN platform_id SET NOT NULL;
