
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  isValid: boolean;
  isEditing: boolean;
}

export function FormActions({
  isSubmitting,
  onCancel,
  isValid,
  isEditing
}: FormActionsProps) {
  return (
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
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? 'Updating...' : 'Adding...'}
          </>
        ) : (
          <>{isEditing ? 'Update' : 'Add'} Image</>
        )}
      </Button>
    </div>
  );
}
