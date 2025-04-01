
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMobile } from '@/hooks/use-mobile';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Settings, CalendarRange } from 'lucide-react';

export function NavBar() {
  const location = useLocation();
  const { isAuthenticated, user, signOut } = useAuth();
  const { isMobile } = useMobile();
  const [isScrolled, setIsScrolled] = useState(false);

  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  // Track scroll to add background to navbar when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Links for main navigation
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Book Now" },
  ];

  // Links that require authentication
  const authLinks = [
    { to: "/my-appointments", label: "My Appointments", icon: <CalendarRange className="h-4 w-4 mr-2" /> },
    { to: "/account", label: "Account", icon: <Settings className="h-4 w-4 mr-2" /> }
  ];

  // Links for admin (if needed in the future)
  const adminLinks = [
    { to: "/admin", label: "Admin Dashboard" }
  ];

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all ${
    isScrolled ? 'bg-background/95 backdrop-blur-sm border-b' : 'bg-transparent'
  }`;

  // Mobile Menu
  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col space-y-4 mt-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          
          {/* Admin link only shown if user is authenticated (simplified) */}
          {isAuthenticated && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`
                }
              >
                Admin Dashboard
              </NavLink>
              
              {authLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`
                  }
                >
                  <div className="flex items-center">
                    {link.icon}
                    {link.label}
                  </div>
                </NavLink>
              ))}
              
              <button
                onClick={signOut}
                className="flex items-center px-4 py-2 rounded-md hover:bg-muted text-left"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </>
          )}
          
          {!isAuthenticated && (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`
              }
            >
              Sign In
            </NavLink>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop Menu
  const DesktopMenu = () => (
    <div className="hidden md:flex items-center space-x-8">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-foreground'}`
          }
        >
          {link.label}
        </NavLink>
      ))}
      
      {/* Admin link without dropdown (simplified) */}
      {isAuthenticated && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-foreground'}`
          }
        >
          Admin Dashboard
        </NavLink>
      )}
    </div>
  );

  // User Menu (for desktop)
  const UserMenu = () => (
    <div className="hidden md:flex items-center">
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || ""} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{user?.email}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {authLinks.map((link) => (
                <DropdownMenuItem key={link.to} asChild>
                  <NavLink to={link.to} className="flex items-center cursor-pointer">
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild variant="outline">
          <NavLink to="/auth">Sign In</NavLink>
        </Button>
      )}
    </div>
  );

  return (
    <header className={navbarClasses}>
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center">
          <NavLink to="/" className="text-xl font-bold">
            Salon
          </NavLink>
        </div>
        
        {/* Desktop Navigation */}
        <DesktopMenu />
        
        {/* User Menu / Auth Button (desktop) */}
        <UserMenu />
        
        {/* Mobile Menu Button */}
        <MobileMenu />
      </div>
    </header>
  );
}
