
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CheckCircle, Clock, XCircle, CalendarDays } from 'lucide-react';

export function AppointmentList() {
  const { appointments, getServiceById, updateAppointment, cancelAppointment } = useAppContext();
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [view, setView] = React.useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [showAllDates, setShowAllDates] = useState(true);

  // Get today's date with time set to start of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter appointments based on the selected view and date filter
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    
    // If showAllDates is true, don't filter by date
    const dateMatches = showAllDates || appointmentDate.getTime() === selectedDate.getTime();
    
    if (!dateMatches) return false;
    
    switch (view) {
      case 'upcoming':
        return (appointmentDate.getTime() >= today.getTime() && appointment.status !== 'cancelled');
      case 'past':
        return (appointmentDate.getTime() < today.getTime() || appointment.status === 'completed');
      case 'all':
      default:
        return true;
    }
  });

  // Mark appointment as completed
  const handleComplete = (id: string) => {
    updateAppointment(id, { status: 'completed' });
  };

  // Cancel appointment
  const handleCancel = (id: string) => {
    cancelAppointment(id);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-salon-400">Completed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-auto">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Button 
                variant={showAllDates ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowAllDates(true)}
                className="flex items-center"
              >
                <CalendarDays className="mr-1 h-4 w-4" />
                All Dates
              </Button>
              <Button 
                variant={!showAllDates ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowAllDates(false)}
                className="flex items-center"
              >
                <Calendar className="mr-1 h-4 w-4" />
                Specific Date
              </Button>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date || new Date());
                setShowAllDates(false);
              }}
              className="rounded-md border p-3"
            />
          </div>
        </div>
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>
                    {showAllDates 
                      ? `All appointments (${filteredAppointments.length})`
                      : selectedDate.toDateString() === new Date().toDateString()
                        ? "Today's schedule"
                        : `Schedule for ${format(selectedDate, 'PPP')}`}
                  </CardDescription>
                </div>
                <Tabs defaultValue="upcoming" onValueChange={(value) => setView(value as any)}>
                  <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  {showAllDates 
                    ? "No appointments found"
                    : "No appointments for this date"}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => {
                    const service = getServiceById(appointment.serviceId);
                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{appointment.clientName}</span>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">{service?.name}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            {format(new Date(appointment.date), 'MMM d, yyyy')} • {appointment.startTime} - {appointment.endTime}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.clientEmail} {appointment.clientPhone && `• ${appointment.clientPhone}`}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {appointment.status === 'confirmed' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center"
                                onClick={() => handleComplete(appointment.id)}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center text-destructive"
                                onClick={() => handleCancel(appointment.id)}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
