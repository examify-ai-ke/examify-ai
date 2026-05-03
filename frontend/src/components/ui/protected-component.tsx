'use client'

import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/lib/permissions';

interface ProtectedComponentProps {
  children: React.ReactNode;
  permission: keyof typeof PERMISSIONS;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Component wrapper that conditionally renders based on user permissions
 */
export function ProtectedComponent({
  children,
  permission,
  fallback = null,
  className,
}: ProtectedComponentProps) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}
