#!/usr/bin/env bash
# Smoke-test PostgREST analytics RPCs (pre-DNS).
# HTTPS: --resolve api.itrain.ing:443:DROPLET
# HTTP:  SMOKE_HTTP=1 uses Host header on port 80 (no TLS)
set -euo pipefail

DROPLET="${DROPLET:-137.184.37.56}"
VISITOR_ID="${VISITOR_ID:-00000000-0000-4000-8000-000000000099}"

if [[ "${SMOKE_HTTP:-0}" == "1" ]]; then
  BASE="${API_BASE:-http://${DROPLET}}"
  CURL=(curl -sS -f -H "Host: api.itrain.ing")
else
  BASE="${API_BASE:-https://api.itrain.ing}"
  CURL=(curl -sS -f --resolve "api.itrain.ing:443:${DROPLET}")
fi

check_not_default_site() {
  local body="$1"
  if echo "$body" | grep -q 'itrain.ing suite'; then
    echo "ERROR: api.itrain.ing is not routed to PostgREST (got default Caddy page)." >&2
    echo "Install infra/caddy/api.itrain.ing.caddy and reload Caddy." >&2
    exit 1
  fi
}

echo "==> PostgREST root (${BASE})"
ROOT=$("${CURL[@]}" "${BASE}/" || true)
check_not_default_site "$ROOT"
echo "$ROOT" | head -3

echo "==> start_session"
SESSION_JSON=$("${CURL[@]}" -X POST "${BASE}/rpc/start_session" \
  -H "Content-Type: application/json" \
  -d "{\"p_site_id\":\"powerlift\",\"p_visitor_id\":\"${VISITOR_ID}\",\"p_ua_raw\":\"smoke-api.sh\",\"p_entry_path\":\"/\",\"p_referrer_url\":\"https://example.com/\"}")
check_not_default_site "$SESSION_JSON"
echo "$SESSION_JSON"
SESSION_ID=$(echo "$SESSION_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['session_id'])")

echo "==> record_page_view"
PV=$("${CURL[@]}" -X POST "${BASE}/rpc/record_page_view" \
  -H "Content-Type: application/json" \
  -d "{\"p_site_id\":\"powerlift\",\"p_session_id\":\"${SESSION_ID}\",\"p_path\":\"/programs/\",\"p_document_title\":\"Programs\",\"p_is_entry\":true}")
check_not_default_site "$PV"

echo "==> record_custom_event"
"${CURL[@]}" -X POST "${BASE}/rpc/record_custom_event" \
  -H "Content-Type: application/json" \
  -d "{\"p_site_id\":\"powerlift\",\"p_session_id\":\"${SESSION_ID}\",\"p_event_type\":\"program_card_open\",\"p_path\":\"/programs/\",\"p_template_id\":\"smoke-test\"}" >/dev/null

echo "OK: analytics RPC smoke passed"
