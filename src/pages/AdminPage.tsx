
import { useEffect, useState } from 'react';
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
import { ChevronLeft, LogOut } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger 
} from "@/components/ui/drawer";

export default function AdminPage() {
  const { isAuthenticated, logout, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("appointments");
  
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
  }, [activeTab]);
  
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

  const tabItems = [
    { id: "appointments", label: "Appointments" },
    { id: "services", label: "Services" },
    { id: "categories", label: "Categories" },
    { id: "hours", label: "Opening Hours" },
    { id: "daysoff", label: "Days Off" },
    { id: "emails", label: "Emails" },
    { id: "gallery", label: "Gallery" }
  ];

  return (
    <div className="container py-4 md:py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-3xl font-bold">Salon Administration</h1>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

      {isMobile ? (
        <div className="w-full">
          <div className="flex flex-col mb-4 gap-2">
            <div className="flex justify-between items-center">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="w-full flex justify-between">
                    {tabItems.find(tab => tab.id === activeTab)?.label}
                    <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                      {tabItems.indexOf(tabItems.find(tab => tab.id === activeTab) || tabItems[0]) + 1}/{tabItems.length}
                    </span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[70vh]">
                  <DrawerHeader>
                    <DrawerTitle>Select Section</DrawerTitle>
                  </DrawerHeader>
                  <div className="flex flex-col p-4">
                    {tabItems.map((tab) => (
                      <DrawerClose asChild key={tab.id}>
                        <Button 
                          variant={activeTab === tab.id ? "default" : "ghost"} 
                          className="w-full justify-start mb-1 text-left" 
                          onClick={() => setActiveTab(tab.id)}
                        >
                          {tab.label}
                        </Button>
                      </DrawerClose>
                    ))}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                className="w-[49%]"
                onClick={() => {
                  const currentIndex = tabItems.findIndex(tab => tab.id === activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabItems[currentIndex - 1].id);
                  }
                }}
                disabled={tabItems.findIndex(tab => tab.id === activeTab) === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-[49%]"
                onClick={() => {
                  const currentIndex = tabItems.findIndex(tab => tab.id === activeTab);
                  if (currentIndex < tabItems.length - 1) {
                    setActiveTab(tabItems[currentIndex + 1].id);
                  }
                }}
                disabled={tabItems.findIndex(tab => tab.id === activeTab) === tabItems.length - 1}
              >
                Next
                <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
              </Button>
            </div>
          </div>
          
          <div className="pt-2">
            {activeTab === "appointments" && <AppointmentList />}
            {activeTab === "services" && <ServicesTab />}
            {activeTab === "categories" && <CategoriesTab />}
            {activeTab === "hours" && <SalonHoursTab />}
            {activeTab === "daysoff" && <DayOffTab />}
            {activeTab === "emails" && <EmailTemplatesTab />}
            {activeTab === "gallery" && <GalleryTab />}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="appointments" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            {tabItems.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
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
      )}
    </div>
  );
}
