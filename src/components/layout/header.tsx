'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

export function Header({ className, onMenuClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogoutClick = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="container mx-auto px-4 flex h-16 items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 py-1">
          <Image
            src="/exampapepel-logo-resized.png"
            alt={`${APP_CONFIG.name} Logo`}
            width={252}
            height={64}
            quality={100}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-6 ml-6">
          <Link
            href="/exampapers"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            ExamPapers
          </Link>
          <Link
            href="/questions"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Questions
          </Link>
          <Link
            href="/institutions"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Institutions
          </Link>
          {isAuthenticated && user?.role?.name && 
            (user.role.name === 'admin' || user.role.name === 'manager') && (
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User menu */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image?.url} alt={`${user?.first_name} ${user?.last_name}` || 'User'} />
                    <AvatarFallback>
                      {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogoutClick}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 