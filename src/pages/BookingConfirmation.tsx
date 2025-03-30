
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function BookingConfirmation() {
  return (
    <div className="container py-10 max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="text-green-500 h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Your appointment has been successfully booked. We'll send you a confirmation email with all the details.
          </p>
          
          <div className="space-y-4 pt-4">
            <Button asChild className="w-full">
              <Link to="/services">Book Another Appointment</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
