
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GalleryCategory } from '@/context/GalleryContext';
import { Loader2, Shield } from 'lucide-react';
import { useAdminCheck } from '@/hooks/gallery/useAdminCheck';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CategoryFormProps {
  category?: GalleryCategory;
  onSubmit: (categoryData: Omit<GalleryCategory, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { isAdmin, isAuthenticated, checkAdminAccess } = useAdminCheck();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!checkAdminAccess('manage categories')) {
      return;
    }
    
    if (!name.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check for a valid authentication session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session found. Please log in again.');
      }
      
      console.log('Submitting category', {
        name,
        description: description || undefined,
        sort_order: category?.sort_order ?? (Date.now() % 1000)
      });
      
      await onSubmit({
        name,
        description: description || undefined,
        sort_order: category?.sort_order ?? (Date.now() % 1000)
      });
      
      // Clear form after successful submission
      if (!category) {
        setName('');
        setDescription('');
      }
    } catch (error: any) {
      console.error('Error in category form submission:', error);
      setErrorMsg(error.message || 'Failed to save category');
      
      if (error.message?.includes('session') || error.message?.includes('authentication')) {
        toast.error('Session expired. Please log in again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show admin requirement notice if user is not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Admin Access Required</h3>
        <p className="text-muted-foreground">
          You need administrator privileges to manage gallery categories.
        </p>
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

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
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Haircuts, Coloring, etc."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of this category"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isAuthenticated}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {category ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{category ? 'Update' : 'Create'} Category</>
          )}
        </Button>
      </div>
    </form>
  );
}
