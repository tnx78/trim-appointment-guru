
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GalleryCategory } from '@/context/GalleryContext';
import { useAuth } from '@/context/AuthContext';

export function useGalleryCategories() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const { isAuthenticated, isAdmin } = useAuth();
  const [sessionVerified, setSessionVerified] = useState(false);
  
  // Verify session when the hook is initialized
  useEffect(() => {
    const verifySession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionVerified(!!data.session);
      console.log('Session verified in useGalleryCategories:', !!data.session);
    };
    
    verifySession();
  }, []);

  // Function to add a new category
  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    try {
      // Verify session again before mutation
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.error('No active session found in addCategory');
        toast.error('No active session found. Please log in again.');
        return null;
      }
      
      console.log('Adding category:', category);
      console.log('Session verified before adding:', !!sessionData.session);

      // Proceed with the database operation
      const { data, error } = await supabase
        .from('gallery_categories')
        .insert(category)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding category to database:', error);
        
        if (error.message.includes('policy')) {
          toast.error('Permission denied: You might not have the right permissions');
        } else if (error.message.includes('JWT')) {
          toast.error('Authentication error: Your session may have expired');
        } else {
          toast.error('Error adding category: ' + error.message);
        }
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
      // Verify session again before mutation
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.error('No active session found in updateCategory');
        toast.error('No active session found. Please log in again.');
        return null;
      }

      console.log('Updating category:', category);
      console.log('Session verified before updating:', !!sessionData.session);

      const { data, error } = await supabase
        .from('gallery_categories')
        .update(category)
        .eq('id', category.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        
        if (error.message.includes('policy')) {
          toast.error('Permission denied: You might not have the right permissions');
        } else if (error.message.includes('JWT')) {
          toast.error('Authentication error: Your session may have expired');
        } else {
          toast.error('Error updating category: ' + error.message);
        }
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
      // Verify session again before mutation
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.error('No active session found in deleteCategory');
        toast.error('No active session found. Please log in again.');
        return;
      }

      console.log('Deleting category:', id);
      console.log('Session verified before deleting:', !!sessionData.session);

      const { error } = await supabase
        .from('gallery_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        
        if (error.message.includes('policy')) {
          toast.error('Permission denied: You might not have the right permissions');
        } else if (error.message.includes('JWT')) {
          toast.error('Authentication error: Your session may have expired');
        } else {
          toast.error('Error deleting category: ' + error.message);
        }
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
    deleteCategory,
    sessionVerified
  };
}
