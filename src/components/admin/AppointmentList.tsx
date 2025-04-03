
import React, { useState } from 'react';
import { useServiceContext } from '@/context/ServiceContext';
import { useAppointmentContext } from '@/context/AppointmentContext';
import { DateFilterCard } from './DateFilterCard';
import { AppointmentListCard } from './AppointmentListCard';
import { WeeklyCalendarView } from './WeeklyCalendarView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, List } from 'lucide-react';

export function AppointmentList() {
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
  const [displayMode, setDisplayMode] = useState<'list' | 'calendar'>('calendar');

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
    if (date) {
      setShowAllDates(false);
      // When a specific date is selected, switch to list view
      setDisplayMode('list');
    }
  };

  const handleToggleAllDates = (showAll: boolean) => {
    setShowAllDates(showAll);
    if (showAll) {
      // When showing all dates, use calendar view by default
      setDisplayMode('calendar');
    }
  };

  // Toggle between list and calendar views
  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'list' ? 'calendar' : 'list');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Appointment Management</h2>
        
        <div className="flex items-center gap-2">
          {/* Date filter mode toggle */}
          <div className="flex items-center space-x-2">
            <Button 
              variant={showAllDates ? "default" : "outline"} 
              size="sm"
              onClick={() => handleToggleAllDates(true)}
              className="flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              All Dates
            </Button>
            
            <Button 
              variant={!showAllDates ? "default" : "outline"} 
              size="sm"
              onClick={() => handleToggleAllDates(false)}
              className="flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Specific Date
            </Button>
          </div>
          
          {/* View mode toggle */}
          {showAllDates && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleDisplayMode}
              className="flex items-center gap-2 ml-2"
            >
              {displayMode === 'calendar' ? (
                <>
                  <List className="h-4 w-4" />
                  List View
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" />
                  Calendar View
                </>
              )}
            </Button>
          )}
          
          {/* Appointment count badge */}
          <Badge variant="secondary" className="ml-2">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        {!showAllDates && (
          <DateFilterCard 
            selectedDate={selectedDate} 
            showAllDates={showAllDates}
            onDateSelect={handleDateSelect}
            onToggleAllDates={handleToggleAllDates}
            appointmentDates={appointmentDates}
          />
        )}
        
        <div className="w-full">
          {displayMode === 'calendar' && showAllDates ? (
            <WeeklyCalendarView 
              appointments={filteredAppointments}
              getServiceById={getServiceById}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ) : (
            <div className="flex gap-6">
              {!showAllDates && displayMode === 'list' && (
                <div className="w-1/3">
                  <DateFilterCard 
                    selectedDate={selectedDate} 
                    showAllDates={showAllDates}
                    onDateSelect={handleDateSelect}
                    onToggleAllDates={handleToggleAllDates}
                    appointmentDates={appointmentDates}
                  />
                </div>
              )}
              
              <div className={showAllDates ? "w-full" : "w-2/3"}>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
