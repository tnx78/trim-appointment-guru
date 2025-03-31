
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a simple auth provider for demo purposes
// In a real application, you'd want to use a more secure authentication method
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isAdmin') === 'true'
  );

  // Simple admin authentication (replace with a real auth system)
  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('isAdmin', 'true');
      toast.success('Successfully logged in as admin');
      return true;
    } else {
      toast.error('Invalid credentials');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdmin');
    toast.success('Successfully logged out');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
