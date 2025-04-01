
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        const isAdminUser = session?.user?.email?.includes('admin') || localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(isAdminUser);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Session exists' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      
      const isAdminUser = session?.user?.email?.includes('admin') || localStorage.getItem('isAdmin') === 'true';
      setIsAdmin(isAdminUser);
      setLoading(false);
    });

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
      
      // Special case for admin login
      if (email === 'admin' && password === 'admin123') {
        console.log('Admin login via local auth');
        
        // Use a valid email format
        const adminEmail = 'admin@salonapp.com'; 
        const adminPassword = 'Admin123!';
        
        // Try to sign in with the admin credentials
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });
        
        if (error) {
          console.log('Attempting to create admin account');
          // Create admin account if it doesn't exist
          const { error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
              data: {
                full_name: 'Admin User',
                is_admin: true
              }
            }
          });
          
          if (signUpError) {
            console.error('Could not create admin account:', signUpError.message);
            toast.error('Admin login failed: ' + signUpError.message);
            return false;
          }
          
          // Try to sign in again after creating the account
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword,
          });
          
          if (loginError) {
            console.error('Admin login failed after account creation:', loginError.message);
            toast.error('Admin login failed: ' + loginError.message);
            return false;
          }
        }
        
        // Set admin status in localStorage for persistence
        localStorage.setItem('isAdmin', 'true');
        setIsAuthenticated(true);
        setIsAdmin(true);
        
        toast.success('Successfully logged in as admin');
        return true;
      }
      
      // Regular user login
      console.log('Attempting Supabase login');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Successfully logged in');
      return true;
    } catch (error: any) {
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
      
      localStorage.removeItem('isAdmin');
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      toast.success('Successfully logged out');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout.');
    } finally {
      setLoading(false);
    }
  };

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
