
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ServiceCategory } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ServiceCategoryFormProps {
  category?: ServiceCategory;
  onComplete: () => void;
}

export function ServiceCategoryForm({ category, onComplete }: ServiceCategoryFormProps) {
  const { addCategory, updateCategory } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name.trim()) {
      toast.error('Category name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = { name, description };
      
      if (category) {
        updateCategory(category.id, formData);
      } else {
        addCategory(formData);
      }
      
      setName('');
      setDescription('');
      onComplete();
    } catch (error) {
      toast.error('An error occurred saving the category');
      console.error(error);
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
