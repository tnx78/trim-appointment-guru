
-- Security Fix: Implement proper role-based access control for RLS policies

-- First, create a security definer function to check if a user is an admin
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Fix categories table - only admins can manage
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix services table - only admins can manage
DROP POLICY IF EXISTS "Authenticated users can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix gallery_categories table - only admins can manage
DROP POLICY IF EXISTS "Authenticated users can manage gallery categories" ON public.gallery_categories;
CREATE POLICY "Admins can manage gallery categories" ON public.gallery_categories
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix gallery_images table - only admins can manage
DROP POLICY IF EXISTS "Authenticated users can manage gallery images" ON public.gallery_images;
CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix salon_hours table - only admins can manage
DROP POLICY IF EXISTS "Authenticated users can manage salon hours" ON public.salon_hours;
CREATE POLICY "Admins can manage salon hours" ON public.salon_hours
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix salon_settings table - only admins can manage
DROP POLICY IF EXISTS "Authenticated users can manage salon settings" ON public.salon_settings;
CREATE POLICY "Admins can manage salon settings" ON public.salon_settings
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix email_templates table - only admins can manage
DROP POLICY IF EXISTS "Authenticated users can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix scheduled_emails table - only admins can manage
DROP POLICY IF EXISTS "Authenticated users can manage scheduled emails" ON public.scheduled_emails;
CREATE POLICY "Admins can manage scheduled emails" ON public.scheduled_emails
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix site_content table - only admins can update
DROP POLICY IF EXISTS "Authenticated users can update site content" ON public.site_content;
CREATE POLICY "Admins can update site content" ON public.site_content
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix hero_settings table - only admins can update
DROP POLICY IF EXISTS "Authenticated users can update hero settings" ON public.hero_settings;
CREATE POLICY "Admins can update hero settings" ON public.hero_settings
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Fix appointments table - improve the existing policies
DROP POLICY IF EXISTS "Authenticated users can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can manage their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments without user_id" ON public.appointments;

-- Create proper appointment policies
CREATE POLICY "Admins can manage all appointments" ON public.appointments
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow anyone to create appointments (booking functionality)
CREATE POLICY "Anyone can create appointments" ON public.appointments
  FOR INSERT
  WITH CHECK (true);

-- Add password validation trigger for better security
CREATE OR REPLACE FUNCTION public.validate_password_strength()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be enforced on the client side, but we add a trigger for additional security
  -- Password must be at least 8 characters (Supabase default is 6)
  IF LENGTH(NEW.encrypted_password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters long';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would need to be applied to auth.users, but we can't modify auth schema
-- So we'll handle password validation in the client code instead
