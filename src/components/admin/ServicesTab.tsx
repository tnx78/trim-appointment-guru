
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function ServicesTab() {
  const { categories, services, deleteService } = useAppContext();
  
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<typeof services[0] | undefined>(undefined);

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

  const handleServiceModalClose = () => {
    setShowServiceModal(false);
    setEditingService(undefined);
  };

  return (
    <>
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
    </>
  );
}
