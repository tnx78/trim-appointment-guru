
import { useState } from 'react';
import { toast } from 'sonner';

export function useServiceStorage() {
  const [isUploading, setIsUploading] = useState(false);

  // Placeholder functions that notify users that image upload is disabled
  const uploadImage = async (file: File): Promise<string | null> => {
    toast.info('Image upload is currently disabled');
    return null;
  };

  const deleteStorageImage = async (url: string): Promise<boolean> => {
    toast.info('Image deletion is currently disabled');
    return true;
  };

  return {
    isUploading,
    uploadImage,
    deleteStorageImage
  };
}
