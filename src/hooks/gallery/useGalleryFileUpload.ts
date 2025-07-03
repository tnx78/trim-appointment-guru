
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Separating validation logic
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Validate file type
  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!validMimeTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Please use JPG, PNG or GIF images.' };
  }
  
  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File too large. Image size should be less than 5MB.' };
  }
  
  return { valid: true };
};

export function useGalleryFileUpload() {
  const [isUploading, setIsUploading] = useState(false);

  // Upload and return a URL for the image
  const uploadImageFile = async (file: File): Promise<string | null> => {
    if (!file) {
      console.error('No file provided for upload');
      return null;
    }

    try {
      setIsUploading(true);
      console.log('Starting image upload process for file:', file.name, 'type:', file.type);
      
      // Check if we're in demo mode (no real auth session)
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      // For demo mode, return a data URL instead of uploading to Supabase
      if (inDemoMode) {
        console.log('Demo mode: Creating data URL for image instead of uploading');
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            console.log('Demo mode: Successfully created data URL');
            resolve(dataUrl);
          };
          reader.onerror = () => {
            console.error('Demo mode: Failed to read image file');
            resolve(null);
          };
          reader.readAsDataURL(file);
        });
      }
      
      // Generate a unique filename to avoid conflicts
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      console.log('Uploading file with name:', uniqueFileName, 'type:', file.type, 'size:', file.size);
      
      // Upload the file directly as a File object - DO NOT convert to FormData or JSON
      console.log('Starting upload to Supabase storage...');
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Supabase storage upload error:', error);
        if (error.message.includes('does not exist')) {
          toast.error('Gallery storage is not available. Please contact support.');
        } else if (error.message.includes('mime type')) {
          console.error('MIME type issue detected. File type:', file.type);
          toast.error('Unsupported file type. Please use JPG, PNG or GIF images.');
        } else {
          toast.error(`Upload failed: ${error.message}`);
        }
        return null;
      }
      
      if (!data || !data.path) {
        console.error('No file path returned from upload');
        toast.error('Upload failed: No file path returned');
        return null;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(data.path);
      
      console.log('File uploaded successfully to Supabase, public URL:', publicUrl);
      toast.success('Image uploaded successfully');
      return publicUrl;
    } catch (error: any) {
      console.error('Error in uploadImageFile:', error);
      toast.error(`Upload error: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    validateImageFile,
    uploadImageFile
  };
}
