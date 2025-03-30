
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

export function NavBar() {
  const location = useLocation();
  
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
          <Link
            to="/admin"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive('/admin') ? "text-primary" : "text-muted-foreground"
            )}
          >
            Admin
          </Link>
        </nav>
        
        <div className="ml-auto flex items-center space-x-4">
          <Button asChild>
            <Link to="/admin">Salon Admin</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
