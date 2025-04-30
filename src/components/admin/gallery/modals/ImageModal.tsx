
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ImageForm } from '../ImageForm';
import { GalleryCategory, GalleryImage } from '@/context/GalleryContext';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image?: GalleryImage;
  categories: GalleryCategory[];
  onSubmit: (imageData: Omit<GalleryImage, 'id'>, file?: File) => Promise<void>;
}

export function ImageModal({
  isOpen,
  onClose,
  image,
  categories,
  onSubmit
}: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {image ? 'Edit Image' : 'Add New Image'}
          </DialogTitle>
          <DialogDescription>
            {image ? 'Edit this gallery image' : 'Add a new image to the gallery'}
          </DialogDescription>
        </DialogHeader>
        <ImageForm 
          image={image} 
          categories={categories}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
