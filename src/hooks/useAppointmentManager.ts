
import { useState, useEffect } from 'react';
import { Appointment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapAppointmentFromDB } from '@/utils/dataMappers';
import { toast } from 'sonner';
import { useAppointmentOperations } from './useAppointmentOperations';
import { useAppointmentQueries } from './useAppointmentQueries';

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
        
        // Make sure data exists before mapping it
        if (data) {
          setAppointments(data.map(mapAppointmentFromDB));
        } else {
          setAppointments([]);
        }
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        // Only show toast on specific errors, not when the user doesn't have permission
        if (error.code !== 'PGRST116') {
          toast.error('Failed to load appointments');
        }
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAppointments();
  }, []);

  // Use the extracted appointment operations
  const { 
    bookAppointment, 
    updateAppointment, 
    cancelAppointment 
  } = useAppointmentOperations(appointments, setAppointments);

  // Use the extracted appointment queries
  const {
    getAppointmentsForDate,
    getAppointmentDates
  } = useAppointmentQueries(appointments);

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
