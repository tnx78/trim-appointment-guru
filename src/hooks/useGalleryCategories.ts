
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GalleryCategory } from '@/context/GalleryContext';
import { useAuth } from '@/context/AuthContext';

export function useGalleryCategories() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const { isAuthenticated, isAdmin, user } = useAuth();

  // Function to add a new category
  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    try {
      console.log('Adding category with auth status:', { 
        isAuthenticated, 
        isAdmin,
        userId: user?.id
      });

      // Check if user is authenticated (we're not using isAdmin check anymore)
      if (!isAuthenticated) {
        const errorMessage = 'Authentication required to add categories';
        console.error(errorMessage);
        toast.error(errorMessage);
        return null;
      }
      
      // Insert category into Supabase
      const { data, error } = await supabase
        .from('gallery_categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        toast.error('Error adding category: ' + error.message);
        return null;
      }
      
      const newCategory = data as GalleryCategory;
      console.log('Category added successfully:', newCategory);
      
      // Update local state
      setCategories(prev => [...prev, newCategory]);
      toast.success('Category added successfully');
      return newCategory;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error('Error adding category: ' + error.message);
      return null;
    }
  };

  // Function to update an existing category
  const updateCategory = async (category: GalleryCategory): Promise<GalleryCategory | null> => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !isAdmin) {
        const errorMessage = 'Admin authentication required to update categories';
        console.error(errorMessage);
        toast.error(errorMessage);
        return null;
      }

      // Update category in Supabase
      const { data, error } = await supabase
        .from('gallery_categories')
        .update(category)
        .eq('id', category.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        toast.error('Error updating category: ' + error.message);
        return null;
      }

      const updatedCategory = data as GalleryCategory;
      
      // Update local state
      setCategories(prev => prev.map(c => c.id === category.id ? updatedCategory : c));
      toast.success('Category updated successfully');
      return updatedCategory;
    } catch (error: any) {
      console.error('Error updating category:', error.message);
      toast.error('Error updating category: ' + error.message);
      return null;
    }
  };

  // Function to delete a category
  const deleteCategory = async (id: string): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !isAdmin) {
        const errorMessage = 'Admin authentication required to delete categories';
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Delete category from Supabase
      const { error } = await supabase
        .from('gallery_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        toast.error('Error deleting category: ' + error.message);
        return;
      }
      
      // Update local state
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error.message);
      toast.error('Error deleting category: ' + error.message);
    }
  };

  return {
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
}
