
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { SalonHours } from '@/components/admin/SalonHoursTab';
import { DayOff } from '@/types';

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
  
  useEffect(() => {
    const loadHours = () => {
      const savedHours = localStorage.getItem('salonHours');
      setSalonHours(savedHours ? JSON.parse(savedHours) : defaultHours);
      
      const savedDaysOff = localStorage.getItem('daysOff');
      if (savedDaysOff) {
        // Convert string dates back to Date objects
        const parsedDaysOff = JSON.parse(savedDaysOff);
        setDaysOff(parsedDaysOff.map((dayOff: any) => ({
          ...dayOff,
          date: new Date(dayOff.date)
        })));
      }
    };
    
    loadHours();
    
    // Listen for storage events to update the hours if changed in another tab
    window.addEventListener('storage', loadHours);
    
    return () => {
      window.removeEventListener('storage', loadHours);
    };
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
    return salonHours[dayOfWeek]?.isOpen || false;
  };

  const addDayOff = (dayOff: Omit<DayOff, 'id'>) => {
    const newDayOff = {
      id: crypto.randomUUID(),
      ...dayOff
    };
    
    const updatedDaysOff = [...daysOff, newDayOff];
    setDaysOff(updatedDaysOff);
    
    // Store in localStorage with date converted to string
    localStorage.setItem('daysOff', JSON.stringify(updatedDaysOff.map(d => ({
      ...d,
      date: d.date.toISOString()
    }))));
    
    return newDayOff;
  };

  const removeDayOff = (id: string) => {
    const updatedDaysOff = daysOff.filter(day => day.id !== id);
    setDaysOff(updatedDaysOff);
    
    // Store in localStorage with date converted to string
    localStorage.setItem('daysOff', JSON.stringify(updatedDaysOff.map(d => ({
      ...d,
      date: d.date.toISOString()
    }))));
  };

  return {
    salonHours,
    daysOff,
    isDateAvailable,
    addDayOff,
    removeDayOff
  };
};
