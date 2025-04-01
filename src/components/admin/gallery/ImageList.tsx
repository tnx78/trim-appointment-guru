
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GalleryImage } from '@/context/GalleryContext';
import { Edit, Trash } from 'lucide-react';

interface ImageListProps {
  images: GalleryImage[];
  onEdit: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
}

export function ImageList({ images, onEdit, onDelete }: ImageListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.length === 0 ? (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          No images found in this category. Add your first image to get started.
        </div>
      ) : (
        images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square bg-muted">
              <img
                src={image.image_url}
                alt={image.title || 'Gallery image'}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {image.title && <h3 className="font-medium">{image.title}</h3>}
                  {image.description && (
                    <p className="text-sm text-muted-foreground">{image.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onEdit(image)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(image.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
