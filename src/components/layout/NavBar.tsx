
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Scissors, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function NavBar() {
  const location = useLocation();
  const { isAuthenticated, logout, isAdmin } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-2 mr-4">
          <Scissors className="h-6 w-6 text-salon-500" />
          <span className="text-lg font-bold text-foreground">TrimGuru</span>
        </div>
        
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            to="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive('/') ? "text-primary" : "text-muted-foreground"
            )}
          >
            Home
          </Link>
          <Link
            to="/services"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive('/services') || isActive('/book') ? "text-primary" : "text-muted-foreground"
            )}
          >
            Book Now
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-appointments"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/my-appointments') ? "text-primary" : "text-muted-foreground"
              )}
            >
              My Appointments
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/admin') ? "text-primary" : "text-muted-foreground"
              )}
            >
              Admin
            </Link>
          )}
        </nav>
        
        <div className="ml-auto flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/account">
                  <UserCircle className="h-5 w-5 mr-2" />
                  My Account
                </Link>
              </Button>
              <Button variant="outline" onClick={() => logout()} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">Login / Register</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
