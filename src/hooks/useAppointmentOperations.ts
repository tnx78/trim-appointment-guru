
import { Appointment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapAppointmentFromDB, mapAppointmentToDB } from '@/utils/dataMappers';
import { toast } from 'sonner';
import { scheduleEmailsForAppointment } from './useEmailScheduler';

export function useAppointmentOperations(appointments: Appointment[], setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>) {
  // Book a new appointment
  const bookAppointment = async (appointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      console.log('Booking appointment:', appointment);
      
      const dbAppointment = mapAppointmentToDB({
        ...appointment,
        status: 'confirmed' as const
      });
      
      console.log('Transformed for DB:', dbAppointment);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(dbAppointment)
        .select();
      
      if (error) {
        console.error('Error booking appointment:', error);
        toast.error(`Failed to book appointment: ${error.message}`);
        return null;
      }
      
      if (data && data.length > 0) {
        console.log('Appointment booked successfully:', data[0]);
        const newAppointment = mapAppointmentFromDB(data[0]);
        setAppointments(prev => [...prev, newAppointment]);
        
        // Schedule emails for the appointment
        try {
          await scheduleEmailsForAppointment(data[0].id, appointment);
        } catch (emailError) {
          console.error('Error scheduling emails:', emailError);
          // Don't fail the booking if email scheduling fails
        }
        
        toast.success("Appointment booked successfully");
        return data[0].id;
      }
      
      toast.error('Failed to book appointment: No data returned');
      return null;
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast.error(`Failed to book appointment: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  // Update an existing appointment
  const updateAppointment = async (id: string, updatedData: Partial<Appointment>) => {
    try {
      console.log('Updating appointment:', id, updatedData);
      
      // Convert to snake_case for database
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
      
      console.log('Sending to database:', dbUpdatedData);
      
      // Try direct update and get the response
      const { data, error } = await supabase
        .from('appointments')
        .update(dbUpdatedData)
        .eq('id', id)
        .select('*');
      
      if (error) {
        console.error('Error updating appointment in database:', error);
        throw new Error(`Failed to update appointment: ${error.message}`);
      }
      
      console.log('Update response from database:', data);
      
      // Update the local state only after confirming the database update was successful
      if (data && data.length > 0) {
        const updatedAppointment = mapAppointmentFromDB(data[0]);
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment.id === id ? updatedAppointment : appointment
          )
        );
        
        toast.success("Appointment updated successfully");
        return true;
      } else {
        // If no data returned but no error, the update might have succeeded
        // but we didn't get the updated record back
        console.warn('No data returned from update, but no error occurred');
        return false;
      }
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error(`Failed to update appointment: ${error.message || 'Unknown error'}`);
      throw error; // Rethrow to allow caller to handle
    }
  };

  // Cancel an appointment
  const cancelAppointment = async (id: string) => {
    try {
      console.log('Cancelling appointment:', id);
      
      // Direct update with status = cancelled
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select('*');
      
      if (error) {
        console.error('Error cancelling appointment in database:', error);
        throw new Error(`Failed to cancel appointment: ${error.message}`);
      }
      
      console.log('Cancel response from database:', data);
      
      // Update the local state only after confirming the database update was successful
      if (data && data.length > 0) {
        const cancelledAppointment = mapAppointmentFromDB(data[0]);
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment.id === id ? cancelledAppointment : appointment
          )
        );
        
        toast.success("Appointment cancelled successfully");
        return true;
      } else {
        // If no data returned but no error, the update might have succeeded
        // but we didn't get the updated record back
        console.warn('No data returned from cancel, but no error occurred');
        return false;
      }
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast.error(`Failed to cancel appointment: ${error.message || 'Unknown error'}`);
      throw error; // Rethrow to allow caller to handle
    }
  };

  return {
    bookAppointment,
    updateAppointment,
    cancelAppointment
  };
}
