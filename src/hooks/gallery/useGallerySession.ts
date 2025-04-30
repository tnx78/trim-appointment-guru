
import { supabase } from '@/integrations/supabase/client';

export function useGallerySession() {
  const checkSession = async (): Promise<{ hasRealSession: boolean, inDemoMode: boolean }> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      return { hasRealSession, inDemoMode };
    } catch (error) {
      console.error('Error checking session:', error);
      return { hasRealSession: false, inDemoMode: false };
    }
  };
  
  return { checkSession };
}
