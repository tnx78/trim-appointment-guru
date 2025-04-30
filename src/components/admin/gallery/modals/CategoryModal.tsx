
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CategoryForm } from '../CategoryForm';
import { GalleryCategory } from '@/context/GalleryContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: GalleryCategory;
  onSubmit: (categoryData: Omit<GalleryCategory, 'id'>) => Promise<void>;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  onSubmit
}: CategoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {category ? 'Edit this gallery category' : 'Add a new gallery category'}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm 
          category={category} 
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
