
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSalonHours } from '@/hooks/use-salon-hours';

export function DateTimeSelection({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { selectedService, selectedDate, selectedTime, selectDate, selectTime, timeSlots, getAvailableTimeSlots } = useAppContext();
  const { isDateAvailable } = useSalonHours();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [currentView, setCurrentView] = useState<'calendar' | 'time'>('calendar');

  useEffect(() => {
    if (selectedService && selectedDate) {
      const slots = getAvailableTimeSlots(selectedDate, selectedService.duration);
      setAvailableTimeSlots(slots);
    }
  }, [selectedDate, selectedService, getAvailableTimeSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      selectDate(startOfDay(date));
      setCurrentView('time');
    }
  };

  const handleTimeSelect = (time: string) => {
    selectTime(time);
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

  if (!selectedService) {
    return <div>No service selected</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button 
          onClick={onBack} 
          variant="ghost" 
          className="flex items-center mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
        </Button>
        <h1 className="text-3xl font-bold">Choose Date & Time</h1>
        <p className="text-muted-foreground">Select when you would like your {selectedService.name} appointment</p>
      </div>

      <Tabs defaultValue="calendar" className="w-full" value={currentView} onValueChange={(v) => setCurrentView(v as 'calendar' | 'time')}>
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
                      {format(new Date(`2000-01-01T${slot.time}`), 'h:mm a')}
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
                  onClick={onNext}
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
