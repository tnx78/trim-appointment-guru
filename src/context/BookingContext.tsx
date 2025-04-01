
import React, { createContext, useContext, useState } from 'react';
import { Service } from '@/types';
import { useServiceContext } from './ServiceContext';
import { useAppointmentContext } from './AppointmentContext';

// Context type
interface BookingContextType {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectService: (service: Service) => void;
  selectDate: (date: Date) => void;
  selectTime: (time: string) => void;
  resetBookingState: () => void;
}

// Creating the context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider component
export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const selectService = (service: Service) => {
    setSelectedService(service);
  };
  
  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };
  
  const selectTime = (time: string) => {
    setSelectedTime(time);
  };

  const resetBookingState = () => {
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const value = {
    selectedService,
    selectedDate,
    selectedTime,
    selectService,
    selectDate,
    selectTime,
    resetBookingState,
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
