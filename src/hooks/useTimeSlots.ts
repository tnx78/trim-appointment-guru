import { TimeSlot, Appointment } from '@/types';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Fetch salon hours from database and generate time slots based on them
export async function generateTimeSlots(date: Date): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = [];
  
  try {
    // Determine day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();
    
    // Fetch salon hours for this day
    const { data, error } = await supabase
      .from('salon_hours')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .single();
    
    if (error) {
      console.error('Error fetching salon hours:', error);
      return slots; // Return empty slots if there's an error
    }
    
    // Check if salon is open
    if (!data || !data.is_open) {
      return slots; // Return empty slots if salon is closed
    }
    
    // Parse open and close times
    const [openHour, openMinute] = data.open_time.split(':').map(n => parseInt(n));
    const [closeHour, closeMinute] = data.close_time.split(':').map(n => parseInt(n));
    
    if (isNaN(openHour) || isNaN(openMinute) || isNaN(closeHour) || isNaN(closeMinute)) {
      console.error('Invalid time format in salon hours:', data);
      return slots;
    }
    
    // Generate slots
    let currentHour = openHour;
    let currentMinute = openMinute;
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push({
        id: `slot-${currentHour}-${currentMinute}`,
        time,
        available: true,
      });
      
      // Increment by 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    return slots;
  } catch (error) {
    console.error('Error generating time slots:', error);
    return slots;
  }
}

export async function getAvailableTimeSlots(date: Date, duration: number, appointments: Appointment[]): Promise<TimeSlot[]> {
  // Check if salon is closed for this date (day off)
  try {
    const { data, error } = await supabase
      .from('salon_settings')
      .select('value')
      .eq('name', 'days_off')
      .single();
    
    if (!error && data && data.value) {
      try {
        const daysOff = JSON.parse(data.value);
        const isDayOff = daysOff.some((dayOff: any) => {
          const dayOffDate = new Date(dayOff.date);
          return dayOffDate.getFullYear() === date.getFullYear() &&
                 dayOffDate.getMonth() === date.getMonth() &&
                 dayOffDate.getDate() === date.getDate();
        });
        
        if (isDayOff) {
          return []; // Return empty slots if the salon is closed on this day
        }
      } catch (parseError) {
        console.error('Error parsing days off data:', parseError);
      }
    }
  } catch (error) {
    console.error('Error checking if date is a day off:', error);
  }
  
  const baseSlots = await generateTimeSlots(date);
  
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
  baseSlots.forEach(slot => {
    const [slotHour, slotMinute] = slot.time.split(':').map(n => parseInt(n));
    
    if (isNaN(slotHour) || isNaN(slotMinute)) {
      console.error('Invalid time format in slot:', slot);
      return;
    }
    
    // Convert slot time to minutes since start of day
    const slotTimeInMinutes = slotHour * 60 + slotMinute;
    const slotEndTimeInMinutes = slotTimeInMinutes + duration;
    
    // Check each appointment for overlap with this slot
    for (const appointment of dayAppointments) {
      // Use the correct property names from the Appointment type
      const startTime = appointment.startTime;
      const endTime = appointment.endTime;
      
      if (!startTime || !endTime) {
        console.error('Appointment missing time information:', appointment);
        continue;
      }
      
      // Parse start and end times to minutes
      const [startHour, startMinute] = startTime.split(':').map(n => parseInt(n));
      const [endHour, endMinute] = endTime.split(':').map(n => parseInt(n));
      
      if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        console.error('Invalid time format in appointment:', appointment);
        continue;
      }
      
      // Convert appointment times to minutes since start of day
      const appointmentStartInMinutes = startHour * 60 + startMinute;
      const appointmentEndInMinutes = endHour * 60 + endMinute;
      
      // Check for any overlap between the slot and the appointment
      const hasOverlap = (
        // Slot starts during appointment
        (slotTimeInMinutes >= appointmentStartInMinutes && slotTimeInMinutes < appointmentEndInMinutes) ||
        // Slot ends during appointment
        (slotEndTimeInMinutes > appointmentStartInMinutes && slotEndTimeInMinutes <= appointmentEndInMinutes) ||
        // Slot completely contains appointment
        (slotTimeInMinutes <= appointmentStartInMinutes && slotEndTimeInMinutes >= appointmentEndInMinutes) ||
        // Appointment completely contains slot
        (appointmentStartInMinutes <= slotTimeInMinutes && appointmentEndInMinutes >= slotEndTimeInMinutes)
      );
      
      if (hasOverlap) {
        console.log(`Marking slot ${slot.time} as unavailable due to overlap with appointment ${startTime}-${endTime}`);
        slot.available = false;
        break; // Once we know it's unavailable, no need to check other appointments
      }
    }
  });
  
  // Filter out slots where the service can't be completed before closing
  return baseSlots;
}
