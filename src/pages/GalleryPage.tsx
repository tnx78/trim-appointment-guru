
import React from 'react';
import { useGalleryContext } from '@/context/GalleryContext';
import { GalleryLoading } from '@/components/gallery/GalleryLoading';
import { GalleryEmpty } from '@/components/gallery/GalleryEmpty';
import { CategoryTabs } from '@/components/gallery/CategoryTabs';

export default function GalleryPage() {
  const { categories, getImagesByCategory, isLoading } = useGalleryContext();

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <GalleryLoading />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Our Gallery</h1>
        <GalleryEmpty />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Our Gallery</h1>
      <CategoryTabs 
        categories={categories} 
        getImagesByCategory={getImagesByCategory} 
      />
    </div>
  );
}
