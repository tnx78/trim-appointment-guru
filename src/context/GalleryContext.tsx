
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useGalleryCategories } from '@/hooks/useGalleryCategories';
import { useGalleryImages } from '@/hooks/useGalleryImages';
import { useGalleryStorage } from '@/hooks/useGalleryStorage';

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
  uploadImage: (file: File) => Promise<string | null>;
  isUploading: boolean;
}

// Create context
const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

// Provider component
export function GalleryProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  // Use our custom hooks
  const { 
    categories, 
    setCategories,
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useGalleryCategories();
  
  const { 
    images, 
    setImages,
    addImage, 
    updateImage, 
    deleteImage 
  } = useGalleryImages();
  
  const { 
    isUploading, 
    uploadImage 
  } = useGalleryStorage();

  // Function to load gallery data
  const loadGalleryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Log authentication status for debugging
      console.log('Loading gallery data...', { 
        isAuthenticated, 
        isAdmin, 
        userId: user?.id 
      });
      
      // Get categories from Supabase
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

      // Get images from Supabase
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

  // Helper function to get images by category
  const getImagesByCategory = (categoryId: string): GalleryImage[] => {
    return images.filter(image => image.category_id === categoryId);
  };

  // Load gallery data when component mounts
  useEffect(() => {
    console.log('GalleryProvider mounted with auth state:', { isAuthenticated, isAdmin });
    loadGalleryData();
  }, [isAuthenticated, isAdmin]);

  // Context value
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

// Custom hook to use the GalleryContext
export function useGalleryContext() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  return context;
}
