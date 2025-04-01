
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GalleryImage } from '@/context/GalleryContext';
import { useGalleryStorage } from '@/hooks/useGalleryStorage';
import { useAuth } from '@/context/AuthContext';

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const { deleteStorageImage } = useGalleryStorage();
  const { isAuthenticated, isAdmin } = useAuth();

  // Function to add a new image
  const addImage = async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage | null> => {
    try {
      // Check for a real Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (!hasRealSession && !inDemoMode) {
        toast.error('You must be logged in to add images');
        return null;
      }

      console.log('Adding image:', image);

      // For demo mode, we'll store in localStorage
      if (inDemoMode) {
        console.log('Demo mode: Simulating image creation');
        
        // Create a unique ID for the demo image
        const demoId = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const newImage: GalleryImage = {
          id: demoId,
          ...image,
          created_at: new Date().toISOString()
        };
        
        // Get existing demo images from localStorage or initialize empty array
        const existingDemoImages = JSON.parse(
          localStorage.getItem('demoImages') || '[]'
        ) as GalleryImage[];
        
        // Add new image to the array
        const updatedDemoImages = [...existingDemoImages, newImage];
        
        // Store updated images in localStorage
        localStorage.setItem('demoImages', JSON.stringify(updatedDemoImages));
        
        // Update local state
        setImages(prev => [...prev, newImage]);
        toast.success('Image added successfully (Demo Mode)');
        return newImage;
      }

      // Real database operation with Supabase
      const { data, error } = await supabase
        .from('gallery_images')
        .insert(image)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding image to database:', error);
        toast.error('Error adding image: ' + error.message);
        return null;
      }
      
      const newImage = data as GalleryImage;
      console.log('Image added successfully to database:', newImage);
      
      // Update local state
      setImages(prev => [...prev, newImage]);
      toast.success('Image added successfully');
      return newImage;
    } catch (error: any) {
      console.error('Error adding image:', error.message);
      toast.error('Error adding image: ' + error.message);
      return null;
    }
  };

  // Function to update an existing image
  const updateImage = async (image: GalleryImage): Promise<GalleryImage | null> => {
    try {
      // Check for a real Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
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
        
        // Get existing demo images from localStorage
        const existingDemoImages = JSON.parse(
          localStorage.getItem('demoImages') || '[]'
        ) as GalleryImage[];
        
        // Find and update the image
        const updatedDemoImages = existingDemoImages.map(img => 
          img.id === image.id ? { ...image } : img
        );
        
        // Store updated images in localStorage
        localStorage.setItem('demoImages', JSON.stringify(updatedDemoImages));
        
        // Update local state
        setImages(prev => prev.map(img => img.id === image.id ? { ...image } : img));
        toast.success('Image updated successfully (Demo Mode)');
        return image;
      }

      // Real database update
      const { data, error } = await supabase
        .from('gallery_images')
        .update(image)
        .eq('id', image.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating image:', error);
        toast.error('Error updating image: ' + error.message);
        return null;
      }

      const updatedImage = data as GalleryImage;
      
      // Update local state
      setImages(prev => prev.map(img => img.id === image.id ? updatedImage : img));
      toast.success('Image updated successfully');
      return updatedImage;
    } catch (error: any) {
      console.error('Error updating image:', error.message);
      toast.error('Error updating image: ' + error.message);
      return null;
    }
  };

  // Function to delete an image
  const deleteImage = async (id: string): Promise<void> => {
    try {
      // Check for a real Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
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
        
        // Get existing demo images from localStorage
        const existingDemoImages = JSON.parse(
          localStorage.getItem('demoImages') || '[]'
        ) as GalleryImage[];
        
        // Filter out the deleted image
        const updatedDemoImages = existingDemoImages.filter(img => img.id !== id);
        
        // Store updated images in localStorage
        localStorage.setItem('demoImages', JSON.stringify(updatedDemoImages));
        
        // Update local state
        setImages(prev => prev.filter(img => img.id !== id));
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
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting image from database:', error);
        toast.error('Error deleting image: ' + error.message);
        return;
      }
      
      // Update local state
      setImages(prev => prev.filter(img => img.id !== id));
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Error deleting image:', error.message);
      toast.error('Error deleting image: ' + error.message);
    }
  };

  // Function to load images from either Supabase or localStorage
  const loadImages = async () => {
    try {
      // Check for a real Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      // In demo mode, load from localStorage
      if (inDemoMode) {
        console.log('Loading images from localStorage (Demo Mode)');
        const demoImages = JSON.parse(
          localStorage.getItem('demoImages') || '[]'
        ) as GalleryImage[];
        
        setImages(demoImages);
        return;
      }
      
      // With real session, load from Supabase
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (error) {
        console.error('Error loading images:', error);
        toast.error('Error loading images: ' + error.message);
        return;
      }
      
      console.log('Images loaded from Supabase:', data);
      setImages(data || []);
    } catch (error: any) {
      console.error('Error in loadImages:', error);
      toast.error('Error loading images: ' + error.message);
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
