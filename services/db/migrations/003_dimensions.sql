-- Dimension tables (3NF): user agents, referrers, paths, event types.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_agents (
  id BIGSERIAL PRIMARY KEY,
  ua_hash BYTEA NOT NULL UNIQUE,
  ua_raw TEXT NOT NULL,
  browser_family TEXT,
  os_family TEXT,
  device_class TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrers (
  id BIGSERIAL PRIMARY KEY,
  referrer_hash BYTEA NOT NULL UNIQUE,
  referrer_url TEXT,
  referrer_host TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS paths (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id),
  path_norm TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, path_norm)
);

CREATE TABLE IF NOT EXISTS event_types (
  id SMALLSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO event_types (name, description) VALUES
  ('program_card_open', 'User opened a program template card'),
  ('open_in_builder', 'User opened template in the app builder'),
  ('share_program', 'User shared a program link'),
  ('pageview', 'Legacy alias — prefer page_views table')
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE FUNCTION public.normalize_path(p_path TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_path IS NULL OR btrim(p_path) = '' THEN '/'
    ELSE '/' || btrim(both '/' FROM btrim(p_path))
  END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_user_agent(p_ua_raw TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_hash BYTEA;
  v_id BIGINT;
BEGIN
  IF p_ua_raw IS NULL OR btrim(p_ua_raw) = '' THEN
    p_ua_raw := 'unknown';
  END IF;
  v_hash := digest(convert_to(p_ua_raw, 'UTF8'), 'sha256');
  INSERT INTO user_agents (ua_hash, ua_raw)
  VALUES (v_hash, p_ua_raw)
  ON CONFLICT (ua_hash) DO UPDATE SET ua_raw = EXCLUDED.ua_raw
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_referrer(p_referrer_url TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_hash BYTEA;
  v_norm TEXT;
  v_host TEXT;
  v_id BIGINT;
BEGIN
  IF p_referrer_url IS NULL OR btrim(p_referrer_url) = '' THEN
    v_norm := '';
    v_hash := digest(convert_to('', 'UTF8'), 'sha256');
    v_host := NULL;
  ELSE
    v_norm := btrim(p_referrer_url);
    v_hash := digest(convert_to(v_norm, 'UTF8'), 'sha256');
    v_host := NULLIF(split_part(regexp_replace(v_norm, '^https?://', ''), '/', 1), '');
  END IF;
  INSERT INTO referrers (referrer_hash, referrer_url, referrer_host)
  VALUES (v_hash, NULLIF(v_norm, ''), v_host)
  ON CONFLICT (referrer_hash) DO UPDATE
    SET referrer_url = COALESCE(EXCLUDED.referrer_url, referrers.referrer_url),
        referrer_host = COALESCE(EXCLUDED.referrer_host, referrers.referrer_host)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_path(p_site_id TEXT, p_path TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_norm TEXT;
  v_id BIGINT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sites WHERE id = p_site_id AND is_active) THEN
    RAISE EXCEPTION 'unknown or inactive site_id: %', p_site_id;
  END IF;
  v_norm := normalize_path(p_path);
  INSERT INTO paths (site_id, path_norm)
  VALUES (p_site_id, v_norm)
  ON CONFLICT (site_id, path_norm) DO UPDATE SET path_norm = EXCLUDED.path_norm
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
