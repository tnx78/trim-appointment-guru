import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

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
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin, user } = useAuth();

  const loadGalleryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading gallery data...', { isAuthenticated, isAdmin, userId: user?.id });
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        setError(categoriesError.message);
        throw categoriesError;
      }
      
      console.log('Fetched categories:', categoriesData);
      setCategories(categoriesData || []);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        setError(imagesError.message);
        throw imagesError;
      }
      
      console.log('Fetched images:', imagesData);
      setImages(imagesData || []);
      
    } catch (error: any) {
      console.error('Error loading gallery data:', error.message);
      setError(error.message);
      toast.error('Error loading gallery data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    try {
      if (!isAuthenticated || !isAdmin) {
        const errorMessage = 'Admin authentication required to add categories';
        console.error(errorMessage);
        toast.error(errorMessage);
        return null;
      }

      console.log('Adding category with auth status:', { isAuthenticated, isAdmin });
      
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
      
      const newCategory = data as GalleryCategory;
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
      if (!isAuthenticated) {
        const errorMessage = 'Authentication required to update categories';
        console.error(errorMessage);
        toast.error(errorMessage);
        return null;
      }

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
      if (!isAuthenticated) {
        const errorMessage = 'Authentication required to delete categories';
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }

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
      if (!isAuthenticated) {
        const errorMessage = 'Authentication required to add images';
        console.error(errorMessage);
        toast.error(errorMessage);
        return null;
      }

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
      if (!isAuthenticated) {
        const errorMessage = 'Authentication required to update images';
        console.error(errorMessage);
        toast.error(errorMessage);
        return null;
      }

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
      if (!isAuthenticated) {
        const errorMessage = 'Authentication required to delete images';
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }

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

  // Load gallery data on component mount or when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      loadGalleryData();
    } else {
      // Clear data when not authenticated
      setCategories([]);
      setImages([]);
      setError(null);
    }
  }, [isAuthenticated]);

  const value = {
    categories,
    images,
    isLoading,
    error,
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
