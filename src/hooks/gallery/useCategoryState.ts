
import { useState } from 'react';
import { GalleryCategory } from '@/context/GalleryContext';

export function useCategoryState() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  return {
    categories,
    setCategories,
    sessionVerified,
    setSessionVerified,
    demoMode,
    setDemoMode
  };
}
