
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Appointment, Service } from '@/types';
import { AppointmentItem } from './AppointmentItem';

interface AppointmentListCardProps {
  appointments: Appointment[];
  selectedDate: Date | undefined;
  showAllDates: boolean;
  getServiceById: (id: string) => Service | undefined;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  viewType: 'all' | 'upcoming' | 'past';
  onViewChange: (view: 'all' | 'upcoming' | 'past') => void;
}

export function AppointmentListCard({
  appointments,
  selectedDate,
  showAllDates,
  getServiceById,
  onComplete,
  onCancel,
  viewType,
  onViewChange
}: AppointmentListCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>
              {showAllDates 
                ? `All appointments (${appointments.length})`
                : selectedDate && selectedDate.toDateString() === new Date().toDateString()
                  ? "Today's schedule"
                  : selectedDate ? `Schedule for ${format(selectedDate, 'PPP')}` : "No date selected"}
            </CardDescription>
          </div>
          <Tabs defaultValue={viewType} onValueChange={(value) => onViewChange(value as any)}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {showAllDates 
              ? "No appointments found"
              : "No appointments for this date"}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const service = getServiceById(appointment.serviceId);
              return (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                  service={service}
                  onComplete={onComplete}
                  onCancel={onCancel}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
