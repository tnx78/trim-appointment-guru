
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Camera, Menu, LogOut, User, Book, Grid3X3 } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export function NavBar() {
  const { isAuthenticated, user, logout, isAdmin, loading } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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

  // Navigation items with icons for both desktop and mobile views
  const navigationItems = (closeMenu?: () => void) => (
    <>
      <NavigationMenuItem>
        <Link to="/" onClick={closeMenu}>
          <NavigationMenuLink className="px-4 py-2">
            Home
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <Link to="/services" onClick={closeMenu}>
          <NavigationMenuLink className="px-4 py-2">
            Services
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      
      <NavigationMenuItem>
        <Link to="/gallery" onClick={closeMenu}>
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
              <Link to="/my-appointments" onClick={closeMenu}>
                <NavigationMenuLink className="px-4 py-2">
                  My Bookings
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
                
          {/* Show Admin for users with admin role */}
          {isAuthenticated && isAdmin && (
            <NavigationMenuItem>
              <Link to="/admin" onClick={closeMenu}>
                <NavigationMenuLink className="px-4 py-2">
                  Admin Panel
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
        </>
      )}
    </>
  );

  // Mobile navigation items with icons
  const mobileNavigationItems = [
    { name: "Home", icon: <Home className="h-5 w-5" />, path: "/" },
    { name: "Services", icon: <Book className="h-5 w-5" />, path: "/services" },
    { name: "Gallery", icon: <Camera className="h-5 w-5" />, path: "/gallery" },
  ];

  // Add conditional items
  if (isAuthenticated && !isAdmin) {
    mobileNavigationItems.push({ 
      name: "My Bookings", 
      icon: <Grid3X3 className="h-5 w-5" />, 
      path: "/my-appointments" 
    });
  }

  if (isAuthenticated && isAdmin) {
    mobileNavigationItems.push({ 
      name: "Admin Panel", 
      icon: <User className="h-5 w-5" />, 
      path: "/admin" 
    });
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex justify-between items-center py-3">
        <div className="flex items-center">
          <Link to="/" className="text-lg font-semibold">
            Salon Booking
          </Link>
        </div>

        {/* Desktop navigation */}
        {!isMobile && (
          <NavigationMenu>
            <NavigationMenuList>
              {navigationItems()}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        <div className="flex items-center gap-4">
          <Link to="/services">
            <Button variant="default" className={isMobile ? "hidden sm:flex" : ""}>Book Now</Button>
          </Link>

          {loading ? (
            <Button variant="ghost" size="icon" disabled>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" className="hidden sm:flex">Login</Button>
            </Link>
          )}

          {/* Mobile burger menu with beautiful slide-in drawer */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[75vw] sm:max-w-xs flex flex-col p-0">
                {/* Profile section at the top */}
                <div className="px-4 py-6 flex flex-col items-center bg-muted/40">
                  {isAuthenticated ? (
                    <>
                      <Avatar className="h-16 w-16 mb-2">
                        <AvatarImage src={getProfileImage()} />
                        <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">
                        {user?.user_metadata?.full_name || 
                         user?.user_metadata?.name || 
                         user?.email || 'User'}
                      </p>
                      <Link to="/account" className="text-xs text-muted-foreground mt-1">
                        View Profile
                      </Link>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Avatar className="h-16 w-16 mb-2">
                        <AvatarFallback className="text-lg">?</AvatarFallback>
                      </Avatar>
                      <Link to="/auth">
                        <Button variant="outline" size="sm" className="mt-2">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Navigation menu */}
                <div className="flex-1 overflow-auto py-2 px-2">
                  <nav className="flex flex-col">
                    {mobileNavigationItems.map((item) => (
                      <SheetClose asChild key={item.name}>
                        <Link 
                          to={item.path} 
                          className="flex items-center gap-3 px-4 py-3 text-base rounded-lg hover:bg-accent"
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>

                {/* Book Now button */}
                <div className="px-4 py-3">
                  <SheetClose asChild>
                    <Link to="/services" className="w-full block">
                      <Button className="w-full" size="lg">
                        Book Now
                      </Button>
                    </Link>
                  </SheetClose>
                </div>

                {/* Logout at the bottom */}
                {isAuthenticated && (
                  <div className="p-4 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => {
                        handleLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
