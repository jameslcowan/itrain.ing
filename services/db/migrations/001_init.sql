-- Panax platform schema (multisite: site_id on all tenant data)

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sites (id, domain, display_name) VALUES
  ('powerlift', 'powerlift.ing', 'powerlift.ing'),
  ('powerbuild', 'powerbuild.ing', 'powerbuild.ing'),
  ('olympiclift', 'olympiclift.ing', 'olympiclift.ing'),
  ('bootybuild', 'bootybuild.ing', 'bootybuild.ing'),
  ('itrain', 'itrain.ing', 'itrain.ing')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id),
  path TEXT,
  event TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_site_id_created_at_idx
  ON events (site_id, created_at DESC);

-- PostgREST roles (passwords set by install script via env)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'web_anon') THEN
    CREATE ROLE web_anon NOINHERIT;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT ON sites TO web_anon;

GRANT web_anon TO authenticator;

CREATE OR REPLACE FUNCTION public.collect_event(
  p_site_id TEXT,
  p_path TEXT DEFAULT NULL,
  p_event TEXT DEFAULT 'pageview',
  p_meta JSONB DEFAULT '{}'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sites WHERE id = p_site_id) THEN
    RAISE EXCEPTION 'unknown site_id: %', p_site_id;
  END IF;
  INSERT INTO events (site_id, path, event, meta)
  VALUES (p_site_id, p_path, p_event, COALESCE(p_meta, '{}'));
END;
$$;

GRANT EXECUTE ON FUNCTION public.collect_event(TEXT, TEXT, TEXT, JSONB) TO web_anon;
