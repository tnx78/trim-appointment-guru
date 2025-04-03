
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
    date: string | Date;
    start_time?: string;
    startTime?: string;
    end_time?: string;
    endTime?: string;
    service_id?: string;
  };
  serviceName?: string;
}

export default function BookingConfirmation() {
  const location = useLocation();
  const { getServiceById } = useServiceContext();
  const [service, setService] = useState<Service | undefined>();
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState<string>('');
  
  // Try to get appointment data from location state
  const appointmentData = (location.state as LocationState)?.appointment;
  const serviceName = (location.state as LocationState)?.serviceName;
  
  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('Appointment data:', appointmentData);

    if (appointmentData) {
      // Get service ID - handle both service_id (from DB) and serviceId (from frontend)
      const serviceId = appointmentData.service_id || appointmentData.serviceId;
      
      if (serviceId) {
        // Try to get service data from context
        const serviceData = getServiceById(serviceId);
        console.log('Service data:', serviceData);
        
        if (serviceData) {
          setService(serviceData);
        }
      }

      // Create Google Calendar URL
      try {
        // Determine start and end times from the data
        const startTime = appointmentData.start_time || appointmentData.startTime;
        const endTime = appointmentData.end_time || appointmentData.endTime;
        
        if (appointmentData.date && startTime && endTime) {
          // Create date objects for start and end times
          let appointmentDate;
          
          if (typeof appointmentData.date === 'string') {
            // Parse the date string to ensure correct date
            const [year, month, day] = appointmentData.date.split('-').map(Number);
            appointmentDate = new Date(year, month - 1, day);
          } else {
            appointmentDate = appointmentData.date;
          }

          console.log('Creating calendar event with date:', {
            originalDate: appointmentData.date,
            parsedDate: appointmentDate,
            dateString: appointmentDate.toDateString()
          });

          const [startHour, startMinute] = startTime.split(':').map(Number);
          const startDate = new Date(appointmentDate);
          startDate.setHours(startHour, startMinute, 0, 0);
          
          const [endHour, endMinute] = endTime.split(':').map(Number);
          const endDate = new Date(appointmentDate);
          endDate.setHours(endHour, endMinute, 0, 0);
          
          const serviceTitle = service?.name || serviceName || 'Appointment';
          
          const eventDetails = {
            text: `${serviceTitle} Appointment`,
            dates: `${startDate.toISOString().replace(/-|:|\.\d+/g, "")}/${endDate.toISOString().replace(/-|:|\.\d+/g, "")}`,
            details: `Your appointment for ${serviceTitle}`,
            location: "Our Salon"
          };
          
          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}`;
          
          console.log('Generated Google Calendar URL:', calendarUrl);
          setGoogleCalendarUrl(calendarUrl);
        } else {
          console.error('Missing date, start time, or end time', {
            date: appointmentData.date,
            startTime,
            endTime
          });
        }
      } catch (error) {
        console.error('Error creating Google Calendar URL:', error);
      }
    }
  }, [appointmentData, getServiceById, serviceName, service]);

  const formatTimeDisplay = (timeString?: string) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const formatDateDisplay = (dateValue: string | Date) => {
    try {
      let dateObj;
      
      if (typeof dateValue === 'string') {
        // Parse the date string to ensure correct date
        const [year, month, day] = dateValue.split('-').map(Number);
        dateObj = new Date(year, month - 1, day);
      } else {
        dateObj = dateValue;
      }
      
      return format(dateObj, 'PPPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(dateValue);
    }
  };

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
          
          {appointmentData && (service || serviceName) && (
            <div className="bg-muted p-4 rounded-lg text-left space-y-2">
              <h3 className="font-medium">Appointment Details</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Service:</span> {service?.name || serviceName}</p>
                <p><span className="font-medium">Date:</span> {formatDateDisplay(appointmentData.date)}</p>
                <p><span className="font-medium">Time:</span> {
                  formatTimeDisplay(appointmentData.start_time || appointmentData.startTime)
                } - {
                  formatTimeDisplay(appointmentData.end_time || appointmentData.endTime)
                }</p>
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
