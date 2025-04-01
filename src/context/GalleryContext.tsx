
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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

  const loadGalleryData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData as GalleryCategory[]);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (imagesError) throw imagesError;
      setImages(imagesData as GalleryImage[]);
    } catch (error: any) {
      console.error('Error loading gallery data:', error.message);
      toast({ title: 'Error loading gallery data', description: error.message, variant: 'destructive' });
    }
  };

  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      
      const newCategory = data as unknown as GalleryCategory;
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error: any) {
      console.error('Error adding category:', error.message);
      toast({ title: 'Error adding category', description: error.message, variant: 'destructive' });
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
      return updatedCategory;
    } catch (error: any) {
      console.error('Error updating category:', error.message);
      toast({ title: 'Error updating category', description: error.message, variant: 'destructive' });
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
    } catch (error: any) {
      console.error('Error deleting category:', error.message);
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
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
      return newImage;
    } catch (error: any) {
      console.error('Error adding image:', error.message);
      toast({ title: 'Error adding image', description: error.message, variant: 'destructive' });
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
      return updatedImage;
    } catch (error: any) {
      console.error('Error updating image:', error.message);
      toast({ title: 'Error updating image', description: error.message, variant: 'destructive' });
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
    } catch (error: any) {
      console.error('Error deleting image:', error.message);
      toast({ title: 'Error deleting image', description: error.message, variant: 'destructive' });
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
