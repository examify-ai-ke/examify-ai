'use client';

import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: 'full' | 'overlay' | 'inline';
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  variant = 'overlay',
  className,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  const variants = {
    full: 'fixed inset-0 z-50 bg-white',
    overlay: 'absolute inset-0 z-10 bg-white/80 backdrop-blur-sm',
    inline: 'relative py-8',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        variants[variant],
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
        
        {/* Message */}
        {message && (
          <p className="text-sm text-gray-600 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
