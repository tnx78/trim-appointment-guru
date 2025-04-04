
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BookingProgressBarProps {
  activeStep: number;
}

export function BookingProgressBar({ activeStep }: BookingProgressBarProps) {
  const isMobile = useIsMobile();
  
  const steps = [
    { 
      number: 1, 
      label: 'Choose Service', 
      mobileLabel: 'Service' 
    },
    { 
      number: 2, 
      label: 'Select Date & Time', 
      mobileLabel: 'Date/Time' 
    },
    { 
      number: 3, 
      label: 'Your Information', 
      mobileLabel: 'You' 
    }
  ];
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {steps.map(step => (
          <div 
            key={step.number} 
            className={`flex items-center ${activeStep === step.number ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 
                ${activeStep === step.number ? 'bg-primary text-white' : 
                  activeStep > step.number ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
            >
              {step.number}
            </div>
            <span className="text-sm font-medium">
              {isMobile ? step.mobileLabel : step.label}
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
  );
}
