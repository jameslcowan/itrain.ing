-- Drop legacy JSONB events table after new RPCs are verified.

REVOKE EXECUTE ON FUNCTION public.collect_event(TEXT, TEXT, TEXT, JSONB) FROM web_anon;
DROP FUNCTION IF EXISTS public.collect_event(TEXT, TEXT, TEXT, JSONB);
DROP TABLE IF EXISTS events;
