
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export function useServiceStorage() {
  const [isUploading, setIsUploading] = useState(false);

  // Completely rebuilt upload function for better reliability
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|gif|jpg|webp)$/)) {
        toast.error('Only image files (JPEG, PNG, GIF, JPG, WEBP) are allowed');
        return null;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return null;
      }
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = fileName;
      
      console.log('Uploading service image to path:', filePath);
      
      // Convert file to ArrayBuffer
      const fileArrayBuffer = await file.arrayBuffer();
      
      // Upload file
      const { data, error } = await supabase.storage
        .from('services')
        .upload(filePath, fileArrayBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('Supabase storage upload error:', error);
        toast.error(`Upload failed: ${error.message}`);
        return null;
      }
      
      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('services')
        .getPublicUrl(data.path);
        
      console.log('Image uploaded successfully:', publicUrl);
      toast.success('Image uploaded successfully');
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error in upload process:', error);
      toast.error(`Upload error: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Completely rebuilt delete function for better reliability
  const deleteStorageImage = async (url: string): Promise<boolean> => {
    try {
      // Handle data URLs
      if (url.startsWith('data:')) {
        console.log('Skipping delete for data URL');
        return true;
      }
      
      // Extract file path from the URL
      const bucketName = 'services';
      const urlObj = new URL(url);
      const pathWithBucket = urlObj.pathname.split('/storage/v1/object/public/')[1];
      
      if (!pathWithBucket) {
        console.error('Invalid storage URL format:', url);
        toast.error('Invalid image URL format');
        return false;
      }
      
      const filePath = pathWithBucket.substring(bucketName.length + 1);
      console.log('Deleting file from storage:', filePath);
      
      // Delete from storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
        
      if (error) {
        console.error('Storage deletion error:', error);
        toast.error(`Failed to delete image: ${error.message}`);
        return false;
      }
      
      toast.success('Image deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error in delete process:', error);
      toast.error(`Delete error: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  return {
    isUploading,
    uploadImage,
    deleteStorageImage
  };
}
