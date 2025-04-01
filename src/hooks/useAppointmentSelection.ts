
import { useState } from 'react';
import { TimeSlot } from '@/types';

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

  return {
    selectedDate,
    selectedTime,
    timeSlots,
    selectDate,
    selectTime
  };
}
