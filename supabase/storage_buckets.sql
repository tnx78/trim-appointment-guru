
-- Create a storage bucket for gallery images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery', 'gallery', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies to allow access to the storage bucket
INSERT INTO storage.policies (name, definition, bucket_id, role_id)
VALUES 
  ('Public access to gallery', '(bucket_id = ''gallery''::text)', 'gallery', 'anon'),
  ('Authenticated users can upload gallery images', '((bucket_id = ''gallery''::text) AND (auth.role() = ''authenticated''::text))', 'gallery', 'authenticated')
ON CONFLICT (name, definition, bucket_id, role_id) DO NOTHING;

-- Add more permissive policies for demo purposes
INSERT INTO storage.policies (name, definition, bucket_id, role_id)
VALUES 
  ('Anyone can insert into gallery', 'true', 'gallery', 'anon')
ON CONFLICT (name, definition, bucket_id, role_id) DO NOTHING;
