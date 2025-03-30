
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ServiceCategoryForm } from '@/components/admin/ServiceCategoryForm';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { AppointmentList } from '@/components/admin/AppointmentList';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const { categories, services, deleteCategory, deleteService } = useAppContext();
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<typeof categories[0] | undefined>(undefined);
  const [editingService, setEditingService] = useState<typeof services[0] | undefined>(undefined);

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: typeof categories[0]) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (id: string) => {
    const hasServices = services.some(service => service.categoryId === id);
    if (hasServices) {
      toast.error("Cannot delete category with existing services");
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  const handleAddService = () => {
    setEditingService(undefined);
    setShowServiceModal(true);
  };

  const handleEditService = (service: typeof services[0]) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
    }
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setEditingCategory(undefined);
  };

  const handleServiceModalClose = () => {
    setShowServiceModal(false);
    setEditingService(undefined);
  };

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
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Manage your salon services</CardDescription>
                </div>
                <Button onClick={handleAddService}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No services yet. Create your first service to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => {
                    const category = categories.find(c => c.id === service.categoryId);
                    return (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {category?.name} • {service.duration} min • ${service.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditService(service)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              </DialogHeader>
              <ServiceForm 
                service={editingService} 
                onComplete={handleServiceModalClose} 
              />
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="categories" className="pt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Service Categories</CardTitle>
                  <CardDescription>Manage your service categories</CardDescription>
                </div>
                <Button onClick={handleAddCategory}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No categories yet. Create your first category to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground">{category.description}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              </DialogHeader>
              <ServiceCategoryForm 
                category={editingCategory} 
                onComplete={handleCategoryModalClose} 
              />
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
