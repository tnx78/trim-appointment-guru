
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GalleryCategory } from '@/context/GalleryContext';
import { useAuth } from '@/context/AuthContext';

export function useGalleryCategories() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const { isAuthenticated, isAdmin } = useAuth();
  const [sessionVerified, setSessionVerified] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  // Verify session when the hook is initialized
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Check for a real Supabase session
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session;
        
        // Check if we're in demo mode (admin flag set in localStorage)
        const inDemoMode = !hasSession && localStorage.getItem('isAdmin') === 'true';
        
        setDemoMode(inDemoMode);
        setSessionVerified(true);
        
        console.log('Session verified in useGalleryCategories:', 
          hasSession ? 'Active' : (inDemoMode ? 'Demo Mode' : 'No Session'));
      } catch (error) {
        console.error('Error verifying session:', error);
        setSessionVerified(true); // Still mark as verified to prevent loading state
      }
    };
    
    verifySession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in useGalleryCategories:', event, session ? 'Session exists' : 'No session');
      // Check demo mode again when auth state changes
      const inDemoMode = !session && localStorage.getItem('isAdmin') === 'true';
      setDemoMode(inDemoMode);
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
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
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
        
        // Create a unique ID for the demo category
        const demoId = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const demoCategory: GalleryCategory = {
          id: demoId,
          ...category,
          created_at: new Date().toISOString()
        };
        
        // Get existing demo categories from localStorage or initialize empty array
        const existingDemoCategories = JSON.parse(
          localStorage.getItem('demoCategories') || '[]'
        ) as GalleryCategory[];
        
        // Add new category to the array
        const updatedDemoCategories = [...existingDemoCategories, demoCategory];
        
        // Store updated categories in localStorage
        localStorage.setItem('demoCategories', JSON.stringify(updatedDemoCategories));
        
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
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (!hasRealSession && !inDemoMode) {
        console.error('No active session found in updateCategory');
        toast.error('No active session found. Please log in again.');
        return null;
      }

      // If in demo mode, handle with localStorage
      if (inDemoMode) {
        console.log('Demo mode: Simulating successful category update');
        
        // Get existing demo categories from localStorage
        const existingDemoCategories = JSON.parse(
          localStorage.getItem('demoCategories') || '[]'
        ) as GalleryCategory[];
        
        // Find and update the category
        const updatedDemoCategories = existingDemoCategories.map(c => 
          c.id === category.id ? { ...category } : c
        );
        
        // Store updated categories in localStorage
        localStorage.setItem('demoCategories', JSON.stringify(updatedDemoCategories));
        
        // Update local state
        setCategories(prev => prev.map(c => c.id === category.id ? { ...category } : c));
        toast.success('Category updated successfully (Demo Mode)');
        return category;
      }

      // Real database update
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
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (!hasRealSession && !inDemoMode) {
        console.error('No active session found in deleteCategory');
        toast.error('No active session found. Please log in again.');
        return;
      }

      // If in demo mode, handle with localStorage
      if (inDemoMode) {
        console.log('Demo mode: Simulating successful category deletion');
        
        // Get existing demo categories from localStorage
        const existingDemoCategories = JSON.parse(
          localStorage.getItem('demoCategories') || '[]'
        ) as GalleryCategory[];
        
        // Filter out the deleted category
        const updatedDemoCategories = existingDemoCategories.filter(c => c.id !== id);
        
        // Store updated categories in localStorage
        localStorage.setItem('demoCategories', JSON.stringify(updatedDemoCategories));
        
        // Update local state
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success('Category deleted successfully (Demo Mode)');
        return;
      }

      // Real database deletion
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

  // Function to load categories from either Supabase or localStorage
  const loadCategories = async () => {
    try {
      // Verify current session state
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      // In demo mode, load from localStorage
      if (inDemoMode) {
        console.log('Loading categories from localStorage (Demo Mode)');
        const demoCategories = JSON.parse(
          localStorage.getItem('demoCategories') || '[]'
        ) as GalleryCategory[];
        
        setCategories(demoCategories);
        return;
      }
      
      // With real session, load from Supabase
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (error) {
        console.error('Error loading categories:', error);
        toast.error('Error loading categories: ' + error.message);
        return;
      }
      
      console.log('Categories loaded from Supabase:', data);
      setCategories(data || []);
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
