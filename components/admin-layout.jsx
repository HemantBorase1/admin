"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Store, ImageIcon, Beaker, Newspaper, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout, getCurrentUser } from "@/lib/auth"

// Navigation configuration
const NAVIGATION_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Farmers", href: "/farmers", icon: Users },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Banners", href: "/banners", icon: ImageIcon },
  { name: "Organic Products", href: "/organic-products", icon: Beaker },
  { name: "News", href: "/news", icon: Newspaper },
];

// Custom hook for user management
const useUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return { currentUser, loading, handleLogout };
};

// Navigation item component
const NavigationItem = ({ item, isActive, onClick }) => (
  <Link
    href={item.href}
    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive 
        ? "bg-green-100 text-green-900" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`}
    onClick={onClick}
  >
    <item.icon className="mr-3 h-5 w-5" />
    {item.name}
  </Link>
);

// Mobile sidebar component
const MobileSidebar = ({ sidebarOpen, setSidebarOpen, pathname }) => (
  <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
      onClick={() => setSidebarOpen(false)} 
    />
    <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white transform transition-transform">
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <h1 className="text-xl font-bold text-green-600">AgriAdmin</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSidebarOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </Button>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => (
          <NavigationItem
            key={item.name}
            item={item}
            isActive={pathname === item.href}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </nav>
    </div>
  </div>
);

// Desktop sidebar component
const DesktopSidebar = ({ pathname }) => (
  <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
    <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-4 border-b">
        <h1 className="text-xl font-bold text-green-600">AgriAdmin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => (
          <NavigationItem
            key={item.name}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </div>
  </div>
);

// User dropdown component
const UserDropdown = ({ currentUser, handleLogout }) => {
  const userInitials = useMemo(() => {
    if (!currentUser?.username) return 'A';
    return currentUser.username.charAt(0).toUpperCase();
  }, [currentUser?.username]);

  const userDisplayName = useMemo(() => {
    return currentUser?.username || 'Admin User';
  }, [currentUser?.username]);

  const userRole = useMemo(() => {
    return currentUser?.role || 'admin';
  }, [currentUser?.role]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userDisplayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Top header component
const TopHeader = ({ sidebarOpen, setSidebarOpen, currentUser, handleLogout }) => (
  <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
    <Button 
      variant="ghost" 
      size="sm" 
      className="lg:hidden" 
      onClick={() => setSidebarOpen(true)}
      aria-label="Open sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>

    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
      <div className="flex-1"></div>
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <UserDropdown currentUser={currentUser} handleLogout={handleLogout} />
      </div>
    </div>
  </div>
);

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, loading, handleLogout } = useUser();

  // Memoized sidebar toggle handler
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Don't render until user is loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <MobileSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        pathname={pathname} 
      />

      {/* Desktop sidebar */}
      <DesktopSidebar pathname={pathname} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <TopHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          currentUser={currentUser} 
          handleLogout={handleLogout} 
        />

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
