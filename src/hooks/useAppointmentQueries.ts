
import { Appointment } from '@/types';

export function useAppointmentQueries(appointments: Appointment[]) {
  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      appointment.date.toDateString() === date.toDateString() && 
      appointment.status !== 'cancelled'
    );
  };

  // Get all dates that have appointments
  const getAppointmentDates = () => {
    // Filter out cancelled appointments and create a unique list of dates
    const uniqueDates = new Set();
    const datesWithAppointments = appointments
      .filter(appointment => appointment.status !== 'cancelled')
      .map(appointment => {
        const dateString = appointment.date.toDateString();
        if (!uniqueDates.has(dateString)) {
          uniqueDates.add(dateString);
          return appointment.date;
        }
        return null;
      })
      .filter(Boolean) as Date[];
    
    return datesWithAppointments;
  };

  return {
    getAppointmentsForDate,
    getAppointmentDates
  };
}
