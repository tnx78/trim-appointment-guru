
import { useServiceContext, useCategoryContext } from '@/context/AppContext';
import { useBookingContext } from '@/context/BookingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign } from 'lucide-react';
import { BookingProgressBar } from './BookingProgressBar';
import { useIsMobile } from '@/hooks/use-mobile';

export function ServiceList({ onServiceSelect }: { onServiceSelect?: () => void }) {
  const { categories } = useCategoryContext();
  const { services } = useServiceContext();
  const { selectService } = useBookingContext();
  const isMobile = useIsMobile();

  const handleSelectService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      selectService(service);
      if (onServiceSelect) {
        onServiceSelect();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <BookingProgressBar activeStep={1} />
        <h1 className="text-2xl md:text-3xl font-bold mt-4">Book Your Appointment</h1>
        <p className="text-muted-foreground">Select a service to begin booking your appointment</p>
      </div>

      {categories.length > 0 ? (
        <Tabs defaultValue={categories[0]?.id} className="w-full">
          <div className="relative">
            <TabsList 
              className={`overflow-x-auto ${isMobile ? 'flex justify-start whitespace-nowrap px-0 bg-transparent p-0 space-x-2' : 'grid'} no-scrollbar`}
              style={!isMobile ? { gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` } : undefined}>
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className={`${isMobile ? 
                    'min-w-max flex-shrink-0 px-4 rounded-full border border-muted bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary' : 
                    ''}`}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* Removed gradient fades for scroll indication on mobile as requested */}
          </div>
          
          {categories.map((category) => {
            const categoryServices = services.filter(service => service.categoryId === category.id);
            
            return (
              <TabsContent key={category.id} value={category.id} className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryServices.map((service) => (
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
                        <div className="p-4 md:p-6">
                          <h3 className="text-base md:text-lg font-semibold">{service.name}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground mt-1 mb-3 md:mb-4 line-clamp-2">{service.description}</p>
                          <div className="flex items-center justify-between mb-3 md:mb-4">
                            <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                              {service.duration} min
                            </div>
                            <div className="flex items-center text-xs md:text-sm font-medium">
                              <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                              {service.price.toFixed(2)}
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleSelectService(service.id)} 
                            className="w-full"
                            size={isMobile ? "sm" : "default"}
                          >
                            Select
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No services available.</p>
        </div>
      )}
    </div>
  );
}
