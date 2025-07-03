
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HeroSettings {
  id: string;
  background_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useContentManagement() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch hero settings
  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching hero settings:', error);
        return;
      }

      setHeroSettings(data);
    } catch (error) {
      console.error('Error fetching hero settings:', error);
    }
  };

  // Fetch site content
  const fetchSiteContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('content_key');

      if (error) {
        console.error('Error fetching site content:', error);
        return;
      }

      setSiteContent(data || []);
    } catch (error) {
      console.error('Error fetching site content:', error);
    }
  };

  // Update hero background image
  const updateHeroBackground = async (imageUrl: string | null) => {
    if (!heroSettings) return false;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('hero_settings')
        .update({ 
          background_image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', heroSettings.id);

      if (error) {
        console.error('Error updating hero background:', error);
        toast.error('Failed to update hero background');
        return false;
      }

      setHeroSettings(prev => prev ? { ...prev, background_image_url: imageUrl } : null);
      toast.success('Hero background updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating hero background:', error);
      toast.error('Failed to update hero background');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Update site content
  const updateSiteContent = async (contentKey: string, newValue: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .update({ 
          content_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('content_key', contentKey);

      if (error) {
        console.error('Error updating site content:', error);
        toast.error('Failed to update content');
        return false;
      }

      setSiteContent(prev => 
        prev.map(item => 
          item.content_key === contentKey 
            ? { ...item, content_value: newValue }
            : item
        )
      );
      toast.success('Content updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating site content:', error);
      toast.error('Failed to update content');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Get content by key
  const getContentByKey = (key: string) => {
    return siteContent.find(item => item.content_key === key)?.content_value || '';
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHeroSettings(), fetchSiteContent()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    heroSettings,
    siteContent,
    loading,
    updating,
    updateHeroBackground,
    updateSiteContent,
    getContentByKey,
    refetch: () => Promise.all([fetchHeroSettings(), fetchSiteContent()])
  };
}
