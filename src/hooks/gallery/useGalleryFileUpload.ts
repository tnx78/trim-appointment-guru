
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

  // Verify bucket exists
  const verifyBucket = async (): Promise<boolean> => {
    try {
      console.log('Verifying gallery bucket exists...');
      
      // Get actual bucket info from Supabase
      const { data, error } = await supabase.storage.getBucket('gallery');
      
      if (error) {
        console.error('Error checking gallery bucket:', error);
        
        // Check if bucket doesn't exist
        if (error.message.includes('does not exist')) {
          console.log('Attempting to create gallery bucket...');
          
          try {
            const { data: createData, error: createError } = await supabase.storage.createBucket('gallery', {
              public: true,
              fileSizeLimit: 5242880, // 5MB
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
            });
            
            if (createError) {
              console.error('Error creating gallery bucket:', createError);
              return false;
            }
            
            console.log('Gallery bucket created successfully:', createData);
            return true;
          } catch (createErr) {
            console.error('Exception creating bucket:', createErr);
            return false;
          }
        }
        
        return false;
      }
      
      console.log('Gallery bucket verified:', data);
      return true;
    } catch (error) {
      console.error('Exception checking bucket:', error);
      return false;
    }
  };

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
      
      // Verify bucket exists
      const bucketExists = await verifyBucket();
      if (!bucketExists) {
        console.error('Gallery bucket verification failed');
        toast.error('Gallery storage is not configured properly. Please contact support.');
        return null;
      }
      
      // Generate a unique filename to avoid conflicts
      const fileExtension = file.name.split('.').pop() || '';
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      console.log('Uploading file with name:', uniqueFileName, 'type:', file.type, 'size:', file.size);
      
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
