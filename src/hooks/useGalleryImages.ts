
import { useState } from 'react';
import { toast } from 'sonner';
import { GalleryImage } from '@/context/GalleryContext';
import { useGalleryStorage } from '@/hooks/useGalleryStorage';
import { useImageState } from '@/hooks/gallery/useImageState';
import { useDemoImages } from '@/hooks/gallery/useDemoImages';
import { useImageDatabase } from '@/hooks/gallery/useImageDatabase';
import { useGallerySession } from '@/hooks/gallery/useGallerySession';

export function useGalleryImages() {
  const { images, setImages } = useImageState();
  const { loadDemoImages, addDemoImage, updateDemoImage, deleteDemoImage } = useDemoImages();
  const { loadImagesFromDatabase, addImageToDatabase, updateImageInDatabase, deleteImageFromDatabase } = useImageDatabase();
  const { checkSession } = useGallerySession();
  const { deleteStorageImage } = useGalleryStorage();
  
  // Function to add a new image
  const addImage = async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage | null> => {
    try {
      const { hasRealSession, inDemoMode } = await checkSession();
      
      if (!hasRealSession && !inDemoMode) {
        toast.error('You must be logged in to add images');
        return null;
      }

      // For demo mode, we'll store in localStorage
      if (inDemoMode) {
        console.log('Demo mode: Simulating image creation');
        
        const newImage = addDemoImage(images, image);
        setImages(prev => [...prev, newImage]);
        toast.success('Image added successfully (Demo Mode)');
        return newImage;
      }

      // Real database operation with Supabase
      const newImage = await addImageToDatabase(image);
      
      if (newImage) {
        setImages(prev => [...prev, newImage]);
        toast.success('Image added successfully');
      }
      
      return newImage;
    } catch (error: any) {
      console.error('Error in addImage:', error);
      toast.error('Error adding image: ' + (error.message || 'Unknown error'));
      return null;
    }
  };

  // Function to update an existing image
  const updateImage = async (image: GalleryImage): Promise<GalleryImage | null> => {
    try {
      const { hasRealSession, inDemoMode } = await checkSession();
      
      if (!hasRealSession && !inDemoMode) {
        toast.error('You must be logged in to update images');
        return null;
      }

      // Get the existing image to check if we need to delete an old image file
      const existingImage = images.find(img => img.id === image.id);
      const imageChanged = existingImage && existingImage.image_url !== image.image_url;
      
      // If the image URL has changed and the old one is a storage URL (not data:), delete it
      if (imageChanged && existingImage?.image_url?.startsWith('http')) {
        try {
          await deleteStorageImage(existingImage.image_url);
        } catch (err) {
          console.warn('Failed to delete old image file, but continuing update:', err);
          // Continue with update even if delete fails
        }
      }

      // For demo mode, we'll update in localStorage
      if (inDemoMode) {
        console.log('Demo mode: Simulating image update');
        
        const updatedImage = updateDemoImage(images, image);
        setImages(prev => prev.map(img => img.id === image.id ? updatedImage : img));
        toast.success('Image updated successfully (Demo Mode)');
        return updatedImage;
      }

      // Real database update
      const updatedImage = await updateImageInDatabase(image);
      
      if (updatedImage) {
        setImages(prev => prev.map(img => img.id === image.id ? updatedImage : img));
        toast.success('Image updated successfully');
      }
      
      return updatedImage;
    } catch (error: any) {
      console.error('Error in updateImage:', error);
      toast.error('Error updating image: ' + (error.message || 'Unknown error'));
      return null;
    }
  };

  // Function to delete an image
  const deleteImage = async (id: string): Promise<void> => {
    try {
      const { hasRealSession, inDemoMode } = await checkSession();
      
      if (!hasRealSession && !inDemoMode) {
        toast.error('You must be logged in to delete images');
        return;
      }

      // Find the image to get its URL for storage deletion
      const imageToDelete = images.find(img => img.id === id);
      if (!imageToDelete) {
        console.error('Image not found for deletion');
        toast.error('Image not found');
        return;
      }

      // For demo mode, we'll just delete from localStorage
      if (inDemoMode) {
        console.log('Demo mode: Simulating image deletion');
        
        const updatedImages = deleteDemoImage(images, id);
        setImages(updatedImages);
        toast.success('Image deleted successfully (Demo Mode)');
        return;
      }

      // Delete the image file from storage first if it's not a data URL
      if (imageToDelete.image_url && imageToDelete.image_url.startsWith('http')) {
        const imageDeleted = await deleteStorageImage(imageToDelete.image_url);
        if (!imageDeleted) {
          console.warn('Could not delete image file, but will proceed with database deletion');
        }
      }

      // Delete from database
      const success = await deleteImageFromDatabase(id);
      
      if (success) {
        setImages(prev => prev.filter(img => img.id !== id));
        toast.success('Image deleted successfully');
      }
    } catch (error: any) {
      console.error('Error in deleteImage:', error);
      toast.error('Error deleting image: ' + (error.message || 'Unknown error'));
    }
  };

  // Function to load images from either Supabase or localStorage
  const loadImages = async () => {
    try {
      const { hasRealSession, inDemoMode } = await checkSession();
      
      // In demo mode, load from localStorage
      if (inDemoMode) {
        console.log('Loading images from localStorage (Demo Mode)');
        const demoImages = loadDemoImages();
        setImages(demoImages);
        return;
      }
      
      // With real session, load from Supabase
      const databaseImages = await loadImagesFromDatabase();
      setImages(databaseImages);
    } catch (error: any) {
      console.error('Error in loadImages:', error);
      toast.error('Error loading images: ' + (error.message || 'Unknown error'));
    }
  };

  return {
    images,
    setImages,
    addImage,
    updateImage,
    deleteImage,
    loadImages
  };
}
