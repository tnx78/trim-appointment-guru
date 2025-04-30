
import { supabase } from '@/integrations/supabase/client';

export function useGallerySession() {
  // Check session and demo mode
  const checkSession = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const hasRealSession = !!sessionData.session;
    const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
    
    return { hasRealSession, inDemoMode };
  };
  
  return {
    checkSession
  };
}
