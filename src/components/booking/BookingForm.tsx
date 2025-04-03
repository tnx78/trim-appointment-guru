
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingContext } from '@/context/BookingContext';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { BookingProgressBar } from './BookingProgressBar';
import { UserInfoForm } from './UserInfoForm';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const BookingForm = ({ onBack }: { onBack?: () => void }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    selectedService, 
    selectedDate, 
    selectedTime, 
    resetBookingState 
  } = useBookingContext();
  
  const [loading, setLoading] = useState(false);

  // Handle previous step
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    
    return `${endHours}:${endMinutes}`;
  };

  // Handle booking submission
  const handleSubmit = async (formData: { name: string; email: string; phone: string }) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error("Missing information. Please select a service, date, and time.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Format date to YYYY-MM-DD string using date components to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.log('Booking date:', {
        originalDate: selectedDate,
        formattedDate: formattedDate,
        year, month, day
      });
      
      // Create appointment data object
      const appointmentData = {
        service_id: selectedService.id,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone || null,
        date: formattedDate,
        start_time: selectedTime,
        end_time: calculateEndTime(selectedTime, selectedService.duration),
        status: 'confirmed',
        user_id: user?.id || null
      };
      
      console.log('Submitting appointment data:', appointmentData);
      
      // Insert appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select();
        
      if (error) {
        console.error("Booking error:", error);
        throw new Error(`Failed to create appointment: ${error.message}`);
      }
      
      // Reset booking context state
      resetBookingState();
      
      // Navigate to confirmation page
      if (data && data.length > 0) {
        toast.success("Appointment booked successfully!");
        navigate('/confirmation', { 
          state: { 
            appointment: data[0],
            serviceName: selectedService.name
          } 
        });
      } else {
        throw new Error("No data returned from appointment creation");
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <BookingProgressBar activeStep={3} />
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Information</h1>
          <p className="text-muted-foreground mb-6">Please enter your details to complete the booking</p>
          <UserInfoForm 
            onBack={handleBack}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
