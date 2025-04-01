
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapServiceFromDB, mapServiceToDB } from '@/utils/dataMappers';
import { toast } from 'sonner';

// Context type
interface ServiceContextType {
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  updateServiceOrder: (updatedServices: Service[]) => void;
  getServiceById: (id: string) => Service | undefined;
}

// Creating the context
const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

// Provider component
export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch services from Supabase
  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*');
        
        if (error) throw error;
        setServices(data.map(mapServiceFromDB));
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchServices();
  }, []);

  const addService = async (service: Omit<Service, 'id'>) => {
    try {
      const dbService = mapServiceToDB(service);
      
      const { data, error } = await supabase
        .from('services')
        .insert(dbService)
        .select();
      
      if (error) throw error;
      if (data && data.length > 0) {
        const newService = mapServiceFromDB(data[0]);
        setServices([...services, newService]);
        toast.success(`Service "${service.name}" added successfully`);
      }
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    }
  };

  const updateService = async (id: string, updatedData: Partial<Service>) => {
    try {
      // Convert camelCase to snake_case for fields that need to be updated
      const dbUpdatedData: any = {};
      
      if (updatedData.categoryId !== undefined) dbUpdatedData.category_id = updatedData.categoryId;
      if (updatedData.name !== undefined) dbUpdatedData.name = updatedData.name;
      if (updatedData.description !== undefined) dbUpdatedData.description = updatedData.description;
      if (updatedData.duration !== undefined) dbUpdatedData.duration = updatedData.duration;
      if (updatedData.price !== undefined) dbUpdatedData.price = updatedData.price;
      if (updatedData.image !== undefined) dbUpdatedData.image = updatedData.image;
      
      const { error } = await supabase
        .from('services')
        .update(dbUpdatedData)
        .eq('id', id);
      
      if (error) throw error;
      
      setServices(services.map(service => 
        service.id === id ? { ...service, ...updatedData } : service
      ));
      toast.success(`Service updated successfully`);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setServices(services.filter(service => service.id !== id));
      toast.success("Service deleted successfully");
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const updateServiceOrder = async (updatedServices: Service[]) => {
    try {
      // Update local state immediately for responsiveness
      setServices(updatedServices);
      
      // For each service, update its order in the database
      for (const service of updatedServices) {
        const { error } = await supabase
          .from('services')
          .update({ 
            order: service.order 
          })
          .eq('id', service.id);
        
        if (error) throw error;
      }
      
      // No need for a toast here as it's a background operation
    } catch (error) {
      console.error('Error updating service order:', error);
      toast.error('Failed to update service order');
      
      // Fetch services again to reset to server state
      const { data, error: fetchError } = await supabase.from('services').select('*');
      if (!fetchError && data) {
        setServices(data.map(mapServiceFromDB));
      }
    }
  };

  const getServiceById = (id: string) => {
    return services.find(service => service.id === id);
  };

  const value = {
    services,
    addService,
    updateService,
    deleteService,
    updateServiceOrder,
    getServiceById,
  };

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
}

// Custom hook to use the ServiceContext
export function useServiceContext() {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServiceContext must be used within a ServiceProvider');
  }
  return context;
}
