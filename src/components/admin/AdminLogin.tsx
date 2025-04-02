
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Scissors, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const hasActiveSession = !!data.session;
      console.log('Current session status in AdminLogin:', hasActiveSession ? 'Active' : 'None');
    };
    
    checkSession();
  }, []);

  // If already authenticated but not admin, redirect to home
  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      console.log('Starting login attempt with:', email);
      const success = await login(email, password);
      
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

  // Demo mode login for easier testing
  const handleDemoLogin = () => {
    setIsLoading(true);
    try {
      localStorage.setItem('isAdmin', 'true');
      toast.success('Logged in as admin (Demo Mode)');
      window.location.reload(); // Reload to apply the demo admin state
    } catch (error) {
      console.error('Demo login error:', error);
      setErrorMessage('Failed to enable demo mode');
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
          <CardDescription>Login with your account to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 text-sm bg-destructive/15 text-destructive rounded-md">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
          
          <div className="mt-4 text-center">
            <Button variant="outline" className="w-full" onClick={handleDemoLogin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up demo...
                </>
              ) : (
                'Use Demo Mode (No Login Required)'
              )}
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>To access admin features, log in with an admin account or use demo mode.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
