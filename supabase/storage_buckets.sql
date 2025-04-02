
-- Create storage buckets for services, gallery, and reviews if they don't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('services', 'services', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery', 'gallery', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('reviews', 'reviews', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for services bucket
CREATE POLICY "Public read access for services" ON storage.objects 
FOR SELECT USING (bucket_id = 'services') 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Admin insert for services" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'services' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')) 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Admin update for services" ON storage.objects 
FOR UPDATE USING (bucket_id = 'services' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')) 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Admin delete for services" ON storage.objects 
FOR DELETE USING (bucket_id = 'services' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')) 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

-- Create RLS policies for gallery bucket
CREATE POLICY "Public read access for gallery" ON storage.objects 
FOR SELECT USING (bucket_id = 'gallery') 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Admin insert for gallery" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'gallery' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')) 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Admin update for gallery" ON storage.objects 
FOR UPDATE USING (bucket_id = 'gallery' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')) 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Admin delete for gallery" ON storage.objects 
FOR DELETE USING (bucket_id = 'gallery' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')) 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

-- Create RLS policies for reviews bucket
CREATE POLICY "Public read access for reviews" ON storage.objects 
FOR SELECT USING (bucket_id = 'reviews') 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Admin insert for reviews" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'reviews' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')) 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Admin update for reviews" ON storage.objects 
FOR UPDATE USING (bucket_id = 'reviews' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')) 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;

CREATE POLICY "Admin delete for reviews" ON storage.objects 
FOR DELETE USING (bucket_id = 'reviews' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')) 
ON CONFLICT ON CONSTRAINT pk_objects_policies DO NOTHING;
