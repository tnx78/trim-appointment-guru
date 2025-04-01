
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, addDays, isSaturday, isSunday } from 'date-fns';
import { ChevronLeft, Clock } from 'lucide-react';

export function DateTimeSelection({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { selectedService, selectedDate, selectedTime, selectDate, selectTime, getAvailableTimeSlots } = useAppContext();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ id: string; time: string; available: boolean }[]>([]);
  
  // Create a date 3 months from now for the upper bound of selectable dates
  const futureDate = addDays(new Date(), 90);
  
  // Create today's date for the lower bound of selectable dates
  const today = new Date();

  useEffect(() => {
    if (selectedService) {
      const slots = getAvailableTimeSlots(selectedDate, selectedService.duration);
      setAvailableTimeSlots(slots);
    }
  }, [selectedDate, selectedService, getAvailableTimeSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      selectDate(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    selectTime(time);
  };

  const handleContinue = () => {
    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }
    onNext();
  };

  // Format time from 24h to 12h format
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Disable weekends and dates before today or after 3 months
  const isDateDisabled = (date: Date) => {
    return date < today || 
           date > futureDate || 
           isSaturday(date) || 
           isSunday(date);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Select Date & Time</h1>
        <p className="text-muted-foreground">
          {selectedService ? `Booking for ${selectedService.name} (${selectedService.duration} min)` : 'Please select a date and time for your appointment'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-auto">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="rounded-md border p-3 pointer-events-auto"
          />
        </div>
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Available Times</CardTitle>
              <CardDescription>
                {format(selectedDate, 'PPP')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableTimeSlots.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No available time slots for this date
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTime === slot.time ? 'default' : 'outline'}
                      className="flex items-center justify-center"
                      onClick={() => handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      {formatTime(slot.time)}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Services
        </Button>
        <Button onClick={handleContinue} disabled={!selectedTime}>
          Continue
        </Button>
      </div>
    </div>
  );
}
