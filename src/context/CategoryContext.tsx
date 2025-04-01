
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceCategory } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapCategoryFromDB } from '@/utils/dataMappers';
import { toast } from 'sonner';

// Context type
interface CategoryContextType {
  categories: ServiceCategory[];
  addCategory: (category: Omit<ServiceCategory, 'id'>) => void;
  updateCategory: (category: ServiceCategory) => void; // Changed to accept a single category object
  deleteCategory: (id: string) => void;
  updateCategoryOrder: (updatedCategories: ServiceCategory[]) => void;
  getCategoryById: (id: string) => ServiceCategory | undefined;
}

// Creating the context
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Provider component
export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from Supabase
  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log('Fetching categories from database...');
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('order', { ascending: true });
        
        if (error) throw error;
        
        const mappedCategories = data.map(mapCategoryFromDB);
        console.log('Categories loaded from database:', mappedCategories);
        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCategories();
  }, []);

  const addCategory = async (category: Omit<ServiceCategory, 'id'>) => {
    try {
      console.log('Adding category to database:', category);
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select();
      
      if (error) throw error;
      if (data && data.length > 0) {
        const newCategory = mapCategoryFromDB(data[0]);
        setCategories([...categories, newCategory]);
        toast.success(`Category "${category.name}" added successfully`);
        return newCategory;
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  // Updated to accept a single category object with id
  const updateCategory = async (category: ServiceCategory) => {
    try {
      const { id, ...updatedData } = category;
      console.log('Updating category in database:', id, updatedData);
      
      const { error } = await supabase
        .from('categories')
        .update(updatedData)
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, ...updatedData } : cat
      ));
      toast.success(`Category updated successfully`);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      console.log('Deleting category from database:', id);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.filter(category => category.id !== id));
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const updateCategoryOrder = async (updatedCategories: ServiceCategory[]) => {
    try {
      // Update local state immediately for responsiveness
      setCategories(updatedCategories);
      
      // For each category, update its order in the database
      for (const category of updatedCategories) {
        console.log('Updating category order in database:', category.id, category.order);
        const { error } = await supabase
          .from('categories')
          .update({ 
            order: category.order 
          })
          .eq('id', category.id);
        
        if (error) throw error;
      }
      
      // No need for a toast here as it's a background operation
    } catch (error) {
      console.error('Error updating category order:', error);
      toast.error('Failed to update category order');
      
      // Fetch categories again to reset to server state
      const { data, error: fetchError } = await supabase.from('categories').select('*');
      if (!fetchError && data) {
        setCategories(data.map(mapCategoryFromDB));
      }
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const value = {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder,
    getCategoryById,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

// Custom hook to use the CategoryContext
export function useCategoryContext() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
}
