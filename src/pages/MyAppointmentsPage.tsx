
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useServiceContext } from '@/context/AppContext';

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  service_id: string;
}

export default function MyAppointmentsPage() {
  const { isAuthenticated, user } = useAuth();
  const { getServiceById } = useServiceContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.email) return;
      
      try {
        console.log('Fetching appointments for user:', user.email);
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('client_email', user.email)
          .order('date', { ascending: false })
          .order('start_time', { ascending: true });
          
        if (error) {
          console.error('Error fetching appointments:', error);
          throw error;
        }
        
        console.log('Fetched appointments:', data);
        setAppointments(data as Appointment[]);
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        toast.error(`Error fetching appointments: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user?.email) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Redirect if not authenticated
  if (!isAuthenticated && !loading) {
    return <Navigate to="/auth" />;
  }

  // Helper to get service name
  const getServiceName = (serviceId: string) => {
    const service = getServiceById(serviceId);
    return service ? service.name : 'Unknown Service';
  };

  // Helper to format date
  const formatAppointmentDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
    } catch (error) {
      return dateStr;
    }
  };

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Appointments</h1>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid gap-6">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">
                  {getServiceName(appointment.service_id)}
                </CardTitle>
                <CardDescription>
                  {formatAppointmentDate(appointment.date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{appointment.start_time} - {appointment.end_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${
                      appointment.status === 'confirmed' ? 'text-green-600' : 
                      appointment.status === 'cancelled' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              You don't have any appointments yet. <br />
              <a href="/services" className="text-primary hover:underline">
                Book an appointment now
              </a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
