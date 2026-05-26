-- PostgREST ingest RPC: record_custom_event.

CREATE OR REPLACE FUNCTION public.record_custom_event(
  p_site_id TEXT,
  p_session_id UUID,
  p_event_type TEXT,
  p_path TEXT DEFAULT NULL,
  p_occurred_at TIMESTAMPTZ DEFAULT NULL,
  p_template_id TEXT DEFAULT NULL,
  p_label TEXT DEFAULT NULL,
  p_value_num DOUBLE PRECISION DEFAULT NULL,
  p_extras JSONB DEFAULT '{}'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type_id SMALLINT;
  v_path_id BIGINT;
  v_event_id BIGINT;
  v_when TIMESTAMPTZ;
BEGIN
  PERFORM assert_active_site(p_site_id);
  IF NOT EXISTS (
    SELECT 1 FROM sessions
    WHERE id = p_session_id AND site_id = p_site_id
  ) THEN
    RAISE EXCEPTION 'invalid session_id for site %', p_site_id;
  END IF;

  SELECT id INTO v_type_id FROM event_types WHERE name = p_event_type;
  IF v_type_id IS NULL THEN
    INSERT INTO event_types (name) VALUES (p_event_type)
    RETURNING id INTO v_type_id;
  END IF;

  v_when := COALESCE(p_occurred_at, now());
  IF p_path IS NOT NULL THEN
    v_path_id := upsert_path(p_site_id, p_path);
  END IF;

  INSERT INTO custom_events (
    site_id, session_id, event_type_id, path_id, occurred_at,
    template_id, label, value_num, extras
  )
  VALUES (
    p_site_id, p_session_id, v_type_id, v_path_id, v_when,
    p_template_id, p_label, p_value_num, COALESCE(p_extras, '{}')
  )
  RETURNING id INTO v_event_id;

  UPDATE sessions SET last_seen_at = GREATEST(last_seen_at, v_when) WHERE id = p_session_id;

  RETURN json_build_object('custom_event_id', v_event_id, 'event_type_id', v_type_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_custom_event(
  TEXT, UUID, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, DOUBLE PRECISION, JSONB
) TO web_anon;
