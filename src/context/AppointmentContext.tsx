
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, TimeSlot } from '@/types';
import { useAppointmentManager } from '@/hooks/useAppointmentManager';
import { useAppointmentSelection } from '@/hooks/useAppointmentSelection';
import { getAvailableTimeSlots } from '@/hooks/useTimeSlots';

// Context type
interface AppointmentContextType {
  appointments: Appointment[];
  selectedDate: Date;
  selectedTime: string | null;
  timeSlots: TimeSlot[];

  // Actions
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => Promise<string | null>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<boolean>;
  cancelAppointment: (id: string) => Promise<boolean>;
  
  selectDate: (date: Date) => void;
  selectTime: (time: string) => void;
  
  getAvailableTimeSlots: (date: Date, duration: number) => Promise<TimeSlot[]>;
  getAppointmentsForDate: (date: Date) => Appointment[];
  getAppointmentDates: () => Date[];
}

// Creating the context
const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Provider component
export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  // Use our custom hooks to manage appointment state
  const {
    appointments,
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    getAppointmentsForDate,
    getAppointmentDates
  } = useAppointmentManager();

  const {
    selectedDate,
    selectedTime,
    timeSlots,
    selectDate,
    selectTime,
  } = useAppointmentSelection();

  // Wrapper for getAvailableTimeSlots that uses the current appointments
  const getAvailableSlotsForDate = async (date: Date, duration: number) => {
    return await getAvailableTimeSlots(date, duration, appointments);
  };

  const value = {
    appointments,
    selectedDate,
    selectedTime,
    timeSlots,
    
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    
    selectDate,
    selectTime,
    
    getAvailableTimeSlots: getAvailableSlotsForDate,
    getAppointmentsForDate,
    getAppointmentDates,
  };

  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>;
}

// Custom hook to use the AppointmentContext
export function useAppointmentContext() {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointmentContext must be used within an AppointmentProvider');
  }
  return context;
}
