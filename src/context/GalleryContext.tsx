
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGalleryCategories } from '@/hooks/useGalleryCategories';
import { useGalleryImages } from '@/hooks/useGalleryImages';
import { useGalleryStorage } from '@/hooks/useGalleryStorage';
import { useAuth } from '@/context/AuthContext';

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
  demoMode: boolean;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin } = useAuth();
  
  const { 
    categories, 
    setCategories,
    addCategory: addCategoryHook, 
    updateCategory, 
    deleteCategory,
    demoMode 
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
      
      console.log('Loading gallery data...');

      // Check if we're in demo mode
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (inDemoMode) {
        console.log('Loading gallery data in demo mode');
        
        // Load categories from localStorage
        const demoCategories = JSON.parse(
          localStorage.getItem('demoCategories') || '[]'
        ) as GalleryCategory[];
        
        // Load images from localStorage
        const demoImages = JSON.parse(
          localStorage.getItem('demoImages') || '[]'
        ) as GalleryImage[];
        
        setCategories(demoCategories);
        setImages(demoImages);
        return;
      }

      // With real session, load from Supabase
      // Fetch categories from Supabase
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories from Supabase:', categoriesError);
        setError(categoriesError.message);
        toast.error('Error loading categories: ' + categoriesError.message);
        return;
      }
      
      console.log('Fetched categories from Supabase:', categoriesData);
      setCategories(categoriesData || []);

      // Fetch images from Supabase
      const { data: imagesData, error: imagesError } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (imagesError) {
        console.error('Error fetching images from Supabase:', imagesError);
        setError(imagesError.message);
        toast.error('Error loading images: ' + imagesError.message);
        return;
      }
      
      console.log('Fetched images from Supabase:', imagesData);
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
    return result;
  };

  const addImage = async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage | null> => {
    const result = await addImageHook(image);
    return result;
  };

  const getImagesByCategory = (categoryId: string): GalleryImage[] => {
    return images.filter(image => image.category_id === categoryId);
  };

  useEffect(() => {
    console.log('GalleryProvider mounted');
    loadGalleryData();
    
    // Listen for auth changes and reload gallery data
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'User logged in' : 'No session');
      loadGalleryData();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
    isUploading,
    demoMode
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
