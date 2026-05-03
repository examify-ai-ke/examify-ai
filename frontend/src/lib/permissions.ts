import type { components } from '@/types/generated/api';

// User type from API schema
type UserRead = components['schemas']['UserRead'];

/**
 * User permissions interface
 */
export interface UserPermissions {
    canViewAdmin: boolean;
    canManageUsers: boolean;
    canManageRoles: boolean;
    canManageInstitutions: boolean;
    canManageFaculties: boolean;
    canManageDepartments: boolean;
    canManageExamPapers: boolean;
    canManageQuestions: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canCreateContent: boolean;
    canEditContent: boolean;
    canDeleteContent: boolean;
}

/**
 * Permission utility system for role-based access control
 * Provides centralized, type-safe permission checking across the application
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  SUPERUSER: 'superuser',
  STUDENT: 'student',
  GUEST: 'guest',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Normalize role string to lowercase for consistent comparison
 * Handles both direct role strings and role objects
 */
export function normalizeRole(role: string | undefined | { name?: string }): UserRole | null {
  if (!role) return null;

  let roleString: string;
  if (typeof role === 'string') {
    roleString = role;
  } else if (typeof role === 'object' && role.name) {
    roleString = role.name;
  } else {
    return null;
  }

  const normalized = roleString.toLowerCase();
  
  // Map common role variations to standard roles
  if (normalized === 'admin' || normalized === 'administrator') {
    return USER_ROLES.ADMIN;
  }
  if (normalized === 'manager' || normalized === 'content_manager') {
    return USER_ROLES.MANAGER;
  }
  if (normalized === 'superuser' || normalized === 'super_user') {
    return USER_ROLES.SUPERUSER;
  }
  if (normalized === 'user') {
    return USER_ROLES.USER;
  }
  if (normalized === 'student' || normalized === 'learner') {
    return USER_ROLES.STUDENT;
  }
  if (normalized === 'guest') {
    return USER_ROLES.GUEST;
  }

  return null;
}

/**
 * Check if a role is admin (admin or superuser)
 */
export function isAdmin(role: string | undefined | { name?: string }): boolean {
  const normalized = normalizeRole(role);
  return normalized === USER_ROLES.ADMIN || normalized === USER_ROLES.SUPERUSER;
}

/**
 * Check if a role is manager
 */
export function isManager(role: string | undefined | { name?: string }): boolean {
  const normalized = normalizeRole(role);
  return normalized === USER_ROLES.MANAGER;
}

/**
 * Check if a role is admin or manager
 */
export function isAdminOrManager(role: string | undefined | { name?: string }): boolean {
  return isAdmin(role) || isManager(role);
}

/**
 * Check if a role is superuser
 */
export function isSuperuser(role: string | undefined | { name?: string }): boolean {
  const normalized = normalizeRole(role);
  return normalized === USER_ROLES.SUPERUSER;
}

/**
 * Check if a role is regular user
 */
export function isUser(role: string | undefined | { name?: string }): boolean {
  const normalized = normalizeRole(role);
  return normalized === USER_ROLES.USER;
}

/**
 * Get role hierarchy level (higher = more permissions)
 */
export function getRoleHierarchy(role: string | undefined | { name?: string }): number {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case USER_ROLES.SUPERUSER:
      return 4;
    case USER_ROLES.ADMIN:
      return 3;
    case USER_ROLES.MANAGER:
      return 2;
    case USER_ROLES.USER:
      return 1;
    default:
      return 0;
  }
}

/**
 * Check if user has required role or higher in hierarchy
 */
export function hasRoleOrHigher(
  userRole: string | undefined | { name?: string },
  requiredRole: UserRole
): boolean {
  const userHierarchy = getRoleHierarchy(userRole);
  const requiredHierarchy = getRoleHierarchy(requiredRole);
  return userHierarchy >= requiredHierarchy;
}

/**
 * Permission definitions for different routes/features
 */
