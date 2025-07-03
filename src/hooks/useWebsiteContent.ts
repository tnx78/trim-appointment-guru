
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HeroSettings {
  background_image_url: string | null;
}

interface SiteContent {
  content_key: string;
  content_value: string;
}

export function useWebsiteContent() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  const getContentByKey = (key: string, fallback: string = '') => {
    return siteContent.find(item => item.content_key === key)?.content_value || fallback;
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch hero settings
        const { data: heroData } = await supabase
          .from('hero_settings')
          .select('background_image_url')
          .single();
        
        if (heroData) {
          setHeroSettings(heroData);
        }

        // Fetch site content
        const { data: contentData } = await supabase
          .from('site_content')
          .select('content_key, content_value');
        
        if (contentData) {
          setSiteContent(contentData);
        }
      } catch (error) {
        console.error('Error fetching website content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return {
    heroSettings,
    siteContent,
    loading,
    getContentByKey
  };
}
