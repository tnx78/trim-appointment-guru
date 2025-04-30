
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function AuthPage() {
  const { isAuthenticated, loading, isAdmin, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');

  // Handle redirection when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Auth state in AuthPage:', { isAuthenticated, isAdmin });
      if (isAdmin) {
        console.log('Redirecting admin to admin panel');
        navigate('/admin');
      } else {
        console.log('Redirecting regular user to home');
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Return loading state
  if (loading) {
    return <div className="container py-10 flex items-center justify-center min-h-[60vh]">
      <p>Loading authentication...</p>
    </div>;
  }
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    if (isAdmin) {
      console.log('Redirecting to admin page from auth page');
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/" />;
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error('Google login error:', error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook();
    } catch (error: any) {
      console.error('Facebook login error:', error);
    }
  };

  return (
    <div className="container py-10 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-8">
        <Scissors className="h-10 w-10 text-salon-500 mr-2" />
        <h1 className="text-3xl font-bold">TrimGuru</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="reset">Reset Password</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm 
                onForgotPassword={() => setActiveTab('reset')}
                onGoogleLogin={handleGoogleLogin}
                onFacebookLogin={handleFacebookLogin}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Fill in your details to create a new account</CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm 
                onGoogleLogin={handleGoogleLogin}
                onFacebookLogin={handleFacebookLogin}
                onSuccess={() => setActiveTab('login')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reset">
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter your email to receive a password reset link</CardDescription>
            </CardHeader>
            <CardContent>
              <ResetPasswordForm
                onBackToLogin={() => setActiveTab('login')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
