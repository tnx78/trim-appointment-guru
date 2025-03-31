
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { ServicesTab } from '@/components/admin/ServicesTab';
import { AppointmentList } from '@/components/admin/AppointmentList';

export default function AdminPage() {
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Salon Administration</h1>
      </div>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
