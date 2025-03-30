import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, ServiceCategory, Appointment, TimeSlot } from '@/types';
import { toast } from 'sonner';

// Sample data
const sampleCategories: ServiceCategory[] = [
  { id: '1', name: 'Haircut', description: 'Professional haircut services' },
  { id: '2', name: 'Color', description: 'Hair coloring services' },
  { id: '3', name: 'Treatment', description: 'Hair treatments and care' },
  { id: '4', name: 'Styling', description: 'Hair styling services' },
];

const sampleServices: Service[] = [
  { id: '1', categoryId: '1', name: 'Men\'s Haircut', description: 'Classic men\'s haircut', duration: 30, price: 25 },
  { id: '2', categoryId: '1', name: 'Women\'s Haircut', description: 'Women\'s haircut and styling', duration: 45, price: 45 },
  { id: '3', categoryId: '1', name: 'Children\'s Haircut', description: 'Haircut for children under 12', duration: 20, price: 18 },
  { id: '4', categoryId: '2', name: 'Root Touch-up', description: 'Color for roots only', duration: 60, price: 65 },
  { id: '5', categoryId: '2', name: 'Full Color', description: 'Full head color', duration: 90, price: 90 },
  { id: '6', categoryId: '2', name: 'Highlights', description: 'Partial or full highlights', duration: 120, price: 110 },
  { id: '7', categoryId: '3', name: 'Deep Conditioning', description: 'Intense moisture treatment', duration: 20, price: 20 },
  { id: '8', categoryId: '3', name: 'Keratin Treatment', description: 'Smoothing keratin treatment', duration: 120, price: 150 },
  { id: '9', categoryId: '4', name: 'Blowout', description: 'Wash and blowdry', duration: 45, price: 40 },
  { id: '10', categoryId: '4', name: 'Special Occasion Style', description: 'Formal styling for events', duration: 60, price: 65 },
];

const sampleAppointments: Appointment[] = [
  {
    id: '1',
    serviceId: '2',
    clientName: 'Jane Smith',
    clientEmail: 'jane@example.com',
    clientPhone: '555-123-4567',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    startTime: '10:00',
    endTime: '10:45',
    status: 'confirmed'
  },
  {
    id: '2',
    serviceId: '5',
    clientName: 'Michael Johnson',
    clientEmail: 'michael@example.com',
    clientPhone: '555-987-6543',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    startTime: '14:00',
    endTime: '15:30',
    status: 'confirmed'
  },
];

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
  reset: () => void;
}

// Creating the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ServiceCategory[]>(sampleCategories);
  const [services, setServices] = useState<Service[]>(sampleServices);
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  // Load data from localStorage
  useEffect(() => {
    const storedCategories = localStorage.getItem('categories');
    const storedServices = localStorage.getItem('services');
    const storedAppointments = localStorage.getItem('appointments');

    if (storedCategories) setCategories(JSON.parse(storedCategories));
    if (storedServices) setServices(JSON.parse(storedServices));
    if (storedAppointments) {
      const parsedAppointments = JSON.parse(storedAppointments);
      // Convert date strings back to Date objects
      setAppointments(parsedAppointments.map((app: any) => ({
        ...app,
        date: new Date(app.date)
      })));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('services', JSON.stringify(services));
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [categories, services, appointments]);

  // Category operations
  const addCategory = (category: Omit<ServiceCategory, 'id'>) => {
    const newCategory = {
      ...category,
      id: crypto.randomUUID()
    };
    setCategories([...categories, newCategory]);
    toast.success(`Category "${category.name}" added successfully`);
  };

  const updateCategory = (id: string, updatedData: Partial<ServiceCategory>) => {
    setCategories(categories.map(category => 
      category.id === id ? { ...category, ...updatedData } : category
    ));
    toast.success(`Category updated successfully`);
  };

  const deleteCategory = (id: string) => {
    const hasServices = services.some(service => service.categoryId === id);
    if (hasServices) {
      toast.error("Can't delete category with existing services");
      return;
    }
    setCategories(categories.filter(category => category.id !== id));
    toast.success("Category deleted successfully");
  };

  // Service operations
  const addService = (service: Omit<Service, 'id'>) => {
    const newService = {
      ...service,
      id: crypto.randomUUID()
    };
    setServices([...services, newService]);
    toast.success(`Service "${service.name}" added successfully`);
  };

  const updateService = (id: string, updatedData: Partial<Service>) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, ...updatedData } : service
    ));
    toast.success(`Service updated successfully`);
  };

  const deleteService = (id: string) => {
    const hasAppointments = appointments.some(appointment => appointment.serviceId === id);
    if (hasAppointments) {
      toast.error("Can't delete service with existing appointments");
      return;
    }
    setServices(services.filter(service => service.id !== id));
    toast.success("Service deleted successfully");
  };

  // Appointment operations
  const bookAppointment = (appointment: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment = {
      ...appointment,
      id: crypto.randomUUID(),
      status: 'confirmed' as const
    };
    setAppointments([...appointments, newAppointment]);
    toast.success("Appointment booked successfully");
  };

  const updateAppointment = (id: string, updatedData: Partial<Appointment>) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === id ? { ...appointment, ...updatedData } : appointment
    ));
    toast.success("Appointment updated successfully");
  };

  const cancelAppointment = (id: string) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === id ? { ...appointment, status: 'cancelled' as const } : appointment
    ));
    toast.success("Appointment cancelled successfully");
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
    reset
  };

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
