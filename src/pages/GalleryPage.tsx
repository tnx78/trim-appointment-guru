import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useGalleryContext } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function GalleryPage() {
  const { categories, getImagesByCategory, isLoading } = useGalleryContext();
  const [activeTab, setActiveTab] = useState<string | null>(categories[0]?.id || null);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Our Gallery</h1>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Our gallery is coming soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Our Gallery</h1>
      
      <Tabs 
        defaultValue={categories[0]?.id} 
        onValueChange={(value) => setActiveTab(value)}
        className="space-y-8"
      >
        <TabsList className="w-full flex flex-wrap justify-center">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => {
          const images = getImagesByCategory(category.id);
          
          return (
            <TabsContent key={category.id} value={category.id}>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold">{category.name}</h2>
                {category.description && (
                  <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    {category.description}
                  </p>
                )}
              </div>
              
              {images.length === 0 ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <p className="text-muted-foreground">No images in this category yet.</p>
                </div>
              ) : (
                <div className="mx-auto max-w-4xl">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {images.map((image) => (
                        <CarouselItem key={image.id}>
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex aspect-square items-center justify-center p-0">
                                <img 
                                  src={image.image_url} 
                                  alt={image.title || 'Gallery image'} 
                                  className="w-full h-full object-cover"
                                />
                              </CardContent>
                            </Card>
                            {(image.title || image.description) && (
                              <div className="text-center mt-4 space-y-1">
                                {image.title && <h3 className="font-medium">{image.title}</h3>}
                                {image.description && <p className="text-sm text-muted-foreground">{image.description}</p>}
                              </div>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </Carousel>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-square">
                      <img 
                        src={image.image_url} 
                        alt={image.title || 'Gallery image'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {(image.title || image.description) && (
                      <CardContent className="p-4">
                        {image.title && <h3 className="font-medium">{image.title}</h3>}
                        {image.description && <p className="text-sm text-muted-foreground">{image.description}</p>}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
