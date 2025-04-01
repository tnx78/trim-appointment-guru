
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Scissors, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isAuthenticated } = useAuth();

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('Current session status in AdminLogin:', data.session ? 'Active' : 'None');
      
      // If no session but isAdmin is set in localStorage, clear it to prevent confusion
      if (!data.session && localStorage.getItem('isAdmin')) {
        console.log('No session found but isAdmin was in localStorage, clearing it');
        localStorage.removeItem('isAdmin');
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      console.log('Starting login attempt with:', username);
      const success = await login(username, password);
      
      if (success) {
        console.log('Login successful');
        
        // Verify session establishment after login
        const { data } = await supabase.auth.getSession();
        console.log('Session after login:', data.session ? 'Active' : 'None');
        
        toast.success('Successfully logged in');
      } else {
        console.log('Login failed');
        setErrorMessage('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-fit mb-4">
            <Scissors className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Salon Admin Login</CardTitle>
          <CardDescription>Login to access the salon administration panel</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 text-sm bg-destructive/15 text-destructive rounded-md">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Default credentials for demo:</p>
            <p>Username: admin / Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
