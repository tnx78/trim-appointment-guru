
import { useState } from 'react';
import { TimeSlot } from '@/types';
import { getAvailableTimeSlots } from './useTimeSlots';

export function useAppointmentSelection() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Select date
  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  // Select time
  const selectTime = (time: string) => {
    setSelectedTime(time);
  };

  // Get available time slots
  const getAvailableSlotsForDate = (date: Date, duration: number, appointments: any[]) => {
    return getAvailableTimeSlots(date, duration, appointments);
  };

  return {
    selectedDate,
    selectedTime,
    timeSlots,
    selectDate,
    selectTime,
    getAvailableSlotsForDate
  };
}
