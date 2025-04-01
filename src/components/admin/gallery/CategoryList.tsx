
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GalleryCategory } from '@/context/GalleryContext';
import { Edit, Trash, Image } from 'lucide-react';

interface CategoryListProps {
  categories: GalleryCategory[];
  onEdit: (category: GalleryCategory) => void;
  onDelete: (id: string) => void;
  onViewImages: (categoryId: string) => void;
  imageCountMap: Record<string, number>;
}

export function CategoryList({ 
  categories, 
  onEdit, 
  onDelete, 
  onViewImages,
  imageCountMap 
}: CategoryListProps) {
  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No categories found. Create your first category to get started.
        </div>
      ) : (
        categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {imageCountMap[category.id] || 0} images
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onViewImages(category.id)}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(category.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
