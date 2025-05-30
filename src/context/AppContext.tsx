
import React, { createContext, useContext } from 'react';
import { CategoryProvider, useCategoryContext } from './CategoryContext';
import { ServiceProvider, useServiceContext } from './ServiceContext';
import { AppointmentProvider, useAppointmentContext } from './AppointmentContext';
import { GalleryProvider, useGalleryContext } from './GalleryContext';
import { BookingProvider, useBookingContext } from './BookingContext';

// Define a type for the context to avoid using any
interface AppContextType {
  [key: string]: any;
}

// Create empty context with proper type
const AppContext = createContext<AppContextType | undefined>(undefined);

// The provider component that wraps the entire app
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <CategoryProvider>
      <ServiceProvider>
        <AppointmentProvider>
          <GalleryProvider>
            <BookingProvider>
              <AppContext.Provider value={{}}>
                {children}
              </AppContext.Provider>
            </BookingProvider>
          </GalleryProvider>
        </AppointmentProvider>
      </ServiceProvider>
    </CategoryProvider>
  );
};

// Custom hook to use the combined context
export const useAppContext = () => {
  // Get individual contexts
  const categories = useCategoryContext();
  const services = useServiceContext();
  const appointments = useAppointmentContext();
  const gallery = useGalleryContext();
  const booking = useBookingContext();

  // Combine all contexts into one
  return {
    ...categories,
    ...services,
    ...appointments,
    ...gallery,
    ...booking
  };
};

// Export all individual context hooks for direct use
export { useCategoryContext } from './CategoryContext';
export { useServiceContext } from './ServiceContext';
export { useAppointmentContext } from './AppointmentContext';
export { useGalleryContext } from './GalleryContext';
export { useBookingContext } from './BookingContext';
