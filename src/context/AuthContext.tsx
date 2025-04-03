
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
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
    
    async function initialize() {
      try {
        // First, set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event, currentSession ? 'Session exists' : 'No session');
            
            // Always update the session state
            setSession(currentSession);
            
            if (currentSession) {
              setUser(currentSession.user);
              setIsAuthenticated(true);
              
              // Check admin role
              const isAdminUser = await checkUserRole(currentSession.user.id);
              console.log('Setting isAdmin to:', isAdminUser);
              setIsAdmin(isAdminUser);
            } else {
              setUser(null);
              setIsAuthenticated(false);
              setIsAdmin(false);
            }
            
            // Only set loading to false after we've updated everything
            setLoading(false);
          }
        );
        
        // Then, get the initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session check:', initialSession ? 'Session exists' : 'No session');
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setIsAuthenticated(true);
          
          // Check admin role
          const isAdminUser = await checkUserRole(initialSession.user.id);
          console.log('Setting initial isAdmin to:', isAdminUser);
          setIsAdmin(isAdminUser);
        }
        
        // Set loading to false when initialization is complete
        setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setLoading(false);
      }
    }
    
    initialize();
  }, []);

  const register = async (email: string, password: string, fullName: string, phone?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || '',
          },
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Registration successful! Please check your email to verify your account.');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to register.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('Attempting login for', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }
      
      console.log('Login successful, checking user role');
      
      // User is authenticated at this point, but we don't need to update state here
      // as the onAuthStateChange listener will handle that
      
      toast.success('Login successful');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      console.log('Logging out user');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      // Don't clear state here, the onAuthStateChange listener will handle that
      
      toast.success('Successfully logged out');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout.');
    } finally {
      setLoading(false);
    }
  };

  // Provide the auth state and functions
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
