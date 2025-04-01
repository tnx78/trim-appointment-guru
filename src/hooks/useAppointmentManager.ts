
import { useState, useEffect } from 'react';
import { Appointment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapAppointmentFromDB, mapAppointmentToDB } from '@/utils/dataMappers';
import { toast } from 'sonner';
import { addDays, addHours } from 'date-fns';

export function useAppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
    appointments,
    isLoading,
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    getAppointmentsForDate,
    getAppointmentDates
  };
}
