
import { useState } from 'react';
import { GalleryImage } from '@/context/GalleryContext';

export function useImageState() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  
  return {
    images,
    setImages
  };
}
