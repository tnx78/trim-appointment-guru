
import { supabase } from '@/integrations/supabase/client';
import { GalleryCategory } from '@/context/GalleryContext';
import { toast } from 'sonner';
import { useAdminCheck } from './useAdminCheck';

export function useCategoryDatabase() {
  const { checkAdminAccess } = useAdminCheck();

  const loadCategoriesFromDatabase = async (): Promise<GalleryCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (error) {
        console.error('Error loading categories:', error);
        toast.error('Error loading categories: ' + error.message);
        return [];
      }
      
      console.log('Categories loaded from Supabase:', data);
      return data || [];
    } catch (error: any) {
      console.error('Error in loadCategoriesFromDatabase:', error);
      toast.error('Error loading categories: ' + error.message);
      return [];
    }
  };
  
  const addCategoryToDatabase = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    if (!checkAdminAccess('add categories')) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .insert(category)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding category to database:', error);
        
        if (error.message.includes('policy')) {
          toast.error('Admin access required to add categories');
        } else if (error.message.includes('JWT')) {
          toast.error('Authentication error: Your session may have expired');
        } else {
          toast.error('Error adding category: ' + error.message);
        }
        return null;
      }
      
      return data as GalleryCategory;
    } catch (error: any) {
      console.error('Error in addCategoryToDatabase:', error);
      toast.error('Error adding category: ' + error.message);
      return null;
    }
  };
  
  const updateCategoryInDatabase = async (category: GalleryCategory): Promise<GalleryCategory | null> => {
    if (!checkAdminAccess('update categories')) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .update(category)
        .eq('id', category.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category in database:', error);
        
        if (error.message.includes('policy')) {
          toast.error('Admin access required to update categories');
        } else if (error.message.includes('JWT')) {
          toast.error('Authentication error: Your session may have expired');
        } else {
          toast.error('Error updating category: ' + error.message);
        }
        return null;
      }

      return data as GalleryCategory;
    } catch (error: any) {
      console.error('Error in updateCategoryInDatabase:', error);
      toast.error('Error updating category: ' + error.message);
      return null;
    }
  };
  
  const deleteCategoryFromDatabase = async (id: string): Promise<boolean> => {
    if (!checkAdminAccess('delete categories')) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('gallery_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category from database:', error);
        
        if (error.message.includes('policy')) {
          toast.error('Admin access required to delete categories');
        } else if (error.message.includes('JWT')) {
          toast.error('Authentication error: Your session may have expired');
        } else {
          toast.error('Error deleting category: ' + error.message);
        }
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in deleteCategoryFromDatabase:', error);
      toast.error('Error deleting category: ' + error.message);
      return false;
    }
  };
  
  return {
    loadCategoriesFromDatabase,
    addCategoryToDatabase,
    updateCategoryInDatabase,
    deleteCategoryFromDatabase
  };
}
