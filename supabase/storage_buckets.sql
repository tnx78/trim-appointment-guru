
-- Create storage buckets for services and gallery if they don't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('services', 'services', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery', 'gallery', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO NOTHING;

-- Set up permissive RLS policies for services bucket
CREATE POLICY "Public read access for services" ON storage.objects FOR SELECT 
USING (bucket_id = 'services');

CREATE POLICY "Auth insert access for services" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'services');

CREATE POLICY "Auth update access for services" ON storage.objects FOR UPDATE
USING (bucket_id = 'services');

CREATE POLICY "Auth delete access for services" ON storage.objects FOR DELETE
USING (bucket_id = 'services');

-- Set up permissive RLS policies for gallery bucket
CREATE POLICY "Public read access for gallery" ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery');

CREATE POLICY "Auth insert access for gallery" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Auth update access for gallery" ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery');

CREATE POLICY "Auth delete access for gallery" ON storage.objects FOR DELETE
USING (bucket_id = 'gallery');
