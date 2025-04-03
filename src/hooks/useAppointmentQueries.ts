
import { Appointment } from '@/types';

export function useAppointmentQueries(appointments: Appointment[]) {
  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      // Normalize both dates to compare only year, month, day
      const appointmentDate = appointment.date instanceof Date 
        ? appointment.date 
        : new Date(appointment.date);
      
      // Compare only the date portions (year, month, day)
      const appDateStr = appointmentDate.toDateString();
      const targetDateStr = date.toDateString();
      
      return appDateStr === targetDateStr && appointment.status !== 'cancelled';
    });
  };

  // Get all dates that have appointments
  const getAppointmentDates = () => {
    // Create a Set to track unique dates
    const uniqueDateStrings = new Set<string>();
    const uniqueDates: Date[] = [];
    
    // Filter out cancelled appointments and extract unique dates
    appointments
      .filter(appointment => appointment.status !== 'cancelled')
      .forEach(appointment => {
        const appDate = appointment.date instanceof Date 
          ? appointment.date 
          : new Date(appointment.date);
        
        const dateString = appDate.toDateString();
        
        if (!uniqueDateStrings.has(dateString)) {
          uniqueDateStrings.add(dateString);
          uniqueDates.push(new Date(dateString));
        }
      });
    
    return uniqueDates;
  };

  return {
    getAppointmentsForDate,
    getAppointmentDates
  };
}
