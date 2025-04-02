
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export function useReviewStorage() {
  const [isUploading, setIsUploading] = useState(false);

  // Upload image to Supabase storage - completely rebuilt
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

      // In demo mode with localStorage
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (inDemoMode) {
        console.log('Demo mode: Creating data URL for review image');
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            toast.success('Image uploaded successfully (Demo Mode)');
            resolve(dataUrl);
          };
          reader.readAsDataURL(file);
        });
      }
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = fileName;
      
      console.log('Uploading review image to path:', filePath);
      
      // Convert file to ArrayBuffer
      const fileArrayBuffer = await file.arrayBuffer();
      
      // Upload file
      const { data, error } = await supabase.storage
        .from('reviews')
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
        .from('reviews')
        .getPublicUrl(data.path);
        
      console.log('Image uploaded successfully:', publicUrl);
      toast.success('Image uploaded successfully');
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error in review upload process:', error);
      toast.error(`Upload error: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete image from Supabase storage - completely rebuilt
  const deleteStorageImage = async (url: string): Promise<boolean> => {
    try {
      // Handle data URLs
      if (url.startsWith('data:')) {
        console.log('Skipping delete for data URL');
        return true;
      }
      
      // In demo mode
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (inDemoMode) {
        console.log('Demo mode: Simulating image deletion');
        toast.success('Image deleted successfully (Demo Mode)');
        return true;
      }
      
      // Extract file path from the URL
      const bucketName = 'reviews';
      const urlObj = new URL(url);
      const pathWithBucket = urlObj.pathname.split('/storage/v1/object/public/')[1];
      
      if (!pathWithBucket) {
        console.error('Invalid storage URL format:', url);
        toast.error('Invalid image URL format');
        return false;
      }
      
      const filePath = pathWithBucket.substring(bucketName.length + 1);
      console.log('Deleting review file from storage:', filePath);
      
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
      console.error('Error in delete review process:', error);
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
