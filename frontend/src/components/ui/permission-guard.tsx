import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, checkUserPermission, hasAnyRole, canAccessAdmin, canManageContent, type UserRole } from '@/lib/permissions';
import { AccessDenied, AdminAccessDenied, ManagerAccessDenied, ContentManagerAccessDenied } from '@/components/ui/access-denied';
import type { UserPermissions } from '@/lib/permissions';

interface PermissionGuardProps {
    children: React.ReactNode;
    requiredPermission?: keyof UserPermissions;
    requiredRole?: UserRole;
    requiredRoles?: UserRole[];
    requireAdmin?: boolean;
    requireManager?: boolean;
    requireContentManager?: boolean;
    fallback?: React.ReactNode;
    className?: string;
}

export function PermissionGuard({
    children,
    requiredPermission,
    requiredRole,
    requiredRoles,
    requireAdmin = false,
    requireManager = false,
    requireContentManager = false,
    fallback,
    className,
}: PermissionGuardProps) {
    const { user } = useAuth();

    // Check permissions based on props
    let hasAccess = true;

    if (requireAdmin) {
        hasAccess = canAccessAdmin(user);
    } else if (requireManager) {
        hasAccess = hasAnyRole(user, ['admin', 'manager']);
    } else if (requireContentManager) {
        hasAccess = canManageContent(user);
    } else if (requiredPermission) {
        hasAccess = checkUserPermission(user, requiredPermission);
    } else if (requiredRole) {
        hasAccess = hasAnyRole(user, [requiredRole]);
    } else if (requiredRoles) {
        hasAccess = hasAnyRole(user, requiredRoles);
    }

    if (!hasAccess) {
        if (fallback) {
            return <>{fallback}</>;
        }

        // Return appropriate access denied component
        if (requireAdmin) {
            return <AdminAccessDenied />;
        } else if (requireManager || requireContentManager) {
            return <ManagerAccessDenied />;
        } else {
            return <AccessDenied />;
        }
    }

    return <div className={className}>{children}</div>;
}

// Convenience components for common permission checks
export function AdminGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <PermissionGuard requireAdmin fallback={fallback}>
            {children}
        </PermissionGuard>
    );
}

export function ManagerGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <PermissionGuard requireManager fallback={fallback}>
            {children}
        </PermissionGuard>
    );
}

export function ContentManagerGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <PermissionGuard requireContentManager fallback={fallback}>
            {children}
        </PermissionGuard>
    );
}

// Hook for permission checking in components
export function usePermissions() {
    const { user } = useAuth();

    return {
        user,
        hasPermission: (permission: keyof UserPermissions) => checkUserPermission(user, permission),
        hasRole: (role: UserRole) => hasAnyRole(user, [role]),
        hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
        canAccessAdmin: () => canAccessAdmin(user),
        canManageContent: () => canManageContent(user),
    };
}
