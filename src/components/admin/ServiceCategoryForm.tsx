
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ServiceCategory } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ServiceCategoryFormProps {
  category?: ServiceCategory;
  onComplete: () => void;
}

export function ServiceCategoryForm({ category, onComplete }: ServiceCategoryFormProps) {
  const { addCategory, updateCategory } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    if (!name.trim()) {
      toast.error('Category name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      // Verify session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session && !localStorage.getItem('isAdmin')) {
        throw new Error('No active session found. Please log in again or use Demo Mode.');
      }
      
      const formData = { 
        name, 
        description: description || undefined,
        // Use either sort_order or order property from category
        sort_order: category?.sort_order ?? category?.order ?? (Date.now() % 1000)
      };
      
      if (category) {
        // Fixed: Pass the data as a single object with id included
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
      setErrorMsg(error.message || 'An error occurred saving the category');
      toast.error('An error occurred saving the category');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {errorMsg}
        </div>
      )}
      
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
