
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GalleryImage } from '@/context/GalleryContext';
import { useAuth } from '@/context/AuthContext';
import { useGalleryStorage } from '@/hooks/useGalleryStorage';

// Key for storing images in local storage (demo mode)
const DEMO_IMAGES_KEY = 'demo_gallery_images';

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { deleteStorageImage } = useGalleryStorage();

  // Load demo images from localStorage if needed
  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      const storedImages = localStorage.getItem(DEMO_IMAGES_KEY);
      if (storedImages) {
        try {
          const parsedImages = JSON.parse(storedImages);
          console.log('Loaded demo images from localStorage:', parsedImages);
          setImages(parsedImages);
        } catch (e) {
          console.error('Error parsing demo images from localStorage:', e);
        }
      }
    }
  }, []);

  // Save demo images to localStorage whenever they change
  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true' && images.length > 0) {
      localStorage.setItem(DEMO_IMAGES_KEY, JSON.stringify(images));
      console.log('Saved demo images to localStorage:', images);
    }
  }, [images]);

  // Function to add a new image
  const addImage = async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage | null> => {
    try {
      console.log('Adding image with auth status:', { 
        isAuthenticated, 
        isAdmin,
        userId: user?.id,
        image
      });

      // For demo mode, prioritize localStorage
      if (localStorage.getItem('isAdmin') === 'true') {
        try {
          // Try Supabase first, but don't fail if it doesn't work
          const { data, error } = await supabase
            .from('gallery_images')
            .insert(image)
            .select()
            .single();

          if (!error && data) {
            console.log('Image added successfully to Supabase:', data);
            const newImage = data as GalleryImage;
            setImages(prev => [...prev, newImage]);
            toast.success('Image added successfully');
            return newImage;
          } else {
            console.warn('Supabase insert failed in demo mode, falling back to localStorage:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase error in demo mode, using localStorage instead:', supabaseError);
        }

        // Fall back to localStorage for demo mode
        const newImage = { 
          id: crypto.randomUUID(), 
          created_at: new Date().toISOString(),
          ...image 
        } as GalleryImage;
        
        setImages(prev => [...prev, newImage]);
        toast.success('Image added successfully (demo mode, local only)');
        return newImage;
      }

      // Not in demo mode, only use Supabase
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
      // Handle demo mode
      if (localStorage.getItem('isAdmin') === 'true') {
        try {
          // Try Supabase first, but don't fail if it doesn't work
          const { data, error } = await supabase
            .from('gallery_images')
            .update(image)
            .eq('id', image.id)
            .select()
            .single();

          if (!error && data) {
            console.log('Image updated successfully in Supabase:', data);
            const updatedImage = data as GalleryImage;
            setImages(prev => prev.map(img => img.id === image.id ? updatedImage : img));
            toast.success('Image updated successfully');
            return updatedImage;
          } else {
            console.warn('Supabase update failed in demo mode, falling back to localStorage:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase error in demo mode, using localStorage instead:', supabaseError);
        }

        // Fall back to localStorage for demo mode
        setImages(prev => prev.map(img => img.id === image.id ? image : img));
        toast.success('Image updated successfully (demo mode)');
        return image;
      }

      // Not in demo mode, only use Supabase
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
      // Find the image to get its URL for storage deletion
      const imageToDelete = images.find(img => img.id === id);
      if (!imageToDelete) {
        console.error('Image not found for deletion');
        toast.error('Image not found');
        return;
      }

      // Delete the image file from storage first
      const imageDeleted = await deleteStorageImage(imageToDelete.image_url);
      if (!imageDeleted) {
        console.warn('Could not delete image file, but will proceed with database deletion');
      }

      // Handle demo mode
      if (localStorage.getItem('isAdmin') === 'true') {
        try {
          // Try Supabase deletion, but don't fail if it doesn't work
          const { error } = await supabase
            .from('gallery_images')
            .delete()
            .eq('id', id);

          if (!error) {
            console.log('Image deleted successfully from Supabase');
          } else {
            console.warn('Supabase delete failed in demo mode, falling back to localStorage:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase error in demo mode, using localStorage instead:', supabaseError);
        }

        // Always update local state in demo mode
        setImages(prev => prev.filter(img => img.id !== id));
        toast.success('Image deleted successfully (demo mode)');
        return;
      }
      
      // Not in demo mode, only use Supabase
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

  return {
    images,
    setImages,
    addImage,
    updateImage,
    deleteImage
  };
}
