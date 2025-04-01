
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export function useGalleryStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  // Upload image to Supabase storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      console.log('Uploading image...');

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return null;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return null;
      }

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image to Supabase storage:', error);
        toast.error('Error uploading image: ' + error.message);
        return null;
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(data.path);

      console.log('Image uploaded successfully:', publicUrl);
      toast.success('Image uploaded successfully');
      return publicUrl;
    } catch (error: any) {
      console.error('Error in upload process:', error.message);
      toast.error('Error uploading image: ' + error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete image from Supabase storage
  const deleteStorageImage = async (url: string): Promise<boolean> => {
    try {
      // Extract file path from the URL
      const bucketName = 'gallery';
      const urlObj = new URL(url);
      const pathWithBucket = urlObj.pathname.split('/storage/v1/object/public/')[1];
      
      if (!pathWithBucket) {
        console.error('Invalid storage URL format');
        return false;
      }
      
      const filePath = pathWithBucket.substring(bucketName.length + 1);
      
      // Delete from storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image from storage:', error);
        toast.error('Error deleting image file: ' + error.message);
        return false;
      }

      toast.success('Image deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error in delete storage process:', error.message);
      toast.error('Error deleting image file: ' + error.message);
      return false;
    }
  };

  return {
    isUploading,
    uploadImage,
    deleteStorageImage
  };
}
