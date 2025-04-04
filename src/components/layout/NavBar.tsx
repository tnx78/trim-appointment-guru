
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

export function NavBar() {
  const { isAuthenticated, user, logout, isAdmin, loading } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Get first letter of user name for avatar or use profile picture from social login
  const getInitials = () => {
    if (!user) return '?';
    
    // Check if full_name is available in user metadata
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName) return fullName.charAt(0).toUpperCase();
    
    // Fallback to email
    return user.email ? user.email.charAt(0).toUpperCase() : '?';
  };

  // Get user profile image from social login providers if available
  const getProfileImage = () => {
    if (!user) return undefined;
    
    // Check various locations where avatar/picture might be stored
    return user.user_metadata?.avatar_url || 
           user.user_metadata?.picture ||
           user.user_metadata?.avatar ||
           undefined;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
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

            {/* Only show menu items if auth state is determined */}
            {!loading && (
              <>
                {/* Show My Bookings for authenticated customers */}
                {isAuthenticated && !isAdmin && (
                  <NavigationMenuItem>
                    <Link to="/my-appointments">
                      <NavigationMenuLink className="px-4 py-2">
                        My Bookings
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
                    
                {/* Show Admin for users with admin role */}
                {isAuthenticated && isAdmin && (
                  <NavigationMenuItem>
                    <Link to="/admin">
                      <NavigationMenuLink className="px-4 py-2">
                        Admin Panel
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Link to="/services">
            <Button variant="default">Book Now</Button>
          </Link>

          {loading ? (
            <Button variant="ghost" size="icon" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Show Account avatar for all logged in users */}
              <Link to="/account">
                <Avatar>
                  <AvatarImage src={getProfileImage()} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
