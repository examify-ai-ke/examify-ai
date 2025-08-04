'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Edit,
    Trash2,
    Users,
    Settings,
    History,
    Search,
    MoreHorizontal,
    CheckCircle,
    AlertTriangle,
    User,
    UserCheck,
    UserX,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoleForm } from '@/components/forms/role-form';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI, type RoleRead } from '@/lib/api-admin';
import { formatDate } from '@/lib/utils';

// Types for role management
interface RoleStats {
    totalRoles: number;
    systemRoles: number;
    customRoles: number;
    usersWithRoles: number;
}

interface RoleTableData extends RoleRead {
    displayName: string;
    userCount: number;
    permissionCount: number;
    statusBadge: React.ReactNode;
    typeBadge: React.ReactNode;
    createdAtFormatted: string;
}

interface RoleFilters {
    search?: string;
    type?: 'system' | 'custom';
    status?: 'active' | 'inactive';
}

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
    isGranted: boolean;
}

interface RoleAuditEntry {
    id: string;
    action: 'create' | 'update' | 'delete' | 'assign' | 'revoke';
    roleId: string;
    roleName: string;
    userId?: string;
    userName?: string;
    timestamp: string;
    details: string;
}

// Mock data for demonstration
const mockRoles: RoleRead[] = [
    {
        id: 'admin-role',
        name: 'Admin',
        description: 'Full system administrator with all permissions'
    },
    {
        id: 'manager-role',
        name: 'Manager',
        description: 'Institution manager with limited administrative rights'
    },
    {
        id: 'student-role',
        name: 'Student',
        description: 'Standard student account with basic access rights'
    },
    {
        id: 'teacher-role',
        name: 'Teacher',
        description: 'Educator account with content management permissions'
    }
];

const mockRoleStats: RoleStats = {
    totalRoles: 4,
    systemRoles: 3,
    customRoles: 1,
    usersWithRoles: 15420
};

const mockPermissions: Permission[] = [
    // User Management
    { id: 'user.create', name: 'Create Users', description: 'Can create new user accounts', category: 'User Management', isGranted: true },
    { id: 'user.read', name: 'View Users', description: 'Can view user information', category: 'User Management', isGranted: true },
    { id: 'user.update', name: 'Edit Users', description: 'Can modify user accounts', category: 'User Management', isGranted: true },
    { id: 'user.delete', name: 'Delete Users', description: 'Can delete user accounts', category: 'User Management', isGranted: false },

    // Content Management
    { id: 'content.create', name: 'Create Content', description: 'Can create exam papers and questions', category: 'Content Management', isGranted: true },
    { id: 'content.read', name: 'View Content', description: 'Can view exam papers and questions', category: 'Content Management', isGranted: true },
    { id: 'content.update', name: 'Edit Content', description: 'Can modify exam papers and questions', category: 'Content Management', isGranted: true },
    { id: 'content.delete', name: 'Delete Content', description: 'Can delete exam papers and questions', category: 'Content Management', isGranted: false },

    // System Administration
    { id: 'system.settings', name: 'System Settings', description: 'Can modify system configuration', category: 'System Administration', isGranted: false },
    { id: 'system.backup', name: 'System Backup', description: 'Can create and restore backups', category: 'System Administration', isGranted: false },
    { id: 'system.logs', name: 'View Logs', description: 'Can access system logs and audit trails', category: 'System Administration', isGranted: false }
];

const mockAuditTrail: RoleAuditEntry[] = [
    {
        id: '1',
        action: 'assign',
        roleId: 'admin-role',
        roleName: 'Admin',
        userId: 'user-1',
        userName: 'John Doe',
        timestamp: '2024-12-19T14:30:00Z',
        details: 'Role assigned to user during account setup'
    },
    {
        id: '2',
        action: 'update',
        roleId: 'teacher-role',
        roleName: 'Teacher',
        timestamp: '2024-12-19T13:15:00Z',
        details: 'Updated role permissions for content management'
    },
    {
        id: '3',
        action: 'create',
        roleId: 'custom-role-1',
        roleName: 'Content Moderator',
        timestamp: '2024-12-19T12:00:00Z',
        details: 'Created new custom role for content moderation'
    }
];

