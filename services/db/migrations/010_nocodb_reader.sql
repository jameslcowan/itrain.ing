-- Read-only Postgres role for NocoDB / SQL inspectors (password set on server by install-nocodb.sh).

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'itrain_nocodb') THEN
    CREATE ROLE itrain_nocodb LOGIN;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE itrain TO itrain_nocodb;
GRANT USAGE ON SCHEMA public TO itrain_nocodb;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO itrain_nocodb;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO itrain_nocodb;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO itrain_nocodb;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO itrain_nocodb;
