
import React, { createContext, useContext, useState } from 'react';
import { Service } from '@/types';
import { useServiceContext } from './ServiceContext';
import { useAppointmentContext } from './AppointmentContext';

// Context type
interface BookingContextType {
  selectedService: Service | null;
  selectService: (service: Service) => void;
  reset: () => void;
}

// Creating the context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider component
export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { selectDate } = useAppointmentContext();

  const selectService = (service: Service) => {
    setSelectedService(service);
  };

  const reset = () => {
    setSelectedService(null);
    selectDate(new Date());
  };

  const value = {
    selectedService,
    selectService,
    reset,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

// Custom hook to use the BookingContext
export function useBookingContext() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}
