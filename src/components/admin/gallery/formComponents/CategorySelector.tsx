
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GalleryCategory } from '@/context/GalleryContext';

interface CategorySelectorProps {
  categories: GalleryCategory[];
  categoryId: string;
  setCategoryId: (value: string) => void;
  isSubmitting: boolean;
}

export function CategorySelector({ 
  categories,
  categoryId, 
  setCategoryId,
  isSubmitting
}: CategorySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">Category</Label>
      <Select
        value={categoryId}
        onValueChange={setCategoryId}
        disabled={isSubmitting}
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
  );
}
