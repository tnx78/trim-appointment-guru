
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { PlusCircle, Edit, Trash2, Filter, GripVertical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function ServicesTab() {
  const { categories, services, deleteService, updateServiceOrder } = useAppContext();
  
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<typeof services[0] | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [draggedService, setDraggedService] = useState<string | null>(null);

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

  const handleDragStart = (e: React.DragEvent, serviceId: string) => {
    setDraggedService(serviceId);
    e.dataTransfer.effectAllowed = 'move';
    // Use a transparent image as drag ghost to create custom drag preview
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, serviceId: string) => {
    e.preventDefault();
    if (draggedService && draggedService !== serviceId) {
      const draggedIndex = filteredServices.findIndex(s => s.id === draggedService);
      const hoverIndex = filteredServices.findIndex(s => s.id === serviceId);
      
      if (draggedIndex !== -1 && hoverIndex !== -1) {
        // Get all services in the same category
        const categoryServices = selectedCategoryId === 'all' 
          ? services 
          : services.filter(s => s.categoryId === selectedCategoryId);
          
        // Create a new array to avoid mutations
        const newServiceOrder = [...categoryServices];
        const [draggedItem] = newServiceOrder.splice(draggedIndex, 1);
        newServiceOrder.splice(hoverIndex, 0, draggedItem);
        
        // Update order for each service
        const updatedServices = newServiceOrder.map((service, index) => ({
          ...service,
          order: index
        }));
        
        // Update context with new order
        updateServiceOrder(updatedServices);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedService(null);
  };

  // Sort services by order
  const sortedServices = [...services].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 0;
    const orderB = b.order !== undefined ? b.order : 0;
    return orderA - orderB;
  });

  const filteredServices = selectedCategoryId === 'all' 
    ? sortedServices 
    : sortedServices.filter(service => service.categoryId === selectedCategoryId);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Services</CardTitle>
              <CardDescription>Manage your salon services</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddService}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {selectedCategoryId === 'all' 
                ? 'No services yet. Create your first service to get started.' 
                : 'No services in this category.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => {
                const category = categories.find(c => c.id === service.categoryId);
                return (
                  <div 
                    key={service.id} 
                    className={`flex items-center justify-between p-4 border rounded-lg ${draggedService === service.id ? 'opacity-50 bg-gray-100' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, service.id)}
                    onDragOver={(e) => handleDragOver(e, service.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center gap-4">
                      <div className="cursor-move">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {service.image && (
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                          <img 
                            src={service.image} 
                            alt={service.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category?.name} • {service.duration} min • ${service.price.toFixed(2)}
                        </div>
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