export default function RoleManagementPage() {
    const { user } = useAuth();

    // Development bypass for admin access
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const bypassAuth = searchParams.get('bypass') === 'true';

    // Mock admin user for development
    const mockAdminUser = {
        id: 'admin-1',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        role: { name: 'Admin', description: 'Administrator', id: 'admin-role' },
        is_active: true,
        email_verified: true,
    };

    const currentUser = bypassAuth ? mockAdminUser : user;
    const { addNotification } = useUIStore();

    const [roles, setRoles] = useState<RoleRead[]>(mockRoles);
    const [stats, setStats] = useState<RoleStats>(mockRoleStats);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<RoleFilters>({});
    const [selectedRoles, setSelectedRoles] = useState<RoleRead[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleRead | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<RoleRead | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
    const [auditTrail, setAuditTrail] = useState<RoleAuditEntry[]>(mockAuditTrail);
    const [activeTab, setActiveTab] = useState('overview');

    // Load roles data
    const loadRoles = async () => {
        try {
            setLoading(true);

            // Load roles from API
            const rolesResponse = await adminAPI.roles.list();

            if (rolesResponse.data) {
                console.log('Roles API Response:', rolesResponse);
                // Process real data when available
                // For now, using mock data
            }

        } catch (error) {
            console.error('Error loading roles:', error);
            addNotification({
                type: 'error',
                title: 'Error Loading Roles',
                message: 'Failed to load roles data. Using mock data.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, [searchQuery, filters]);

    // Transform roles for table display
    const transformRoleForTable = (role: RoleRead): RoleTableData => {
        const displayName = role.name || 'Unknown Role';

        const statusBadge = (
            <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
            </Badge>
        );

        const isSystemRole = ['Admin', 'Manager', 'Student'].includes(role.name);
        const typeBadge = (
            <Badge variant={isSystemRole ? 'secondary' : 'outline'}>
                {isSystemRole ? 'System' : 'Custom'}
            </Badge>
        );

        return {
            ...role,
            displayName,
            userCount: Math.floor(Math.random() * 1000) + 10, // Mock data
            permissionCount: Math.floor(Math.random() * 20) + 5, // Mock data
            statusBadge,
            typeBadge,
            createdAtFormatted: 'Recently', // Mock data
        };
    };

    // Role actions
    const handleCreateRole = () => {
        setEditingRole(null);
        setShowCreateDialog(true);
    };

    const handleEditRole = (role: RoleRead) => {
        setEditingRole(role);
        setShowEditDialog(true);
    };

    const handleDeleteRole = async (roleId: string) => {
        try {
            await adminAPI.roles.delete(roleId);

            setRoles(prev => prev.filter(role => role.id !== roleId));

            addNotification({
                type: 'success',
                title: 'Role Deleted',
                message: 'Role has been successfully deleted.',
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to delete role. Please try again.',
            });
        }
    };

    const handleRoleCreated = (newRole: RoleRead) => {
        setRoles(prev => [...prev, newRole]);
        setShowCreateDialog(false);

        addNotification({
            type: 'success',
            title: 'Role Created',
            message: `Role "${newRole.name}" has been successfully created.`,
        });
    };

    const handleRoleUpdated = (updatedRole: RoleRead) => {
        setRoles(prev => prev.map(role =>
            role.id === updatedRole.id ? updatedRole : role
        ));
        setShowEditDialog(false);
        setEditingRole(null);

        addNotification({
            type: 'success',
            title: 'Role Updated',
            message: `Role "${updatedRole.name}" has been successfully updated.`,
        });
    };

    const handlePermissionChange = (permissionId: string, isGranted: boolean) => {
        setPermissions(prev => prev.map(permission =>
            permission.id === permissionId ? { ...permission, isGranted } : permission
        ));
    };

    // Table columns
    const columns = [
        {
            key: 'displayName' as keyof RoleTableData,
            header: 'ROLE NAME',
            cell: (role: RoleTableData) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{role.displayName}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                            {role.description}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'typeBadge' as keyof RoleTableData,
            header: 'TYPE',
            cell: (role: RoleTableData) => role.typeBadge,
        },
        {
            key: 'userCount' as keyof RoleTableData,
            header: 'USERS',
            cell: (role: RoleTableData) => (
                <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{role.userCount.toLocaleString()}</span>
                </div>
            ),
        },
        {
            key: 'permissionCount' as keyof RoleTableData,
            header: 'PERMISSIONS',
            cell: (role: RoleTableData) => (
                <div className="flex items-center space-x-1">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span>{role.permissionCount}</span>
                </div>
            ),
        },
        {
            key: 'statusBadge' as keyof RoleTableData,
            header: 'STATUS',
            cell: (role: RoleTableData) => role.statusBadge,
        },
        {
            key: 'createdAtFormatted' as keyof RoleTableData,
            header: 'CREATED',
            cell: (role: RoleTableData) => (
                <span className="text-sm text-gray-500">{role.createdAtFormatted}</span>
            ),
        },
        {
            key: 'actions' as keyof RoleTableData,
            header: 'ACTIONS',
            cell: (role: RoleTableData) => (
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                            setSelectedRole(role);
                            setActiveTab('permissions');
                        }}
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditRole(role)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteRole(role.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // Bulk actions
    const bulkActions = [
        {
            label: 'Delete Selected',
            onClick: (selectedItems: RoleTableData[]) => {
                console.log('Bulk delete roles:', selectedItems);
                addNotification({
                    type: 'info',
                    title: 'Bulk Delete Started',
                    message: `Deleting ${selectedItems.length} roles...`,
                });
            },
            icon: Trash2,
            variant: 'destructive' as const,
        },
    ];

    // Check if user has admin role
    const isAdmin = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'admin' || currentUser?.role === 'Admin')
        : (currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'Admin');

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <AdminBreadcrumb currentPage="Role Management" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-muted-foreground">
                            You need administrator privileges to access this page.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <AdminBreadcrumb currentPage="Role Management" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                    <p className="text-muted-foreground">
                        Manage user roles and permissions across the system
                    </p>
                </div>
                <Button onClick={handleCreateRole} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="users">User Assignments</TabsTrigger>
                    <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalRoles}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active across the system
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Roles</CardTitle>
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.systemRoles}</div>
                                <p className="text-xs text-muted-foreground">
                                    Built-in roles
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.customRoles}</div>
                                <p className="text-xs text-muted-foreground">
                                    User-defined roles
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.usersWithRoles.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    Users with assigned roles
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Roles Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Roles</CardTitle>
                            <CardDescription>
                                Manage and configure user roles in the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                data={roles.map(transformRoleForTable)}
                                columns={columns}
                                searchable
                                filterable
                                pagination
                                actions={bulkActions}
                                loading={loading}
                                emptyMessage="No roles found"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="space-y-6">
                    {selectedRole && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Managing permissions for role: <strong>{selectedRole.name}</strong>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Role Permissions</CardTitle>
                            <CardDescription>
                                Configure permissions for the selected role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Permission Categories */}
                            {Object.entries(
                                permissions.reduce((acc, permission) => {
                                    if (!acc[permission.category]) {
                                        acc[permission.category] = [];
                                    }
                                    acc[permission.category].push(permission);
                                    return acc;
                                }, {} as Record<string, Permission[]>)
                            ).map(([category, categoryPermissions]) => (
                                <div key={category} className="space-y-4">
                                    <h3 className="text-lg font-semibold">{category}</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {categoryPermissions.map((permission) => (
                                            <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="font-medium">{permission.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {permission.description}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={permission.isGranted}
                                                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                                        className="rounded border-gray-300"
                                                    />
                                                    {permission.isGranted ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <UserX className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* User Assignments Tab */}
                <TabsContent value="users" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Role Assignments</CardTitle>
                            <CardDescription>
                                Manage which users are assigned to each role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">User Assignments</h3>
                                <p className="text-muted-foreground mb-4">
                                    This feature will show users assigned to each role and allow bulk role assignments.
                                </p>
                                <Button variant="outline">
                                    View User Assignments
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Audit Trail Tab */}
                <TabsContent value="audit" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Audit Trail</CardTitle>
                            <CardDescription>
                                Track all role-related changes and assignments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {auditTrail.map((entry) => (
                                    <div key={entry.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                                        <div className="flex-shrink-0">
                                            {entry.action === 'create' && <Plus className="h-5 w-5 text-green-600" />}
                                            {entry.action === 'update' && <Edit className="h-5 w-5 text-blue-600" />}
                                            {entry.action === 'delete' && <Trash2 className="h-5 w-5 text-red-600" />}
                                            {entry.action === 'assign' && <UserCheck className="h-5 w-5 text-green-600" />}
                                            {entry.action === 'revoke' && <UserX className="h-5 w-5 text-orange-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{entry.roleName}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {entry.action}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {entry.details}
                                            </p>
                                            {entry.userName && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    User: {entry.userName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatDate(entry.timestamp)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Role Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>Create New Role</DialogTitle>
                        <DialogDescription>
                            Create a new user role with specific permissions and settings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <RoleForm
                            mode="create"
                            onSuccess={handleRoleCreated}
                            onCancel={() => setShowCreateDialog(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            Modify role details and permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-2">
                        {editingRole && (
                            <RoleForm
                                role={editingRole}
                                mode="edit"
                                onSuccess={handleRoleUpdated}
                                onCancel={() => {
                                    setShowEditDialog(false);
                                    setEditingRole(null);
                                }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}