
import { Appointment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapAppointmentFromDB, mapAppointmentToDB } from '@/utils/dataMappers';
import { toast } from 'sonner';

export function useAppointmentOperations(appointments: Appointment[], setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>) {
  // Book a new appointment
  const bookAppointment = async (appointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      console.log('Booking appointment:', appointment);
      
      const dbAppointment = mapAppointmentToDB({
        ...appointment,
        status: 'confirmed'
      });
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(dbAppointment)
        .select();
      
      if (error) {
        console.error('Error booking appointment:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const newAppointment = mapAppointmentFromDB(data[0]);
        setAppointments(prev => [...prev, newAppointment]);
        
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

  // Update an existing appointment
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

  // Cancel an appointment
  const cancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
      
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

  return {
    bookAppointment,
    updateAppointment,
    cancelAppointment
  };
}
