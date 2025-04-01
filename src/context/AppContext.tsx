
import React from 'react';
import { CategoryProvider } from '@/context/CategoryContext';
import { ServiceProvider } from '@/context/ServiceContext';
import { AppointmentProvider } from '@/context/AppointmentContext';
import { BookingProvider } from '@/context/BookingContext';

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
  // Import hooks directly to avoid circular dependencies
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    updateCategoryOrder, 
    getCategoryById 
  } = require('./CategoryContext').useCategoryContext();
  
  const {
    services,
    addService,
    updateService,
    deleteService,
    updateServiceOrder,
    getServiceById
  } = require('./ServiceContext').useServiceContext();
  
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
  } = require('./AppointmentContext').useAppointmentContext();
  
  const {
    selectedService,
    selectService,
    resetBookingState
  } = require('./BookingContext').useBookingContext();
  
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
