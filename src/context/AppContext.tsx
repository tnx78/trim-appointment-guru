
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, ServiceCategory, Appointment, TimeSlot } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { addDays, addHours } from 'date-fns';

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
  updateCategoryOrder: (updatedCategories: ServiceCategory[]) => void;
  
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  updateServiceOrder: (updatedServices: Service[]) => void;
  
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => Promise<string | null>;
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

// Helper functions to convert between snake_case and camelCase
const toCamelCase = (str: string): string => {
  return str.replace(/(_\w)/g, (m) => m[1].toUpperCase());
};

const toSnakeCase = (str: string): string => {
  return str.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
};

// Convert snake_case database record to camelCase object
const mapServiceFromDB = (dbService: any): Service => {
  return {
    id: dbService.id,
    categoryId: dbService.category_id,
    name: dbService.name,
    description: dbService.description,
    duration: dbService.duration,
    price: dbService.price,
    image: dbService.image,
    order: dbService.order
  };
};

// Convert camelCase object to snake_case for database
const mapServiceToDB = (service: Omit<Service, 'id'>): any => {
  return {
    category_id: service.categoryId,
    name: service.name,
    description: service.description,
    duration: service.duration,
    price: service.price,
    image: service.image,
    order: service.order
  };
};

// Convert snake_case database record to camelCase object
const mapCategoryFromDB = (dbCategory: any): ServiceCategory => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description,
    order: dbCategory.order
  };
};

// Convert snake_case database record to camelCase object
const mapAppointmentFromDB = (dbAppointment: any): Appointment => {
  return {
    id: dbAppointment.id,
    serviceId: dbAppointment.service_id,
    clientName: dbAppointment.client_name,
    clientEmail: dbAppointment.client_email,
    clientPhone: dbAppointment.client_phone,
    date: new Date(dbAppointment.date),
    startTime: dbAppointment.start_time,
    endTime: dbAppointment.end_time,
    status: dbAppointment.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'
  };
};

