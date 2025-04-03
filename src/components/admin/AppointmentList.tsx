
import React, { useState } from 'react';
import { useServiceContext } from '@/context/ServiceContext';
import { useAppointmentContext } from '@/context/AppointmentContext';
import { DateFilterCard } from './DateFilterCard';
import { AppointmentListCard } from './AppointmentListCard';
import { WeeklyCalendarView } from './WeeklyCalendarView';
import { Button } from '@/components/ui/button';
import { CalendarDays, List } from 'lucide-react';

export function AppointmentList() {
  // Use the specific contexts needed instead of the combined useAppContext
  const { getServiceById } = useServiceContext();
  const { 
    appointments, 
    updateAppointment, 
    cancelAppointment, 
    getAppointmentDates 
  } = useAppointmentContext();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [showAllDates, setShowAllDates] = useState(true);
  const [displayMode, setDisplayMode] = useState<'list' | 'calendar'>('list');

  // Get dates with appointments for calendar indicators - filter out cancelled appointments
  const appointmentDates = appointments
    .filter(app => app.status !== 'cancelled')
    .map(app => new Date(app.date));

  // Get today's date with time set to start of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter appointments based on the selected view and date filter
  const filteredAppointments = appointments.filter(appointment => {
    // Make a new date object to compare only the date portion
    const appointmentDate = appointment.date instanceof Date 
      ? appointment.date 
      : new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    
    // If showAllDates is true, don't filter by date
    const dateMatches = showAllDates || 
      (selectedDate && appointmentDate.getTime() === selectedDate.getTime());
    
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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) setShowAllDates(false);
    // If a specific date is selected, switch to list view
    setDisplayMode('list');
  };

  const handleToggleAllDates = (showAll: boolean) => {
    setShowAllDates(showAll);
    // When toggling to show all dates, maintain the current view
  };

  // Toggle between list and calendar views
  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'list' ? 'calendar' : 'list');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64">
          <DateFilterCard 
            selectedDate={selectedDate} 
            showAllDates={showAllDates}
            onDateSelect={handleDateSelect}
            onToggleAllDates={handleToggleAllDates}
            appointmentDates={appointmentDates}
          />
          
          {/* View mode toggle button */}
          {showAllDates && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={toggleDisplayMode}
              >
                {displayMode === 'list' ? (
                  <>
                    <CalendarDays className="h-4 w-4" />
                    Switch to Calendar View
                  </>
                ) : (
                  <>
                    <List className="h-4 w-4" />
                    Switch to List View
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1">
          {showAllDates && displayMode === 'calendar' ? (
            <WeeklyCalendarView 
              appointments={filteredAppointments}
              getServiceById={getServiceById}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ) : (
            <AppointmentListCard 
              appointments={filteredAppointments}
              selectedDate={selectedDate}
              showAllDates={showAllDates}
              getServiceById={getServiceById}
              onComplete={handleComplete}
              onCancel={handleCancel}
              viewType={view}
              onViewChange={setView}
            />
          )}
        </div>
      </div>
    </div>
  );
}
