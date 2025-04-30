
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GalleryCategory, GalleryImage } from '@/context/GalleryContext';
import { Image, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGalleryFileUpload } from '@/hooks/gallery/useGalleryFileUpload';

interface ImageFormProps {
  image?: GalleryImage;
  categories: GalleryCategory[];
  onSubmit: (imageData: Omit<GalleryImage, 'id'>, file?: File) => Promise<void>;
  onCancel: () => void;
}

export function ImageForm({ image, categories, onSubmit, onCancel }: ImageFormProps) {
  const [title, setTitle] = useState(image?.title || '');
  const [description, setDescription] = useState(image?.description || '');
  const [categoryId, setCategoryId] = useState(image?.category_id || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(image?.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { validateImageFile } = useGalleryFileUpload();

  // Reset the form if the image prop changes
  useEffect(() => {
    if (image) {
      setTitle(image.title || '');
      setDescription(image.description || '');
      setCategoryId(image.category_id);
      setPreviewUrl(image.image_url);
      setImageFile(null);
      setUploadError(null);
    } else {
      // Reset the form for new image
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      } else {
        setCategoryId('');
      }
      setUploadError(null);
    }
  }, [image, categories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (file) {
      // Validate file using our hook
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        setUploadError(validation.error);
        return;
      }
      
      setImageFile(file);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Clean up the object URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (!image) {
      setPreviewUrl(null);
    } else {
      setPreviewUrl(image.image_url);
    }
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    
    // For a new image, we need an image file
    if (!image && !imageFile) {
      toast.error('Please upload an image');
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting image data:', {
        category_id: categoryId,
        title,
        description,
        image_url: image?.image_url || '',
      });
      
      // Submit with the image data and file
      await onSubmit({
        category_id: categoryId,
        title: title || undefined,
        description: description || undefined,
        image_url: image?.image_url || '',
        sort_order: image?.sort_order
      }, imageFile);
      
    } catch (error: any) {
      console.error('Error submitting image:', error);
      setUploadError(error.message || 'Unknown error');
      toast.error('Error submitting image: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={categoryId}
          onValueChange={setCategoryId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <div className="space-y-2">
          {previewUrl ? (
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
          ) : (
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
          )}

          {uploadError && (
            <div className="text-sm text-destructive mt-1">{uploadError}</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (Optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Image title"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of this image"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || (!image && !imageFile) || !categoryId}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {image ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>{image ? 'Update' : 'Add'} Image</>
          )}
        </Button>
      </div>
    </form>
  );
}
