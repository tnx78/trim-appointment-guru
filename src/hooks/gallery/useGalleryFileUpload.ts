
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export function useGalleryFileUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
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

  const createImageUrl = async (file: File): Promise<string | null> => {
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
      const uniqueFileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      console.log('Uploading file with name:', uniqueFileName);
      
      // Upload file to Supabase storage - fixed to use the file directly, not JSON
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Explicitly set content type from the file
        });
      
      if (error) {
        console.error('Upload error:', error);
        throw new Error(error.message);
      }
      
      if (!data || !data.path) {
        throw new Error('No file path returned');
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(data.path);
      
      console.log('File uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Error in createImageUrl:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    validateImageFile,
    createImageUrl
  };
}
