
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useGalleryCategories } from '@/hooks/useGalleryCategories';
import { useGalleryImages } from '@/hooks/useGalleryImages';
import { useGalleryStorage } from '@/hooks/useGalleryStorage';

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
  uploadImage: (file: File) => Promise<string | null>;
  isUploading: boolean;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  const { 
    categories, 
    setCategories,
    addCategory: addCategoryHook, 
    updateCategory, 
    deleteCategory 
  } = useGalleryCategories();
  
  const { 
    images, 
    setImages,
    addImage: addImageHook, 
    updateImage, 
    deleteImage 
  } = useGalleryImages();
  
  const { 
    isUploading, 
    uploadImage 
  } = useGalleryStorage();

  const loadGalleryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading gallery data...', { 
        isAuthenticated, 
        isAdmin, 
        userId: user?.id 
      });

      // For demo mode, we don't need to fetch from Supabase
      if (localStorage.getItem('isAdmin') === 'true') {
        console.log('Demo mode active, using localStorage data');
        setIsLoading(false);
        return;
      }
      
      // Fetch categories from Supabase
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        setError(categoriesError.message);
        toast.error('Error fetching categories: ' + categoriesError.message);
        return;
      }
      
      console.log('Fetched categories:', categoriesData);
      setCategories(categoriesData || []);

      // Fetch images from Supabase
      const { data: imagesData, error: imagesError } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        setError(imagesError.message);
        toast.error('Error fetching images: ' + imagesError.message);
        return;
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

  // Wrap the hook methods to ensure they update the UI and reload data
  const addCategory = async (category: Omit<GalleryCategory, 'id'>): Promise<GalleryCategory | null> => {
    const result = await addCategoryHook(category);
    if (result) {
      console.log('Category added:', result);
    }
    return result;
  };

  const addImage = async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage | null> => {
    const result = await addImageHook(image);
    if (result) {
      console.log('Image added:', result);
    }
    return result;
  };

  const getImagesByCategory = (categoryId: string): GalleryImage[] => {
    return images.filter(image => image.category_id === categoryId);
  };

  useEffect(() => {
    console.log('GalleryProvider mounted with auth state:', { isAuthenticated, isAdmin });
    loadGalleryData();
  }, [isAuthenticated, isAdmin]);

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
    getImagesByCategory,
    uploadImage,
    isUploading
  };

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

export function useGalleryContext() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  return context;
}
