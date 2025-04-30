
import React from 'react';
import { Input } from '@/components/ui/input';
import { Upload, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  isSubmitting: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploader({ isSubmitting, handleImageChange }: ImageUploaderProps) {
  return (
    <div className="flex items-center justify-center w-full aspect-video bg-muted rounded-md border-2 border-dashed border-muted-foreground/20">
      {isSubmitting ? (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload an image</p>
        </div>
      )}
      <Input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        disabled={isSubmitting}
      />
      <label
        htmlFor="image-upload"
        className="absolute inset-0 cursor-pointer"
      />
    </div>
  );
}
