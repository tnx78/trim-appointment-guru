
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
}

export function DateFilterCard({ 
  selectedDate, 
  showAllDates, 
  onDateSelect, 
  onToggleAllDates 
}: DateFilterCardProps) {
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
            <Calendar className="mr-1 h-4 w-4" />
            Specific Date
          </Button>
        </div>
        
        <div className="relative z-10 border rounded-md">
          <div className="pointer-events-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              initialFocus
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
