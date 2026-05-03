// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

// Helper function to normalize role checking
export function normalizeRole(role: string | undefined): string | null {
  if (!role) return null;
  return role.toLowerCase();
}

export function isAdminOrManager(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === USER_ROLES.ADMIN || normalized === USER_ROLES.MANAGER;
}

export function isAdmin(role: string | undefined): boolean {
  return normalizeRole(role) === USER_ROLES.ADMIN;
}

export function isManager(role: string | undefined): boolean {
  return normalizeRole(role) === USER_ROLES.MANAGER;
}
