
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GalleryCategory } from '@/context/GalleryContext';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
  const { isAuthenticated, isAdmin } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Check session on mount and before form submission
  useEffect(() => {
    async function verifySession() {
      try {
        console.log('Verifying session in CategoryForm...');
        const { data: { session } } = await supabase.auth.getSession();
        const hasSession = !!session;
        console.log('Session verified in CategoryForm:', hasSession ? 'Active' : 'None');
        
        if (!hasSession && !isAuthenticated) {
          setErrorMsg('No active session found. Please log in again.');
        } else {
          setErrorMsg('');
        }
        
        setSessionChecked(true);
      } catch (error) {
        console.error('Error verifying session:', error);
      }
    }
    
    verifySession();
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Double-check session right before submission
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && !isAuthenticated) {
      setErrorMsg('No active session found. Please log in again.');
      toast.error('Authentication required');
      return;
    }
    
    if (!name.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting category with session verification completed');
      await onSubmit({
        name,
        description: description || undefined,
        sort_order: category?.sort_order ?? (Date.now() % 1000) // Default sort order if not provided
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
          disabled={isSubmitting || (!isAuthenticated && !localStorage.getItem('isAdmin'))}
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
