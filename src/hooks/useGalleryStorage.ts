import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { validateImageFile } from './gallery/useGalleryFileUpload';

export function useGalleryStorage() {
  const [isUploading, setIsUploading] = useState(false);

  // Check if we're in demo mode
  const checkDemoMode = async (): Promise<boolean> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const hasRealSession = !!sessionData.session;
    return !hasRealSession && localStorage.getItem('isAdmin') === 'true';
  };

  // Handle demo mode image upload
  const uploadDemoImage = async (file: File): Promise<string | null> => {
    console.log('Demo mode: Creating data URL for image');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          const dataUrl = reader.result as string;
          console.log('Demo mode: Successfully created data URL');
          toast.success('Image uploaded successfully (Demo Mode)');
          resolve(dataUrl);
        }, 500); // Small delay to simulate network request
      };
      reader.onerror = () => {
        console.error('Demo mode: Failed to read image file');
        toast.error('Failed to read image file');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload image to Supabase storage
  const uploadToSupabase = async (file: File): Promise<string | null> => {
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    console.log('Uploading file to Supabase with name:', uniqueFileName);
    
    // This is the critical fix: use the File object directly without any transformations
    const { data, error } = await supabase.storage
      .from('gallery')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
    
    if (!data || !data.path) {
      console.error('Upload succeeded but no path returned');
      toast.error('Upload failed: No file path returned');
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(data.path);
    
    console.log('File uploaded successfully:', publicUrl);
    toast.success('Image uploaded successfully');
    
    return publicUrl;
  };

  // Upload image to Supabase storage or create data URL in demo mode
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) {
      console.error('No file provided for upload');
      toast.error('No file selected');
      return null;
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return null;
    }

    try {
      setIsUploading(true);
      console.log('Starting image upload process for file:', file.name, 'type:', file.type, 'size:', file.size);
      
      const inDemoMode = await checkDemoMode();
      
      // For demo mode, create a data URL
      if (inDemoMode) {
        return await uploadDemoImage(file);
      }
      
      // For real uploads, use Supabase
      return await uploadToSupabase(file);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Upload error: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete an image from storage
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
      
      const inDemoMode = await checkDemoMode();
      
      if (inDemoMode) {
        console.log('Demo mode: Simulating image deletion');
        // Add slight delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success('Image deleted successfully (Demo Mode)');
        return true;
      }
      
      // Extract the filename from the URL
      try {
        const fileName = url.split('/').pop();
        
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
      } catch (parseError) {
        console.error('Error parsing URL for deletion:', parseError, url);
        return false;
      }
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
