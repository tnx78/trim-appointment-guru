
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export function useSessionVerification(
  setSessionVerified: (value: boolean) => void,
  setDemoMode: (value: boolean) => void
) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Verify session when the hook is initialized
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Check for a real Supabase session
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session;
        
        // Check if we're in demo mode (admin flag set in localStorage)
        const inDemoMode = !hasSession && localStorage.getItem('isAdmin') === 'true';
        
        setDemoMode(inDemoMode);
        setSessionVerified(true);
        
        console.log('Session verified in useSessionVerification:', 
          hasSession ? 'Active' : (inDemoMode ? 'Demo Mode' : 'No Session'));
      } catch (error) {
        console.error('Error verifying session:', error);
        setSessionVerified(true); // Still mark as verified to prevent loading state
      }
    };
    
    verifySession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in useSessionVerification:', event, session ? 'Session exists' : 'No session');
      // Check demo mode again when auth state changes
      const inDemoMode = !session && localStorage.getItem('isAdmin') === 'true';
      setDemoMode(inDemoMode);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
