
import { GalleryImage } from '@/context/GalleryContext';
import { toast } from 'sonner';

export function useDemoImages() {
  const loadDemoImages = (): GalleryImage[] => {
    try {
      return JSON.parse(localStorage.getItem('demoImages') || '[]') as GalleryImage[];
    } catch (error) {
      console.error('Error loading demo images from localStorage:', error);
      return [];
    }
  };
  
  const saveDemoImages = (images: GalleryImage[]): void => {
    try {
      localStorage.setItem('demoImages', JSON.stringify(images));
    } catch (error) {
      console.error('Error saving demo images to localStorage:', error);
      toast.error('Failed to save images to local storage');
    }
  };
  
  const addDemoImage = (images: GalleryImage[], image: Omit<GalleryImage, 'id'>): GalleryImage => {
    const demoId = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newImage: GalleryImage = {
      id: demoId,
      ...image,
      created_at: new Date().toISOString()
    };
    
    const updatedImages = [...images, newImage];
    saveDemoImages(updatedImages);
    
    return newImage;
  };
  
  const updateDemoImage = (images: GalleryImage[], image: GalleryImage): GalleryImage => {
    const updatedImages = images.map(img => 
      img.id === image.id ? { ...image } : img
    );
    
    saveDemoImages(updatedImages);
    return image;
  };
  
  const deleteDemoImage = (images: GalleryImage[], id: string): GalleryImage[] => {
    const updatedImages = images.filter(img => img.id !== id);
    saveDemoImages(updatedImages);
    return updatedImages;
  };
  
  return {
    loadDemoImages,
    addDemoImage,
    updateDemoImage,
    deleteDemoImage
  };
}
