
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GalleryImage } from '@/context/GalleryContext';
import { useAuth } from '@/context/AuthContext';

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const { isAuthenticated, isAdmin, user } = useAuth();

  // Function to add a new image
  const addImage = async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage | null> => {
    try {
      console.log('Adding image with auth status:', { 
        isAuthenticated, 
        isAdmin,
        userId: user?.id,
        image
      });

      // Always try to insert into Supabase first, even in demo mode
      const { data, error } = await supabase
        .from('gallery_images')
        .insert(image)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding image to database:', error);
        
        // Only fall back to local storage if we're in demo mode
        if (localStorage.getItem('isAdmin') === 'true') {
          console.log('Falling back to demo mode after database error for image');
          const newImage = { 
            id: crypto.randomUUID(), 
            created_at: new Date().toISOString(),
            ...image 
          } as GalleryImage;
          
          setImages(prev => [...prev, newImage]);
          toast.success('Image added successfully (demo mode, local only)');
          return newImage;
        }
        
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
      // Handle demo mode
      if (!isAuthenticated && localStorage.getItem('isAdmin') === 'true') {
        console.log('Updating image in demo mode');
        setImages(prev => prev.map(img => img.id === image.id ? image : img));
        toast.success('Image updated successfully (demo mode)');
        return image;
      }

      // Check if user is authenticated
      if (!isAuthenticated && !isAdmin) {
        const errorMessage = 'Admin authentication required to update images';
        console.error(errorMessage);
        toast.error(errorMessage);
        return null;
      }

      // Update image in Supabase
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
      // Handle demo mode
      if (!isAuthenticated && localStorage.getItem('isAdmin') === 'true') {
        console.log('Deleting image in demo mode');
        setImages(prev => prev.filter(img => img.id !== id));
        toast.success('Image deleted successfully (demo mode)');
        return;
      }
      
      // Check if user is authenticated
      if (!isAuthenticated || !isAdmin) {
        const errorMessage = 'Admin authentication required to delete images';
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Delete image from Supabase
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting image:', error);
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

  return {
    images,
    setImages,
    addImage,
    updateImage,
    deleteImage
  };
}
