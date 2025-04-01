
-- Create a storage bucket for gallery images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery', 'gallery', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO NOTHING;

-- Set up simple, permissive RLS policies to allow public access to the storage bucket
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
  ('Public read access', 'true', 'gallery'),
  ('Public insert access', 'true', 'gallery'),
  ('Public update access', 'true', 'gallery'),
  ('Public delete access', 'true', 'gallery')
ON CONFLICT (name, definition, bucket_id) DO NOTHING;
