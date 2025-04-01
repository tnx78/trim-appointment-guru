
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
        userId: user?.id,
        category
      });

      // Insert category into Supabase regardless of auth state if isAdmin is set in localStorage
      if (!isAuthenticated && localStorage.getItem('isAdmin') === 'true') {
        // Always try to insert into Supabase first, even in demo mode
        const { data, error } = await supabase
          .from('gallery_categories')
          .insert(category)
          .select()
          .single();
          
        if (error) {
          console.error('Error in demo mode DB insert:', error);
          // Fall back to client-side only if DB operation fails
          const newCategory = { 
            id: crypto.randomUUID(), 
            created_at: new Date().toISOString(),
            ...category 
          } as GalleryCategory;
          
          setCategories(prev => [...prev, newCategory]);
          toast.success('Category added successfully (demo mode, local only)');
          return newCategory;
        }
        
        const newCategory = data as GalleryCategory;
        setCategories(prev => [...prev, newCategory]);
        toast.success('Category added successfully (demo mode)');
        return newCategory;
      }

      // Standard authentication check
      if (!isAuthenticated && !localStorage.getItem('isAdmin')) {
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
        
        // Fallback to client-side only if admin mode is on
        if (localStorage.getItem('isAdmin') === 'true') {
          console.log('Falling back to demo mode after database error');
          const newCategory = { 
            id: crypto.randomUUID(), 
            created_at: new Date().toISOString(),
            ...category 
          } as GalleryCategory;
          
          setCategories(prev => [...prev, newCategory]);
          toast.success('Category added successfully (demo mode, local only)');
          return newCategory;
        }
        
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

      // Get Supabase session to ensure RLS policies work correctly
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session status before updating category:', sessionData.session ? 'Active' : 'None');
      
      if (!sessionData.session) {
        toast.error('Your session has expired. Please log in again.');
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

      // Get Supabase session to ensure RLS policies work correctly
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session status before deleting category:', sessionData.session ? 'Active' : 'None');
      
      if (!sessionData.session) {
        toast.error('Your session has expired. Please log in again.');
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
