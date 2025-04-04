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
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Helper function to check if user has admin role
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

  // Main session initialization and auth state change listener
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up the auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession ? 'Session exists' : 'No session');
        
        if (currentSession) {
          setUser(currentSession.user);
          setIsAuthenticated(true);
          
          // Use setTimeout to prevent potential deadlocks with Supabase client
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
    
    // Check for existing session
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
    
    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
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
      
      console.log('Login successful, session established');
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

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('Google login error:', error);
        toast.error(error.message || 'Failed to login with Google');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const loginWithFacebook = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('Facebook login error:', error);
        toast.error(error.message || 'Failed to login with Facebook');
      }
    } catch (error: any) {
      console.error('Facebook login error:', error);
      toast.error(error.message || 'Failed to login with Facebook');
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
        console.error('Logout error:', error);
        toast.error(error.message);
        return;
      }
      
      // Explicitly clear state
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      toast.success('Successfully logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
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
      isAdmin,
      loginWithGoogle,
      loginWithFacebook
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
