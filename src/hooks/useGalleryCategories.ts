
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GalleryCategory } from '@/context/GalleryContext';
import { useAuth } from '@/context/AuthContext';

// Key for storing categories in local storage (demo mode)
const DEMO_CATEGORIES_KEY = 'demo_gallery_categories';

export function useGalleryCategories() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const { isAuthenticated, isAdmin, user } = useAuth();

  // Load demo categories from localStorage if needed
  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      const storedCategories = localStorage.getItem(DEMO_CATEGORIES_KEY);
      if (storedCategories) {
        try {
          const parsedCategories = JSON.parse(storedCategories);
          console.log('Loaded demo categories from localStorage:', parsedCategories);
          setCategories(parsedCategories);
        } catch (e) {
          console.error('Error parsing demo categories from localStorage:', e);
        }
      }
    }
  }, []);

  // Save demo categories to localStorage whenever they change
  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true' && categories.length > 0) {
      localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(categories));
      console.log('Saved demo categories to localStorage:', categories);
    }
  }, [categories]);

  // Function to add a new category
  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    try {
      console.log('Adding category with auth status:', { 
        isAuthenticated, 
        isAdmin,
        userId: user?.id,
        category
      });

      // For demo mode, prioritize localStorage but try Supabase too
      if (localStorage.getItem('isAdmin') === 'true') {
        try {
          // Try inserting into Supabase first
          const { data, error } = await supabase
            .from('gallery_categories')
            .insert(category)
            .select()
            .single();
            
          if (!error && data) {
            console.log('Category added successfully to Supabase in demo mode:', data);
            const newCategory = data as GalleryCategory;
            
            // Update local state
            setCategories(prev => [...prev, newCategory]);
            
            // Save to localStorage too for persistence
            const updatedCategories = [...categories, newCategory];
            localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(updatedCategories));
            
            toast.success('Category added successfully');
            return newCategory;
          } else {
            console.warn('Supabase insert failed in demo mode, falling back to localStorage:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase error in demo mode, using localStorage instead:', supabaseError);
        }
        
        // Fall back to localStorage for demo mode
        const newCategory = { 
          id: crypto.randomUUID(), 
          created_at: new Date().toISOString(),
          ...category 
        } as GalleryCategory;
        
        // Update local state
        setCategories(prev => [...prev, newCategory]);
        
        // Save to localStorage for persistence
        const updatedCategories = [...categories, newCategory];
        localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(updatedCategories));
        
        toast.success('Category added successfully (demo mode)');
        return newCategory;
      }

      // Not in demo mode, use only Supabase
      const { data, error } = await supabase
        .from('gallery_categories')
        .insert(category)
        .select()
        .single();
        
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
      // Handle demo mode
      if (localStorage.getItem('isAdmin') === 'true') {
        try {
          // Try Supabase first, but don't fail if it doesn't work
          const { data, error } = await supabase
            .from('gallery_categories')
            .update(category)
            .eq('id', category.id)
            .select()
            .single();

          if (!error && data) {
            console.log('Category updated successfully in Supabase:', data);
            const updatedCategory = data as GalleryCategory;
            
            // Update local state
            setCategories(prev => prev.map(c => c.id === category.id ? updatedCategory : c));
            
            // Update localStorage too
            const updatedCategories = categories.map(c => c.id === category.id ? updatedCategory : c);
            localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(updatedCategories));
            
            toast.success('Category updated successfully');
            return updatedCategory;
          } else {
            console.warn('Supabase update failed in demo mode, falling back to localStorage:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase error in demo mode, using localStorage instead:', supabaseError);
        }

        // Fall back to localStorage for demo mode
        const updatedCategories = categories.map(c => c.id === category.id ? category : c);
        setCategories(updatedCategories);
        localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(updatedCategories));
        toast.success('Category updated successfully (demo mode)');
        return category;
      }

      // Not in demo mode, only use Supabase
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
      // Handle demo mode
      if (localStorage.getItem('isAdmin') === 'true') {
        try {
          // Try Supabase deletion, but don't fail if it doesn't work
          const { error } = await supabase
            .from('gallery_categories')
            .delete()
            .eq('id', id);

          if (!error) {
            console.log('Category deleted successfully from Supabase');
          } else {
            console.warn('Supabase delete failed in demo mode, falling back to localStorage:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase error in demo mode, using localStorage instead:', supabaseError);
        }

        // Always update local state in demo mode
        const updatedCategories = categories.filter(c => c.id !== id);
        setCategories(updatedCategories);
        localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(updatedCategories));
        toast.success('Category deleted successfully (demo mode)');
        return;
      }
      
      // Not in demo mode, only use Supabase
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
