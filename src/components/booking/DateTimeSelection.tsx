
import { useState, useEffect } from 'react';
import { useBookingContext } from '@/context/BookingContext';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { useSalonHours } from '@/hooks/use-salon-hours';
import { BookingProgressBar } from './BookingProgressBar';

export function DateTimeSelection({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  const { selectedService, selectedDate, selectedTime, selectDate, selectTime } = useBookingContext();
  const { isDateAvailable } = useSalonHours();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Generate time slots (simplified for this example)
  useEffect(() => {
    if (selectedService && selectedDate) {
      // For demonstration purposes, we'll just create some dummy time slots
      const slots = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute of ['00', '30']) {
          slots.push({
            id: `slot-${hour}-${minute}`,
            time: `${hour}:${minute}`,
            available: true
          });
        }
      }
      
      setAvailableTimeSlots(slots);
    }
  }, [selectedDate, selectedService]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      selectDate(startOfDay(date));
    }
  };

  const handleTimeSelect = (time: string) => {
    selectTime(time);
  };

  const handleBackButton = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleNextButton = () => {
    if (onNext) {
      onNext();
    }
  };

  const isDateDisabled = (date: Date) => {
    // Don't allow dates in the past
    const today = startOfDay(new Date());
    if (date < today) return true;
    
    // Don't allow dates too far in the future (e.g., limit to 30 days)
    const maxDate = addDays(today, 30);
    if (date > maxDate) return true;
    
    // Check if the salon is open on this day
    return !isDateAvailable(date);
  };

  // Helper function to safely format time
  const formatTimeSlot = (timeStr: string) => {
    try {
      // Create a valid date object using the time string (with a fixed date)
      const timeParts = timeStr.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return timeStr; // Fallback to original string if parsing fails
      }
      
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', timeStr, error);
      return timeStr; // Fallback to original string if formatting fails
    }
  };

  if (!selectedService) {
    return <div>No service selected</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button 
          onClick={handleBackButton} 
          variant="ghost" 
          className="flex items-center mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <BookingProgressBar activeStep={2} />
        <h1 className="text-3xl font-bold mt-4">Choose Date & Time</h1>
        <p className="text-muted-foreground">Select when you would like your {selectedService.name} appointment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select a Date</CardTitle>
            <CardDescription>Choose a date for your appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              className="rounded-md border mx-auto"
            />
          </CardContent>
        </Card>

        {/* Time Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select a Time</CardTitle>
            <CardDescription>
              {selectedDate 
                ? `Available time slots for ${format(selectedDate, 'EEEE, MMMM d, yyyy')}` 
                : 'Please select a date first'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Please select a date first.</p>
              </div>
            ) : availableTimeSlots.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No available time slots for this date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableTimeSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedTime === slot.time ? 'default' : 'outline'}
                    className="text-center py-6"
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                  >
                    {formatTimeSlot(slot.time)}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handleBackButton}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNextButton}
          disabled={!selectedDate || !selectedTime}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
