
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuthState() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  const checkUserRole = async (userId: string): Promise<boolean> => {
    try {
      console.log('Checking user role for:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return false;
      }
      
      const isAdminRole = data?.role === 'admin';
      console.log('User role check result:', isAdminRole ? 'Admin' : 'Not admin');
      return isAdminRole;
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession ? 'Session exists' : 'No session');
        
        if (currentSession) {
          setUser(currentSession.user);
          setIsAuthenticated(true);
          
          setTimeout(async () => {
            const isAdminUser = await checkUserRole(currentSession.user.id);
            console.log('Setting isAdmin to:', isAdminUser);
            setIsAdmin(isAdminUser);
          }, 0);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );
    
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error retrieving session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Initial session check:', data.session ? 'Session exists' : 'No session');
        
        if (data.session) {
          setUser(data.session.user);
          setIsAuthenticated(true);
          
          const isAdminUser = await checkUserRole(data.session.user.id);
          console.log('Setting initial isAdmin to:', isAdminUser);
          setIsAdmin(isAdminUser);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    user,
    isAuthenticated,
    isAdmin
  };
}
