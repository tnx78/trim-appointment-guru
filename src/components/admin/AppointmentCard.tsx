
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Appointment, Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, XCircle, Clock, Mail, Phone, User } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  service: Service | undefined;
  onClose: () => void;
  onComplete: (id: string) => Promise<boolean>;
  onCancel: (id: string) => Promise<boolean>;
}

export function AppointmentCard({
  appointment,
  service,
  onClose,
  onComplete,
  onCancel
}: AppointmentCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
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
      if (!success) {
        throw new Error("Update operation failed");
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
      if (!success) {
        throw new Error("Cancel operation failed");
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {appointment.clientName} 
            {getStatusBadge(appointment.status)}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="text-sm">
          <div className="font-medium">Service</div>
          <div>{service?.name || 'Unknown Service'}</div>
        </div>
        
        <div className="text-sm">
          <div className="font-medium flex items-center gap-1">
            <Clock className="h-4 w-4" /> 
            Date and Time
          </div>
          <div>
            {format(new Date(appointment.date), 'PPP')} • {appointment.startTime} - {appointment.endTime}
          </div>
        </div>
        
        <div className="text-sm">
          <div className="font-medium flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Email
          </div>
          <div>{appointment.clientEmail}</div>
        </div>
        
        {appointment.clientPhone && (
          <div className="text-sm">
            <div className="font-medium flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Phone
            </div>
            <div>{appointment.clientPhone}</div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {appointment.status === 'confirmed' && (
          <div className="flex space-x-2 w-full">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1 flex-1"
              onClick={handleComplete}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Complete'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1 flex-1 text-destructive"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Cancel'}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
