
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Appointment, Service } from '@/types';

interface AppointmentItemProps {
  appointment: Appointment;
  service: Service | undefined;
  onComplete: (id: string) => Promise<boolean>;
  onCancel: (id: string) => Promise<boolean>;
}

export function AppointmentItem({ 
  appointment, 
  service, 
  onComplete, 
  onCancel 
}: AppointmentItemProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(appointment.status);
  
  // Get status badge with consistent colors
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
    try {
      setIsProcessing(true);
      const success = await onComplete(appointment.id);
      if (success) {
        setCurrentStatus('completed');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      const success = await onCancel(appointment.id);
      if (success) {
        setCurrentStatus('cancelled');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Use the local status state to ensure UI updates immediately
  const status = currentStatus || appointment.status;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{appointment.clientName}</span>
          {getStatusBadge(status)}
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
        {status === 'confirmed' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center"
              onClick={handleComplete}
              disabled={isProcessing}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Complete'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center text-destructive"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              <XCircle className="mr-1 h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Cancel'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
