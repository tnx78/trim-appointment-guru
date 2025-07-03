
-- Enable RLS on tables that don't have it
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for services table
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policies for categories table
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policies for email_templates table
CREATE POLICY "Authenticated users can manage email templates" ON public.email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policies for salon_hours table
CREATE POLICY "Anyone can view salon hours" ON public.salon_hours FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage salon hours" ON public.salon_hours FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policies for scheduled_emails table
CREATE POLICY "Authenticated users can manage scheduled emails" ON public.scheduled_emails FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Clean up duplicate/conflicting policies on gallery tables
-- Drop all existing policies on gallery_categories and gallery_images
DROP POLICY IF EXISTS "Admin users can modify gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Admins can manage gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow admin delete from gallery_categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow admin insert to gallery_categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow admin update to gallery_categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Authenticated users can insert gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow all users to view gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow public read access to gallery_categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow public to view gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Anyone can view gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Authenticated users can delete gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Authenticated users can update gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Public read access for gallery categories" ON public.gallery_categories;

-- Create simplified policies for gallery_categories
CREATE POLICY "Public can view gallery categories" ON public.gallery_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage gallery categories" ON public.gallery_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Drop all existing policies on gallery_images
DROP POLICY IF EXISTS "Admin users can modify gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can manage gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow admin delete from gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow admin insert to gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow admin update to gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow all users to view gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow authenticated users to manage gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow authenticated users to update gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow public read access to gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow public to view gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can view gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated users can insert gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Public read access for gallery images" ON public.gallery_images;

-- Create simplified policies for gallery_images
CREATE POLICY "Public can view gallery images" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage gallery images" ON public.gallery_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
