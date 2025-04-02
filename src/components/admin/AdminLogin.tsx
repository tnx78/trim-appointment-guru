
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Scissors, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const { login, isAuthenticated, isAdmin } = useAuth();

  // If already authenticated but not admin, redirect to home
  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/" />;
  }

  // If already authenticated as admin, redirect to admin panel
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setDebugInfo('');
    setIsLoading(true);
    
    try {
      // Use direct Supabase client for detailed error reporting
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        setErrorMessage(`Login failed: ${error.message}`);
        
        // Add some debug info
        setDebugInfo(`Error code: ${error.status || 'unknown'}, 
          Message: ${error.message}, 
          Email used: ${email}`);
        
        return;
      }
      
      if (data?.user) {
        // Check if user is admin by fetching profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          setErrorMessage(`Could not verify admin status: ${profileError.message}`);
          toast.error('Failed to verify admin privileges');
          return;
        }
        
        if (profileData?.role !== 'admin') {
          setErrorMessage('This account does not have admin privileges');
          await supabase.auth.signOut();
          return;
        }
        
        toast.success('Successfully logged in as admin');
      } else {
        setErrorMessage('Login failed with an unknown error');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred during login');
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
              <p className="font-medium">Error:</p>
              <p>{errorMessage}</p>
            </div>
          )}
          
          {debugInfo && (
            <div className="mb-4 p-3 text-xs bg-amber-100 text-amber-800 rounded-md">
              <div className="flex items-center gap-1 mb-1">
                <Info className="h-3 w-3" />
                <p className="font-medium">Debug Info:</p>
              </div>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
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
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">Default admin credentials:</p>
            <div className="mt-1 p-2 bg-muted rounded text-sm">
              <p><strong>Email:</strong> hello@okospincer.hu</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
