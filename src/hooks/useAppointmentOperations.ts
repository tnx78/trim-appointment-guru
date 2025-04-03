
import { Appointment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapAppointmentFromDB, mapAppointmentToDB } from '@/utils/dataMappers';
import { toast } from 'sonner';
import { scheduleEmailsForAppointment } from './useEmailScheduler';
import { useAuth } from '@/context/AuthContext';

export function useAppointmentOperations(appointments: Appointment[], setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>) {
  const { isAdmin } = useAuth();
  
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
  const updateAppointment = async (id: string, updatedData: Partial<Appointment>): Promise<boolean> => {
    try {
      console.log('Updating appointment:', id, updatedData);
      console.log('User is admin:', isAdmin);
      
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
      
      // First, try with .select() to get the updated record back
      const { data, error } = await supabase
        .from('appointments')
        .update(dbUpdatedData)
        .eq('id', id)
        .select('*');
      
      if (error) {
        console.error('Error updating appointment in database:', error);
        toast.error(`Failed to update appointment: ${error.message}`);
        return false;
      }
      
      console.log('Update response from database:', data);
      
      // Update local state whether or not we get data back
      if (data && data.length > 0) {
        // If we got data back, use it to update the state
        const updatedAppointment = mapAppointmentFromDB(data[0]);
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment.id === id ? updatedAppointment : appointment
          )
        );
      } else {
        // If no data returned but no error, the update succeeded
        // but we didn't get the updated record back, so update manually
        console.log('No data returned from update, updating state manually');
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => {
            if (appointment.id === id) {
              return {
                ...appointment,
                ...updatedData
              };
            }
            return appointment;
          })
        );
      }
      
      toast.success("Appointment updated successfully");
      return true;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error(`Failed to update appointment: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  // Cancel an appointment
  const cancelAppointment = async (id: string): Promise<boolean> => {
    try {
      console.log('Cancelling appointment:', id);
      console.log('User is admin:', isAdmin);
      
      // Direct update with status = cancelled
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select('*');
      
      if (error) {
        console.error('Error cancelling appointment in database:', error);
        toast.error(`Failed to cancel appointment: ${error.message}`);
        return false;
      }
      
      console.log('Cancel response from database:', data);
      
      // Update local state whether or not we get data back
      if (data && data.length > 0) {
        // If we got data back, use it to update the state
        const cancelledAppointment = mapAppointmentFromDB(data[0]);
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment.id === id ? cancelledAppointment : appointment
          )
        );
      } else {
        // If no data returned but no error, the cancel succeeded
        // but we didn't get the updated record back, so update manually
        console.log('No data returned from cancel, updating state manually');
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => {
            if (appointment.id === id) {
              return {
                ...appointment,
                status: 'cancelled'
              };
            }
            return appointment;
          })
        );
      }
      
      toast.success("Appointment cancelled successfully");
      return true;
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast.error(`Failed to cancel appointment: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  return {
    bookAppointment,
    updateAppointment,
    cancelAppointment
  };
}
