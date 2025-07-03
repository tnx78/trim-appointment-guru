
-- Create a table to store the hero background image
CREATE TABLE public.hero_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  background_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default hero settings
INSERT INTO public.hero_settings (background_image_url) VALUES (NULL);

-- Create a table to store editable text content
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default content values
INSERT INTO public.site_content (content_key, content_value, description) VALUES
('hero_title', 'Book Your Perfect Haircut Today', 'Main hero section title'),
('hero_subtitle', 'Experience the best salon services with our professional stylists. Easy online booking, flexible scheduling.', 'Hero section subtitle'),
('hero_cta_primary', 'Book Now', 'Primary call-to-action button text'),
('hero_cta_secondary', 'View Services', 'Secondary call-to-action button text'),
('services_section_title', 'Our Services', 'Services section title'),
('services_section_subtitle', 'Professional hair services for every style', 'Services section subtitle'),
('why_choose_title', 'Why Choose Us', 'Why choose us section title'),
('why_choose_subtitle', 'Experience the difference', 'Why choose us section subtitle'),
('cta_section_title', 'Ready to Look Your Best?', 'Final CTA section title'),
('cta_section_subtitle', 'Book your appointment today', 'Final CTA section subtitle'),
('expert_stylists_title', 'Expert Stylists', 'Expert stylists card title'),
('expert_stylists_text', 'Our team of professional stylists are trained in the latest techniques and trends.', 'Expert stylists card text'),
('easy_booking_title', 'Easy Booking', 'Easy booking card title'),
('easy_booking_text', 'Book your appointment online in just a few clicks, anytime, anywhere.', 'Easy booking card text'),
('flexible_hours_title', 'Flexible Hours', 'Flexible hours card title'),
('flexible_hours_text', 'We offer flexible scheduling to accommodate your busy lifestyle.', 'Flexible hours card text'),
('personalized_service_title', 'Personalized Service', 'Personalized service card title'),
('personalized_service_text', 'We take the time to understand your needs for the perfect look.', 'Personalized service card text');

-- Enable Row Level Security
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Create policies for hero_settings (public read, admin write)
CREATE POLICY "Anyone can view hero settings" 
  ON public.hero_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can update hero settings" 
  ON public.hero_settings 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create policies for site_content (public read, admin write)
CREATE POLICY "Anyone can view site content" 
  ON public.site_content 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can update site content" 
  ON public.site_content 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');
