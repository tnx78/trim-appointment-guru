
import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, Service } from '@/types';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
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

  // Get appointments for a specific day (including past appointments)
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

  // Parse time string to minutes since midnight
  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Get color based on appointment status
  const getAppointmentColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled': 
        return 'bg-red-400 hover:bg-red-500';
      case 'completed':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-orange-400 hover:bg-orange-500';
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  const handleCompleteAppointment = () => {
    if (selectedAppointment) {
      onComplete(selectedAppointment.id);
      setShowDetails(false);
    }
  };

  const handleOpenCancelDialog = () => {
    setShowCancelDialog(true);
  };

  const handleCancelAppointment = () => {
    if (selectedAppointment) {
      onCancel(selectedAppointment.id);
      setShowCancelDialog(false);
      setShowDetails(false);
    }
  };

  // Create a map to track appointments by day and time
  // This helps prevent duplicate renders of appointments that span multiple slots
  const createDayAppointmentMap = () => {
    const dayMap = new Map<string, Map<string, Appointment>>();
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const timeMap = new Map<string, Appointment>();
      const dayAppointments = getAppointmentsForDay(day);
      
      dayAppointments.forEach(appointment => {
        const key = `${appointment.clientName}-${appointment.serviceId}-${appointment.startTime}`;
        timeMap.set(key, appointment);
      });
      
      dayMap.set(dayKey, timeMap);
    });
    
    return dayMap;
  };

  const dayAppointmentMap = createDayAppointmentMap();

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
                {weekDays.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const appointmentsForDay = dayAppointmentMap.get(dayKey);
                  
                  return (
                    <div key={day.toString()} className="border-r relative">
                      {appointmentsForDay && Array.from(appointmentsForDay.values()).map((appointment) => {
                        const service = getServiceById(appointment.serviceId);
                        const startMinutes = timeToMinutes(appointment.startTime);
                        const endMinutes = timeToMinutes(appointment.endTime);
                        const slotStartMinutes = slot.hour * 60;
                        const slotEndMinutes = (slot.hour + 1) * 60;
                        
                        // Only render if this appointment overlaps with this time slot
                        if (startMinutes < slotEndMinutes && endMinutes > slotStartMinutes) {
                          // Calculate position and height 
                          const top = Math.max(0, startMinutes - slotStartMinutes);
                          
                          // Only render appointment at its starting slot
                          if (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) {
                            const duration = endMinutes - startMinutes;
                            const height = duration; // 1 minute = 1px
                            const color = getAppointmentColor(appointment.status);
                            
                            return (
                              <div
                                key={appointment.id}
                                onClick={() => handleAppointmentClick(appointment)}
                                className={`absolute left-0 right-0 mx-1 rounded px-2 py-1 text-white cursor-pointer transition-colors ${color}`}
                                style={{
                                  top: `${top}px`,
                                  height: `${height}px`,
                                  overflow: 'hidden',
                                  zIndex: 10
                                }}
                              >
                                <div className="text-sm font-semibold truncate">{appointment.clientName}</div>
                                <div className="text-xs truncate">{service?.name}</div>
                              </div>
                            );
                          }
                        }
                        return null;
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Dialog for appointment details */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Client:</div>
                <div className="text-sm">{selectedAppointment.clientName}</div>
                
                <div className="text-sm font-medium">Service:</div>
                <div className="text-sm">{getServiceById(selectedAppointment.serviceId)?.name}</div>
                
                <div className="text-sm font-medium">Date:</div>
                <div className="text-sm">
                  {selectedAppointment.date instanceof Date 
                    ? format(selectedAppointment.date, 'MMMM dd, yyyy') 
                    : format(new Date(selectedAppointment.date), 'MMMM dd, yyyy')}
                </div>
                
                <div className="text-sm font-medium">Time:</div>
                <div className="text-sm">{selectedAppointment.startTime} - {selectedAppointment.endTime}</div>
                
                <div className="text-sm font-medium">Status:</div>
                <div className="text-sm">
                  <Badge 
                    className={
                      selectedAppointment.status === 'confirmed' ? "bg-green-500" :
                      selectedAppointment.status === 'cancelled' ? "bg-red-400" :
                      selectedAppointment.status === 'completed' ? "bg-purple-500" : ""
                    }
                  >
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="text-sm font-medium">Phone:</div>
                <div className="text-sm">{selectedAppointment.clientPhone}</div>
                
                <div className="text-sm font-medium">Email:</div>
                <div className="text-sm">{selectedAppointment.clientEmail}</div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <>
                    <Button 
                      onClick={handleCompleteAppointment}
                      variant="default"
                    >
                      Mark Completed
                    </Button>
                    <Button 
                      onClick={handleOpenCancelDialog} 
                      variant="destructive"
                    >
                      Cancel Appointment
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for cancellation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelAppointment} className="bg-red-600 hover:bg-red-700">
              Yes, Cancel It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
