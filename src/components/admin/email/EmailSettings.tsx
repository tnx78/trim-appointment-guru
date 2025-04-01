
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

interface EmailSettingsProps {
  isSettingsLoading: boolean;
  adminEmail: string;
  salonName: string;
  isUpdatingSettings: boolean;
  onAdminEmailChange: (value: string) => void;
  onSalonNameChange: (value: string) => void;
  onSaveSettings: () => void;
  onTriggerEmailProcessing: () => void;
}

export function EmailSettings({
  isSettingsLoading,
  adminEmail,
  salonName,
  isUpdatingSettings,
  onAdminEmailChange,
  onSalonNameChange,
  onSaveSettings,
  onTriggerEmailProcessing
}: EmailSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>Configure email notification settings</CardDescription>
        </CardHeader>
        <CardContent>
          {isSettingsLoading ? (
            <div className="py-4 text-center">Loading settings...</div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email Address</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => onAdminEmailChange(e.target.value)}
                  placeholder="admin@example.com"
                />
                <p className="text-sm text-muted-foreground">
                  Admin notifications will be sent to this email address
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salonName">Salon Name</Label>
                <Input
                  id="salonName"
                  value={salonName}
                  onChange={(e) => onSalonNameChange(e.target.value)}
                  placeholder="Your Salon Name"
                />
              </div>
              
              <Button 
                onClick={onSaveSettings} 
                disabled={isUpdatingSettings}
                className="w-full"
              >
                Save Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Processing</CardTitle>
          <CardDescription>Manage email delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">Scheduled Emails</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Emails are automatically processed on a schedule. You can manually trigger email processing below.
            </p>
            <Button 
              onClick={onTriggerEmailProcessing}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Process Pending Emails Now
            </Button>
          </div>
          
          <div className="border p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">How Emails Work</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Booking Confirmation:</strong> Sent to clients immediately after booking
              </p>
              <p>
                <strong>Admin Notification:</strong> Sent to the admin when a new booking is made
              </p>
              <p>
                <strong>Appointment Reminders:</strong> Sent 1 day and 2 hours before the appointment
              </p>
              <p>
                <strong>Status Updates:</strong> Sent when an appointment is confirmed or cancelled
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
