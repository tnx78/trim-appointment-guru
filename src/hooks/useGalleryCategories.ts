
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
      try {
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session;
        setSessionVerified(hasSession);
        console.log('Session verified in useGalleryCategories:', hasSession ? 'Active' : 'None');
        
        // If we're in demo mode (admin flag is set but no real session)
        const demoMode = !hasSession && localStorage.getItem('isAdmin') === 'true';
        if (demoMode) {
          console.log('Operating in demo admin mode');
        }
      } catch (error) {
        console.error('Error verifying session:', error);
      }
    };
    
    verifySession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in useGalleryCategories:', event, session ? 'Session exists' : 'No session');
      setSessionVerified(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to add a new category
  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    try {
      // Verify session again before mutation
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const demoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      console.log('Adding category in mode:', demoMode ? 'demo admin' : (hasRealSession ? 'authenticated' : 'unauthenticated'));
      console.log('Category data:', category);
      
      if (!hasRealSession && !demoMode) {
        console.error('No active session found in addCategory');
        toast.error('No active session found. Please log in again.');
        return null;
      }
      
      // If in demo mode, return a fake success response
      if (demoMode) {
        console.log('Demo mode: Simulating successful category creation');
        const demoCategory: GalleryCategory = {
          id: `demo-${Date.now()}`,
          ...category,
          created_at: new Date().toISOString()
        };
        
        // Update local state
        setCategories(prev => [...prev, demoCategory]);
        toast.success('Category added successfully (Demo Mode)');
        return demoCategory;
      }

      // Real database operation (only happens with actual session)
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
      const hasRealSession = !!sessionData.session;
      const demoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (!hasRealSession && !demoMode) {
        console.error('No active session found in updateCategory');
        toast.error('No active session found. Please log in again.');
        return null;
      }

      // If in demo mode, return a fake success response
      if (demoMode) {
        console.log('Demo mode: Simulating successful category update');
        const updatedCategory = { ...category };
        
        // Update local state
        setCategories(prev => prev.map(c => c.id === category.id ? updatedCategory : c));
        toast.success('Category updated successfully (Demo Mode)');
        return updatedCategory;
      }

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
      const hasRealSession = !!sessionData.session;
      const demoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (!hasRealSession && !demoMode) {
        console.error('No active session found in deleteCategory');
        toast.error('No active session found. Please log in again.');
        return;
      }

      // If in demo mode, simulate deletion
      if (demoMode) {
        console.log('Demo mode: Simulating successful category deletion');
        
        // Update local state
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success('Category deleted successfully (Demo Mode)');
        return;
      }

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
