
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function useAdminCheck() {
  const { isAdmin, isAuthenticated } = useAuth();

  const checkAdminAccess = (action: string = 'perform this action'): boolean => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to ' + action);
      return false;
    }
    
    if (!isAdmin) {
      toast.error('Admin access required to ' + action);
      return false;
    }
    
    return true;
  };

  return {
    isAdmin,
    isAuthenticated,
    checkAdminAccess
  };
}