export const PERMISSIONS: Record<string, { roles: UserRole[]; description: string }> = {
  // Dashboard access
  DASHBOARD_ACCESS: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    description: 'Access to dashboard',
  },
  
  // Admin panel access
  ADMIN_PANEL_ACCESS: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.SUPERUSER],
    description: 'Access to admin panel',
  },

  // User management
  VIEW_USERS: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.SUPERUSER],
    description: 'View all users',
  },
  CREATE_USER: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.SUPERUSER],
    description: 'Create new users',
  },
  EDIT_USER: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.SUPERUSER],
    description: 'Edit user details',
  },
  DELETE_USER: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.SUPERUSER],
    description: 'Delete users',
  },

  // Exam paper management
  VIEW_EXAM_PAPERS: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER],
    description: 'View exam papers',
  },
  CREATE_EXAM_PAPER: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    description: 'Create new exam papers',
  },
  EDIT_EXAM_PAPER: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    description: 'Edit exam papers',
  },
  DELETE_EXAM_PAPER: {
    roles: [USER_ROLES.ADMIN],
    description: 'Delete exam papers',
  },

  // Questions management
  VIEW_QUESTIONS: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER],
    description: 'View questions',
  },
  CREATE_QUESTION: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    description: 'Create new questions',
  },
  EDIT_QUESTION: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    description: 'Edit questions',
  },
  DELETE_QUESTION: {
    roles: [USER_ROLES.ADMIN],
    description: 'Delete questions',
  },

  // Institutions management
  VIEW_INSTITUTIONS: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER],
    description: 'View institutions',
  },
  CREATE_INSTITUTION: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    description: 'Create new institutions',
  },
  EDIT_INSTITUTION: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    description: 'Edit institutions',
  },
  DELETE_INSTITUTION: {
    roles: [USER_ROLES.ADMIN],
    description: 'Delete institutions',
  },

  // Analytics
  VIEW_ANALYTICS: {
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    description: 'View analytics',
  },

  // Settings
  MANAGE_SETTINGS: {
    roles: [USER_ROLES.ADMIN],
    description: 'Manage application settings',
  },
} as const;

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(
  userRole: string | undefined | { name?: string },
  permission: keyof typeof PERMISSIONS
): boolean {
  const perm = PERMISSIONS[permission];
  if (!perm) {
    console.warn(`Unknown permission: ${permission}`);
    return false;
  }

  const normalized = normalizeRole(userRole);
  return perm.roles.includes(normalized as UserRole);
}

/**
 * Get all permissions for a given role
 */
export function getPermissionsForRole(role: string | undefined | { name?: string }): string[] {
  const normalized = normalizeRole(role);
  const permissions: string[] = [];

  (Object.keys(PERMISSIONS) as Array<keyof typeof PERMISSIONS>).forEach((permKey) => {
    if (PERMISSIONS[permKey].roles.includes(normalized as UserRole)) {
      permissions.push(permKey);
    }
  });

  return permissions;
}

/**
 * Check if user can perform action on a resource
 * Can be extended for more granular resource-based access control
 */
