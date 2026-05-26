-- Per-site read views (PostgREST-friendly); ingest remains via RPCs.

CREATE OR REPLACE VIEW public.powerlift_page_views AS
  SELECT pv.*, p.path_norm
  FROM page_views pv
  JOIN paths p ON p.id = pv.path_id
  WHERE pv.site_id = 'powerlift';

CREATE OR REPLACE VIEW public.powerbuild_page_views AS
  SELECT pv.*, p.path_norm
  FROM page_views pv
  JOIN paths p ON p.id = pv.path_id
  WHERE pv.site_id = 'powerbuild';

CREATE OR REPLACE VIEW public.olympiclift_page_views AS
  SELECT pv.*, p.path_norm
  FROM page_views pv
  JOIN paths p ON p.id = pv.path_id
  WHERE pv.site_id = 'olympiclift';

CREATE OR REPLACE VIEW public.bootybuild_page_views AS
  SELECT pv.*, p.path_norm
  FROM page_views pv
  JOIN paths p ON p.id = pv.path_id
  WHERE pv.site_id = 'bootybuild';

CREATE OR REPLACE VIEW public.itrain_page_views AS
  SELECT pv.*, p.path_norm
  FROM page_views pv
  JOIN paths p ON p.id = pv.path_id
  WHERE pv.site_id = 'itrain';

-- Read access reserved for future admin role; web_anon has ingest RPCs only.
