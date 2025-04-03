
import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, parseISO, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppointmentItem } from './AppointmentItem';
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

  // Determine the position and height of an appointment card
  const getAppointmentPosition = (appointment: Appointment) => {
    const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
    const [endHour, endMinute] = appointment.endTime.split(':').map(Number);
    
    // Calculate top position (relative to 9:00 AM)
    const startTime = startHour + startMinute / 60 - 9;
    const endTime = endHour + endMinute / 60 - 9;
    
    // Calculate height based on duration
    const durationHours = endTime - startTime;
    
    return {
      top: `${startTime * 60}px`,
      height: `${durationHours * 60}px`
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

  return (
    <Card>
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
                    {getAppointmentsForDay(day).map((appointment) => {
                      const service = getServiceById(appointment.serviceId);
                      const { top, height } = getAppointmentPosition(appointment);
                      const color = getAppointmentColor(appointment.status);
                      
                      // Only render if this appointment falls within this hour
                      const [startHour] = appointment.startTime.split(':').map(Number);
                      const [endHour, endMinute] = appointment.endTime.split(':').map(Number);
                      
                      // Check if appointment is visible in this cell
                      const appointmentStartsBeforeOrAtSlot = startHour <= slot.hour;
                      const appointmentEndsAfterSlotStart = endHour > slot.hour || (endHour === slot.hour && endMinute > 0);
                      
                      if (appointmentStartsBeforeOrAtSlot && appointmentEndsAfterSlotStart) {
                        return (
                          <div
                            key={appointment.id}
                            onClick={() => handleAppointmentClick(appointment)}
                            className={`absolute left-0 right-0 mx-1 rounded px-2 py-1 text-white cursor-pointer transition-colors ${color}`}
                            style={{
                              top: top,
                              height: height,
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
