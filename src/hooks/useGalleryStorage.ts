
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useGalleryStorage() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    try {
      setIsUploading(true);
      
      // Check if we're in demo mode
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      // For demo mode, create a data URL
      if (inDemoMode) {
        console.log('Demo mode: Creating data URL for image');
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
      
      // Upload to Supabase storage with original filename
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(file.name, file);
      
      if (error) {
        console.error('Upload error:', error);
        toast.error(`Upload failed: ${error.message}`);
        return null;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
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
      
      // Check if we're in demo mode
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (inDemoMode) {
        console.log('Demo mode: Simulating image deletion');
        toast.success('Image deleted successfully (Demo Mode)');
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
      
      console.log(`Deleting file ${fileName} from gallery bucket`);
      
      const { error } = await supabase.storage
        .from('gallery')
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
