
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
        
        if (error) {
          console.error('Error fetching appointments:', error);
          toast.error('Failed to load appointments');
          setAppointments([]);
          return;
        }
        
        if (data) {
          setAppointments(data.map(mapAppointmentFromDB));
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error in appointment fetching process:', error);
        toast.error('Failed to load appointments');
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
