
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Appointment, Service } from '@/types';

interface AppointmentItemProps {
  appointment: Appointment;
  service: Service | undefined;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}

export function AppointmentItem({ 
  appointment, 
  service, 
  onComplete, 
  onCancel 
}: AppointmentItemProps) {
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-400">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-purple-500">Completed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleComplete = async () => {
    await onComplete(appointment.id);
  };

  const handleCancel = async () => {
    await onCancel(appointment.id);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
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
              onClick={handleComplete}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center text-destructive"
              onClick={handleCancel}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
