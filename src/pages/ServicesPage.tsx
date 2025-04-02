
import { useState, useEffect } from 'react';
import { ServiceList } from '@/components/booking/ServiceList';
import { DateTimeSelection } from '@/components/booking/DateTimeSelection';
import BookingForm from '@/components/booking/BookingForm';
import { useBookingContext } from '@/context/BookingContext';
import { useServiceContext } from '@/context/ServiceContext';
import { Loader2 } from 'lucide-react';

export default function ServicesPage() {
  const [step, setStep] = useState(1);
  const { selectedService } = useBookingContext();
  const { services } = useServiceContext();
  const [isLoading, setIsLoading] = useState(true);

  const goToServices = () => {
    setStep(1);
  };

  const goToDateTime = () => {
    setStep(2);
  };

  const goToBookingForm = () => {
    setStep(3);
  };

  useEffect(() => {
    // Check if services are loaded
    if (services.length > 0) {
      setIsLoading(false);
    } else {
      // Set a timeout to avoid infinite loading if there are no services
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [services]);

  useEffect(() => {
    if (step === 2 && !selectedService) {
      goToServices();
    }
  }, [step, selectedService]);

  if (isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      {step === 1 && <ServiceList onServiceSelect={goToDateTime} />}
      {step === 2 && <DateTimeSelection onBack={goToServices} onNext={goToBookingForm} />}
      {step === 3 && <BookingForm onBack={goToDateTime} />}
    </div>
  );
}
