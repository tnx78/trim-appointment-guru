
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGalleryContext, GalleryCategory, GalleryImage } from '@/context/GalleryContext';

// Import our components
import { CategoryForm } from './gallery/CategoryForm';
import { ImageForm } from './gallery/ImageForm';
import { CategoryList } from './gallery/CategoryList';
import { ImageList } from './gallery/ImageList';
import { GalleryHeader } from './gallery/GalleryHeader';
import { GalleryTabManager } from './gallery/GalleryTabManager';

export function GalleryTab() {
  const {
    categories,
    images,
    isLoading,
    error,
    loadGalleryData,
    addCategory,
    updateCategory,
    deleteCategory,
    addImage,
    updateImage,
    deleteImage,
    getImagesByCategory,
    uploadImage,
    isUploading
  } = useGalleryContext();

  const [activeTab, setActiveTab] = useState<'categories' | 'images'>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | undefined>(undefined);
  const [editingImage, setEditingImage] = useState<GalleryImage | undefined>(undefined);

  // Initialize or refresh data - Force refresh on mount
  useEffect(() => {
    console.log('GalleryTab mounted, loading data...');
    loadGalleryData();
  }, []);

  // Handle category form submission
  const handleCategorySubmit = async (categoryData: Omit<GalleryCategory, 'id'>) => {
    try {
      if (editingCategory) {
        await updateCategory({
          ...editingCategory,
          ...categoryData
        });
      } else {
        await addCategory(categoryData);
      }
      setShowCategoryModal(false);
      setEditingCategory(undefined);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category: ' + error.message);
    }
  };

  // Handle image form submission
  const handleImageSubmit = async (imageData: Omit<GalleryImage, 'id'>, file?: File) => {
    try {
      console.log('Handling image submission:', imageData, file ? `${file.name} (${file.type})` : 'no file');
      
      let finalImageUrl = imageData.image_url;
      
      // If we have a new file, upload it first
      if (file) {
        console.log('Uploading new file...', file.name, file.type, file.size);
        const uploadedUrl = await uploadImage(file);
        
        if (!uploadedUrl) {
          throw new Error('Failed to upload image');
        }
        
        finalImageUrl = uploadedUrl;
        console.log('File uploaded, got URL:', finalImageUrl);
      }
      
      if (editingImage) {
        console.log('Updating existing image with data:', {
          ...editingImage,
          ...imageData,
          image_url: finalImageUrl
        });
        
        await updateImage({
          ...editingImage,
          ...imageData,
          image_url: finalImageUrl
        });
      } else {
        console.log('Adding new image with data:', {
          ...imageData,
          image_url: finalImageUrl
        });
        
        await addImage({
          ...imageData,
          image_url: finalImageUrl
        });
      }
      
      setShowImageModal(false);
      setEditingImage(undefined);
      toast.success(editingImage ? 'Image updated successfully' : 'Image added successfully');
    } catch (error: any) {
      console.error('Failed to save image:', error);
      toast.error('Failed to save image: ' + error.message);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: string) => {
    // Check if there are images in this category
    const categoryImages = getImagesByCategory(id);
    if (categoryImages.length > 0) {
      toast.error(`This category contains ${categoryImages.length} images. Delete the images first.`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      await deleteImage(id);
    }
  };

  // View a specific category's images
  const handleViewCategoryImages = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setActiveTab('images');
  };

  // Back to categories view
  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setActiveTab('categories');
  };

  // Handle adding a new image
  const handleAddImage = () => {
    // If we're in a specific category view, pre-select that category
    setEditingImage(undefined);
    setShowImageModal(true);
  };

  // Handle editing an image
  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setShowImageModal(true);
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryModal(true);
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading gallery data...</span>
      </div>
    );
  }

  // If error, show message
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>
          Failed to load gallery data: {error}
          <div className="mt-2">
            <Button onClick={loadGalleryData}>Retry</Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Selected category details
  const selectedCategory = selectedCategoryId 
    ? categories.find(c => c.id === selectedCategoryId) 
    : null;
  
  // Images for the selected category or all images if no category is selected
  const displayedImages = selectedCategoryId
    ? getImagesByCategory(selectedCategoryId)
    : images;

  return (
    <>
      <GalleryHeader 
        activeTab={activeTab}
        selectedCategoryId={selectedCategoryId}
        selectedCategory={selectedCategory}
        onAddClick={activeTab === 'categories' ? handleAddCategory : handleAddImage}
        onBackClick={handleBackToCategories}
      />
      
      <GalleryTabManager
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategoryId={selectedCategoryId}
      />
      
      {activeTab === 'categories' ? (
        <CategoryList 
          categories={categories} 
          onEdit={(category) => {
            setEditingCategory(category);
            setShowCategoryModal(true);
          }}
          onDelete={handleDeleteCategory}
          onViewImages={handleViewCategoryImages}
          imageCountMap={categories.reduce((acc, category) => {
            acc[category.id] = getImagesByCategory(category.id).length;
            return acc;
          }, {} as Record<string, number>)}
        />
      ) : (
        <ImageList 
          images={displayedImages} 
          onEdit={handleEditImage}
          onDelete={handleDeleteImage}
        />
      )}
      
      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Edit this gallery category' : 'Add a new gallery category'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm 
            category={editingCategory} 
            onSubmit={handleCategorySubmit}
            onCancel={() => {
              setShowCategoryModal(false);
              setEditingCategory(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingImage ? 'Edit Image' : 'Add New Image'}
            </DialogTitle>
            <DialogDescription>
              {editingImage ? 'Edit this gallery image' : 'Add a new image to the gallery'}
            </DialogDescription>
          </DialogHeader>
          <ImageForm 
            image={editingImage} 
            categories={categories}
            onSubmit={handleImageSubmit}
            onCancel={() => {
              setShowImageModal(false);
              setEditingImage(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
