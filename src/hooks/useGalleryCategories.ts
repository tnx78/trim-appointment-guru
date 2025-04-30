
import { useEffect } from 'react';
import { toast } from 'sonner';
import { GalleryCategory } from '@/context/GalleryContext';
import { useCategoryState } from './gallery/useCategoryState';
import { useSessionVerification } from './gallery/useSessionVerification';
import { useDemoCategories } from './gallery/useDemoCategories';
import { useCategoryDatabase } from './gallery/useCategoryDatabase';
import { useGallerySession } from './gallery/useGallerySession';

export function useGalleryCategories() {
  const { 
    categories, 
    setCategories,
    sessionVerified,
    setSessionVerified,
    demoMode,
    setDemoMode
  } = useCategoryState();
  
  // Set up session verification
  useSessionVerification(setSessionVerified, setDemoMode);
  
  // Import utility hooks
  const { loadDemoCategories, addDemoCategory, updateDemoCategory, deleteDemoCategory } = useDemoCategories();
  const { 
    loadCategoriesFromDatabase, 
    addCategoryToDatabase, 
    updateCategoryInDatabase, 
    deleteCategoryFromDatabase 
  } = useCategoryDatabase();
  const { checkSession } = useGallerySession();

  // Function to add a new category
  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    try {
      // Verify session again before mutation
      const { hasRealSession, inDemoMode } = await checkSession();
      
      console.log('Adding category in mode:', 
        inDemoMode ? 'demo admin' : (hasRealSession ? 'authenticated' : 'unauthenticated'));
      console.log('Category data:', category);
      
      if (!hasRealSession && !inDemoMode) {
        console.error('No active session found in addCategory');
        toast.error('No active session found. Please log in again.');
        return null;
      }
      
      // If in demo mode, return a fake success response with locally stored data
      if (inDemoMode) {
        console.log('Demo mode: Simulating successful category creation');
        
        const demoCategory = addDemoCategory(categories, category);
        
        // Update local state
        setCategories(prev => [...prev, demoCategory]);
        toast.success('Category added successfully (Demo Mode)');
        return demoCategory;
      }

      // Real database operation (only happens with actual session)
      const newCategory = await addCategoryToDatabase(category);
      
      if (newCategory) {
        // Update local state
        setCategories(prev => [...prev, newCategory]);
        toast.success('Category added successfully');
      }
      
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
      const { hasRealSession, inDemoMode } = await checkSession();
      
      if (!hasRealSession && !inDemoMode) {
        console.error('No active session found in updateCategory');
        toast.error('No active session found. Please log in again.');
        return null;
      }

      // If in demo mode, handle with localStorage
      if (inDemoMode) {
        console.log('Demo mode: Simulating successful category update');
        
        const updatedCategory = updateDemoCategory(categories, category);
        
        // Update local state
        setCategories(prev => prev.map(c => c.id === category.id ? updatedCategory : c));
        toast.success('Category updated successfully (Demo Mode)');
        return updatedCategory;
      }

      // Real database update
      const updatedCategory = await updateCategoryInDatabase(category);
      
      if (updatedCategory) {
        // Update local state
        setCategories(prev => prev.map(c => c.id === category.id ? updatedCategory : c));
        toast.success('Category updated successfully');
      }
      
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
      const { hasRealSession, inDemoMode } = await checkSession();
      
      if (!hasRealSession && !inDemoMode) {
        console.error('No active session found in deleteCategory');
        toast.error('No active session found. Please log in again.');
        return;
      }

      // If in demo mode, handle with localStorage
      if (inDemoMode) {
        console.log('Demo mode: Simulating successful category deletion');
        
        const updatedCategories = deleteDemoCategory(categories, id);
        
        // Update local state
        setCategories(updatedCategories);
        toast.success('Category deleted successfully (Demo Mode)');
        return;
      }

      // Real database deletion
      const success = await deleteCategoryFromDatabase(id);
      
      if (success) {
        // Update local state
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success('Category deleted successfully');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error.message);
      toast.error('Error deleting category: ' + error.message);
    }
  };

  // Function to load categories from either Supabase or localStorage
  const loadCategories = async () => {
    try {
      // Verify current session state
      const { hasRealSession, inDemoMode } = await checkSession();
      
      // In demo mode, load from localStorage
      if (inDemoMode) {
        console.log('Loading categories from localStorage (Demo Mode)');
        const demoCategories = loadDemoCategories();
        
        setCategories(demoCategories);
        return;
      }
      
      // With real session, load from Supabase
      const databaseCategories = await loadCategoriesFromDatabase();
      setCategories(databaseCategories);
    } catch (error: any) {
      console.error('Error in loadCategories:', error);
      toast.error('Error loading categories: ' + error.message);
    }
  };

  // Load categories on mount and when session or demo mode changes
  useEffect(() => {
    if (sessionVerified) {
      loadCategories();
    }
  }, [sessionVerified, demoMode]);

  return {
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    loadCategories,
    sessionVerified,
    demoMode
  };
}
