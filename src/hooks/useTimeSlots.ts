
import { TimeSlot, Appointment } from '@/types';
import { format, parseISO } from 'date-fns';

// Generate time slots from 9:00 AM to 5:00 PM
export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 9; // 9:00 AM
  const endHour = 17; // 5:00 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    ['00', '30'].forEach((minutes) => {
      const time = `${hour}:${minutes}`;
      slots.push({
        id: `slot-${hour}-${minutes}`,
        time,
        available: true,
      });
    });
  }
  
  return slots;
}

export function getAvailableTimeSlots(date: Date, duration: number, appointments: Appointment[]) {
  const baseSlots = generateTimeSlots();
  
  // Convert date to string for consistent comparison
  const dateString = date.toDateString();
  
  // Filter appointments for the selected date
  const dayAppointments = appointments.filter(
    appointment => {
      // Handle different date formats/objects
      const appDate = appointment.date instanceof Date 
        ? appointment.date 
        : new Date(appointment.date);
      
      return appDate.toDateString() === dateString && 
        appointment.status !== 'cancelled';
    }
  );
  
  console.log('Appointments for selected date:', dayAppointments);
  
  // Mark slots as unavailable if they overlap with existing appointments
  dayAppointments.forEach(appointment => {
    // Use the correct property names from the Appointment type
    const startTime = appointment.startTime;
    const endTime = appointment.endTime;
    
    if (!startTime || !endTime) {
      console.error('Appointment missing time information:', appointment);
      return;
    }
    
    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(n => parseInt(n));
    const [endHour, endMinute] = endTime.split(':').map(n => parseInt(n));
    
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      console.error('Invalid time format in appointment:', appointment);
      return;
    }
    
    baseSlots.forEach(slot => {
      const [slotHour, slotMinute] = slot.time.split(':').map(n => parseInt(n));
      
      if (isNaN(slotHour) || isNaN(slotMinute)) {
        console.error('Invalid time format in slot:', slot);
        return;
      }
      
      // Convert to minutes for easier comparison
      const appointmentStart = startHour * 60 + startMinute;
      const appointmentEnd = endHour * 60 + endMinute;
      const slotTime = slotHour * 60 + slotMinute;
      const slotEnd = slotTime + duration;
      
      // If the slot overlaps with the appointment, mark it unavailable
      if ((slotTime >= appointmentStart && slotTime < appointmentEnd) ||
          (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
          (slotTime <= appointmentStart && slotEnd >= appointmentEnd)) {
        console.log(`Marking slot ${slot.time} as unavailable due to overlap with appointment ${startTime}-${endTime}`);
        slot.available = false;
      }
    });
  });
  
  // Filter out slots where the service can't be completed before closing
  return baseSlots.filter(slot => {
    const [slotHour, slotMinute] = slot.time.split(':').map(n => parseInt(n));
    const slotTime = slotHour * 60 + slotMinute;
    const slotEnd = slotTime + duration;
    
    // Salon closes at 5:00 PM (17:00)
    return slotEnd <= 17 * 60 && slot.available;
  });
}
