
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useServiceStorage() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    try {
      setIsUploading(true);
      
      // Upload to Supabase storage with original filename
      const { data, error } = await supabase.storage
        .from('services')
        .upload(file.name, file);
      
      if (error) {
        console.error('Upload error:', error);
        toast.error(`Upload failed: ${error.message}`);
        return null;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('services')
        .getPublicUrl(data.path);
      
      console.log('File uploaded successfully:', publicUrl);
      toast.success('Image uploaded successfully');
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Upload error: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteStorageImage = async (url: string): Promise<boolean> => {
    if (!url) {
      console.log('No URL provided for deletion');
      return false;
    }
    
    try {
      // Skip deletion for data URLs
      if (url.startsWith('data:')) {
        console.log('Skipping deletion for data URL');
        return true;
      }
      
      // Extract the file path from the URL
      const urlObj = new URL(url);
      const fullPath = urlObj.pathname;
      
      // Get the filename from the path
      const fileName = fullPath.split('/').pop();
      
      if (!fileName) {
        console.error('Could not extract filename from URL:', url);
        return false;
      }
      
      console.log(`Deleting file ${fileName} from services bucket`);
      
      const { error } = await supabase.storage
        .from('services')
        .remove([fileName]);
      
      if (error) {
        console.error('Error deleting file:', error);
        toast.error(`Deletion failed: ${error.message}`);
        return false;
      }
      
      toast.success('Image deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(`Deletion error: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  return {
    isUploading,
    uploadImage,
    deleteStorageImage
  };
}
