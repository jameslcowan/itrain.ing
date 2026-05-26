-- Panax platform owner (replaces itrain platform row; product site itrain.ing unchanged).

INSERT INTO platforms (id, slug, display_name) VALUES
  ('panax', 'panax', 'Panax')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  display_name = EXCLUDED.display_name;

UPDATE sites SET platform_id = 'panax' WHERE platform_id = 'itrain';

DELETE FROM platforms WHERE id = 'itrain';

INSERT INTO sites (id, domain, display_name, platform_id, is_active) VALUES
  ('panax', 'panax.ai', 'Panax', 'panax', true)
ON CONFLICT (id) DO UPDATE SET
  domain = EXCLUDED.domain,
  display_name = EXCLUDED.display_name,
  platform_id = 'panax',
  is_active = true;
