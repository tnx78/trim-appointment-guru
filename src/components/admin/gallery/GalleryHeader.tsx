
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { GalleryCategory } from '@/context/GalleryContext';

interface GalleryHeaderProps {
  activeTab: 'categories' | 'images';
  selectedCategoryId: string | null;
  selectedCategory: GalleryCategory | null;
  onAddClick: () => void;
  onBackClick: () => void;
}

export function GalleryHeader({ 
  activeTab, 
  selectedCategoryId, 
  selectedCategory, 
  onAddClick, 
  onBackClick 
}: GalleryHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      {activeTab === 'images' && selectedCategoryId ? (
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm"
            className="mr-2"
            onClick={onBackClick}
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
        <Button onClick={onAddClick}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {activeTab === 'categories' ? 'Add Category' : 'Add Image'}
        </Button>
      </div>
    </div>
  );
}
