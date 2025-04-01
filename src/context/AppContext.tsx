
import React from 'react';
import { CategoryProvider } from '@/context/CategoryContext';
import { ServiceProvider } from '@/context/ServiceContext';
import { AppointmentProvider } from '@/context/AppointmentContext';
import { BookingProvider } from '@/context/BookingContext';

// Import the context hooks
import { useCategoryContext as importedUseCategoryContext } from '@/context/CategoryContext';
import { useServiceContext as importedUseServiceContext } from '@/context/ServiceContext';
import { useAppointmentContext as importedUseAppointmentContext } from '@/context/AppointmentContext';
import { useBookingContext as importedUseBookingContext } from '@/context/BookingContext';

// Re-export all the hooks for easier imports
export const useCategoryContext = importedUseCategoryContext;
export const useServiceContext = importedUseServiceContext;
export const useAppointmentContext = importedUseAppointmentContext;
export const useBookingContext = importedUseBookingContext;

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

// For backward compatibility, create a useAppContext hook that combines all contexts
export function useAppContext() {
  // Use the imported context hooks
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    updateCategoryOrder, 
    getCategoryById 
  } = useCategoryContext();
  
  const { 
    services, 
    addService, 
    updateService, 
    deleteService, 
    updateServiceOrder, 
    getServiceById 
  } = useServiceContext();
  
  const { 
    appointments, 
    selectedDate, 
    selectedTime, 
    timeSlots, 
    bookAppointment, 
    updateAppointment, 
    cancelAppointment, 
    selectDate, 
    selectTime, 
    getAvailableTimeSlots, 
    getAppointmentsForDate, 
    getAppointmentDates 
  } = useAppointmentContext();
  
  const { 
    selectedService, 
    selectService, 
    resetBookingState 
  } = useBookingContext();
  
  return {
    // From CategoryContext
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder,
    getCategoryById,
    
    // From ServiceContext
    services,
    addService,
    updateService,
    deleteService,
    updateServiceOrder,
    getServiceById,
    
    // From AppointmentContext
    appointments,
    selectedDate,
    selectedTime,
    timeSlots,
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    selectDate,
    selectTime,
    getAvailableTimeSlots,
    getAppointmentsForDate,
    getAppointmentDates,
    
    // From BookingContext
    selectedService,
    selectService,
    resetBookingState,
  };
}
