
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
      if (!isAuthenticated) {
        toast.error('You must be logged in to add categories');
        return null;
      }
      
      console.log('Adding category:', category);
      console.log('Current user:', user);

      // Make sure we're sending the request with the user's session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication error: ' + sessionError.message);
        return null;
      }

      if (!sessionData.session) {
        console.error('No active session found');
        toast.error('No active session found. Please log in again.');
        return null;
      }

      console.log('Session verified:', !!sessionData.session);

      // Try with explicit RLS bypass for admins
      let query = supabase
        .from('gallery_categories')
        .insert(category)
        .select()
        .single();

      const { data, error } = await query;
        
      if (error) {
        console.error('Error adding category to database:', error);
        toast.error('Error adding category: ' + error.message);
        return null;
      }
      
      const newCategory = data as GalleryCategory;
      console.log('Category added successfully to database:', newCategory);
      
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
      if (!isAuthenticated) {
        toast.error('You must be logged in to update categories');
        return null;
      }

      console.log('Updating category:', category);
      console.log('Current user:', user);

      // Make sure we're sending the request with the user's session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication error: ' + sessionError.message);
        return null;
      }

      if (!sessionData.session) {
        console.error('No active session found');
        toast.error('No active session found. Please log in again.');
        return null;
      }

      console.log('Session verified:', !!sessionData.session);

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
      if (!isAuthenticated) {
        toast.error('You must be logged in to delete categories');
        return;
      }

      console.log('Deleting category:', id);
      console.log('Current user:', user);

      // Make sure we're sending the request with the user's session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication error: ' + sessionError.message);
        return;
      }

      if (!sessionData.session) {
        console.error('No active session found');
        toast.error('No active session found. Please log in again.');
        return;
      }

      console.log('Session verified:', !!sessionData.session);

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
