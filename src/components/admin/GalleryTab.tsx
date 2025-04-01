
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useGalleryContext, GalleryCategory, GalleryImage } from '@/context/GalleryContext';

// Import our components
import { CategoryForm } from './gallery/CategoryForm';
import { ImageForm } from './gallery/ImageForm';
import { CategoryList } from './gallery/CategoryList';
import { ImageList } from './gallery/ImageList';

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

  console.log('Current categories:', categories);
  console.log('Current images:', images);

  // Count images in each category
  const imageCountMap = categories.reduce((acc, category) => {
    acc[category.id] = getImagesByCategory(category.id).length;
    return acc;
  }, {} as Record<string, number>);

  // Handle category form submission
  const handleCategorySubmit = async (categoryData: Omit<GalleryCategory, 'id'>) => {
    try {
      console.log('Submitting category data:', categoryData);
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
      console.log('Submitting image data:', imageData);
      console.log('File provided:', file ? file.name : 'No file');
      
      let imageUrl = imageData.image_url;
      
      // If there's a new file, upload it first
      if (file) {
        const uploadedUrl = await uploadImage(file);
        if (!uploadedUrl) {
          throw new Error('Failed to upload image');
        }
        imageUrl = uploadedUrl;
      }
      
      if (editingImage) {
        // If the image URL has changed and we're not in demo mode, delete the old image
        if (imageData.image_url && imageData.image_url !== editingImage.image_url && !imageData.image_url.startsWith('data:')) {
          // Let it fail silently if deletion fails - we still want to update the image
          try {
            // This will eventually be handled in the useGalleryImages hook deleteImage method
          } catch (error) {
            console.warn('Failed to delete old image, but continuing with update:', error);
          }
        }
        
        await updateImage({
          ...editingImage,
          ...imageData,
          image_url: imageUrl
        });
      } else {
        await addImage({
          ...imageData,
          image_url: imageUrl
        });
      }
      
      setShowImageModal(false);
      setEditingImage(undefined);
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
      <div className="flex justify-between items-center mb-6">
        {activeTab === 'images' && selectedCategoryId ? (
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm"
              className="mr-2"
              onClick={handleBackToCategories}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Categories
            </Button>
            <h2 className="text-xl font-semibold">
              {selectedCategory?.name} Images
            </h2>
          </div>
        ) : (
          <h2 className="text-xl font-semibold">Gallery Management</h2>
        )}
        
        <div>
          {activeTab === 'categories' ? (
            <Button onClick={() => {
              setEditingCategory(undefined);
              setShowCategoryModal(true);
            }}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          ) : (
            <Button onClick={handleAddImage}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          )}
        </div>
      </div>
      
      {!selectedCategoryId && (
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'categories' | 'images')}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="images">All Images</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      
      {activeTab === 'categories' ? (
        <CategoryList 
          categories={categories} 
          onEdit={(category) => {
            setEditingCategory(category);
            setShowCategoryModal(true);
          }}
          onDelete={handleDeleteCategory}
          onViewImages={handleViewCategoryImages}
          imageCountMap={imageCountMap}
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
