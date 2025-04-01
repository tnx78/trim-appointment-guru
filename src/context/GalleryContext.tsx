import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define types for gallery data
export interface GalleryCategory {
  id: string;
  name: string;
  description?: string;
  sort_order?: number;
  created_at?: string;
}

export interface GalleryImage {
  id: string;
  category_id: string;
  title?: string;
  description?: string;
  image_url: string;
  sort_order?: number;
  created_at?: string;
}

// Define context type
interface GalleryContextType {
  categories: GalleryCategory[];
  images: GalleryImage[];
  isLoading: boolean;
  loadGalleryData: () => Promise<void>;
  addCategory: (category: Omit<GalleryCategory, 'id'>) => Promise<GalleryCategory | null>;
  updateCategory: (category: GalleryCategory) => Promise<GalleryCategory | null>;
  deleteCategory: (id: string) => Promise<void>;
  addImage: (image: Omit<GalleryImage, 'id'>) => Promise<GalleryImage | null>;
  updateImage: (image: GalleryImage) => Promise<GalleryImage | null>;
  deleteImage: (id: string) => Promise<void>;
  getImagesByCategory: (categoryId: string) => GalleryImage[];
}

// Create context
const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

// Provider component
export function GalleryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGalleryData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading gallery data...');
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }
      
      console.log('Fetched categories:', categoriesData);
      setCategories(categoriesData as GalleryCategory[]);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        throw imagesError;
      }
      
      console.log('Fetched images:', imagesData);
      setImages(imagesData as GalleryImage[]);
    } catch (error: any) {
      console.error('Error loading gallery data:', error.message);
      toast.error('Error loading gallery data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    try {
      console.log('Adding category:', category);
      
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
      
      const newCategory = data as unknown as GalleryCategory;
      console.log('Category added successfully:', newCategory);
      setCategories(prev => [...prev, newCategory]);
      toast.success('Category added successfully');
      return newCategory;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error('Error adding category: ' + error.message);
      return null;
    }
  };

  const updateCategory = async (category: GalleryCategory): Promise<GalleryCategory | null> => {
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .update(category)
        .eq('id', category.id)
        .select()
        .single();

      if (error) throw error;

      const updatedCategory = data as unknown as GalleryCategory;
      setCategories(prev => prev.map(c => c.id === category.id ? updatedCategory : c));
      toast.success('Category updated successfully');
      return updatedCategory;
    } catch (error: any) {
      console.error('Error updating category:', error.message);
      toast.error('Error updating category: ' + error.message);
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('gallery_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error.message);
      toast.error('Error deleting category: ' + error.message);
    }
  };

  const addImage = async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage | null> => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert(image)
        .select()
        .single();

      if (error) throw error;
      
      const newImage = data as unknown as GalleryImage;
      setImages(prev => [...prev, newImage]);
      toast.success('Image added successfully');
      return newImage;
    } catch (error: any) {
      console.error('Error adding image:', error.message);
      toast.error('Error adding image: ' + error.message);
      return null;
    }
  };

  const updateImage = async (image: GalleryImage): Promise<GalleryImage | null> => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .update(image)
        .eq('id', image.id)
        .select()
        .single();

      if (error) throw error;

      const updatedImage = data as unknown as GalleryImage;
      setImages(prev => prev.map(img => img.id === image.id ? updatedImage : img));
      toast.success('Image updated successfully');
      return updatedImage;
    } catch (error: any) {
      console.error('Error updating image:', error.message);
      toast.error('Error updating image: ' + error.message);
      return null;
    }
  };

  const deleteImage = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setImages(prev => prev.filter(img => img.id !== id));
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Error deleting image:', error.message);
      toast.error('Error deleting image: ' + error.message);
    }
  };

  const getImagesByCategory = (categoryId: string): GalleryImage[] => {
    return images.filter(image => image.category_id === categoryId);
  };

  // Load gallery data on component mount
  useEffect(() => {
    loadGalleryData();
  }, []);

  const value = {
    categories,
    images,
    isLoading,
    loadGalleryData,
    addCategory,
    updateCategory,
    deleteCategory,
    addImage,
    updateImage,
    deleteImage,
    getImagesByCategory
  };

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

// Custom hook to use the GalleryContext
export function useGalleryContext() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  return context;
}
