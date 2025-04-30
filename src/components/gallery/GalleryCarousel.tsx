
import React from 'react';
import { GalleryImage } from '@/context/GalleryContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

interface GalleryCarouselProps {
  images: GalleryImage[];
}

export function GalleryCarousel({ images }: GalleryCarouselProps) {
  if (images.length === 0) {
    return null;
  }
  
  return (
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
  );
}
