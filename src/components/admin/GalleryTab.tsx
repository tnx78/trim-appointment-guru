
import React, { useState, useEffect } from 'react';
import { useGalleryContext } from '@/context/GalleryContext';
import { useAuth } from '@/context/AuthContext'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash, Edit, Image, Upload, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Split into smaller components for better maintainability
const CategoryForm = ({ newCategory, setNewCategory, handleAddCategory }) => {
  return (
    <div className="flex items-end gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="category-name">New Category Name</Label>
        <Input
          id="category-name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          placeholder="Enter category name"
        />
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor="category-desc">Description (Optional)</Label>
        <Input
          id="category-desc"
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          placeholder="Enter category description"
        />
      </div>
      <Button onClick={handleAddCategory}>
        <Plus className="mr-2 h-4 w-4" /> Add Category
      </Button>
    </div>
  );
};

const CategoryList = ({ categories, setEditingCategory, deleteCategory }) => {
  if (categories.length === 0) {
    return <p className="text-muted-foreground">No categories yet. Add your first one.</p>;
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between border-b pb-2">
          <div>
            <h4 className="font-medium">{category.name}</h4>
            {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingCategory(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => deleteCategory(category.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ImageGrid = ({ images, deleteImage }) => {
  if (images.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center border rounded-lg p-8 text-center">
        <Image className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No images in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <Card key={image.id}>
          <div className="relative aspect-square overflow-hidden">
            <img
              src={image.image_url}
              alt={image.title || 'Gallery image'}
              className="object-cover w-full h-full"
            />
          </div>
          <CardContent className="p-4">
            {image.title && <h4 className="font-medium">{image.title}</h4>}
            {image.description && <p className="text-sm text-muted-foreground">{image.description}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => deleteImage(image.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main component
export function GalleryTab() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Get gallery context and handle potential errors
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
    deleteImage,
    getImagesByCategory
  } = useGalleryContext();

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newImage, setNewImage] = useState({ title: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Set selected category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);
  
  // Load gallery data when authenticated
  useEffect(() => {
    console.log('GalleryTab mounted with auth state:', { isAuthenticated, isAdmin });
    
    if (isAuthenticated) {
      loadGalleryData();
    }
  }, [isAuthenticated, isAdmin, loadGalleryData]);

  // Handle file upload
  const handleFileUpload = async (file, category_id) => {
    try {
      setIsUploading(true);
      console.log('Uploading file:', file.name, 'for category:', category_id);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;
      
      if (!isAuthenticated || !isAdmin) {
        throw new Error('You must be logged in as an admin to upload images');
      }
      
      // Check if the gallery bucket exists, if not this will fail
      const { error: uploadError, data } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('File uploaded successfully, getting public URL');
      
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);
      
      console.log('Public URL:', publicUrl);  
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image: ' + error.message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    if (!isAuthenticated || !isAdmin) {
      toast.error('You must be logged in as an admin to add categories');
      return;
    }
    
    console.log('Adding new category:', newCategory, 'Auth status:', { isAuthenticated, isAdmin });
    
    try {
      const result = await addCategory({
        name: newCategory.name,
        description: newCategory.description,
        sort_order: categories.length + 1
      });
      
      if (result) {
        console.log('Category added successfully:', result);
        setNewCategory({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category: ' + error.message);
    }
  };

  // Handle updating a category
  const handleUpdateCategory = async () => {
    if (!editingCategory?.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    if (!isAuthenticated || !isAdmin) {
      toast.error('You must be logged in as an admin to update categories');
      return;
    }
    
    console.log('Updating category:', editingCategory);
    
    await updateCategory(editingCategory);
    setEditingCategory(null);
  };

  // Handle adding a new image
  const handleAddImage = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }
    
    if (!selectedFile) {
      toast.error('Please select an image to upload');
      return;
    }
    
    if (!isAuthenticated || !isAdmin) {
      toast.error('You must be logged in as an admin to add images');
      return;
    }
    
    try {
      console.log('Adding new image for category:', selectedCategory);
      
      const imageUrl = await handleFileUpload(selectedFile, selectedCategory);
      
      console.log('Image uploaded, URL:', imageUrl);
      
      const result = await addImage({
        category_id: selectedCategory,
        title: newImage.title,
        description: newImage.description,
        image_url: imageUrl,
        sort_order: getImagesByCategory(selectedCategory).length + 1
      });
      
      if (result) {
        console.log('Image added successfully:', result);
        setNewImage({ title: '', description: '' });
        setSelectedFile(null);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to add image:', error);
    }
  };

  // If not authenticated, prompt user to log in
  if (!isAuthenticated) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">You must be logged in as an admin to manage the gallery.</p>
          <Button onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If not admin, show appropriate message
  if (isAuthenticated && !isAdmin) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Admin privileges are required to manage the gallery.</p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If there's an error, display it
  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">There was an error loading the gallery data: {error}</p>
          <Button onClick={() => loadGalleryData()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading gallery data...</p>
        </CardContent>
      </Card>
    );
  }

  // Render the gallery management UI
  return (
    <div className="space-y-6">
      {/* Categories management */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <CategoryForm 
              newCategory={newCategory}
              setNewCategory={setNewCategory}
              handleAddCategory={handleAddCategory}
            />
            
            <div className="border rounded-md p-4 mt-4">
              <h3 className="font-medium mb-2">Existing Categories</h3>
              <CategoryList 
                categories={categories} 
                setEditingCategory={setEditingCategory} 
                deleteCategory={deleteCategory}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit category dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateCategory} className="w-full">
                Update Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Images management */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gallery Images</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={categories[0].id} onValueChange={setSelectedCategory}>
              <TabsList className="w-full overflow-x-auto">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{category.name} Images</h3>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Upload className="mr-2 h-4 w-4" /> Upload Image
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload New Image</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="image-title">Image Title (Optional)</Label>
                            <Input
                              id="image-title"
                              value={newImage.title}
                              onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                              placeholder="Enter image title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="image-desc">Description (Optional)</Label>
                            <Textarea
                              id="image-desc"
                              value={newImage.description}
                              onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                              placeholder="Enter image description"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="image-file">Select Image</Label>
                            <Input
                              id="image-file"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                            />
                          </div>
                          <Button
                            onClick={handleAddImage}
                            disabled={isUploading || !selectedFile}
                            className="w-full"
                          >
                            {isUploading ? 'Uploading...' : 'Upload Image'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <ImageGrid 
                    images={getImagesByCategory(category.id)} 
                    deleteImage={deleteImage} 
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
