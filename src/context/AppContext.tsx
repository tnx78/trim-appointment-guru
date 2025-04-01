import React, { createContext, useContext } from 'react';
import { CategoryProvider, useCategoryContext } from './CategoryContext';
import { ServiceProvider, useServiceContext } from './ServiceContext';
import { AppointmentProvider, useAppointmentContext } from './AppointmentContext';
import { GalleryProvider, useGalleryContext } from './GalleryContext';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <CategoryProvider>
      <ServiceProvider>
        <AppointmentProvider>
          <GalleryProvider>
            {children}
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
