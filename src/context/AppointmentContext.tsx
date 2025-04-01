
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, TimeSlot } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapAppointmentFromDB, mapAppointmentToDB } from '@/utils/dataMappers';
import { toast } from 'sonner';
import { addDays, addHours } from 'date-fns';

// Context type
interface AppointmentContextType {
  appointments: Appointment[];
  selectedDate: Date;
  selectedTime: string | null;
  timeSlots: TimeSlot[];

  // Actions
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => Promise<string | null>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  
  selectDate: (date: Date) => void;
  selectTime: (time: string) => void;
  
  getAvailableTimeSlots: (date: Date, duration: number) => TimeSlot[];
  getAppointmentsForDate: (date: Date) => Appointment[];
  getAppointmentDates: () => Date[];
}

// Creating the context
const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Provider component
export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch appointments from Supabase
  useEffect(() => {
    async function fetchAppointments() {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*');
        
        if (error) throw error;
        setAppointments(data.map(mapAppointmentFromDB));
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAppointments();
  }, []);

  // Helper function to schedule emails for an appointment
  const scheduleEmailsForAppointment = async (appointmentId: string, appointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const appointmentDate = new Date(appointment.date);
      const now = new Date();
      
      // Schedule emails
      const emailSchedules = [
        {
          template_name: 'booking_confirmation',
          send_at: now,  // immediate
        },
        {
          template_name: 'admin_notification',
          send_at: now,  // immediate
        },
        {
          template_name: 'appointment_reminder_day',
          send_at: addDays(appointmentDate, -1), // 1 day before
        },
        {
          template_name: 'appointment_reminder_hours',
          send_at: addHours(
            new Date(
              appointmentDate.getFullYear(),
              appointmentDate.getMonth(),
              appointmentDate.getDate(),
              parseInt(appointment.startTime.split(':')[0]),
              parseInt(appointment.startTime.split(':')[1] || '0')
            ),
            -2 // 2 hours before appointment
          ),
        }
      ];
      
      // Create scheduled emails table entry for each email
      for (const schedule of emailSchedules) {
        await supabase
          .from('scheduled_emails')
          .insert({
            appointment_id: appointmentId,
            template_name: schedule.template_name,
            send_at: schedule.send_at.toISOString(),
          });
      }
      
      // Trigger immediate processing of emails
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      fetch(`${supabaseUrl}/functions/v1/process-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ process: 'immediate' })
      }).catch(err => {
        console.error('Error triggering email processing:', err);
      });
    } catch (error) {
      console.error('Error in scheduleEmailsForAppointment:', error);
    }
  };

  const bookAppointment = async (appointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const dbAppointment = mapAppointmentToDB({
        ...appointment,
        status: 'confirmed'
      });
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(dbAppointment)
        .select();
      
      if (error) throw error;
      if (data && data.length > 0) {
        const newAppointment = mapAppointmentFromDB(data[0]);
        setAppointments([...appointments, newAppointment]);
        
        // Schedule emails for the new appointment
        await scheduleEmailsForAppointment(data[0].id, appointment);
        
        toast.success("Appointment booked successfully");
        return data[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
      return null;
    }
  };

  const updateAppointment = async (id: string, updatedData: Partial<Appointment>) => {
    try {
      // Convert camelCase to snake_case for fields that need to be updated
      const dbUpdatedData: any = {};
      
      if (updatedData.serviceId !== undefined) dbUpdatedData.service_id = updatedData.serviceId;
      if (updatedData.clientName !== undefined) dbUpdatedData.client_name = updatedData.clientName;
      if (updatedData.clientEmail !== undefined) dbUpdatedData.client_email = updatedData.clientEmail;
      if (updatedData.clientPhone !== undefined) dbUpdatedData.client_phone = updatedData.clientPhone;
      if (updatedData.startTime !== undefined) dbUpdatedData.start_time = updatedData.startTime;
      if (updatedData.endTime !== undefined) dbUpdatedData.end_time = updatedData.endTime;
      if (updatedData.status !== undefined) dbUpdatedData.status = updatedData.status;
      
      // Handle date conversion for the database
      if (updatedData.date !== undefined) {
        dbUpdatedData.date = updatedData.date instanceof Date 
          ? updatedData.date.toISOString().split('T')[0] 
          : updatedData.date;
      }
      
      const { error } = await supabase
        .from('appointments')
        .update(dbUpdatedData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Find the appointment to get the client's email
      const appointment = appointments.find(a => a.id === id);
      
      // Schedule an email notification based on the update type
      if (updatedData.status === 'confirmed' && appointment) {
        await supabase
          .from('scheduled_emails')
          .insert({
            appointment_id: id,
            template_name: 'appointment_confirmed',
            send_at: new Date().toISOString()
          });
          
        // Trigger email processing
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        fetch(`${supabaseUrl}/functions/v1/process-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ process: 'immediate' })
        }).catch(err => {
          console.error('Error triggering email processing:', err);
        });
      }
      
      setAppointments(appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, ...updatedData } 
          : appointment
      ));
      toast.success("Appointment updated successfully");
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
      
      // Schedule cancellation email
      await supabase
        .from('scheduled_emails')
        .insert({
          appointment_id: id,
          template_name: 'appointment_cancelled',
          send_at: new Date().toISOString()
        });
        
      // Trigger email processing
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      fetch(`${supabaseUrl}/functions/v1/process-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ process: 'immediate' })
      }).catch(err => {
        console.error('Error triggering email processing:', err);
      });
      
      setAppointments(appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: 'cancelled' as const } 
          : appointment
      ));
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  // Booking flow operations
  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const selectTime = (time: string) => {
    setSelectedTime(time);
  };

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

  // Generate time slots from 9:00 AM to 5:00 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9:00 AM
    const endHour = 17; // 5:00 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      ['00', '30'].forEach((minutes, index) => {
        const time = `${hour}:${minutes}`;
        slots.push({
          id: `slot-${hour}-${minutes}`,
          time,
          available: true,
        });
      });
    }
    
    return slots;
  };

  const getAvailableTimeSlots = (date: Date, duration: number) => {
    const dayAppointments = getAppointmentsForDate(date);
    const baseSlots = generateTimeSlots();
    
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
    
    getAvailableTimeSlots,
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
