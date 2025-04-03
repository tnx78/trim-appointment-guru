
import { useState, useEffect, useCallback } from 'react';
import { Appointment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapAppointmentFromDB } from '@/utils/dataMappers';
import { toast } from 'sonner';
import { useAppointmentOperations } from './useAppointmentOperations';
import { useAppointmentQueries } from './useAppointmentQueries';

export function useAppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch appointments from the database
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching appointments...');
      
      // Fetch appointments with improved error handling
      const { data, error } = await supabase
        .from('appointments')
        .select('*');
      
      if (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
        setAppointments([]);
        return;
      }
      
      if (data && data.length > 0) {
        console.log(`Successfully fetched ${data.length} appointments`);
        const mappedAppointments = data.map(mapAppointmentFromDB);
        console.log('Mapped appointments:', mappedAppointments);
        setAppointments(mappedAppointments);
      } else {
        console.log('No appointments found');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error in appointment fetching process:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch appointments from Supabase on component mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Custom hook for appointment operations
  const { bookAppointment, updateAppointment: performUpdate, cancelAppointment: performCancel } = 
    useAppointmentOperations(appointments, setAppointments);
  
  // Wrap operations to ensure database updates are completed and UI is refreshed
  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    try {
      // Update in database first
      await performUpdate(id, data);
      
      // Force refresh appointments from database to ensure we have latest state
      await fetchAppointments();
      
      return true;
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      toast.error('Failed to update appointment');
      return false;
    }
  };
  
  const cancelAppointment = async (id: string) => {
    try {
      // Cancel in database first
      await performCancel(id);
      
      // Force refresh appointments from database to ensure we have latest state
      await fetchAppointments();
      
      return true;
    } catch (error) {
      console.error('Error in cancelAppointment:', error);
      toast.error('Failed to cancel appointment');
      return false;
    }
  };

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
    getAppointmentDates,
    refreshAppointments: fetchAppointments
  };
}
