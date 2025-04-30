
import React from 'react';
import { Label } from '@/components/ui/label';
import { ImagePreview } from '../ImagePreview';
import { ImageUploader } from '../ImageUploader';

interface ImageSelectorProps {
  previewUrl: string | null;
  removeImage: () => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  uploadError: string | null;
}

export function ImageSelector({
  previewUrl,
  removeImage,
  handleImageChange,
  isSubmitting,
  uploadError
}: ImageSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="image">Image</Label>
      <div className="space-y-2">
        {previewUrl ? (
          <ImagePreview 
            previewUrl={previewUrl}
            removeImage={removeImage}
            isSubmitting={isSubmitting}
          />
        ) : (
          <ImageUploader
            isSubmitting={isSubmitting}
            handleImageChange={handleImageChange}
          />
        )}

        {uploadError && (
          <div className="text-sm text-destructive mt-1">{uploadError}</div>
        )}
      </div>
    </div>
  );
}
