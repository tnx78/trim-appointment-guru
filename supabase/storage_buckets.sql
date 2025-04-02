
-- Create storage buckets for services, gallery, and reviews if they don't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('services', 'services', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[];

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery', 'gallery', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[];

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('reviews', 'reviews', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[];

-- Set up permissive RLS policies for services bucket
CREATE POLICY "Public read access for services" ON storage.objects FOR SELECT 
USING (bucket_id = 'services')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Auth insert access for services" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'services')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Auth update access for services" ON storage.objects FOR UPDATE
USING (bucket_id = 'services')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Auth delete access for services" ON storage.objects FOR DELETE
USING (bucket_id = 'services')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

-- Set up permissive RLS policies for gallery bucket
CREATE POLICY "Public read access for gallery" ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Auth insert access for gallery" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'gallery')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Auth update access for gallery" ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Auth delete access for gallery" ON storage.objects FOR DELETE
USING (bucket_id = 'gallery')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

-- Set up permissive RLS policies for reviews bucket
CREATE POLICY "Public read access for reviews" ON storage.objects FOR SELECT 
USING (bucket_id = 'reviews')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Auth insert access for reviews" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'reviews')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Auth update access for reviews" ON storage.objects FOR UPDATE
USING (bucket_id = 'reviews')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Auth delete access for reviews" ON storage.objects FOR DELETE
USING (bucket_id = 'reviews')
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;
