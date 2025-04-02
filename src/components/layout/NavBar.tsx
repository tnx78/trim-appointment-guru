
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function NavBar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  // Get first letter of user name for avatar
  const getInitials = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex justify-between items-center py-3">
        <div className="flex items-center">
          <Link to="/" className="text-lg font-semibold">
            Salon Booking
          </Link>
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className="px-4 py-2">
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/services">
                <NavigationMenuLink className="px-4 py-2">
                  Services
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/gallery">
                <NavigationMenuLink className="px-4 py-2">
                  Gallery
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {/* Only show My Bookings for authenticated non-admin users */}
            {isAuthenticated && !isAdmin && (
              <NavigationMenuItem>
                <Link to="/my-appointments">
                  <NavigationMenuLink className="px-4 py-2">
                    My Bookings
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}
                
            {/* Only show Admin for users with admin role */}
            {isAuthenticated && isAdmin && (
              <NavigationMenuItem>
                <Link to="/admin">
                  <NavigationMenuLink className="px-4 py-2">
                    Admin
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Link to="/services">
            <Button variant="default">Book Now</Button>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Show Account avatar for all logged in users */}
              <Link to="/account">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar || undefined} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
