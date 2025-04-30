
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGalleryOperations } from '@/hooks/useGalleryOperations';
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
  const { isAuthenticated } = useAuth();
  const {
    categories,
    images,
    isLoading,
    error,
    isUploading,
    demoMode,
    loadGalleryData,
    addCategory,
    updateCategory,
    deleteCategory,
    addImage,
    updateImage,
    deleteImage,
    getImagesByCategory,
    uploadImage
  } = useGalleryOperations();

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
