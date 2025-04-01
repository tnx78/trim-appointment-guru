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
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        // Check if admin (simple implementation)
        const isAdminUser = session?.user?.email === 'admin@example.com' || localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(isAdminUser);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Session exists' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      
      // Check if admin (simple implementation)
      const isAdminUser = session?.user?.email === 'admin@example.com' || localStorage.getItem('isAdmin') === 'true';
      setIsAdmin(isAdminUser);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // User registration function
  const register = async (email: string, password: string, fullName: string, phone?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Add user metadata that will be used by the database trigger to create the profile
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

  // User login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Maintain backward compatibility with admin login
      if (email === 'admin' && password === 'admin123') {
        console.log('Admin login via local auth');
        
        // For admin login, we'll create a session with a fixed email
        // This ensures Supabase has a valid session for database operations
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@example.com',
          password: 'Admin123!', // Use a strong fixed password for this admin account
        });
        
        if (error) {
          // Try to sign up the admin user if it doesn't exist
          console.log('Attempting to create admin account');
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'admin@example.com',
            password: 'Admin123!',
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
          
          // Try logging in again
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@example.com',
            password: 'Admin123!',
          });
          
          if (loginError) {
            console.error('Admin login failed after account creation:', loginError.message);
            toast.error('Admin login failed: ' + loginError.message);
            return false;
          }
        }
        
        // Set the admin flag in local storage
        localStorage.setItem('isAdmin', 'true');
        setIsAuthenticated(true);
        setIsAdmin(true);
        
        toast.success('Successfully logged in as admin');
        return true;
      }
      
      console.log('Attempting Supabase login');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }
      
      // Success is handled by onAuthStateChange
      toast.success('Successfully logged in');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to login.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // User logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      console.log('Logging out user');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      // Clear admin flag
      localStorage.removeItem('isAdmin');
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      // Success is handled by onAuthStateChange
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
