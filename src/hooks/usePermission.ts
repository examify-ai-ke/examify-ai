'use client'

import { useAuth } from '@/hooks/useAuth';
import {
  hasPermission,
  isAdmin,
  isManager,
  isAdminOrManager,
  normalizeRole,
  getPermissionsForRole,
  PERMISSIONS,
  USER_ROLES,
  type UserRole,
} from '@/lib/permissions';

/**
 * Hook to check permissions based on user role
 * Provides easy access to permission checking functions
 */
export function usePermission() {
  const { user } = useAuth();

  const userRole = user?.role;

  return {
    // Check specific permissions
    hasPermission: (permission: keyof typeof PERMISSIONS) =>
      hasPermission(userRole, permission),

    // Check role types
    isAdmin: () => isAdmin(userRole),
    isManager: () => isManager(userRole),
    isAdminOrManager: () => isAdminOrManager(userRole),

    // Get user role info
    normalizedRole: () => normalizeRole(userRole),
    userPermissions: () => getPermissionsForRole(userRole),

    // Resource-level checks (from permissions utility)
    canViewExamPapers: () => hasPermission(userRole, 'VIEW_EXAM_PAPERS'),
    canCreateExamPaper: () => hasPermission(userRole, 'CREATE_EXAM_PAPER'),
    canEditExamPaper: () => hasPermission(userRole, 'EDIT_EXAM_PAPER'),
    canDeleteExamPaper: () => hasPermission(userRole, 'DELETE_EXAM_PAPER'),

    canViewQuestions: () => hasPermission(userRole, 'VIEW_QUESTIONS'),
    canCreateQuestion: () => hasPermission(userRole, 'CREATE_QUESTION'),
    canEditQuestion: () => hasPermission(userRole, 'EDIT_QUESTION'),
    canDeleteQuestion: () => hasPermission(userRole, 'DELETE_QUESTION'),

    canViewInstitutions: () => hasPermission(userRole, 'VIEW_INSTITUTIONS'),
    canCreateInstitution: () => hasPermission(userRole, 'CREATE_INSTITUTION'),
    canEditInstitution: () => hasPermission(userRole, 'EDIT_INSTITUTION'),
    canDeleteInstitution: () => hasPermission(userRole, 'DELETE_INSTITUTION'),

    canViewUsers: () => hasPermission(userRole, 'VIEW_USERS'),
    canCreateUser: () => hasPermission(userRole, 'CREATE_USER'),
    canEditUser: () => hasPermission(userRole, 'EDIT_USER'),
    canDeleteUser: () => hasPermission(userRole, 'DELETE_USER'),

    canAccessDashboard: () => hasPermission(userRole, 'DASHBOARD_ACCESS'),
    canAccessAdmin: () => hasPermission(userRole, 'ADMIN_PANEL_ACCESS'),
    canViewAnalytics: () => hasPermission(userRole, 'VIEW_ANALYTICS'),
    canManageSettings: () => hasPermission(userRole, 'MANAGE_SETTINGS'),
  };
}
