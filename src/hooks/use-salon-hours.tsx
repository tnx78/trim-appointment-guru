
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { SalonHours } from '@/components/admin/SalonHoursTab';
import { DayOff } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSalonHours = () => {
  const defaultHours: SalonHours = {
    monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    saturday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
    sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
  };

  const [salonHours, setSalonHours] = useState<SalonHours>(defaultHours);
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load salon hours and days off from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch salon hours
        const { data: hoursData, error: hoursError } = await supabase
          .from('salon_hours')
          .select('*')
          .order('day_of_week', { ascending: true });
          
        if (hoursError) {
          throw hoursError;
        }
        
        if (hoursData && hoursData.length > 0) {
          // Convert the database format to our app format
          const hoursMap: SalonHours = { ...defaultHours };
          
          const dayMapping: { [key: number]: string } = {
            0: 'sunday',
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday',
          };
          
          hoursData.forEach(row => {
            const dayName = dayMapping[row.day_of_week];
            if (dayName) {
              hoursMap[dayName] = {
                isOpen: row.is_open,
                openTime: row.open_time,
                closeTime: row.close_time
              };
            }
          });
          
          setSalonHours(hoursMap);
        } else {
          // No data, set default hours
          setSalonHours(defaultHours);
        }
        
        // Fetch days off
        const { data: daysOffData, error: daysOffError } = await supabase
          .from('salon_settings')
          .select('*')
          .eq('name', 'days_off')
          .single();
          
        if (!daysOffError && daysOffData) {
          try {
            const parsedDaysOff = JSON.parse(daysOffData.value);
            setDaysOff(parsedDaysOff.map((dayOff: any) => ({
              ...dayOff,
              date: new Date(dayOff.date)
            })));
          } catch (parseError) {
            console.error('Error parsing days off data:', parseError);
            setDaysOff([]);
          }
        } else {
          setDaysOff([]);
        }
      } catch (error) {
        console.error('Error loading salon data:', error);
        toast.error('Failed to load salon data, using defaults');
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadData();
  }, []);

  const isDateAvailable = (date: Date): boolean => {
    // First check if the date is a day off
    const isDayOff = daysOff.some(dayOff => 
      dayOff.date.getFullYear() === date.getFullYear() &&
      dayOff.date.getMonth() === date.getMonth() &&
      dayOff.date.getDate() === date.getDate()
    );
    
    if (isDayOff) return false;
    
    // Then check if the salon is open on that day
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    return salonHours[dayOfWeek as keyof SalonHours]?.isOpen || false;
  };

  const addDayOff = async (dayOff: Omit<DayOff, 'id'>) => {
    const newDayOff = {
      id: crypto.randomUUID(),
      ...dayOff
    };
    
    const updatedDaysOff = [...daysOff, newDayOff];
    setDaysOff(updatedDaysOff);
    
    try {
      // Store in database
      const serializedDaysOff = JSON.stringify(updatedDaysOff.map(d => ({
        ...d,
        date: d.date.toISOString()
      })));
      
      const { data, error } = await supabase
        .from('salon_settings')
        .upsert({
          name: 'days_off',
          value: serializedDaysOff
        }, {
          onConflict: 'name'
        });
      
      if (error) throw error;
      
      toast.success('Day off added successfully');
    } catch (error) {
      console.error('Error saving day off:', error);
      toast.error('Failed to save day off');
    }
    
    return newDayOff;
  };

  const removeDayOff = async (id: string) => {
    const updatedDaysOff = daysOff.filter(day => day.id !== id);
    setDaysOff(updatedDaysOff);
    
    try {
      // Update in database
      const serializedDaysOff = JSON.stringify(updatedDaysOff.map(d => ({
        ...d,
        date: d.date.toISOString()
      })));
      
      const { error } = await supabase
        .from('salon_settings')
        .upsert({
          name: 'days_off',
          value: serializedDaysOff
        }, {
          onConflict: 'name'
        });
      
      if (error) throw error;
      
      toast.success('Day off removed successfully');
    } catch (error) {
      console.error('Error removing day off:', error);
      toast.error('Failed to remove day off');
    }
  };

  return {
    salonHours,
    daysOff,
    isDateAvailable,
    addDayOff,
    removeDayOff,
    isInitialized
  };
};
