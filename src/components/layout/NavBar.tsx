
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Menu, X, LogOut, User, ChevronRight } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function NavBar() {
  const { isAuthenticated, user, logout, isAdmin, loading } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Get full name from user metadata
  const getFullName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           '';
  };

  // Navigation items shared between desktop and mobile views
  const navigationItems = (closeMenu?: () => void) => {
    const items = [
      { to: "/", label: "Home" },
      { to: "/services", label: "Services" },
      { to: "/gallery", label: "Gallery" }
    ];
    
    // Add conditional items based on auth state
    if (isAuthenticated && !isAdmin) {
      items.push({ to: "/my-appointments", label: "My Bookings" });
      items.push({ to: "/account", label: "Account" });
    }
    
    if (isAuthenticated && isAdmin) {
      items.push({ to: "/admin", label: "Admin Panel" });
      items.push({ to: "/account", label: "Account" });
    }
    
    return items.map(item => (
      <NavigationMenuItem key={item.to}>
        <Link 
          to={item.to}
          onClick={closeMenu}
          className={cn(
            "flex items-center px-4 py-3 w-full hover:bg-accent rounded-md",
            location.pathname === item.to && "bg-accent font-medium"
          )}
        >
          <NavigationMenuLink className="w-full">
            {item.label}
            {isMobile && <ChevronRight className="ml-auto h-4 w-4" />}
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    ));
  };

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
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Show Account avatar for all logged in users */}
              {!isMobile && (
                <Link to="/account">
                  <Avatar>
                    <AvatarImage src={getProfileImage()} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Link>
              )}
              {!isMobile && (
                <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              )}
            </div>
          ) : (
            !isMobile && (
              <Link to="/auth">
                <Button variant="outline" className="hidden sm:flex">Login</Button>
              </Link>
            )
          )}

          {/* Mobile burger menu */}
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-full sm:max-w-xs">
                <div className="flex flex-col h-full bg-primary text-primary-foreground">
                  <div className="flex flex-col items-center py-10 space-y-2">
                    {isAuthenticated ? (
                      <>
                        <Avatar className="h-20 w-20 mb-2">
                          <AvatarImage src={getProfileImage()} />
                          <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-medium">{getFullName()}</h3>
                        <p className="text-sm opacity-75">
                          {isAdmin ? 'Administrator' : 'Customer'}
                        </p>
                      </>
                    ) : (
                      <div className="py-6">
                        <h2 className="text-2xl font-bold mb-2">Salon Booking</h2>
                        <p className="opacity-75">Welcome Guest</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center text-lg">
                    <NavigationMenu orientation="vertical" className="w-full max-w-xs">
                      <NavigationMenuList className="flex-col items-center space-y-1 w-full px-4">
                        {navigationItems(() => setIsOpen(false))}
                      </NavigationMenuList>
                    </NavigationMenu>
                  </div>
                  
                  <div className="p-6 w-full flex flex-col space-y-4">
                    {isAuthenticated ? (
                      <Button 
                        variant="outline" 
                        className="w-full border-white/20 hover:bg-white/10" 
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <Link to="/auth" className="w-full" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                          <User className="mr-2 h-4 w-4" />
                          Login
                        </Button>
                      </Link>
                    )}
                    
                    <Link to="/services" className="w-full" onClick={() => setIsOpen(false)}>
                      <Button variant="secondary" className="w-full">Book Now</Button>
                    </Link>
                    
                    <Button 
                      variant="ghost" 
                      className="absolute right-4 top-4 rounded-full h-8 w-8 p-0 text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
