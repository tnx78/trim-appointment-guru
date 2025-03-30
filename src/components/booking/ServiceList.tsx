
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign } from 'lucide-react';

export function ServiceList({ onServiceSelect }: { onServiceSelect: () => void }) {
  const { categories, services, selectService } = useAppContext();

  const handleSelectService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      selectService(service);
      onServiceSelect();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book Your Appointment</h1>
        <p className="text-muted-foreground">Select a service to begin booking your appointment</p>
      </div>

      <Tabs defaultValue={categories[0]?.id} className="w-full">
        <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => {
          const categoryServices = services.filter(service => service.categoryId === category.id);
          
          return (
            <TabsContent key={category.id} value={category.id} className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryServices.map((service) => (
                    <Card key={service.id} className="overflow-hidden">
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
                        <Button 
                          onClick={() => handleSelectService(service.id)} 
                          className="w-full"
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
    </div>
  );
}
