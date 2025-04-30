
import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGalleryContext, GalleryCategory, GalleryImage } from '@/context/GalleryContext';
import { GalleryHeader } from './gallery/GalleryHeader';
import { GalleryTabManager } from './gallery/GalleryTabManager';
import { CategoryTab } from './gallery/tabs/CategoryTab';
import { ImagesTab } from './gallery/tabs/ImagesTab';
import { CategoryModal } from './gallery/modals/CategoryModal';
import { ImageModal } from './gallery/modals/ImageModal';
import { useGalleryTabState } from './gallery/hooks/useGalleryTabState';

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
    uploadImage
  } = useGalleryContext();

  const {
    activeTab,
    setActiveTab,
    selectedCategoryId,
    showCategoryModal,
    showImageModal,
    editingCategory,
    editingImage,
    handleViewCategoryImages,
    handleBackToCategories,
    handleAddImage,
    handleEditImage,
    handleAddCategory,
    handleEditCategory,
    handleCloseCategoryModal,
    handleCloseImageModal
  } = useGalleryTabState();

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
      handleCloseCategoryModal();
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
        await updateImage({
          ...editingImage,
          ...imageData,
          image_url: finalImageUrl
        });
      } else {
        await addImage({
          ...imageData,
          image_url: finalImageUrl
        });
      }
      
      handleCloseImageModal();
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

  // Image count map for categories
  const imageCountMap = categories.reduce((acc, category) => {
    acc[category.id] = getImagesByCategory(category.id).length;
    return acc;
  }, {} as Record<string, number>);

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
        <CategoryTab
          categories={categories}
          imageCountMap={imageCountMap}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onViewImages={handleViewCategoryImages}
        />
      ) : (
        <ImagesTab 
          images={displayedImages}
          onEdit={handleEditImage}
          onDelete={handleDeleteImage}
        />
      )}
      
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={handleCloseCategoryModal}
        category={editingCategory}
        onSubmit={handleCategorySubmit}
      />
      
      <ImageModal
        isOpen={showImageModal}
        onClose={handleCloseImageModal}
        image={editingImage}
        categories={categories}
        onSubmit={handleImageSubmit}
      />
    </>
  );
}
