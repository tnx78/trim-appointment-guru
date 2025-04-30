
import { supabase } from '@/integrations/supabase/client';
import { GalleryImage } from '@/context/GalleryContext';
import { toast } from 'sonner';

export function useImageDatabase() {
  const loadImagesFromDatabase = async (): Promise<GalleryImage[]> => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (error) {
        console.error('Error loading images from database:', error);
        toast.error('Error loading images: ' + error.message);
        return [];
      }
      
      return data || [];
    } catch (error: any) {
      console.error('Exception loading images from database:', error);
      toast.error('Error loading images: ' + error.message);
      return [];
    }
  };
  
  const addImageToDatabase = async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage | null> => {
    try {
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
      
      return data as GalleryImage;
    } catch (error: any) {
      console.error('Exception adding image to database:', error);
      toast.error('Error adding image: ' + error.message);
      return null;
    }
  };
  
  const updateImageInDatabase = async (image: GalleryImage): Promise<GalleryImage | null> => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .update(image)
        .eq('id', image.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating image in database:', error);
        toast.error('Error updating image: ' + error.message);
        return null;
      }

      return data as GalleryImage;
    } catch (error: any) {
      console.error('Exception updating image in database:', error);
      toast.error('Error updating image: ' + error.message);
      return null;
    }
  };
  
  const deleteImageFromDatabase = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting image from database:', error);
        toast.error('Error deleting image: ' + error.message);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Exception deleting image from database:', error);
      toast.error('Error deleting image: ' + error.message);
      return false;
    }
  };
  
  return {
    loadImagesFromDatabase,
    addImageToDatabase,
    updateImageInDatabase,
    deleteImageFromDatabase
  };
}
