import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumb({
  items,
  className,
  showHome = true
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: 'Home', href: '/', icon: Home }, ...items]
    : items;

  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}>
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const Icon = item.icon;

        if (isLast) {
          return (
            <span key={index} className="flex items-center space-x-1">
              {Icon && <Icon className="h-4 w-4" />}
              <span className="font-medium text-foreground">{item.label}</span>
            </span>
          );
        }

        return (
          <div key={index} className="flex items-center space-x-1">
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center space-x-1 hover:text-foreground transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center space-x-1">
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </span>
            )}
            <ChevronRight className="h-4 w-4" />
          </div>
        );
      })}
    </nav>
  );
}

// Predefined breadcrumb patterns
export function DashboardBreadcrumb({
  currentPage
}: {
  currentPage: string;
}) {
  return (
    <Breadcrumb
      items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: currentPage }
      ]}
    />
  );
}

export function PapersBreadcrumb({
  currentPage,
  paperTitle
}: {
  currentPage: string;
  paperTitle?: string;
}) {
  const items = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Exam Papers', href: '/dashboard/papers' },
    { label: currentPage }
  ];

  if (paperTitle) {
    items.splice(2, 0, { label: paperTitle });
  }

  return <Breadcrumb items={items} />;
}

export function AdminBreadcrumb({
  currentPage,
  items
}: {
  currentPage: string;
  items?: BreadcrumbItem[];
}) {
  const defaultItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Admin', href: '/dashboard/admin' },
  ];

  const breadcrumbItems = items ? [...defaultItems, ...items] : defaultItems;
  
  return (
    <Breadcrumb
      items={[
        ...breadcrumbItems,
        { label: currentPage }
      ]}
    />
  );
} 