
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GalleryCategory {
  id: string;
  name: string;
  description?: string;
  sort_order?: number;
}

export interface GalleryImage {
  id: string;
  category_id: string;
  title?: string;
  description?: string;
  image_url: string;
  sort_order?: number;
}

interface GalleryContextType {
  categories: GalleryCategory[];
  images: GalleryImage[];
  isLoading: boolean;
  error: string | null;
  addCategory: (category: Omit<GalleryCategory, 'id'>) => Promise<void>;
  updateCategory: (category: GalleryCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addImage: (image: Omit<GalleryImage, 'id'>) => Promise<void>;
  updateImage: (image: GalleryImage) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  getImagesByCategory: (categoryId: string) => GalleryImage[];
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchImages();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load gallery categories');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load gallery images');
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (category: Omit<GalleryCategory, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      setCategories([...categories, data]);
      toast.success('Category added successfully');
    } catch (err: any) {
      toast.error('Failed to add category');
      setError(err.message);
    }
  };

  const updateCategory = async (category: GalleryCategory) => {
    try {
      const { error } = await supabase
        .from('gallery_categories')
        .update(category)
        .eq('id', category.id);

      if (error) throw error;
      setCategories(categories.map(c => c.id === category.id ? category : c));
      toast.success('Category updated successfully');
    } catch (err: any) {
      toast.error('Failed to update category');
      setError(err.message);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gallery_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete category');
      setError(err.message);
    }
  };

  const addImage = async (image: Omit<GalleryImage, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert(image)
        .select()
        .single();

      if (error) throw error;
      setImages([...images, data]);
      toast.success('Image added successfully');
    } catch (err: any) {
      toast.error('Failed to add image');
      setError(err.message);
    }
  };

  const updateImage = async (image: GalleryImage) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update(image)
        .eq('id', image.id);

      if (error) throw error;
      setImages(images.map(i => i.id === image.id ? image : i));
      toast.success('Image updated successfully');
    } catch (err: any) {
      toast.error('Failed to update image');
      setError(err.message);
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setImages(images.filter(i => i.id !== id));
      toast.success('Image deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete image');
      setError(err.message);
    }
  };

  const getImagesByCategory = (categoryId: string) => {
    return images.filter(image => image.category_id === categoryId);
  };

  return (
    <GalleryContext.Provider
      value={{
        categories,
        images,
        isLoading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        addImage,
        updateImage,
        deleteImage,
        getImagesByCategory
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export const useGalleryContext = () => {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  return context;
};
