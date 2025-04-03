
import React, { useState } from 'react';
import { useServiceContext } from '@/context/ServiceContext';
import { useAppointmentContext } from '@/context/AppointmentContext';
import { DateFilterCard } from './DateFilterCard';
import { AppointmentListCard } from './AppointmentListCard';
import { WeeklyCalendarView } from './WeeklyCalendarView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AppointmentList() {
  const { getServiceById } = useServiceContext();
  const { 
    appointments, 
    updateAppointment, 
    cancelAppointment, 
    getAppointmentDates 
  } = useAppointmentContext();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'all' | 'upcoming' | 'past'>('all');
  const [displayMode, setDisplayMode] = useState<'weekly' | 'specific'>('weekly');

  const appointmentDates = appointments
    .filter(app => app.status !== 'cancelled')
    .map(app => new Date(app.date));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      const appointmentDate = appointment.date instanceof Date 
        ? appointment.date 
        : new Date(appointment.date);
      appointmentDate.setHours(0, 0, 0, 0);
      
      if (displayMode === 'specific' && selectedDate) {
        if (appointmentDate.getTime() !== selectedDate.getTime()) {
          return false;
        }
      }
      
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
  };

  const filteredAppointments = getFilteredAppointments();

  const handleComplete = async (id: string): Promise<boolean> => {
    try {
      const result = await updateAppointment(id, { status: 'completed' });
      return result === true;
    } catch (error) {
      console.error('Error completing appointment:', error);
      return false;
    }
  };

  const handleCancel = async (id: string): Promise<boolean> => {
    try {
      const result = await cancelAppointment(id);
      return result === true;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return false;
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'weekly' ? 'specific' : 'weekly');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Appointment Management</h2>
        
        <div className="flex items-center gap-2">
          <Tabs defaultValue={view} onValueChange={(value) => setView(value as any)} className="mr-2">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant={displayMode === 'specific' ? "default" : "outline"} 
            size="sm"
            onClick={toggleDisplayMode}
            className="flex items-center gap-2"
          >
            {displayMode === 'weekly' ? (
              <>
                <CalendarDays className="h-4 w-4" />
                Specific Date
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Weekly Calendar
              </>
            )}
          </Button>
          
          <Badge variant="secondary" className="ml-2">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-6">
        {displayMode === 'weekly' ? (
          <WeeklyCalendarView 
            appointments={filteredAppointments}
            getServiceById={getServiceById}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <DateFilterCard 
                selectedDate={selectedDate} 
                showAllDates={false}
                onDateSelect={handleDateSelect}
                onToggleAllDates={() => {}}
                appointmentDates={appointmentDates}
                hideToggle={true}
              />
            </div>
            
            <div className="md:col-span-2">
              <AppointmentListCard 
                appointments={filteredAppointments}
                selectedDate={selectedDate}
                showAllDates={false}
                getServiceById={getServiceById}
                onComplete={handleComplete}
                onCancel={handleCancel}
                viewType={view}
                onViewChange={setView}
                hideViewSwitch={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
