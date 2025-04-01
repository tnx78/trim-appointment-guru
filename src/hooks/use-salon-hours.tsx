
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
  
  // Load salon hours and days off from Supabase or fallback to localStorage
  useEffect(() => {
    const loadHours = async () => {
      try {
        // First try to load from Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        const hasSession = !!sessionData.session || localStorage.getItem('isAdmin') === 'true';
        
        if (hasSession) {
          // Try to load hours from salon_settings table
          const { data: hoursData, error: hoursError } = await supabase
            .from('salon_settings')
            .select('*')
            .eq('name', 'salon_hours')
            .single();
            
          if (hoursData && !hoursError) {
            setSalonHours(JSON.parse(hoursData.value));
          } else {
            // Fallback to localStorage
            const savedHours = localStorage.getItem('salonHours');
            setSalonHours(savedHours ? JSON.parse(savedHours) : defaultHours);
            
            // Save to Supabase if we have a session
            if (sessionData.session) {
              await supabase
                .from('salon_settings')
                .upsert({
                  name: 'salon_hours',
                  value: savedHours || JSON.stringify(defaultHours)
                });
            }
          }
          
          // Try to load days off from salon_settings table
          const { data: daysOffData, error: daysOffError } = await supabase
            .from('salon_settings')
            .select('*')
            .eq('name', 'days_off')
            .single();
            
          if (daysOffData && !daysOffError) {
            const parsedDaysOff = JSON.parse(daysOffData.value);
            setDaysOff(parsedDaysOff.map((dayOff: any) => ({
              ...dayOff,
              date: new Date(dayOff.date)
            })));
          } else {
            // Fallback to localStorage
            const savedDaysOff = localStorage.getItem('daysOff');
            if (savedDaysOff) {
              const parsedDaysOff = JSON.parse(savedDaysOff);
              setDaysOff(parsedDaysOff.map((dayOff: any) => ({
                ...dayOff,
                date: new Date(dayOff.date)
              })));
              
              // Save to Supabase if we have a session
              if (sessionData.session) {
                await supabase
                  .from('salon_settings')
                  .upsert({
                    name: 'days_off',
                    value: savedDaysOff
                  });
              }
            }
          }
        } else {
          // No session, use localStorage only
          const savedHours = localStorage.getItem('salonHours');
          setSalonHours(savedHours ? JSON.parse(savedHours) : defaultHours);
          
          const savedDaysOff = localStorage.getItem('daysOff');
          if (savedDaysOff) {
            const parsedDaysOff = JSON.parse(savedDaysOff);
            setDaysOff(parsedDaysOff.map((dayOff: any) => ({
              ...dayOff,
              date: new Date(dayOff.date)
            })));
          }
        }
      } catch (error) {
        console.error('Error loading salon hours:', error);
        // Fallback to localStorage on error
        const savedHours = localStorage.getItem('salonHours');
        setSalonHours(savedHours ? JSON.parse(savedHours) : defaultHours);
        
        const savedDaysOff = localStorage.getItem('daysOff');
        if (savedDaysOff) {
          const parsedDaysOff = JSON.parse(savedDaysOff);
          setDaysOff(parsedDaysOff.map((dayOff: any) => ({
            ...dayOff,
            date: new Date(dayOff.date)
          })));
        }
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadHours();
    
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
      // Try to save to Supabase first
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        // Store in Supabase
        await supabase
          .from('salon_settings')
          .upsert({
            name: 'days_off',
            value: JSON.stringify(updatedDaysOff.map(d => ({
              ...d,
              date: d.date.toISOString()
            })))
          });
      }
      
      // Always store in localStorage as backup
      localStorage.setItem('daysOff', JSON.stringify(updatedDaysOff.map(d => ({
        ...d,
        date: d.date.toISOString()
      }))));
      
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
      // Try to save to Supabase first
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        // Update in Supabase
        await supabase
          .from('salon_settings')
          .upsert({
            name: 'days_off',
            value: JSON.stringify(updatedDaysOff.map(d => ({
              ...d,
              date: d.date.toISOString()
            })))
          });
      }
      
      // Always update localStorage as backup
      localStorage.setItem('daysOff', JSON.stringify(updatedDaysOff.map(d => ({
        ...d,
        date: d.date.toISOString()
      }))));
      
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
