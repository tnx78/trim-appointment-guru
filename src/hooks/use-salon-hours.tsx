
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { SalonHours } from '@/components/admin/SalonHoursTab';

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
  
  useEffect(() => {
    const loadHours = () => {
      const savedHours = localStorage.getItem('salonHours');
      setSalonHours(savedHours ? JSON.parse(savedHours) : defaultHours);
    };
    
    loadHours();
    
    // Listen for storage events to update the hours if changed in another tab
    window.addEventListener('storage', loadHours);
    
    return () => {
      window.removeEventListener('storage', loadHours);
    };
  }, []);

  const isDateAvailable = (date: Date): boolean => {
    // Get the day of the week as lowercase string
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    
    // Check if the salon is open on that day
    return salonHours[dayOfWeek]?.isOpen || false;
  };

  return {
    salonHours,
    isDateAvailable
  };
};
