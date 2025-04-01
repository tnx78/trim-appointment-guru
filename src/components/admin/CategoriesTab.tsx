
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ServiceCategoryForm } from '@/components/admin/ServiceCategoryForm';
import { PlusCircle, Edit, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export function CategoriesTab() {
  const { categories, services, deleteCategory, updateCategoryOrder } = useAppContext();
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<typeof categories[0] | undefined>(undefined);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: typeof categories[0]) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (id: string) => {
    const hasServices = services.some(service => service.categoryId === id);
    if (hasServices) {
      toast.error("Cannot delete category with existing services");
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setEditingCategory(undefined);
  };

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategory(categoryId);
    e.dataTransfer.effectAllowed = 'move';
    // Use a transparent image as drag ghost
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (draggedCategory && draggedCategory !== categoryId) {
      const draggedIndex = sortedCategories.findIndex(c => c.id === draggedCategory);
      const hoverIndex = sortedCategories.findIndex(c => c.id === categoryId);
      
      if (draggedIndex !== -1 && hoverIndex !== -1) {
        // Create a new array to avoid mutations
        const newCategoryOrder = [...sortedCategories];
        const [draggedItem] = newCategoryOrder.splice(draggedIndex, 1);
        newCategoryOrder.splice(hoverIndex, 0, draggedItem);
        
        // Update order for each category
        const updatedCategories = newCategoryOrder.map((category, index) => ({
          ...category,
          order: index
        }));
        
        // Update context with new order
        updateCategoryOrder(updatedCategories);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
  };

  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 0;
    const orderB = b.order !== undefined ? b.order : 0;
    return orderA - orderB;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>Manage your service categories</CardDescription>
            </div>
            <Button onClick={handleAddCategory}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No categories yet. Create your first category to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCategories.map((category) => (
                <div 
                  key={category.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg ${draggedCategory === category.id ? 'opacity-50 bg-gray-100' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, category.id)}
                  onDragOver={(e) => handleDragOver(e, category.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center gap-4">
                    <div className="cursor-move">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <ServiceCategoryForm 
            category={editingCategory} 
            onComplete={handleCategoryModalClose} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
