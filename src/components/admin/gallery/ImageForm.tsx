
import React, { useState, useEffect } from 'react';
import { GalleryCategory, GalleryImage } from '@/context/GalleryContext';
import { toast } from 'sonner';
import { validateImageFile } from '@/hooks/gallery/useGalleryFileUpload';
import { useAdminCheck } from '@/hooks/gallery/useAdminCheck';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategorySelector } from './formComponents/CategorySelector';
import { ImageSelector } from './formComponents/ImageSelector';
import { ImageDetailsForm } from './formComponents/ImageDetailsForm';
import { FormActions } from './formComponents/FormActions';

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
  const { isAdmin, checkAdminAccess } = useAdminCheck();

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
      setTitle('');
      setDescription('');
      setPreviewUrl(null);
      setImageFile(null);
      setUploadError(null);
    }
  }, [image, categories]);

  // Show admin requirement notice if user is not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Admin Access Required</h3>
        <p className="text-muted-foreground">
          You need administrator privileges to manage gallery images.
        </p>
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Validate file using our hook
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      toast.error(validation.error);
      return;
    }
    
    console.log('Selected file:', file.name, 'type:', file.type, 'size:', file.size);
    setImageFile(file);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Return cleanup function
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  };

  const removeImage = () => {
    if (imageFile) {
      setImageFile(null);
    }
    
    if (!image) {
      setPreviewUrl(null);
    } else {
      // Revert to the original image if we're editing
      setPreviewUrl(image.image_url);
    }
    
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    
    if (!checkAdminAccess('manage images')) {
      return;
    }
    
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

  const isValid = !!categoryId && (!!image || !!imageFile);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CategorySelector 
        categories={categories}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        isSubmitting={isSubmitting}
      />

      <ImageSelector
        previewUrl={previewUrl}
        removeImage={removeImage}
        handleImageChange={handleImageChange}
        isSubmitting={isSubmitting}
        uploadError={uploadError}
      />

      <ImageDetailsForm
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        isSubmitting={isSubmitting}
      />

      <FormActions
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        isValid={isValid}
        isEditing={!!image}
      />
    </form>
  );
}
