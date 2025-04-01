
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface DayHours {
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

  const [salonHours, setSalonHours] = useState<SalonHours>(() => {
    const savedHours = localStorage.getItem('salonHours');
    return savedHours ? JSON.parse(savedHours) : defaultHours;
  });

  useEffect(() => {
    localStorage.setItem('salonHours', JSON.stringify(salonHours));
  }, [salonHours]);

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

  const updateHours = (day: string, field: keyof DayHours, value: any) => {
    setSalonHours({
      ...salonHours,
      [day]: {
        ...salonHours[day],
        [field]: value
      }
    });
  };

  const handleSave = () => {
    localStorage.setItem('salonHours', JSON.stringify(salonHours));
    // Force a page reload to ensure all components respect the new hours
    toast.success('Salon hours saved successfully. Refreshing page to apply changes.');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleReset = () => {
    setSalonHours(defaultHours);
    toast.info('Salon hours reset to default');
  };

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
              <Button variant="outline" onClick={handleReset}>
                Reset to Default
              </Button>
              <Button onClick={handleSave}>
                Save Hours
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
