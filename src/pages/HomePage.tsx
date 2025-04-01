import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { Scissors, Calendar, UserCheck, Clock, DollarSign } from 'lucide-react';

export default function HomePage() {
  const { services, appointments } = useAppContext();

  // Get upcoming appointments (today and future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() >= today.getTime() && appointment.status === 'confirmed';
  });

  return (
    <div className="container py-10">
      <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <div className="container px-4 md:px-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Book Your Perfect Haircut Today
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Experience the best salon services with our professional stylists. Easy online booking, flexible scheduling.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
            <Button asChild size="lg" className="px-8">
              <Link to="/services">Book Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/services">View Services</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">Our Services</h2>
            <p className="text-gray-500 mt-2">Professional hair services for every style</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <Card key={service.id} className="overflow-hidden">
                {service.image && (
                  <div className="w-full h-40 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {service.duration} min
                    </div>
                    <div className="flex items-center font-medium">
                      <DollarSign className="h-4 w-4" />
                      {service.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {services.length > 6 && (
            <div className="text-center mt-10">
              <Button asChild variant="outline">
                <Link to="/services">View All Services</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-secondary rounded-lg">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">Why Choose Us</h2>
            <p className="text-gray-500 mt-2">Experience the difference</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-center">
                  <Scissors className="h-8 w-8 text-salon-500" />
                </div>
                <CardTitle className="text-center pt-2">Expert Stylists</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                Our team of professional stylists are trained in the latest techniques and trends.
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-center">
                  <Calendar className="h-8 w-8 text-salon-500" />
                </div>
                <CardTitle className="text-center pt-2">Easy Booking</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                Book your appointment online in just a few clicks, anytime, anywhere.
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-center">
                  <Clock className="h-8 w-8 text-salon-500" />
                </div>
                <CardTitle className="text-center pt-2">Flexible Hours</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                We offer flexible scheduling to accommodate your busy lifestyle.
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-center">
                  <UserCheck className="h-8 w-8 text-salon-500" />
                </div>
                <CardTitle className="text-center pt-2">Personalized Service</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                We take the time to understand your needs for the perfect look.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">Ready to Look Your Best?</h2>
            <p className="text-gray-500 mt-2">Book your appointment today</p>
          </div>
          
          <div className="flex justify-center">
            <Button asChild size="lg" className="px-8">
              <Link to="/services">Book Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
