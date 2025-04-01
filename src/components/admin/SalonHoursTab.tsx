
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface SalonHours {
  [key: string]: DayHours;
}

export function SalonHoursTab() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSalonHours();
  }, []);

  const fetchSalonHours = async () => {
    try {
      setIsLoading(true);
      
      // First try to fetch hours from salon_hours table
      const { data, error } = await supabase
        .from('salon_hours')
        .select('*')
        .order('day_of_week', { ascending: true });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
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
        
        data.forEach(row => {
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
        // If no data in database, initialize with default hours
        await saveHoursToDatabase(defaultHours);
        setSalonHours(defaultHours);
      }
    } catch (error) {
      console.error('Error fetching salon hours:', error);
      toast.error('Failed to load salon hours');
    } finally {
      setIsLoading(false);
    }
  };

  const saveHoursToDatabase = async (hours: SalonHours) => {
    try {
      const dayMapping: { [key: string]: number } = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
      };
      
      // First delete existing records
      const { error: deleteError } = await supabase
        .from('salon_hours')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows
      
      if (deleteError) throw deleteError;
      
      // Prepare data for insertion
      const rowsToInsert = Object.entries(hours).map(([day, data]) => ({
        day_of_week: dayMapping[day],
        is_open: data.isOpen,
        open_time: data.openTime,
        close_time: data.closeTime
      }));
      
      // Insert new data
      const { error: insertError } = await supabase
        .from('salon_hours')
        .insert(rowsToInsert);
      
      if (insertError) throw insertError;
      
    } catch (error) {
      console.error('Error saving salon hours to database:', error);
      throw error;
    }
  };

  const updateHours = (day: string, field: keyof DayHours, value: any) => {
    setSalonHours({
      ...salonHours,
      [day]: {
        ...salonHours[day],
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveHoursToDatabase(salonHours);
      toast.success('Salon hours saved successfully');
    } catch (error) {
      console.error('Error saving salon hours:', error);
      toast.error('Failed to save salon hours');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSaving(true);
      setSalonHours(defaultHours);
      await saveHoursToDatabase(defaultHours);
      toast.success('Salon hours reset to default');
    } catch (error) {
      console.error('Error resetting salon hours:', error);
      toast.error('Failed to reset salon hours');
    } finally {
      setIsSaving(false);
    }
  };

  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  // Create time options from 00:00 to 23:30 in half-hour increments
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Salon Opening Hours</CardTitle>
          <CardDescription>
            Configure when clients can book appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day.id} className="flex items-center space-x-4 py-2 border-b">
                <div className="w-32">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`${day.id}-open`}
                      checked={salonHours[day.id].isOpen}
                      onCheckedChange={(checked) => 
                        updateHours(day.id, 'isOpen', checked === true)
                      }
                    />
                    <label 
                      htmlFor={`${day.id}-open`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day.label}
                    </label>
                  </div>
                </div>
                
                <div className="flex flex-1 items-center space-x-2">
                  <Select
                    disabled={!salonHours[day.id].isOpen}
                    value={salonHours[day.id].openTime}
                    onValueChange={(value) => updateHours(day.id, 'openTime', value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Opening" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={`open-${day.id}-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <span className="text-sm">to</span>
                  
                  <Select
                    disabled={!salonHours[day.id].isOpen}
                    value={salonHours[day.id].closeTime}
                    onValueChange={(value) => updateHours(day.id, 'closeTime', value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Closing" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={`close-${day.id}-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                Reset to Default
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Hours'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
