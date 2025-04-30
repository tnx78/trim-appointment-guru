
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  previewUrl: string | null;
  removeImage: () => void;
  isSubmitting: boolean;
}

export function ImagePreview({ previewUrl, removeImage, isSubmitting }: ImagePreviewProps) {
  return (
    <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
      <img
        src={previewUrl}
        alt="Preview"
        className="w-full h-full object-cover"
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2"
        onClick={removeImage}
        disabled={isSubmitting}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
