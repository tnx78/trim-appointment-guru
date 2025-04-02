
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
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // This will help for showing tabs on mobile
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // If not authenticated or not admin, redirect to auth page with a message
  if (!isAuthenticated) {
    toast.error('You must be logged in to access the admin panel');
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    toast.error('You do not have permission to access the admin panel');
    return <Navigate to="/" />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
