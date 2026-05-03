/**
 * Base card component for public pages
 * Provides consistent styling and structure for all card types
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BaseCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function BaseCard({
  title,
  description,
  children,
  footer,
  variant = 'default',
  className,
  onClick,
  hoverable = true,
}: BaseCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-200',
        hoverable && 'hover:shadow-lg hover:scale-[1.02]',
        onClick && 'cursor-pointer',
        variant === 'outline' && 'border-2',
        variant === 'ghost' && 'border-none shadow-none',
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="line-clamp-2">{title}</CardTitle>}
          {description && (
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          )}
        </CardHeader>
      )}
      
      <CardContent>{children}</CardContent>
      
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
