
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { DateFilterCard } from './DateFilterCard';
import { AppointmentListCard } from './AppointmentListCard';

export function AppointmentList() {
  const { appointments, getServiceById, updateAppointment, cancelAppointment } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [showAllDates, setShowAllDates] = useState(true);

  // Get today's date with time set to start of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter appointments based on the selected view and date filter
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
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
  };

  const handleToggleAllDates = (showAll: boolean) => {
    setShowAllDates(showAll);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <DateFilterCard 
          selectedDate={selectedDate} 
          showAllDates={showAllDates}
          onDateSelect={handleDateSelect}
          onToggleAllDates={handleToggleAllDates}
        />

        <div className="flex-1">
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
    </div>
  );
}
