
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Separating validation logic
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Invalid file type. Please select an image file.' };
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
      const fileExtension = file.name.split('.').pop() || '';
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      console.log('Uploading file with name:', uniqueFileName, 'type:', file.type, 'size:', file.size);
      
      // Verify the file and bucket exist before upload
      console.log('Verifying storage bucket exists...');
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage
          .getBucket('gallery');
          
        if (bucketError) {
          console.error('Error verifying gallery bucket:', bucketError);
          throw new Error(`Storage bucket check failed: ${bucketError.message}`);
        }
        
        console.log('Bucket verified:', bucketData?.id);
      } catch (bucketCheckError) {
        console.error('Failed to check bucket:', bucketCheckError);
        toast.error('Storage not properly configured. Please contact support.');
        throw bucketCheckError;
      }
      
      // Direct file upload with content-type explicitly set
      console.log('Starting upload to Supabase storage...');
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(uniqueFileName, file, {
          contentType: file.type, // Explicitly set content type
          cacheControl: '3600'
        });
      
      if (error) {
        console.error('Supabase storage upload error:', error);
        if (error.message.includes('mime type')) {
          console.error('MIME type issue detected. File type:', file.type);
          toast.error(`Upload failed: Unsupported file type. Please use JPG, PNG or GIF images.`);
        } else {
          toast.error(`Upload failed: ${error.message}`);
        }
        throw new Error(`Storage upload failed: ${error.message}`);
      }
      
      if (!data || !data.path) {
        console.error('No file path returned from upload');
        throw new Error('No file path returned from upload');
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(data.path);
      
      console.log('File uploaded successfully to Supabase, public URL:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Error in uploadImageFile:', error);
      throw error;
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
