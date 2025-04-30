
import { useState } from 'react';
import { GalleryCategory, GalleryImage } from '@/context/GalleryContext';

export function useGalleryTabState() {
  const [activeTab, setActiveTab] = useState<'categories' | 'images'>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | undefined>(undefined);
  const [editingImage, setEditingImage] = useState<GalleryImage | undefined>(undefined);

  // View a specific category's images
  const handleViewCategoryImages = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setActiveTab('images');
  };

  // Back to categories view
  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setActiveTab('categories');
  };

  // Handle adding a new image
  const handleAddImage = () => {
    setEditingImage(undefined);
    setShowImageModal(true);
  };

  // Handle editing an image
  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setShowImageModal(true);
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryModal(true);
  };

  // Handle editing a category
  const handleEditCategory = (category: GalleryCategory) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  // Close category modal
  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(undefined);
  };

  // Close image modal
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setEditingImage(undefined);
  };

  return {
    activeTab,
    setActiveTab,
    selectedCategoryId,
    setSelectedCategoryId,
    showCategoryModal,
    showImageModal,
    editingCategory,
    editingImage,
    handleViewCategoryImages,
    handleBackToCategories,
    handleAddImage,
    handleEditImage,
    handleAddCategory,
    handleEditCategory,
    handleCloseCategoryModal,
    handleCloseImageModal
  };
}
