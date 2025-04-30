
import React from 'react';
import { CategoryList } from '../CategoryList';
import { GalleryCategory } from '@/context/GalleryContext';

interface CategoryTabProps {
  categories: GalleryCategory[];
  imageCountMap: Record<string, number>;
  onEdit: (category: GalleryCategory) => void;
  onDelete: (id: string) => void;
  onViewImages: (categoryId: string) => void;
}

export function CategoryTab({
  categories,
  imageCountMap,
  onEdit,
  onDelete,
  onViewImages
}: CategoryTabProps) {
  return (
    <CategoryList 
      categories={categories} 
      onEdit={onEdit}
      onDelete={onDelete}
      onViewImages={onViewImages}
      imageCountMap={imageCountMap}
    />
  );
}
