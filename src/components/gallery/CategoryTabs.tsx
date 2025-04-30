
import React from 'react';
import { GalleryCategory } from '@/context/GalleryContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GalleryCategoryContent } from './GalleryCategoryContent';

interface CategoryTabsProps {
  categories: GalleryCategory[];
  getImagesByCategory: (categoryId: string) => GalleryImage[];
}

export function CategoryTabs({ categories, getImagesByCategory }: CategoryTabsProps) {
  if (categories.length === 0) {
    return null;
  }
  
  return (
    <Tabs 
      defaultValue={categories[0]?.id} 
      className="space-y-8"
    >
      <TabsList className="w-full flex flex-wrap justify-center">
        {categories.map((category) => (
          <TabsTrigger key={category.id} value={category.id}>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id}>
          <GalleryCategoryContent 
            category={category} 
            images={getImagesByCategory(category.id)} 
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
