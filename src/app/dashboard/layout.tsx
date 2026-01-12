'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/sidebar';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Plus,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Development-only: Bypass authentication for testing
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassAuth = isDevelopment && typeof window !== 'undefined' && window.location.search.includes('bypass=true');

  const handleLogoutClick = async () => {
    await logout();
    setIsProfileOpen(false);
    router.push('/auth/login');
  };

  useEffect(() => {
    // Check if we have authentication data in localStorage
    const checkAuth = () => {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed.state?.isAuthenticated && parsed.state?.user) {
            // User is authenticated, continue
            setIsInitializing(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }

      // No valid auth data, redirect to login (unless bypassing)
      setIsInitializing(false);
      if (!isAuthenticated && !bypassAuth) {
        router.push('/auth/login');
      }
    };

    // Small delay to allow Zustand to hydrate
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router, bypassAuth]);

  useEffect(() => {
    if (!isInitializing && !isLoading && !isAuthenticated && !bypassAuth) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, isInitializing, router, bypassAuth]);

  // Show loading while initializing or checking authentication
  if (isInitializing || isLoading) {
    return <LoadingPage text="Checking authentication..." />;
  }

  // Show loading while redirecting (unless bypassing)
  if (!isAuthenticated && !bypassAuth) {
    return <LoadingPage text="Redirecting to login..." />;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Handle search logic here
  };

  // Mock user data for development bypass
  const mockUser = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'admin@example.com',
    role: 'Admin',
    avatar_url: null,
  };

  const currentUser = bypassAuth ? mockUser : user;

  return (
    <div className="fixed inset-0 flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left side - Mobile menu and breadcrumb */}
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden flex-shrink-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">Dashboard</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Welcome back, {currentUser?.first_name || 'User'}</p>
                </div>
              </div>

              {/* Center - Search bar */}
              <div className="hidden md:flex flex-1 max-w-2xl">
                <SearchBar
                  placeholder="Search exam papers, questions, courses..."
                  onSearch={handleSearch}
                  defaultValue={searchQuery}
                  className="w-full"
                />
              </div>

              {/* Right side - Quick actions and user */}
              <div className="flex items-center gap-2">
                {/* Quick Actions - Desktop only */}
                <div className="hidden lg:flex items-center gap-1 mr-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Link href="/dashboard/exam-papers/create">
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="text-sm">New Paper</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Link href="/dashboard/questions/manage">
                      <HelpCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Questions</span>
                    </Link>
                  </Button>
                </div>

                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative flex-shrink-0 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/dashboard/notifications">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600"
                    >
                      3
                    </Badge>
                  </Link>
                </Button>

                {/* User profile */}
                <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 h-auto py-1.5 px-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                        <AvatarImage 
                          src={currentUser?.image?.media?.path || '/default-avatar-profile-picture-male-icon.png'} 
                          alt={currentUser?.first_name || 'User'} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                          {currentUser?.first_name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-left">
                        <div className="text-sm font-medium text-gray-900 leading-tight">
                          {currentUser?.first_name} {currentUser?.last_name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize leading-tight">
                          {currentUser?.role?.name || 'User'}
                        </div>
                      </div>
                      <ChevronDown className="hidden lg:block h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={currentUser?.image?.media?.path || '/default-avatar-profile-picture-male-icon.png'} 
                            alt={currentUser?.first_name || 'User'} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                            {currentUser?.first_name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none">
                            {currentUser?.first_name} {currentUser?.last_name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {currentUser?.email}
                          </p>
                          <Badge variant="secondary" className="w-fit text-xs capitalize">
                            {currentUser?.role?.name || 'User'}
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/progress" className="cursor-pointer">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>My Progress</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={handleLogoutClick}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile search bar */}
            <div className="md:hidden mt-3">
              <SearchBar
                placeholder="Search exam papers, questions..."
                onSearch={handleSearch}
                defaultValue={searchQuery}
              />
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 min-h-0">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
