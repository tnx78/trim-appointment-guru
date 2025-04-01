
import { TimeSlot } from '@/types';

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

export function getAvailableTimeSlots(date: Date, duration: number, appointments: any[]) {
  const baseSlots = generateTimeSlots();
  
  // Filter appointments for the selected date
  const dayAppointments = appointments.filter(
    appointment => 
      appointment.date.toDateString() === date.toDateString() && 
      appointment.status !== 'cancelled'
  );
  
  // Mark slots as unavailable if they overlap with existing appointments
  dayAppointments.forEach(appointment => {
    const startHour = parseInt(appointment.startTime.split(':')[0]);
    const startMinute = parseInt(appointment.startTime.split(':')[1]);
    const endHour = parseInt(appointment.endTime.split(':')[0]);
    const endMinute = parseInt(appointment.endTime.split(':')[1]);
    
    baseSlots.forEach(slot => {
      const slotHour = parseInt(slot.time.split(':')[0]);
      const slotMinute = parseInt(slot.time.split(':')[1]);
      
      // Convert to minutes for easier comparison
      const appointmentStart = startHour * 60 + startMinute;
      const appointmentEnd = endHour * 60 + endMinute;
      const slotTime = slotHour * 60 + slotMinute;
      const slotEnd = slotTime + duration;
      
      // If the slot overlaps with the appointment, mark it unavailable
      if ((slotTime >= appointmentStart && slotTime < appointmentEnd) ||
          (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
          (slotTime <= appointmentStart && slotEnd >= appointmentEnd)) {
        slot.available = false;
      }
    });
  });
  
  // Filter out slots where the service can't be completed before closing
  return baseSlots.filter(slot => {
    const slotHour = parseInt(slot.time.split(':')[0]);
    const slotMinute = parseInt(slot.time.split(':')[1]);
    const slotTime = slotHour * 60 + slotMinute;
    const slotEnd = slotTime + duration;
    
    // Salon closes at 5:00 PM (17:00)
    return slotEnd <= 17 * 60 && slot.available;
  });
}
