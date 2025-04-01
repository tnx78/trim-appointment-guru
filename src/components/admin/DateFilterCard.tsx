
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';

interface DateFilterCardProps {
  selectedDate: Date | undefined;
  showAllDates: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onToggleAllDates: (showAll: boolean) => void;
  appointmentDates?: Date[];
}

export function DateFilterCard({ 
  selectedDate, 
  showAllDates, 
  onDateSelect, 
  onToggleAllDates,
  appointmentDates = []
}: DateFilterCardProps) {
  // Create a Map with date strings as keys for faster lookup
  const datesWithAppointments = appointmentDates.reduce((acc, date) => {
    const dateStr = date.toISOString().split('T')[0];
    acc[dateStr] = true;
    return acc;
  }, {} as Record<string, boolean>);

  // Custom modifiers for the calendar
  const modifiers = {
    withAppointments: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return !!datesWithAppointments[dateStr];
    }
  };

  // Custom day class names
  const modifiersClassNames = {
    withAppointments: "bg-gray-100 relative"
  };

  return (
    <Card className="md:w-auto">
      <CardHeader>
        <CardTitle className="text-lg">Date Filter</CardTitle>
        <CardDescription>Select a date or view all appointments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant={showAllDates ? "default" : "outline"} 
            size="sm"
            onClick={() => onToggleAllDates(true)}
            className="flex items-center"
          >
            <CalendarDays className="mr-1 h-4 w-4" />
            All Dates
          </Button>
          <Button 
            variant={!showAllDates ? "default" : "outline"} 
            size="sm"
            onClick={() => onToggleAllDates(false)}
            className="flex items-center"
          >
            <CalendarDays className="mr-1 h-4 w-4" />
            Specific Date
          </Button>
        </div>
        
        {!showAllDates && (
          <div className="rounded-md border">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              initialFocus
              className="pointer-events-auto"
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
