
import { supabase } from '@/integrations/supabase/client';
import { GalleryImage } from '@/context/GalleryContext';
import { toast } from 'sonner';
import { useAdminCheck } from './useAdminCheck';

export function useImageDatabase() {
  const { checkAdminAccess } = useAdminCheck();

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
    if (!checkAdminAccess('add images')) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert(image)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding image to database:', error);
        
        if (error.message.includes('policy')) {
          toast.error('Admin access required to add images');
        } else {
          toast.error('Error adding image: ' + error.message);
        }
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
    if (!checkAdminAccess('update images')) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .update(image)
        .eq('id', image.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating image in database:', error);
        
        if (error.message.includes('policy')) {
          toast.error('Admin access required to update images');
        } else {
          toast.error('Error updating image: ' + error.message);
        }
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
    if (!checkAdminAccess('delete images')) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting image from database:', error);
        
        if (error.message.includes('policy')) {
          toast.error('Admin access required to delete images');
        } else {
          toast.error('Error deleting image: ' + error.message);
        }
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
