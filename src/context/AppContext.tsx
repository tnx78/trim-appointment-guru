
import React, { useContext } from 'react';
import { CategoryProvider, useCategoryContext } from '@/context/CategoryContext';
import { ServiceProvider, useServiceContext } from '@/context/ServiceContext';
import { AppointmentProvider, useAppointmentContext } from '@/context/AppointmentContext';
import { BookingProvider, useBookingContext } from '@/context/BookingContext';

// Create a combined context for AppContext
const AppContext = React.createContext<any | undefined>(undefined);

// Re-export all the hooks for easier imports
export { useCategoryContext } from './CategoryContext';
export { useServiceContext } from './ServiceContext';
export { useAppointmentContext } from './AppointmentContext';
export { useBookingContext } from './BookingContext';

// Modified AppProvider to compose all the other providers
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <CategoryProvider>
      <ServiceProvider>
        <AppointmentProvider>
          <BookingProvider>
            {children}
          </BookingProvider>
        </AppointmentProvider>
      </ServiceProvider>
    </CategoryProvider>
  );
}

// For backward compatibility, create a useAppContext hook
export function useAppContext() {
  // Import hooks directly from the source context files
  const categoryContext = useCategoryContext();
  const serviceContext = useServiceContext();
  const appointmentContext = useAppointmentContext();
  const bookingContext = useBookingContext();
  
  return {
    // From CategoryContext
    categories: categoryContext.categories,
    addCategory: categoryContext.addCategory,
    updateCategory: categoryContext.updateCategory,
    deleteCategory: categoryContext.deleteCategory,
    updateCategoryOrder: categoryContext.updateCategoryOrder,
    getCategoryById: categoryContext.getCategoryById,
    
    // From ServiceContext
    services: serviceContext.services,
    addService: serviceContext.addService,
    updateService: serviceContext.updateService,
    deleteService: serviceContext.deleteService,
    updateServiceOrder: serviceContext.updateServiceOrder,
    getServiceById: serviceContext.getServiceById,
    
    // From AppointmentContext
    appointments: appointmentContext.appointments,
    selectedDate: appointmentContext.selectedDate,
    selectedTime: appointmentContext.selectedTime,
    timeSlots: appointmentContext.timeSlots,
    bookAppointment: appointmentContext.bookAppointment,
    updateAppointment: appointmentContext.updateAppointment,
    cancelAppointment: appointmentContext.cancelAppointment,
    selectDate: appointmentContext.selectDate,
    selectTime: appointmentContext.selectTime,
    getAvailableTimeSlots: appointmentContext.getAvailableTimeSlots,
    getAppointmentsForDate: appointmentContext.getAppointmentsForDate,
    getAppointmentDates: appointmentContext.getAppointmentDates,
    
    // From BookingContext
    selectedService: bookingContext.selectedService,
    selectService: bookingContext.selectService,
    resetBookingState: bookingContext.resetBookingState,
  };
}
