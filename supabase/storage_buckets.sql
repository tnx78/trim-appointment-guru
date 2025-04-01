
-- Create a storage bucket for gallery images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery', 'gallery', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies to allow access to the storage bucket
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
  ('Public access to gallery', 'true', 'gallery'),
  ('Anyone can insert into gallery', 'true', 'gallery'),
  ('Anyone can update gallery content', 'true', 'gallery'),
  ('Anyone can delete from gallery', 'true', 'gallery')
ON CONFLICT (name, definition, bucket_id) DO NOTHING;
