
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './useAuthContext';

interface AuthRedirectOptions {
  redirectAuthenticated?: string;
  redirectUnauthenticated?: string;
  checkAdmin?: boolean;
  redirectNonAdmin?: string;
}

export function useAuthRedirect({
  redirectAuthenticated,
  redirectUnauthenticated,
  checkAdmin = false,
  redirectNonAdmin
}: AuthRedirectOptions = {}) {
  const { isAuthenticated, isAdmin, loading } = useAuthContext();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (loading) return;
    
    if (isAuthenticated) {
      // Check if user should be redirected when authenticated
      if (redirectAuthenticated) {
        navigate(redirectAuthenticated);
        return;
      }
      
      // Check admin status if needed
      if (checkAdmin && !isAdmin && redirectNonAdmin) {
        navigate(redirectNonAdmin);
        return;
      }
    } else if (redirectUnauthenticated) {
      // Redirect unauthenticated user
      navigate(redirectUnauthenticated);
    }
  }, [
    isAuthenticated, 
    isAdmin, 
    loading, 
    navigate, 
    redirectAuthenticated, 
    redirectUnauthenticated, 
    checkAdmin, 
    redirectNonAdmin
  ]);
  
  return { isAuthenticated, isAdmin, loading };
}
