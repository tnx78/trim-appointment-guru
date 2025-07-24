
import { useState, useEffect } from 'react';
import { useCategoryContext } from '@/context/CategoryContext';
import { ServiceCategory } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useAdminCheck } from '@/hooks/gallery/useAdminCheck';
import { toast } from 'sonner';

interface ServiceCategoryFormProps {
  category?: ServiceCategory;
  onComplete: () => void;
}

export function ServiceCategoryForm({ category, onComplete }: ServiceCategoryFormProps) {
  const { addCategory, updateCategory } = useCategoryContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAdmin, checkAdminAccess } = useAdminCheck();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
    }
  }, [category]);

  // Show admin requirement notice if user is not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Admin Access Required</h3>
        <p className="text-muted-foreground">
          You need administrator privileges to manage service categories.
        </p>
        <Button variant="outline" onClick={onComplete}>
          Close
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!checkAdminAccess('manage service categories')) {
      setIsSubmitting(false);
      return;
    }

    if (!name.trim()) {
      toast.error('Category name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = { 
        name, 
        description: description || undefined,
        // Use either sort_order or order property
        order: category?.order ?? (Date.now() % 1000)
      };
      
      if (category) {
        // Pass the data as a single object with id included
        updateCategory({
          id: category.id,
          ...formData
        });
        console.log('Updating category:', category.id, formData);
        toast.success(`Category "${name}" updated successfully`);
      } else {
        addCategory(formData);
        console.log('Adding new category:', formData);
        toast.success(`Category "${name}" added successfully`);
      }
      
      setName('');
      setDescription('');
      onComplete();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error('An error occurred saving the category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          placeholder="e.g. Haircut, Coloring, etc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description of the service category"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {category ? 'Update' : 'Add'} Category
        </Button>
      </div>
    </form>
  );
}
