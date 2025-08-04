'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { USER_ROLES, STORAGE_KEYS } from '@/lib/constants';
import { storage } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  FileText,
  Building,
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  Plus,
  GraduationCap,
  LogOut,
  User,
  Bell,
  Menu,
  X,
  Shield,
  Edit,
  FolderOpen,
  Archive,
  TrendingUp,
  Database,
  Book,
  School,
  MapPin,
  HelpCircle,
  CheckCircle,
  Upload
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  children?: Omit<NavItem, 'children'>[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Exam Papers',
    href: '/dashboard/exam-papers',
    icon: BookOpen,
    children: [
      {
        title: 'Browse Papers',
        href: '/dashboard/exam-papers',
        icon: Search,
      },
      {
        title: 'My Favorites',
        href: '/dashboard/exam-papers/favorites',
        icon: FileText,
      },
      {
        title: 'Recent Papers',
        href: '/dashboard/exam-papers/recent',
        icon: TrendingUp,
      },
      {
        title: 'Manage Papers',
        href: '/dashboard/exam-papers/manage',
        icon: FolderOpen,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Create Paper',
        href: '/dashboard/exam-papers/create',
        icon: Plus,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Draft Papers',
        href: '/dashboard/exam-papers/drafts',
        icon: Edit,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Archived Papers',
        href: '/dashboard/exam-papers/archived',
        icon: Archive,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
    ],
  },
  {
    title: 'Institutions',
    href: '/dashboard/institutions',
    icon: Building,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    children: [
      {
        title: 'All Institutions',
        href: '/dashboard/institutions',
        icon: Building,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Manage Institutions',
        href: '/dashboard/institutions/manage',
        icon: Settings,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Faculties',
        href: '/dashboard/institutions/faculties',
        icon: School,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Departments',
        href: '/dashboard/institutions/departments',
        icon: Book,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Courses',
        href: '/dashboard/institutions/courses',
        icon: GraduationCap,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
    ],
  },
  {
    title: 'Questions Bank',
    href: '/dashboard/questions',
    icon: HelpCircle,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    children: [
      {
        title: 'All Questions',
        href: '/dashboard/questions',
        icon: HelpCircle,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Manage Questions',
        href: '/dashboard/questions/manage',
        icon: Settings,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Question Sets',
        href: '/dashboard/questions/sets',
        icon: FolderOpen,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Answers Management',
        href: '/dashboard/questions/answers',
        icon: CheckCircle,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Import Questions',
        href: '/dashboard/questions/import',
        icon: Upload,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
    ],
  },
  {
    title: 'Administration',
    href: '/dashboard/admin',
    icon: Shield,
    roles: [USER_ROLES.ADMIN],
    children: [
      {
        title: 'Overview',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'User Management',
        href: '/dashboard/admin/users',
        icon: Users,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'Role Management',
        href: '/dashboard/admin/roles',
        icon: Shield,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'System Settings',
        href: '/dashboard/admin/settings',
        icon: Settings,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'Analytics',
        href: '/dashboard/admin/analytics',
        icon: BarChart3,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'Data Management',
        href: '/dashboard/admin/data',
        icon: Database,
        roles: [USER_ROLES.ADMIN],
      },
    ],
  },
  {
    title: 'My Progress',
    href: '/dashboard/progress',
    icon: TrendingUp,
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
];

export function Sidebar({
  className,
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = storage.get(STORAGE_KEYS.sidebarCollapsed);
    if (savedState === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    storage.set(STORAGE_KEYS.sidebarCollapsed, newState.toString());
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isExpanded = (href: string) => {
    return expandedItems.includes(href);
  };

  // Get current user with development bypass (similar to layout.tsx)
  const currentUser = user || {
    role: { name: 'Admin' },
    email: 'admin@dev.local',
    name: 'Admin User'
  };

  const userRole = typeof currentUser?.role === 'string'
    ? currentUser?.role?.toLowerCase()
    : currentUser?.role?.name?.toLowerCase() || 'user';

  // Debug logging for role detection
  console.log('🔍 Sidebar Debug:', {
    currentUser,
    userRole,
    totalNavItems: navItems.length,
    filteredNavItems: navItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    }).length
  });

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const handleLogoutClick = async () => {
    await logout();
  };

  return (
    <aside className={cn(
      'flex flex-col bg-gray-900 text-white transition-all duration-300 h-full',
      isCollapsed ? 'w-16' : 'w-64',
      'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full',
      'md:relative md:translate-x-0',
      className
    )}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white">ExamPrep</span>
          </Link>
        )}

        {/* Mobile close button */}
        {isMobileOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            className="md:hidden text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop collapse button */}
        {!isMobileOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="hidden md:flex h-8 w-8 p-0 text-white hover:bg-gray-800"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isItemActive = isActive(item.href);
          const isItemExpanded = isExpanded(item.href);

          return (
            <div key={item.href}>
              <Link
                href={hasChildren ? '#' : item.href}
                onClick={hasChildren ? (e) => {
                  e.preventDefault();
                  toggleExpanded(item.href);
                } : undefined}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isItemActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                  isCollapsed && 'justify-center'
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && (
                  <>
                    <span>{item.title}</span>
                    {hasChildren && (
                      <ChevronRight
                        className={cn(
                          'ml-auto h-4 w-4 transition-transform',
                          isItemExpanded && 'rotate-90'
                        )}
                      />
                    )}
                  </>
                )}
              </Link>

              {/* Children */}
              {hasChildren && !isCollapsed && isItemExpanded && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.children!
                    .filter(child => {
                      if (!child.roles) return true;
                      return child.roles.includes(userRole);
                    })
                    .map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = isActive(child.href);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            isChildActive
                              ? 'bg-blue-600/20 text-blue-300'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          )}
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span>{child.title}</span>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section with logout */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogoutClick}
          className={cn(
            'w-full text-gray-300 hover:bg-gray-800 hover:text-white',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </aside>
  );
} 