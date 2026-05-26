#!/usr/bin/env bash
# Smoke-test PostgREST analytics RPCs (pre-DNS: use DROPLET + --resolve).
set -euo pipefail

DROPLET="${DROPLET:-137.184.37.56}"
BASE="${API_BASE:-https://api.itrain.ing}"
VISITOR_ID="${VISITOR_ID:-00000000-0000-4000-8000-000000000099}"

CURL=(curl -sS -f --resolve "api.itrain.ing:443:${DROPLET}")

echo "==> PostgREST root"
"${CURL[@]}" -o /dev/null -w "HTTP %{http_code}\n" "${BASE}/" || true

echo "==> start_session"
SESSION_JSON=$("${CURL[@]}" -X POST "${BASE}/rpc/start_session" \
  -H "Content-Type: application/json" \
  -d "{\"p_site_id\":\"powerlift\",\"p_visitor_id\":\"${VISITOR_ID}\",\"p_ua_raw\":\"smoke-api.sh\",\"p_entry_path\":\"/\",\"p_referrer_url\":\"https://example.com/\"}")

echo "$SESSION_JSON"
SESSION_ID=$(echo "$SESSION_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['session_id'])")

echo "==> record_page_view"
"${CURL[@]}" -X POST "${BASE}/rpc/record_page_view" \
  -H "Content-Type: application/json" \
  -d "{\"p_site_id\":\"powerlift\",\"p_session_id\":\"${SESSION_ID}\",\"p_path\":\"/programs/\",\"p_document_title\":\"Programs\",\"p_is_entry\":true}"

echo "==> record_custom_event"
"${CURL[@]}" -X POST "${BASE}/rpc/record_custom_event" \
  -H "Content-Type: application/json" \
  -d "{\"p_site_id\":\"powerlift\",\"p_session_id\":\"${SESSION_ID}\",\"p_event_type\":\"program_card_open\",\"p_path\":\"/programs/\",\"p_template_id\":\"smoke-test\"}"

echo "OK: analytics RPC smoke passed"
