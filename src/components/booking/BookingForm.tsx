
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, addMinutes } from 'date-fns';
import { ChevronLeft, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function BookingForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { selectedService, selectedDate, selectedTime, bookAppointment, reset, getServiceById } = useAppContext();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedService || !selectedTime) {
    navigate('/services');
    return null;
  }

  const service = getServiceById(selectedService.id);
  
  if (!service) {
    navigate('/services');
    return null;
  }

  // Safely parse time
  const parseTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    } catch (error) {
      console.error('Error parsing time:', timeStr, error);
      return new Date(); // Fallback
    }
  };

  // Format time safely
  const formatTime = (timeStr: string) => {
    try {
      const date = parseTime(timeStr);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', timeStr, error);
      return timeStr; // Fallback
    }
  };

  const startTime = selectedTime;
  const timeObject = parseTime(startTime);
  const endTimeObject = addMinutes(timeObject, service.duration);
  const endTime = format(endTimeObject, 'H:mm');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const appointmentId = await bookAppointment({
        serviceId: service.id,
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        date: selectedDate,
        startTime,
        endTime,
      });
      
      if (appointmentId) {
        // Reset the booking flow state
        reset();
        
        // Show success message and redirect
        toast.success('Appointment booked successfully!');
        navigate('/confirmation');
      } else {
        throw new Error("Failed to book appointment");
      }
    } catch (error) {
      toast.error('An error occurred while booking your appointment');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Complete Your Booking</h1>
        <p className="text-muted-foreground">
          Enter your information to confirm your appointment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Confirm Booking
              </Button>
            </div>
          </form>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Service</div>
                  <div className="font-medium">{service.name}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">{format(selectedDate, 'PPP')}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-medium flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {formatTime(startTime)} - {formatTime(endTime)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">{service.duration} minutes</div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold">Total</div>
                    <div className="text-lg font-semibold flex items-center">
                      <DollarSign className="h-4 w-4" />
                      {service.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
