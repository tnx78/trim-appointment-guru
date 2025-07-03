
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { useWebsiteContent } from '@/hooks/useWebsiteContent';
import { Scissors, Calendar, UserCheck, Clock, DollarSign } from 'lucide-react';

export default function HomePage() {
  const { services, appointments } = useAppContext();
  const { heroSettings, getContentByKey, loading } = useWebsiteContent();

  // Get upcoming appointments (today and future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() >= today.getTime() && appointment.status === 'confirmed';
  });

  // Fallback content for when loading or no content available
  const fallbackContent = {
    hero_title: 'Book Your Perfect Haircut Today',
    hero_subtitle: 'Experience the best salon services with our professional stylists. Easy online booking, flexible scheduling.',
    hero_cta_primary: 'Book Now',
    hero_cta_secondary: 'View Services',
    services_section_title: 'Our Services',
    services_section_subtitle: 'Professional hair services for every style',
    why_choose_title: 'Why Choose Us',
    why_choose_subtitle: 'Experience the difference',
    cta_section_title: 'Ready to Look Your Best?',
    cta_section_subtitle: 'Book your appointment today',
    expert_stylists_title: 'Expert Stylists',
    expert_stylists_text: 'Our team of professional stylists are trained in the latest techniques and trends.',
    easy_booking_title: 'Easy Booking',
    easy_booking_text: 'Book your appointment online in just a few clicks, anytime, anywhere.',
    flexible_hours_title: 'Flexible Hours',
    flexible_hours_text: 'We offer flexible scheduling to accommodate your busy lifestyle.',
    personalized_service_title: 'Personalized Service',
    personalized_service_text: 'We take the time to understand your needs for the perfect look.'
  };

  const heroStyle = heroSettings?.background_image_url ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroSettings.background_image_url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <div className="container py-10">
      <section 
        className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center rounded-lg"
        style={heroStyle}
      >
        <div className="container px-4 md:px-6">
          <div className="space-y-4">
            <h1 className={`text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none ${heroSettings?.background_image_url ? 'text-white' : ''}`}>
              {loading ? fallbackContent.hero_title : getContentByKey('hero_title', fallbackContent.hero_title)}
            </h1>
            <p className={`mx-auto max-w-[700px] md:text-xl ${heroSettings?.background_image_url ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
              {loading ? fallbackContent.hero_subtitle : getContentByKey('hero_subtitle', fallbackContent.hero_subtitle)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
            <Button asChild size="lg" className="px-8">
              <Link to="/services">
                {loading ? fallbackContent.hero_cta_primary : getContentByKey('hero_cta_primary', fallbackContent.hero_cta_primary)}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/services">
                {loading ? fallbackContent.hero_cta_secondary : getContentByKey('hero_cta_secondary', fallbackContent.hero_cta_secondary)}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">
              {loading ? fallbackContent.services_section_title : getContentByKey('services_section_title', fallbackContent.services_section_title)}
            </h2>
            <p className="text-gray-500 mt-2">
              {loading ? fallbackContent.services_section_subtitle : getContentByKey('services_section_subtitle', fallbackContent.services_section_subtitle)}
            </p>
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
            <h2 className="text-3xl font-bold tracking-tighter">
              {loading ? fallbackContent.why_choose_title : getContentByKey('why_choose_title', fallbackContent.why_choose_title)}
            </h2>
            <p className="text-gray-500 mt-2">
              {loading ? fallbackContent.why_choose_subtitle : getContentByKey('why_choose_subtitle', fallbackContent.why_choose_subtitle)}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-center">
                  <Scissors className="h-8 w-8 text-salon-500" />
                </div>
                <CardTitle className="text-center pt-2">
                  {loading ? fallbackContent.expert_stylists_title : getContentByKey('expert_stylists_title', fallbackContent.expert_stylists_title)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                {loading ? fallbackContent.expert_stylists_text : getContentByKey('expert_stylists_text', fallbackContent.expert_stylists_text)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-center">
                  <Calendar className="h-8 w-8 text-salon-500" />
                </div>
                <CardTitle className="text-center pt-2">
                  {loading ? fallbackContent.easy_booking_title : getContentByKey('easy_booking_title', fallbackContent.easy_booking_title)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                {loading ? fallbackContent.easy_booking_text : getContentByKey('easy_booking_text', fallbackContent.easy_booking_text)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-center">
                  <Clock className="h-8 w-8 text-salon-500" />
                </div>
                <CardTitle className="text-center pt-2">
                  {loading ? fallbackContent.flexible_hours_title : getContentByKey('flexible_hours_title', fallbackContent.flexible_hours_title)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                {loading ? fallbackContent.flexible_hours_text : getContentByKey('flexible_hours_text', fallbackContent.flexible_hours_text)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-center">
                  <UserCheck className="h-8 w-8 text-salon-500" />
                </div>
                <CardTitle className="text-center pt-2">
                  {loading ? fallbackContent.personalized_service_title : getContentByKey('personalized_service_title', fallbackContent.personalized_service_title)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                {loading ? fallbackContent.personalized_service_text : getContentByKey('personalized_service_text', fallbackContent.personalized_service_text)}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">
              {loading ? fallbackContent.cta_section_title : getContentByKey('cta_section_title', fallbackContent.cta_section_title)}
            </h2>
            <p className="text-gray-500 mt-2">
              {loading ? fallbackContent.cta_section_subtitle : getContentByKey('cta_section_subtitle', fallbackContent.cta_section_subtitle)}
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button asChild size="lg" className="px-8">
              <Link to="/services">
                {loading ? fallbackContent.hero_cta_primary : getContentByKey('hero_cta_primary', fallbackContent.hero_cta_primary)}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
