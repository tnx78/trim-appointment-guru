
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { ServicesTab } from '@/components/admin/ServicesTab';
import { AppointmentList } from '@/components/admin/AppointmentList';
import { SalonHoursTab } from '@/components/admin/SalonHoursTab';
import { DayOffTab } from '@/components/admin/DayOffTab';
import { EmailTemplatesTab } from '@/components/admin/EmailTemplatesTab';
import { GalleryTab } from '@/components/admin/GalleryTab';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminPage() {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const [sessionVerified, setSessionVerified] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  
  // Verify session immediately on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log('Verifying session in AdminPage...');
        const { data: { session } } = await supabase.auth.getSession();
        const sessionActive = !!session;
        setHasActiveSession(sessionActive);
        console.log('Session verification result in AdminPage:', sessionActive ? 'Active' : 'None');
        setSessionVerified(true);
      } catch (error) {
        console.error('Failed to verify session:', error);
        setSessionVerified(true); // Still mark as verified even on error
      }
    };
    
    verifySession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in AdminPage:', event, session ? 'Session exists' : 'No session');
      setHasActiveSession(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // This will help for showing tabs on mobile
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Wait for session verification before rendering
  if (!sessionVerified) {
    return <div className="flex justify-center items-center h-screen">Verifying authentication...</div>;
  }
  
  // If not authenticated or not admin, show login
  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin />;
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Salon Administration</h1>
        <Button variant="outline" onClick={logout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      {(!hasActiveSession && !localStorage.getItem('isAdmin')) ? (
        <div className="bg-amber-100 border border-amber-300 text-amber-800 p-4 rounded-md mb-6">
          Warning: You appear to be using admin features without a proper authentication session.
          You may encounter issues when saving data. Please try logging out and logging in again.
        </div>
      ) : null}

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
