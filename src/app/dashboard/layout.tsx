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
import { cn } from '@/lib/utils';
import {
  Menu,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Development-only: Bypass authentication for testing
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassAuth = isDevelopment && typeof window !== 'undefined' && window.location.search.includes('bypass=true');

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
    <div className="h-screen flex bg-gray-50">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left side - Mobile menu and title */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>

            {/* Center - Search bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar
                placeholder="Search exams, courses..."
                onSearch={handleSearch}
                defaultValue={searchQuery}
                className="w-full"
              />
            </div>

            {/* Right side - Notifications and user */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500"
                >
                  3
                </Badge>
              </Button>

              {/* User profile */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.first_name || 'User'} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {currentUser?.first_name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {String(currentUser?.first_name || '')} {String(currentUser?.last_name || 'User')}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {String(currentUser?.role || 'Student')}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="md:hidden mt-3">
            <SearchBar
              placeholder="Search exams, courses..."
              onSearch={handleSearch}
              defaultValue={searchQuery}
            />
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
