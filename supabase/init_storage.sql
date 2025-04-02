
-- Create storage buckets if they don't exist
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

-- Add RLS policies for all buckets
DO $$
BEGIN
  -- Services bucket policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public read access for services'
  ) THEN
    CREATE POLICY "Public read access for services" ON storage.objects FOR SELECT 
    USING (bucket_id = 'services');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Auth insert access for services'
  ) THEN
    CREATE POLICY "Auth insert access for services" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'services');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Auth update access for services'
  ) THEN
    CREATE POLICY "Auth update access for services" ON storage.objects FOR UPDATE
    USING (bucket_id = 'services');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Auth delete access for services'
  ) THEN
    CREATE POLICY "Auth delete access for services" ON storage.objects FOR DELETE
    USING (bucket_id = 'services');
  END IF;

  -- Gallery bucket policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public read access for gallery'
  ) THEN
    CREATE POLICY "Public read access for gallery" ON storage.objects FOR SELECT 
    USING (bucket_id = 'gallery');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Auth insert access for gallery'
  ) THEN
    CREATE POLICY "Auth insert access for gallery" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'gallery');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Auth update access for gallery'
  ) THEN
    CREATE POLICY "Auth update access for gallery" ON storage.objects FOR UPDATE
    USING (bucket_id = 'gallery');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Auth delete access for gallery'
  ) THEN
    CREATE POLICY "Auth delete access for gallery" ON storage.objects FOR DELETE
    USING (bucket_id = 'gallery');
  END IF;

  -- Reviews bucket policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public read access for reviews'
  ) THEN
    CREATE POLICY "Public read access for reviews" ON storage.objects FOR SELECT 
    USING (bucket_id = 'reviews');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Auth insert access for reviews'
  ) THEN
    CREATE POLICY "Auth insert access for reviews" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'reviews');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Auth update access for reviews'
  ) THEN
    CREATE POLICY "Auth update access for reviews" ON storage.objects FOR UPDATE
    USING (bucket_id = 'reviews');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Auth delete access for reviews'
  ) THEN
    CREATE POLICY "Auth delete access for reviews" ON storage.objects FOR DELETE
    USING (bucket_id = 'reviews');
  END IF;
END $$;
