
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSalonHours } from '@/hooks/use-salon-hours';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function DayOffTab() {
  const { daysOff, addDayOff, removeDayOff, isInitialized } = useSalonHours();
  const [showAddDayOffDialog, setShowAddDayOffDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const handleAddDayOff = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check for a valid authentication session
      const { data: sessionData } = await supabase.auth.getSession();
      const isDemoMode = localStorage.getItem('isAdmin') === 'true';
      
      if (!sessionData.session && !isDemoMode) {
        throw new Error('No active session found. Please log in again or use Demo Mode.');
      }
      
      await addDayOff({
        date: selectedDate,
        reason: reason.trim() || 'Closed'
      });
      
      setShowAddDayOffDialog(false);
      setSelectedDate(undefined);
      setReason('');
    } catch (error: any) {
      console.error('Error adding day off:', error);
      toast.error(error.message || 'Failed to add day off');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveDayOff = async (id: string) => {
    try {
      // Check for a valid authentication session
      const { data: sessionData } = await supabase.auth.getSession();
      const isDemoMode = localStorage.getItem('isAdmin') === 'true';
      
      if (!sessionData.session && !isDemoMode) {
        throw new Error('No active session found. Please log in again or use Demo Mode.');
      }
      
      await removeDayOff(id);
    } catch (error: any) {
      console.error('Error removing day off:', error);
      toast.error(error.message || 'Failed to remove day off');
    }
  };
  
  const openAddDayOffDialog = () => {
    setSelectedDate(undefined);
    setReason('');
    setShowAddDayOffDialog(true);
  };
  
  // Sort days off by date, most recent first
  const sortedDaysOff = [...daysOff].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Days Off</CardTitle>
              <CardDescription>Manage days when the salon will be closed</CardDescription>
            </div>
            <Button onClick={openAddDayOffDialog} disabled={!isAuthenticated && localStorage.getItem('isAdmin') !== 'true'}>
              Add Day Off
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isAuthenticated && localStorage.getItem('isAdmin') !== 'true' ? (
            <div className="bg-amber-100 border border-amber-300 text-amber-800 p-4 rounded-md mb-4">
              You must be logged in to add or remove days off. Please login to continue.
            </div>
          ) : null}
          
          {sortedDaysOff.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No days off have been scheduled.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDaysOff.map((dayOff) => (
                <div 
                  key={dayOff.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{format(dayOff.date, 'EEEE, MMMM d, yyyy')}</div>
                      {dayOff.reason && <div className="text-sm text-muted-foreground">{dayOff.reason}</div>}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveDayOff(dayOff.id)}
                    disabled={!isAuthenticated && localStorage.getItem('isAdmin') !== 'true'}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showAddDayOffDialog} onOpenChange={setShowAddDayOffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Day Off</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border mx-auto"
                initialFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g. Holiday, Maintenance, Staff Training"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDayOffDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDayOff} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Day Off'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
