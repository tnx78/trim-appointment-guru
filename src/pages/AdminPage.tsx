
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { ServicesTab } from '@/components/admin/ServicesTab';
import { AppointmentList } from '@/components/admin/AppointmentList';
import { SalonHoursTab } from '@/components/admin/SalonHoursTab';
import { DayOffTab } from '@/components/admin/DayOffTab';
import { EmailTemplatesTab } from '@/components/admin/EmailTemplatesTab';
import { GalleryTab } from '@/components/admin/GalleryTab';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminPage() {
  const { isAuthenticated, logout, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('AdminPage auth state:', { 
      isAuthenticated, 
      isAdmin, 
      loading, 
      user: user?.email 
    });
  }, [isAuthenticated, isAdmin, loading, user]);
  
  // This will help for showing tabs on mobile
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Display loading state
  if (loading) {
    return (
      <div className="container py-10 flex justify-center">
        <p>Loading authentication status...</p>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to auth page');
    toast.error('Please log in to access the admin panel');
    return <Navigate to="/auth" />;
  }
  
  // If authenticated but not admin, redirect to home with error message
  if (!isAdmin) {
    console.log('User authenticated but not admin, redirecting to home');
    toast.error('You do not have permission to access the admin panel');
    return <Navigate to="/" />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Successfully logged out, navigating to home');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Salon Administration</h1>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-7 md:grid-cols-7 overflow-auto">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="hours">Opening Hours</TabsTrigger>
          <TabsTrigger value="daysoff">Days Off</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="pt-6">
          <AppointmentList />
        </TabsContent>
        
        <TabsContent value="services" className="pt-6">
          <ServicesTab />
        </TabsContent>
        
        <TabsContent value="categories" className="pt-6">
          <CategoriesTab />
        </TabsContent>
        
        <TabsContent value="hours" className="pt-6">
          <SalonHoursTab />
        </TabsContent>
        
        <TabsContent value="daysoff" className="pt-6">
          <DayOffTab />
        </TabsContent>
        
        <TabsContent value="emails" className="pt-6">
          <EmailTemplatesTab />
        </TabsContent>
        
        <TabsContent value="gallery" className="pt-6">
          <GalleryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
