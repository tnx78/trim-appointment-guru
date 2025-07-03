import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { ServicesTab } from '@/components/admin/ServicesTab';
import { AppointmentList } from '@/components/admin/AppointmentList';
import { SalonHoursTab } from '@/components/admin/SalonHoursTab';
import { DayOffTab } from '@/components/admin/DayOffTab';
import { EmailTemplatesTab } from '@/components/admin/EmailTemplatesTab';
import { GalleryTab } from '@/components/admin/GalleryTab';
import { ContentManagementTab } from '@/components/admin/ContentManagementTab';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, FolderOpen, ChevronRight, Clock, ImageIcon, LogOut, Mail, Settings, Sparkles, FileText } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminPage() {
  const { isAuthenticated, logout, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("appointments");
  
  useEffect(() => {
    console.log('AdminPage auth state:', { 
      isAuthenticated, 
      isAdmin, 
      loading, 
      user: user?.email 
    });
  }, [isAuthenticated, isAdmin, loading, user]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  if (loading) {
    return (
      <div className="container py-10 flex justify-center">
        <p>Loading authentication status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to auth page');
    toast.error('Please log in to access the admin panel');
    return <Navigate to="/auth" />;
  }
  
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
    { id: "appointments", label: "Appointments", icon: <Calendar className="h-5 w-5" /> },
    { id: "services", label: "Services", icon: <Sparkles className="h-5 w-5" /> },
    { id: "categories", label: "Categories", icon: <FolderOpen className="h-5 w-5" /> },
    { id: "hours", label: "Opening Hours", icon: <Clock className="h-5 w-5" /> },
    { id: "daysoff", label: "Days Off", icon: <Calendar className="h-5 w-5" /> },
    { id: "emails", label: "Emails", icon: <Mail className="h-5 w-5" /> },
    { id: "gallery", label: "Gallery", icon: <ImageIcon className="h-5 w-5" /> },
    { id: "content", label: "Content", icon: <FileText className="h-5 w-5" /> }
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
          <div className="flex justify-between items-center mb-4">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center">
                  {tabItems.find(tab => tab.id === activeTab)?.icon}
                  <span className="mx-2">{tabItems.find(tab => tab.id === activeTab)?.label}</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader>
                  <DrawerTitle className="text-center">Admin Navigation</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col p-4">
                  <div className="flex items-center gap-3 mb-4 p-2 bg-muted/30 rounded-lg">
                    <Avatar>
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user?.email}</p>
                      <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  {tabItems.map((tab) => (
                    <DrawerClose asChild key={tab.id}>
                      <Button 
                        variant={activeTab === tab.id ? "default" : "ghost"} 
                        className="w-full justify-start mb-1 gap-3" 
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.icon}
                        {tab.label}
                      </Button>
                    </DrawerClose>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          
          <div className="pt-2">
            {activeTab === "appointments" && <AppointmentList />}
            {activeTab === "services" && <ServicesTab />}
            {activeTab === "categories" && <CategoriesTab />}
            {activeTab === "hours" && <SalonHoursTab />}
            {activeTab === "daysoff" && <DayOffTab />}
            {activeTab === "emails" && <EmailTemplatesTab />}
            {activeTab === "gallery" && <GalleryTab />}
            {activeTab === "content" && <ContentManagementTab />}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="appointments" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            {tabItems.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex gap-2 items-center">
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
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
          
          <TabsContent value="content" className="pt-6">
            <ContentManagementTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
