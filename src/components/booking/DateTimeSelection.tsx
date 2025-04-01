
import { useState, useEffect } from 'react';
import { useBookingContext } from '@/context/BookingContext';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSalonHours } from '@/hooks/use-salon-hours';
import { BookingProgressBar } from './BookingProgressBar';

export function DateTimeSelection({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  const { selectedService, selectedDate, selectedTime, selectDate, selectTime } = useBookingContext();
  const { isDateAvailable } = useSalonHours();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [currentView, setCurrentView] = useState<'calendar' | 'time'>(selectedDate ? 'time' : 'calendar');

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
      setCurrentView('time');
    }
  };

  const handleTimeSelect = (time: string) => {
    selectTime(time);
  };

  const handleBackButton = () => {
    if (currentView === 'time') {
      setCurrentView('calendar');
    } else if (onBack) {
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

      <Tabs defaultValue={currentView} className="w-full" value={currentView} onValueChange={(v) => setCurrentView(v as 'calendar' | 'time')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Choose Date
          </TabsTrigger>
          <TabsTrigger value="time" disabled={!selectedDate}>
            <Clock className="mr-2 h-4 w-4" />
            Choose Time
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="pt-4">
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
        </TabsContent>
        
        <TabsContent value="time" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Select a Time</CardTitle>
              <CardDescription>
                Available time slots for {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableTimeSlots.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No available time slots for this date.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setCurrentView('calendar')}
                  >
                    Choose Another Date
                  </Button>
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
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('calendar')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Calendar
                </Button>
                
                <Button 
                  onClick={handleNextButton}
                  disabled={!selectedTime}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
