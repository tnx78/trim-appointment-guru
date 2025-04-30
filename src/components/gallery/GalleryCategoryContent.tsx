
import React from 'react';
import { GalleryCategory, GalleryImage } from '@/context/GalleryContext';
import { GalleryCarousel } from './GalleryCarousel';
import { GalleryGrid } from './GalleryGrid';

interface GalleryCategoryContentProps {
  category: GalleryCategory;
  images: GalleryImage[];
}

export function GalleryCategoryContent({ category, images }: GalleryCategoryContentProps) {
  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">{category.name}</h2>
        {category.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {category.description}
          </p>
        )}
      </div>
      
      {images.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-muted-foreground">No images in this category yet.</p>
        </div>
      ) : (
        <>
          <GalleryCarousel images={images} />
          <GalleryGrid images={images} />
        </>
      )}
    </>
  );
}
