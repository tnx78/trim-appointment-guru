
import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

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
  resetPassword: (email: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loading, user, isAuthenticated, isAdmin } = useAuthState();
  const { 
    loading: actionsLoading, 
    login, 
    register, 
    logout,
    loginWithGoogle,
    loginWithFacebook,
    resetPassword
  } = useAuthActions();

  // Combine loading states
  const isLoading = loading || actionsLoading;

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading: isLoading, 
      login, 
      register, 
      logout, 
      isAdmin,
      loginWithGoogle,
      loginWithFacebook,
      resetPassword
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
