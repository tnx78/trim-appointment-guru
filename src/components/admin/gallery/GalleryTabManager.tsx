
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GalleryTabManagerProps {
  activeTab: 'categories' | 'images';
  setActiveTab: (value: 'categories' | 'images') => void;
  selectedCategoryId: string | null;
}

export function GalleryTabManager({ activeTab, setActiveTab, selectedCategoryId }: GalleryTabManagerProps) {
  if (selectedCategoryId) {
    return null; // No tabs when viewing a specific category's images
  }

  return (
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
  );
}
