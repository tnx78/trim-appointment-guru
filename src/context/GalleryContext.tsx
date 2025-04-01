
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

      // Always attempt to fetch from Supabase first
      try {
        // Fetch categories from Supabase
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('gallery_categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (categoriesError) {
          console.warn('Error fetching categories from Supabase:', categoriesError);
          throw categoriesError;
        }
        
        console.log('Fetched categories from Supabase:', categoriesData);
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }

        // Fetch images from Supabase
        const { data: imagesData, error: imagesError } = await supabase
          .from('gallery_images')
          .select('*')
          .order('sort_order', { ascending: true });

        if (imagesError) {
          console.warn('Error fetching images from Supabase:', imagesError);
          throw imagesError;
        }
        
        console.log('Fetched images from Supabase:', imagesData);
        if (imagesData && imagesData.length > 0) {
          setImages(imagesData);
        }
      } catch (supabaseError) {
        console.warn('Supabase fetch failed, checking for demo mode:', supabaseError);
        
        // For demo mode, load from localStorage if available
        if (localStorage.getItem('isAdmin') === 'true') {
          const storedCategories = localStorage.getItem('demo_gallery_categories');
          if (storedCategories) {
            try {
              const parsedCategories = JSON.parse(storedCategories);
              console.log('Loaded demo categories from localStorage:', parsedCategories);
              setCategories(parsedCategories);
            } catch (e) {
              console.error('Error parsing demo categories from localStorage:', e);
            }
          }
          
          const storedImages = localStorage.getItem('demo_gallery_images');
          if (storedImages) {
            try {
              const parsedImages = JSON.parse(storedImages);
              console.log('Loaded demo images from localStorage:', parsedImages);
              setImages(parsedImages);
            } catch (e) {
              console.error('Error parsing demo images from localStorage:', e);
            }
          }
          console.log('Demo mode active, using localStorage data');
        } else {
          // If we're not in demo mode and Supabase fetch failed, show the error
          setError((supabaseError as Error).message);
          toast.error('Error loading gallery data: ' + (supabaseError as Error).message);
        }
      }
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
