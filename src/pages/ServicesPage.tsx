
import { useState } from 'react';
import { ServiceList } from '@/components/booking/ServiceList';
import { DateTimeSelection } from '@/components/booking/DateTimeSelection';
import BookingForm from '@/components/booking/BookingForm';

export default function ServicesPage() {
  const [step, setStep] = useState(1);

  const goToServices = () => {
    setStep(1);
  };

  const goToDateTime = () => {
    setStep(2);
  };

  const goToBookingForm = () => {
    setStep(3);
  };

  return (
    <div className="container py-10">
      {step === 1 && <ServiceList onServiceSelect={goToDateTime} />}
      {step === 2 && <DateTimeSelection onBack={goToServices} onNext={goToBookingForm} />}
      {step === 3 && <BookingForm onBack={goToDateTime} />}
    </div>
  );
}
