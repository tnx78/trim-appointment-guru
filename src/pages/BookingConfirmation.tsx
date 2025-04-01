
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Service } from '@/types';
import { useServiceContext } from '@/context/ServiceContext';

interface LocationState {
  appointment?: {
    id: string;
    serviceId: string;
    clientName: string;
    date: Date;
    startTime: string;
    endTime: string;
  };
}

export default function BookingConfirmation() {
  const location = useLocation();
  const { getServiceById } = useServiceContext();
  const [service, setService] = useState<Service | undefined>();
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState<string>('');
  
  // Try to get appointment data from location state
  const appointmentData = (location.state as LocationState)?.appointment;
  
  useEffect(() => {
    if (appointmentData?.serviceId) {
      const serviceData = getServiceById(appointmentData.serviceId);
      setService(serviceData);
      
      if (appointmentData.date && appointmentData.startTime && appointmentData.endTime && serviceData) {
        // Create Google Calendar URL
        const startDate = new Date(appointmentData.date);
        const [startHour, startMinute] = appointmentData.startTime.split(':').map(Number);
        startDate.setHours(startHour, startMinute, 0, 0);
        
        const endDate = new Date(startDate);
        const [endHour, endMinute] = appointmentData.endTime.split(':').map(Number);
        endDate.setHours(endHour, endMinute, 0, 0);
        
        const eventDetails = {
          text: `${serviceData.name} Appointment`,
          dates: `${startDate.toISOString().replace(/-|:|\.\d+/g, "")}/${endDate.toISOString().replace(/-|:|\.\d+/g, "")}`,
          details: `Your appointment for ${serviceData.name}`,
          location: "Our Salon"
        };
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}`;
        
        setGoogleCalendarUrl(calendarUrl);
      }
    }
  }, [appointmentData, getServiceById]);

  return (
    <div className="container py-10 max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="text-green-500 h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Your appointment has been successfully booked. We'll send you a confirmation email with all the details.
          </p>
          
          {appointmentData && service && (
            <div className="bg-muted p-4 rounded-lg text-left space-y-2">
              <h3 className="font-medium">Appointment Details</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Service:</span> {service.name}</p>
                <p><span className="font-medium">Date:</span> {format(new Date(appointmentData.date), 'PPPP')}</p>
                <p><span className="font-medium">Time:</span> {appointmentData.startTime} - {appointmentData.endTime}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4 pt-4">
            {googleCalendarUrl && (
              <Button asChild className="w-full" variant="outline">
                <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Google Calendar
                </a>
              </Button>
            )}
            
            <Button asChild className="w-full">
              <Link to="/services">Book Another Appointment</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
