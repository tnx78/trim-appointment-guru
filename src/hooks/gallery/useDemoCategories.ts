
import { GalleryCategory } from '@/context/GalleryContext';
import { toast } from 'sonner';

export function useDemoCategories() {
  const loadDemoCategories = (): GalleryCategory[] => {
    try {
      const demoCategories = JSON.parse(
        localStorage.getItem('demoCategories') || '[]'
      ) as GalleryCategory[];
      
      return demoCategories;
    } catch (error) {
      console.error('Error loading demo categories:', error);
      return [];
    }
  };
  
  const addDemoCategory = (
    categories: GalleryCategory[],
    category: Omit<GalleryCategory, 'id'>
  ): GalleryCategory => {
    // Create a unique ID for the demo category
    const demoId = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const demoCategory: GalleryCategory = {
      id: demoId,
      ...category,
      created_at: new Date().toISOString()
    };
    
    // Get existing demo categories from localStorage or initialize empty array
    const existingDemoCategories = loadDemoCategories();
    
    // Add new category to the array
    const updatedDemoCategories = [...existingDemoCategories, demoCategory];
    
    // Store updated categories in localStorage
    localStorage.setItem('demoCategories', JSON.stringify(updatedDemoCategories));
    
    return demoCategory;
  };
  
  const updateDemoCategory = (
    categories: GalleryCategory[],
    category: GalleryCategory
  ): GalleryCategory => {
    // Get existing demo categories from localStorage
    const existingDemoCategories = loadDemoCategories();
    
    // Find and update the category
    const updatedDemoCategories = existingDemoCategories.map(c => 
      c.id === category.id ? { ...category } : c
    );
    
    // Store updated categories in localStorage
    localStorage.setItem('demoCategories', JSON.stringify(updatedDemoCategories));
    
    return category;
  };
  
  const deleteDemoCategory = (
    categories: GalleryCategory[],
    id: string
  ): GalleryCategory[] => {
    // Get existing demo categories from localStorage
    const existingDemoCategories = loadDemoCategories();
    
    // Filter out the deleted category
    const updatedDemoCategories = existingDemoCategories.filter(c => c.id !== id);
    
    // Store updated categories in localStorage
    localStorage.setItem('demoCategories', JSON.stringify(updatedDemoCategories));
    
    return categories.filter(c => c.id !== id);
  };
  
  return {
    loadDemoCategories,
    addDemoCategory,
    updateDemoCategory,
    deleteDemoCategory
  };
}
