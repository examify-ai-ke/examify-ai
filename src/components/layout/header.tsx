'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut, Settings, Bell, Sun, Moon } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const icons = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
  };

  const nextTheme = theme === 'light' ? 'dark' : 'light';
  
  // Handle case where system might still be briefly loaded/cached
  const currentIcon = theme === 'dark' ? icons.dark : icons.light;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(nextTheme)}
      className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={`Switch to ${nextTheme} mode`}
    >
      {currentIcon}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function Header({ className, onMenuClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const handleLogoutClick = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
      className
    )}>
      <div className="container mx-auto px-4 flex h-16 items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="mr-1 md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center py-1 shrink-0">
          <Image
            src="/exampapepel-logo-resized.png"
            alt={`${APP_CONFIG.name} Logo`}
            width={252}
            height={64}
            quality={100}
            className="h-14 w-auto object-contain dark:brightness-110"
            priority
          />
        </Link>

        {/* Navigation – Desktop */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {[
            { href: '/exampapers', label: 'ExamPapers' },
            { href: '/questions', label: 'Questions' },
            { href: '/institutions', label: 'Institutions' },
          ].map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-all duration-200 px-3 py-2 rounded-sm flex items-center gap-1.5',
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:-translate-y-0.5',
                  'active:scale-95'
                )}
              >
                {label}
              </Link>
            );
          })}
          {isAuthenticated && user?.role?.name &&
            (user.role.name === 'admin' || user.role.name === 'manager') && (
              <Link
                href="/dashboard"
                className={cn(
                  'text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg',
                  pathname === '/dashboard'
                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:-translate-y-0.5',
                  'active:scale-95'
                )}
              >
                Dashboard
              </Link>
            )}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                asChild
              >
                <Link href="/dashboard/notifications">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>
              <span className="hidden md:inline-block text-sm font-medium text-muted-foreground">
                Hi, {user?.last_name || user?.first_name || 'User'}
              </span>
              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <UserAvatar user={user} size="sm" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">
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
                    <Link href="/profile" className="cursor-pointer">
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
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}