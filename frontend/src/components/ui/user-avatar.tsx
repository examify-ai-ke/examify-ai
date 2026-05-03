'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    image?: {
      media?: {
        link?: string | null;
        path?: string | null;
      } | null;
    } | null;
  } | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-2xl',
};

/**
 * UserAvatar Component
 * 
 * A robust avatar component that handles:
 * - Image loading from API
 * - Fallback to user initials
 * - Error handling
 * - URL formatting (relative/absolute)
 * - Default avatar image
 * 
 * @param user - User object containing image and name data
 * @param className - Additional CSS classes
 * @param size - Avatar size (sm, md, lg, xl)
 * @param showFallback - Whether to show fallback on error (default: true)
 */
export function UserAvatar({ 
  user, 
  className, 
  size = 'md',
  showFallback = true 
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  /**
   * Formats the image URL to be absolute
   * Handles both relative and absolute URLs
   */
  const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    
    // If it's already an absolute URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Otherwise, prepend the API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${formattedPath}`;
  };

  const imageUrl = getImageUrl(user?.image?.media?.link);
  const fallbackText = user?.first_name?.charAt(0)?.toUpperCase() 
    || user?.email?.charAt(0)?.toUpperCase() 
    || 'U';

  // Determine what to show
  const shouldShowImage = !imageError && imageUrl;
  const shouldShowDefault = !shouldShowImage && !showFallback;

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {shouldShowImage ? (
        <AvatarImage 
          src={imageUrl}
          alt={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
          onError={(e) => {
            console.error('❌ Failed to load avatar image:', imageUrl);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('✅ Avatar image loaded successfully:', imageUrl);
          }}
        />
      ) : shouldShowDefault ? (
        <AvatarImage 
          src="/default-avatar-profile-picture-male-icon.png"
          alt="Default avatar"
        />
      ) : null}
      {showFallback && (
        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
          {fallbackText}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
