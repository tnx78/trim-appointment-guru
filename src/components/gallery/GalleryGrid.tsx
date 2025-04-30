
import React from 'react';
import { GalleryImage } from '@/context/GalleryContext';
import { Card, CardContent } from '@/components/ui/card';

interface GalleryGridProps {
  images: GalleryImage[];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  if (images.length === 0) {
    return null;
  }
  
  return (
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
  );
}
