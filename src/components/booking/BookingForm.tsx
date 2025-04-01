
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingContext } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ServiceList } from './ServiceList';
import { DateTimeSelection } from './DateTimeSelection';
import { Loader2 } from 'lucide-react';

const BookingForm = ({ onBack }: { onBack?: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    selectedService, 
    selectedDate, 
    selectedTime, 
    resetBookingState 
  } = useBookingContext();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{full_name?: string, phone?: string | null} | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [activeStep, setActiveStep] = useState(1);

  // Fetch user profile data when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('full_name, phone')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          setUserProfile(data);
          
          // Auto-fill form with user data
          setFormData(prev => ({
            ...prev,
            name: data.full_name || '',
            email: user.email || '',
            phone: data.phone || ''
          }));
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated, user]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle next step
  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  // Handle previous step
  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  // Handle service selection
  const handleServiceSelect = () => {
    setActiveStep(2);
  };

  // Handle date/time selection
  const handleDateTimeNext = () => {
    setActiveStep(3);
  };

  // Handle booking submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a service, date, and time.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Format date object to YYYY-MM-DD string
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          service_id: selectedService.id,
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone || null,
          date: formattedDate,
          start_time: selectedTime,
          // Calculate end time based on service duration
          end_time: calculateEndTime(selectedTime, selectedService.duration),
          status: 'pending',
          // Link appointment to user if authenticated
          user_id: user?.id || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Reset booking context state
      resetBookingState();
      
      // Navigate to confirmation page
      navigate('/confirmation', { 
        state: { 
          appointment: data,
          serviceName: selectedService.name
        } 
      });
    } catch (error: any) {
      toast({
        title: "Error creating appointment",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  // Always return the component with a consistent structure
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`flex items-center ${activeStep === step ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 
                    ${activeStep === step ? 'bg-primary text-white' : 
                      activeStep > step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  {step}
                </div>
                <span className="text-sm font-medium">
                  {step === 1 ? 'Choose Service' : 
                   step === 2 ? 'Select Date & Time' : 'Your Information'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(activeStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {activeStep === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select a Service</h2>
            <ServiceList onServiceSelect={handleServiceSelect} />
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleNext} 
                disabled={!selectedService}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select Date & Time</h2>
            <DateTimeSelection onBack={handleBack} onNext={handleDateTimeNext} />
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!selectedDate || !selectedTime}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number (optional)
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="pt-4 flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingForm;
