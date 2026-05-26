-- Rename NocoDB reader role to match Panax platform naming.

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'itrain_nocodb') THEN
    ALTER ROLE itrain_nocodb RENAME TO panax_nocodb;
  ELSIF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'panax_nocodb') THEN
    CREATE ROLE panax_nocodb LOGIN;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE panax TO panax_nocodb;
GRANT USAGE ON SCHEMA public TO panax_nocodb;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO panax_nocodb;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO panax_nocodb;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO panax_nocodb;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO panax_nocodb;