// Convert camelCase object to snake_case for database
const mapAppointmentToDB = (appointment: Omit<Appointment, 'id' | 'status'> & { status?: string }): any => {
  return {
    service_id: appointment.serviceId,
    client_name: appointment.clientName,
    client_email: appointment.clientEmail,
    client_phone: appointment.clientPhone,
    date: appointment.date instanceof Date ? appointment.date.toISOString().split('T')[0] : appointment.date,
    start_time: appointment.startTime,
    end_time: appointment.endTime,
    status: appointment.status || 'confirmed'
  };
};

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
        setCategories(categoriesData.map(mapCategoryFromDB));
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');
        
        if (servicesError) throw servicesError;
        setServices(servicesData.map(mapServiceFromDB));
        
        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*');
        
        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData.map(mapAppointmentFromDB));
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
        const newCategory = mapCategoryFromDB(data[0]);
        setCategories([...categories, newCategory]);
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

  const updateCategoryOrder = async (updatedCategories: ServiceCategory[]) => {
    try {
      // Update local state immediately for responsiveness
      setCategories(updatedCategories);
      
      // For each category, update its order in the database
      for (const category of updatedCategories) {
        const { error } = await supabase
          .from('categories')
          .update({ 
            order: category.order 
          })
          .eq('id', category.id);
        
        if (error) throw error;
      }
      
      // No need for a toast here as it's a background operation
    } catch (error) {
      console.error('Error updating category order:', error);
      toast.error('Failed to update category order');
      
      // Fetch categories again to reset to server state
      const { data, error: fetchError } = await supabase.from('categories').select('*');
      if (!fetchError && data) {
        setCategories(data.map(mapCategoryFromDB));
      }
    }
  };

  // Service operations
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

  // Helper function to schedule emails for an appointment
  const scheduleEmailsForAppointment = async (appointmentId: string, appointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const appointmentDate = new Date(appointment.date);
      const now = new Date();
      
      // Schedule emails
      const emailSchedules = [
        {
          template_name: 'booking_confirmation',
          send_at: now,  // immediate
        },
        {
          template_name: 'admin_notification',
          send_at: now,  // immediate
        },
        {
          template_name: 'appointment_reminder_day',
          send_at: addDays(appointmentDate, -1), // 1 day before
        },
        {
          template_name: 'appointment_reminder_hours',
          send_at: addHours(
            new Date(
              appointmentDate.getFullYear(),
              appointmentDate.getMonth(),
              appointmentDate.getDate(),
              parseInt(appointment.startTime.split(':')[0]),
              parseInt(appointment.startTime.split(':')[1] || '0')
            ),
            -2 // 2 hours before appointment
          ),
        }
      ];
      
      // Batch insert all scheduled emails
      for (const schedule of emailSchedules) {
        const { error } = await supabase
          .from('scheduled_emails')
          .insert({
            appointment_id: appointmentId,
            template_name: schedule.template_name,
            send_at: schedule.send_at.toISOString(),
          });
          
        if (error) {
          console.error('Error scheduling email:', error);
        }
      }
      
      console.log('Emails scheduled successfully');
      
      // Trigger immediate processing of emails
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ process: 'immediate' })
      }).catch(err => {
        console.error('Error triggering email processing:', err);
      });
    } catch (error) {
      console.error('Error in scheduleEmailsForAppointment:', error);
    }
  };

  // Appointment operations
  const bookAppointment = async (appointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const dbAppointment = mapAppointmentToDB({
        ...appointment,
        status: 'confirmed'
      });
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(dbAppointment)
        .select();
      
      if (error) throw error;
      if (data && data.length > 0) {
        const newAppointment = mapAppointmentFromDB(data[0]);
        setAppointments([...appointments, newAppointment]);
        
        // Schedule emails for the new appointment
        await scheduleEmailsForAppointment(data[0].id, appointment);
        
        toast.success("Appointment booked successfully");
        return data[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
      return null;
    }
  };

  const updateAppointment = async (id: string, updatedData: Partial<Appointment>) => {
    try {
      // Convert camelCase to snake_case for fields that need to be updated
      const dbUpdatedData: any = {};
      
      if (updatedData.serviceId !== undefined) dbUpdatedData.service_id = updatedData.serviceId;
      if (updatedData.clientName !== undefined) dbUpdatedData.client_name = updatedData.clientName;
      if (updatedData.clientEmail !== undefined) dbUpdatedData.client_email = updatedData.clientEmail;
      if (updatedData.clientPhone !== undefined) dbUpdatedData.client_phone = updatedData.clientPhone;
      if (updatedData.startTime !== undefined) dbUpdatedData.start_time = updatedData.startTime;
      if (updatedData.endTime !== undefined) dbUpdatedData.end_time = updatedData.endTime;
      if (updatedData.status !== undefined) dbUpdatedData.status = updatedData.status;
      
      // Handle date conversion for the database
      if (updatedData.date !== undefined) {
        dbUpdatedData.date = updatedData.date instanceof Date 
          ? updatedData.date.toISOString().split('T')[0] 
          : updatedData.date;
      }
      
      const { error } = await supabase
        .from('appointments')
        .update(dbUpdatedData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Find the appointment to get the client's email
      const appointment = appointments.find(a => a.id === id);
      
      // Schedule an email notification based on the update type
      if (updatedData.status === 'confirmed' && appointment) {
        const { error } = await supabase
          .from('scheduled_emails')
          .insert({
            appointment_id: id,
            template_name: 'appointment_confirmed',
            send_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error scheduling confirmation email:', error);
        } else {
          // Trigger email processing
          fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-emails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ process: 'immediate' })
          }).catch(err => {
            console.error('Error triggering email processing:', err);
          });
        }
      }
      
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
      
      // Schedule cancellation email
      const { error: emailError } = await supabase
        .from('scheduled_emails')
        .insert({
          appointment_id: id,
          template_name: 'appointment_cancelled',
          send_at: new Date().toISOString()
        });
        
      if (emailError) {
        console.error('Error scheduling cancellation email:', emailError);
      } else {
        // Trigger email processing
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ process: 'immediate' })
        }).catch(err => {
          console.error('Error triggering email processing:', err);
        });
      }
      
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
    updateCategoryOrder,
    
    addService,
    updateService,
    deleteService,
    updateServiceOrder,
    
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
