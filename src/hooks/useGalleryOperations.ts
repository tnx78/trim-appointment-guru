
import { useState } from 'react';
import { GalleryCategory, GalleryImage } from '@/context/GalleryContext';
import { useGalleryCategories } from '@/hooks/useGalleryCategories';
import { useGalleryImages } from '@/hooks/useGalleryImages';
import { useGalleryStorage } from '@/hooks/useGalleryStorage';
import { toast } from 'sonner';

export function useGalleryOperations() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    categories, 
    setCategories,
    addCategory: addCategoryHook, 
    updateCategory, 
    deleteCategory,
    demoMode 
  } = useGalleryCategories();
  
  const { 
    images, 
    setImages,
    addImage: addImageHook, 
    updateImage, 
    deleteImage,
    loadImages 
  } = useGalleryImages();
  
  const {
    isUploading,
    uploadImage,
    deleteStorageImage
  } = useGalleryStorage();

  // Wrap the hook methods to ensure they update the UI and reload data
  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    try {
      const result = await addCategoryHook(category);
      return result;
    } catch (err: any) {
      console.error('Error in addCategory:', err);
      toast.error('Failed to add category: ' + (err.message || 'Unknown error'));
      return null;
    }
  };

  const addImage = async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage | null> => {
    try {
      console.log('Adding image with data:', image);
      const result = await addImageHook(image);
      return result;
    } catch (err: any) {
      console.error('Error in addImage:', err);
      toast.error('Failed to add image: ' + (err.message || 'Unknown error'));
      return null;
    }
  };

  const getImagesByCategory = (categoryId: string): GalleryImage[] => {
    return images.filter(image => image.category_id === categoryId);
  };

  const loadGalleryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading gallery data...');

      // Use our refactored hooks to load data
      await Promise.all([
        (async () => {
          try {
            // The useGalleryCategories hook handles the loading logic internally
          } catch (err: any) {
            console.error('Error loading categories:', err);
            toast.error('Error loading categories: ' + err.message);
          }
        })(),
        loadImages()
      ]);
    } catch (error: any) {
      console.error('Error loading gallery data:', error.message);
      setError(error.message);
      toast.error('Error loading gallery data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    images, 
    isLoading,
    error,
    isUploading,
    demoMode,
    loadGalleryData,
    addCategory,
    updateCategory,
    deleteCategory,
    addImage,
    updateImage,
    deleteImage,
    getImagesByCategory,
    uploadImage
  };
}
