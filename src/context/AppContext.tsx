
import React, { createContext, useContext } from 'react';
import { CategoryProvider, useCategoryContext } from './CategoryContext';
import { ServiceProvider, useServiceContext } from './ServiceContext';
import { AppointmentProvider, useAppointmentContext } from './AppointmentContext';
import { GalleryProvider, useGalleryContext } from './GalleryContext';
import { BookingProvider, useBookingContext } from './BookingContext';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <CategoryProvider>
      <ServiceProvider>
        <AppointmentProvider>
          <GalleryProvider>
            <BookingProvider>
              {children}
            </BookingProvider>
          </GalleryProvider>
        </AppointmentProvider>
      </ServiceProvider>
    </CategoryProvider>
  );
};

export const useAppContext = () => {
  const categories = useCategoryContext();
  const services = useServiceContext();
  const appointments = useAppointmentContext();
  const gallery = useGalleryContext();

  return {
    ...categories,
    ...services,
    ...appointments,
    ...gallery
  };
};

// Export all individual context hooks for direct use
export { useCategoryContext } from './CategoryContext';
export { useServiceContext } from './ServiceContext';
export { useAppointmentContext } from './AppointmentContext';
export { useGalleryContext } from './GalleryContext';
export { useBookingContext } from './BookingContext';
