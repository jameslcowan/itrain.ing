-- PostgREST ingest RPCs: start_session, record_page_view.

CREATE OR REPLACE FUNCTION public.assert_active_site(p_site_id TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sites WHERE id = p_site_id AND is_active) THEN
    RAISE EXCEPTION 'unknown or inactive site_id: %', p_site_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.start_session(
  p_site_id TEXT,
  p_visitor_id UUID,
  p_ua_raw TEXT,
  p_referrer_url TEXT DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_utm_term TEXT DEFAULT NULL,
  p_utm_content TEXT DEFAULT NULL,
  p_entry_path TEXT DEFAULT NULL,
  p_language TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_country_code CHAR(2) DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_extras JSONB DEFAULT '{}'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_ua_id BIGINT;
  v_ref_id BIGINT;
  v_entry_path_id BIGINT;
BEGIN
  PERFORM assert_active_site(p_site_id);
  v_ua_id := upsert_user_agent(p_ua_raw);
  v_ref_id := upsert_referrer(p_referrer_url);
  IF p_entry_path IS NOT NULL THEN
    v_entry_path_id := upsert_path(p_site_id, p_entry_path);
  END IF;

  INSERT INTO sessions (
    site_id, visitor_id, user_agent_id, first_referrer_id,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    entry_path_id, language, timezone, country_code, region, city, extras
  )
  VALUES (
    p_site_id, p_visitor_id, v_ua_id, v_ref_id,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content,
    v_entry_path_id, p_language, p_timezone, p_country_code, p_region, p_city,
    COALESCE(p_extras, '{}')
  )
  RETURNING id INTO v_session_id;

  RETURN json_build_object(
    'session_id', v_session_id,
    'visitor_id', p_visitor_id,
    'site_id', p_site_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_page_view(
  p_site_id TEXT,
  p_session_id UUID,
  p_path TEXT,
  p_referrer_url TEXT DEFAULT NULL,
  p_occurred_at TIMESTAMPTZ DEFAULT NULL,
  p_full_url TEXT DEFAULT NULL,
  p_query_string TEXT DEFAULT NULL,
  p_document_title TEXT DEFAULT NULL,
  p_is_entry BOOLEAN DEFAULT false,
  p_is_exit BOOLEAN DEFAULT false,
  p_viewport_w SMALLINT DEFAULT NULL,
  p_viewport_h SMALLINT DEFAULT NULL,
  p_screen_w SMALLINT DEFAULT NULL,
  p_screen_h SMALLINT DEFAULT NULL,
  p_device_pixel_ratio REAL DEFAULT NULL,
  p_connection_type TEXT DEFAULT NULL,
  p_load_time_ms INTEGER DEFAULT NULL,
  p_dom_ready_ms INTEGER DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL,
  p_scroll_depth_pct SMALLINT DEFAULT NULL,
  p_extras JSONB DEFAULT '{}'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_path_id BIGINT;
  v_ref_id BIGINT;
  v_pv_id BIGINT;
  v_when TIMESTAMPTZ;
BEGIN
  PERFORM assert_active_site(p_site_id);
  IF NOT EXISTS (
    SELECT 1 FROM sessions
    WHERE id = p_session_id AND site_id = p_site_id
  ) THEN
    RAISE EXCEPTION 'invalid session_id for site %', p_site_id;
  END IF;

  IF p_occurred_at IS NULL THEN
    RAISE EXCEPTION 'p_occurred_at is required (client event time, ISO 8601)';
  END IF;
  v_when := p_occurred_at;
  v_path_id := upsert_path(p_site_id, p_path);
  v_ref_id := upsert_referrer(p_referrer_url);

  INSERT INTO page_views (
    site_id, session_id, path_id, referrer_id, occurred_at,
    full_url, query_string, document_title,
    is_entry, is_exit,
    viewport_w, viewport_h, screen_w, screen_h, device_pixel_ratio,
    connection_type, load_time_ms, dom_ready_ms, duration_ms, scroll_depth_pct,
    extras
  )
  VALUES (
    p_site_id, p_session_id, v_path_id, v_ref_id, v_when,
    p_full_url, p_query_string, p_document_title,
    COALESCE(p_is_entry, false), COALESCE(p_is_exit, false),
    p_viewport_w, p_viewport_h, p_screen_w, p_screen_h, p_device_pixel_ratio,
    p_connection_type, p_load_time_ms, p_dom_ready_ms, p_duration_ms, p_scroll_depth_pct,
    COALESCE(p_extras, '{}')
  )
  RETURNING id INTO v_pv_id;

  UPDATE sessions SET last_seen_at = GREATEST(last_seen_at, v_when) WHERE id = p_session_id;

  RETURN json_build_object('page_view_id', v_pv_id, 'path_id', v_path_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_session(
  TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, CHAR(2), TEXT, TEXT, JSONB
) TO web_anon;

GRANT EXECUTE ON FUNCTION public.record_page_view(
  TEXT, UUID, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN,
  SMALLINT, SMALLINT, SMALLINT, SMALLINT, REAL, TEXT, INTEGER, INTEGER, INTEGER, SMALLINT, JSONB
) TO web_anon;

GRANT EXECUTE ON FUNCTION public.upsert_path(TEXT, TEXT) TO web_anon;
