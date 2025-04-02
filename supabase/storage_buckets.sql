
-- Create a storage bucket for service images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('services', 'services', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO NOTHING;

-- Set up simple, permissive RLS policies to allow public access to the storage bucket
CREATE POLICY IF NOT EXISTS "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'services');
CREATE POLICY IF NOT EXISTS "Public insert access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'services');
CREATE POLICY IF NOT EXISTS "Public update access" ON storage.objects FOR UPDATE USING (bucket_id = 'services');
CREATE POLICY IF NOT EXISTS "Public delete access" ON storage.objects FOR DELETE USING (bucket_id = 'services');
