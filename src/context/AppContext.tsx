
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, ServiceCategory, Appointment, TimeSlot } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Context type
interface AppContextType {
  categories: ServiceCategory[];
  services: Service[];
  appointments: Appointment[];
  selectedService: Service | null;
  selectedDate: Date;
  selectedTime: string | null;
  timeSlots: TimeSlot[];
  
  // Actions
  addCategory: (category: Omit<ServiceCategory, 'id'>) => void;
  updateCategory: (id: string, category: Partial<ServiceCategory>) => void;
  deleteCategory: (id: string) => void;
  
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  
  selectService: (service: Service) => void;
  selectDate: (date: Date) => void;
  selectTime: (time: string) => void;
  
  getServiceById: (id: string) => Service | undefined;
  getAvailableTimeSlots: (date: Date, duration: number) => TimeSlot[];
  getAppointmentsForDate: (date: Date) => Appointment[];
  getCategoryById: (id: string) => ServiceCategory | undefined;
  getAppointmentDates: () => Date[];
  reset: () => void;
}

// Creating the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');
        
        if (servicesError) throw servicesError;
        setServices(servicesData);
        
        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*');
        
        if (appointmentsError) throw appointmentsError;
        
        // Convert date strings to Date objects
        const formattedAppointments = appointmentsData.map((app: any) => ({
          ...app,
          date: new Date(app.date)
        }));
        
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data from database');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Generate time slots from 9:00 AM to 5:00 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9:00 AM
    const endHour = 17; // 5:00 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      ['00', '30'].forEach((minutes, index) => {
        const time = `${hour}:${minutes}`;
        slots.push({
          id: `slot-${hour}-${minutes}`,
          time,
          available: true,
        });
      });
    }
    
    return slots;
  };

  // Category operations
  const addCategory = async (category: Omit<ServiceCategory, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select();
      
      if (error) throw error;
      if (data && data.length > 0) {
        setCategories([...categories, data[0]]);
        toast.success(`Category "${category.name}" added successfully`);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const updateCategory = async (id: string, updatedData: Partial<ServiceCategory>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updatedData)
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.map(category => 
        category.id === id ? { ...category, ...updatedData } : category
      ));
      toast.success(`Category updated successfully`);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    const hasServices = services.some(service => service.categoryId === id);
    if (hasServices) {
      toast.error("Can't delete category with existing services");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.filter(category => category.id !== id));
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // Service operations
  const addService = async (service: Omit<Service, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select();
      
      if (error) throw error;
      if (data && data.length > 0) {
        setServices([...services, data[0]]);
        toast.success(`Service "${service.name}" added successfully`);
      }
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    }
  };

  const updateService = async (id: string, updatedData: Partial<Service>) => {
    try {
      const { error } = await supabase
        .from('services')
        .update(updatedData)
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
    const hasAppointments = appointments.some(appointment => appointment.serviceId === id);
    if (hasAppointments) {
      toast.error("Can't delete service with existing appointments");
      return;
    }
    
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

  // Appointment operations
  const bookAppointment = async (appointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const newAppointment = {
        ...appointment,
        status: 'confirmed' as const
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(newAppointment)
        .select();
      
      if (error) throw error;
      if (data && data.length > 0) {
        // Convert date string back to Date object
        const formattedAppointment = {
          ...data[0],
          date: new Date(data[0].date)
        };
        
        setAppointments([...appointments, formattedAppointment]);
        toast.success("Appointment booked successfully");
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  const updateAppointment = async (id: string, updatedData: Partial<Appointment>) => {
    try {
      // If we're updating the date and it's a Date object, convert to ISO string
      const dataToUpdate = { ...updatedData };
      if (dataToUpdate.date instanceof Date) {
        dataToUpdate.date = dataToUpdate.date.toISOString().split('T')[0];
      }
      
      const { error } = await supabase
        .from('appointments')
        .update(dataToUpdate)
        .eq('id', id);
      
      if (error) throw error;
      
      setAppointments(appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, ...updatedData } 
          : appointment
      ));
      toast.success("Appointment updated successfully");
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
      
      setAppointments(appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: 'cancelled' as const } 
          : appointment
      ));
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  // Booking flow operations
  const selectService = (service: Service) => {
    setSelectedService(service);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const selectTime = (time: string) => {
    setSelectedTime(time);
  };

  // Helper functions
  const getServiceById = (id: string) => {
    return services.find(service => service.id === id);
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      appointment.date.toDateString() === date.toDateString() && 
      appointment.status !== 'cancelled'
    );
  };

  // Get all dates that have appointments
  const getAppointmentDates = () => {
    // Filter out cancelled appointments and create a unique list of dates
    const uniqueDates = new Set();
    const datesWithAppointments = appointments
      .filter(appointment => appointment.status !== 'cancelled')
      .map(appointment => {
        const dateString = appointment.date.toDateString();
        if (!uniqueDates.has(dateString)) {
          uniqueDates.add(dateString);
          return appointment.date;
        }
        return null;
      })
      .filter(Boolean) as Date[];
    
    return datesWithAppointments;
  };

  const getAvailableTimeSlots = (date: Date, duration: number) => {
    const dayAppointments = getAppointmentsForDate(date);
    const baseSlots = generateTimeSlots();
    
    // Mark slots as unavailable if they overlap with existing appointments
    dayAppointments.forEach(appointment => {
      const startHour = parseInt(appointment.startTime.split(':')[0]);
      const startMinute = parseInt(appointment.startTime.split(':')[1]);
      const endHour = parseInt(appointment.endTime.split(':')[0]);
      const endMinute = parseInt(appointment.endTime.split(':')[1]);
      
      baseSlots.forEach(slot => {
        const slotHour = parseInt(slot.time.split(':')[0]);
        const slotMinute = parseInt(slot.time.split(':')[1]);
        
        // Convert to minutes for easier comparison
        const appointmentStart = startHour * 60 + startMinute;
        const appointmentEnd = endHour * 60 + endMinute;
        const slotTime = slotHour * 60 + slotMinute;
        const slotEnd = slotTime + duration;
        
        // If the slot overlaps with the appointment, mark it unavailable
        if ((slotTime >= appointmentStart && slotTime < appointmentEnd) ||
            (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
            (slotTime <= appointmentStart && slotEnd >= appointmentEnd)) {
          slot.available = false;
        }
      });
    });
    
    // Filter out slots where the service can't be completed before closing
    return baseSlots.filter(slot => {
      const slotHour = parseInt(slot.time.split(':')[0]);
      const slotMinute = parseInt(slot.time.split(':')[1]);
      const slotTime = slotHour * 60 + slotMinute;
      const slotEnd = slotTime + duration;
      
      // Salon closes at 5:00 PM (17:00)
      return slotEnd <= 17 * 60 && slot.available;
    });
  };

  const reset = () => {
    setSelectedService(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
  };

  const value = {
    categories,
    services,
    appointments,
    selectedService,
    selectedDate,
    selectedTime,
    timeSlots,
    
    addCategory,
    updateCategory,
    deleteCategory,
    
    addService,
    updateService,
    deleteService,
    
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    
    selectService,
    selectDate,
    selectTime,
    
    getServiceById,
    getAvailableTimeSlots,
    getAppointmentsForDate,
    getCategoryById,
    getAppointmentDates,
    reset
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading salon data...</div>;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the AppContext
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
