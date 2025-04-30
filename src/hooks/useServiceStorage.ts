
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export function useServiceStorage() {
  const [isUploading, setIsUploading] = useState(false);

  // Verify bucket exists
  const verifyBucket = async (): Promise<boolean> => {
    try {
      console.log('Verifying services bucket exists...');
      
      // First, check if we're in demo mode
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      // Skip actual verification for demo mode
      if (inDemoMode) {
        console.log('Demo mode: Skipping bucket verification');
        return true;
      }
      
      // Get actual bucket info from Supabase
      const { data, error } = await supabase.storage.getBucket('services');
      
      if (error) {
        console.error('Error checking services bucket:', error);
        
        // Check if bucket doesn't exist
        if (error.message.includes('does not exist')) {
          console.log('Attempting to create services bucket...');
          
          try {
            const { data: createData, error: createError } = await supabase.storage.createBucket('services', {
              public: true,
              fileSizeLimit: 5242880, // 5MB
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
            });
            
            if (createError) {
              console.error('Error creating services bucket:', createError);
              return false;
            }
            
            console.log('Services bucket created successfully:', createData);
            return true;
          } catch (createErr) {
            console.error('Exception creating bucket:', createErr);
            return false;
          }
        }
        
        return false;
      }
      
      console.log('Services bucket verified:', data);
      return true;
    } catch (error) {
      console.error('Exception checking bucket:', error);
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return null;
    }

    try {
      setIsUploading(true);
      console.log('Starting service image upload for file:', file.name, 'type:', file.type, 'size:', file.size);
      
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

      // Verify bucket exists
      const bucketExists = await verifyBucket();
      if (!bucketExists) {
        console.error('Services bucket verification failed');
        toast.error('Services storage is not configured properly. Please contact support.');
        return null;
      }
      
      // Generate a unique filename to avoid conflicts
      const fileExtension = file.name.split('.').pop() || '';
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      console.log('Uploading to services bucket with name:', uniqueFileName);
      
      // Direct file upload with content-type explicitly set
      const { data, error } = await supabase.storage
        .from('services')
        .upload(uniqueFileName, file, {
          contentType: file.type, // Explicitly set content type
          cacheControl: '3600'
        });
      
      if (error) {
        console.error('Upload error:', error);
        if (error.message.includes('mime type')) {
          toast.error('Unsupported file type. Please use JPG, PNG or GIF images.');
        } else {
          toast.error(`Upload failed: ${error.message}`);
        }
        return null;
      }
      
      if (!data || !data.path) {
        console.error('Upload succeeded but no path returned');
        toast.error('Upload failed: No file path returned');
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
      
      // Check if we're in demo mode
      const { data: sessionData } = await supabase.auth.getSession();
      const hasRealSession = !!sessionData.session;
      const inDemoMode = !hasRealSession && localStorage.getItem('isAdmin') === 'true';
      
      if (inDemoMode) {
        console.log('Demo mode: Simulating image deletion');
        toast.success('Image deleted successfully (Demo Mode)');
        return true;
      }
      
      // Extract the filename from the URL
      const pathParts = url.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
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
