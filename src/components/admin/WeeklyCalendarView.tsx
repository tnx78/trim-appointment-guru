
import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, parseISO, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, Service } from '@/types';
import { AppointmentCard } from './AppointmentCard';

interface WeeklyCalendarViewProps {
  appointments: Appointment[];
  getServiceById: (id: string) => Service | undefined;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}

export function WeeklyCalendarView({
  appointments,
  getServiceById,
  onComplete,
  onCancel
}: WeeklyCalendarViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Generate array of days for the week
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevWeek => subWeeks(prevWeek, 1));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(prevWeek => addWeeks(prevWeek, 1));
  };

  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = appointment.date instanceof Date 
        ? appointment.date 
        : new Date(appointment.date);
      return isSameDay(appointmentDate, day);
    });
  };

  // Generate time slots (from 9:00 to 18:00)
  const timeSlots = Array.from({ length: 10 }, (_, i) => ({
    hour: i + 9,
    display: `${i + 9}:00`
  }));

  // Helper function to parse time string to minutes
  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Determine the position and height of an appointment card
  const getAppointmentPosition = (appointment: Appointment) => {
    const startMinutes = timeToMinutes(appointment.startTime);
    const endMinutes = timeToMinutes(appointment.endTime);
    
    // Calculate top position (relative to 9:00 AM)
    const startPositionMinutes = startMinutes - (9 * 60);
    
    // Calculate height based on duration
    const durationMinutes = endMinutes - startMinutes;
    
    return {
      top: `${startPositionMinutes}px`,
      height: `${durationMinutes}px`
    };
  };

  // Get color based on appointment status
  const getAppointmentColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled': 
        return 'bg-red-400 hover:bg-red-500';
      case 'completed':
        return 'bg-blue-400 hover:bg-blue-500';
      default:
        return 'bg-orange-400 hover:bg-orange-500';
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  // Process appointments to combine duplicate client-service entries into single blocks
  const processAppointmentsForDay = (day: Date) => {
    const dayAppointments = getAppointmentsForDay(day);
    const processedAppointments = new Map();
    
    dayAppointments.forEach(appointment => {
      const clientServiceKey = `${appointment.clientName}-${appointment.serviceId}`;
      
      if (!processedAppointments.has(clientServiceKey)) {
        processedAppointments.set(clientServiceKey, appointment);
      } else {
        // If there's a duplicate, use the one with the earlier start time
        const existing = processedAppointments.get(clientServiceKey);
        const existingStart = timeToMinutes(existing.startTime);
        const currentStart = timeToMinutes(appointment.startTime);
        
        if (currentStart < existingStart) {
          processedAppointments.set(clientServiceKey, appointment);
        }
      }
    });
    
    return Array.from(processedAppointments.values());
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Weekly Calendar</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekly calendar grid */}
        <div className="rounded-md border">
          {/* Header row with day names */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b">
            <div className="p-2 font-medium border-r text-center">Time</div>
            {weekDays.map((day) => (
              <div key={day.toString()} className="p-2 font-medium border-r text-center">
                <div>{format(day, 'EEEE')}</div>
                <div className="text-sm text-gray-500">{format(day, 'MMM dd')}</div>
              </div>
            ))}
          </div>
          
          {/* Time slots rows */}
          <div className="relative">
            {timeSlots.map((slot) => (
              <div key={slot.hour} className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b h-[60px]">
                <div className="p-2 font-medium border-r text-center">
                  {slot.display}
                </div>
                {weekDays.map((day) => (
                  <div key={day.toString()} className="border-r relative">
                    {/* Render appointments for this day and time */}
                    {processAppointmentsForDay(day).map((appointment) => {
                      const service = getServiceById(appointment.serviceId);
                      const { top, height } = getAppointmentPosition(appointment);
                      const color = getAppointmentColor(appointment.status);
                      
                      // Only render if this appointment falls within this hour's slot
                      const slotStart = slot.hour * 60; // Minutes since midnight
                      const slotEnd = slotStart + 60;
                      const appointmentStart = timeToMinutes(appointment.startTime);
                      const appointmentEnd = timeToMinutes(appointment.endTime);
                      
                      // Check if appointment is visible in this cell
                      const isVisible = (
                        (appointmentStart >= slotStart && appointmentStart < slotEnd) || // Starts in this slot
                        (appointmentEnd > slotStart && appointmentEnd <= slotEnd) || // Ends in this slot
                        (appointmentStart <= slotStart && appointmentEnd >= slotEnd) // Spans this slot
                      );
                      
                      if (isVisible) {
                        return (
                          <div
                            key={appointment.id}
                            onClick={() => handleAppointmentClick(appointment)}
                            className={`absolute left-0 right-0 mx-1 rounded px-2 py-1 text-white cursor-pointer transition-colors ${color}`}
                            style={{
                              top: `${Math.max(0, appointmentStart - slotStart)}px`,
                              height: `${Math.min(60, (appointmentEnd - Math.max(appointmentStart, slotStart)))}px`,
                              overflow: 'hidden',
                              zIndex: 10
                            }}
                          >
                            <div className="text-sm font-semibold truncate">{appointment.clientName}</div>
                            <div className="text-xs truncate">{service?.name}</div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Appointment detail card */}
        {selectedAppointment && (
          <div className="mt-4">
            <AppointmentCard
              appointment={selectedAppointment}
              service={getServiceById(selectedAppointment.serviceId)}
              onClose={() => setSelectedAppointment(null)}
              onComplete={onComplete}
              onCancel={onCancel}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