export function canAccessResource(
  userRole: string | undefined | { name?: string },
  resourceType: 'exam_paper' | 'question' | 'institution' | 'user',
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean {
  const permissionKey = `${action.toUpperCase()}_${resourceType.toUpperCase()}` as keyof typeof PERMISSIONS;
  return hasPermission(userRole, permissionKey);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: string | undefined | { name?: string }): string {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case USER_ROLES.SUPERUSER:
      return 'Superuser';
    case USER_ROLES.ADMIN:
      return 'Administrator';
    case USER_ROLES.MANAGER:
      return 'Manager';
    case USER_ROLES.USER:
      return 'User';
    default:
      return 'Unknown Role';
  }
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: string | undefined | { name?: string }): string {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case USER_ROLES.SUPERUSER:
      return 'bg-red-100 text-red-800';
    case USER_ROLES.ADMIN:
      return 'bg-purple-100 text-purple-800';
    case USER_ROLES.MANAGER:
      return 'bg-blue-100 text-blue-800';
    case USER_ROLES.USER:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get user permissions based on their role
 */
export function getUserPermissions(user: UserRead | null | undefined): UserPermissions {
    const role = normalizeUserRole(user);

    switch (role) {
        case 'admin':
            return {
                canViewAdmin: true,
                canManageUsers: true,
                canManageRoles: true,
                canManageInstitutions: true,
                canManageFaculties: true,
                canManageDepartments: true,
                canManageExamPapers: true,
                canManageQuestions: true,
                canViewReports: true,
                canManageSettings: true,
                canCreateContent: true,
                canEditContent: true,
                canDeleteContent: true,
            };

        case 'manager':
            return {
                canViewAdmin: false,
                canManageUsers: false,
                canManageRoles: false,
                canManageInstitutions: true,
                canManageFaculties: true,
                canManageDepartments: true,
                canManageExamPapers: true,
                canManageQuestions: true,
                canViewReports: true,
                canManageSettings: false,
                canCreateContent: true,
                canEditContent: true,
                canDeleteContent: false,
            };

        case 'student':
            return {
                canViewAdmin: false,
                canManageUsers: false,
                canManageRoles: false,
                canManageInstitutions: false,
                canManageFaculties: false,
                canManageDepartments: false,
                canManageExamPapers: false,
                canManageQuestions: false,
                canViewReports: false,
                canManageSettings: false,
                canCreateContent: false,
                canEditContent: false,
                canDeleteContent: false,
            };

        default: // guest
            return {
                canViewAdmin: false,
                canManageUsers: false,
                canManageRoles: false,
                canManageInstitutions: false,
                canManageFaculties: false,
                canManageDepartments: false,
                canManageExamPapers: false,
                canManageQuestions: false,
                canViewReports: false,
                canManageSettings: false,
                canCreateContent: false,
                canEditContent: false,
                canDeleteContent: false,
            };
    }
}

/**
 * Normalize user role from different possible formats
 */
export function normalizeUserRole(user: UserRead | null | undefined): UserRole {
    if (!user) return 'guest';

    // Handle different role formats
    const role = typeof user.role === 'string'
        ? user.role
        : user.role?.name;

    if (!role) return 'guest';

    // Normalize to lowercase and handle variations
    const normalizedRole = role.toLowerCase();

    switch (normalizedRole) {
        case 'admin':
        case 'administrator':
            return 'admin';
        case 'manager':
        case 'content_manager':
        case 'exam_manager':
            return 'manager';
        case 'student':
        case 'learner':
            return 'student';
        default:
            return 'guest';
    }
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserRead | null | undefined, role: UserRole): boolean {
    return normalizeUserRole(user) === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserRead | null | undefined, roles: UserRole[]): boolean {
    const userRole = normalizeUserRole(user);
    return roles.includes(userRole);
}

/**
 * Check if user has a specific permission (by UserPermissions key)
 */
export function checkUserPermission(
    user: UserRead | null | undefined,
    permission: keyof ReturnType<typeof getUserPermissions>
): boolean {
    const permissions = getUserPermissions(user);
    return permissions[permission];
}

/**
 * Check if user can access admin areas
 */
export function canAccessAdmin(user: UserRead | null | undefined): boolean {
    return hasAnyRole(user, ['admin']);
}

/**
 * Check if user can manage content (institutions, papers, questions)
 */
export function canManageContent(user: UserRead | null | undefined): boolean {
    return hasAnyRole(user, ['admin', 'manager']);
}

/**
 * Check if user can create content
 */
export function canCreateContent(user: UserRead | null | undefined): boolean {
    return checkUserPermission(user, 'canCreateContent');
}

/**
 * Check if user can edit content
 */
export function canEditContent(user: UserRead | null | undefined): boolean {
    return checkUserPermission(user, 'canEditContent');
}

/**
 * Check if user can delete content
 */
export function canDeleteContent(user: UserRead | null | undefined): boolean {
    return checkUserPermission(user, 'canDeleteContent');
}

/**
 * Get user display info
 */
export function getUserDisplayInfo(user: UserRead | null | undefined) {
    if (!user) {
        return {
            name: 'Guest User',
            email: 'guest@example.com',
            role: 'guest' as UserRole,
            displayRole: 'Guest',
        };
    }

    const role = normalizeUserRole(user);
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1);

    return {
        name: user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.email || 'Unknown User',
        email: user.email || 'unknown@example.com',
        role,
        displayRole,
    };
}
