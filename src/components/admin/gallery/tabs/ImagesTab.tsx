
import React from 'react';
import { ImageList } from '../ImageList';
import { GalleryImage } from '@/context/GalleryContext';

interface ImagesTabProps {
  images: GalleryImage[];
  onEdit: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
}

export function ImagesTab({
  images,
  onEdit,
  onDelete
}: ImagesTabProps) {
  return (
    <ImageList 
      images={images} 
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
