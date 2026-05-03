'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserForm } from '@/components/forms/user-form';
import { DataTable } from '@/components/ui/data-table';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { AdminGuard } from '@/components/ui/permission-guard';
import { SearchBar } from '@/components/ui/search-bar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Mail,
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    Upload,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { adminAPI, type UserRead } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import { hasPermission } from '@/lib/permissions';

// User management interfaces
interface UserTableData extends UserRead {
    displayName: string;
    statusBadge: React.ReactNode;
    roleBadge: React.ReactNode;
    lastLoginFormatted: string;
    createdAtFormatted: string;
}

interface UserFilters {
    role?: string;
    status?: 'active' | 'inactive' | 'pending';
    verified?: 'verified' | 'unverified';
    search?: string;
}

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    todayRegistrations: number;
    pendingVerifications: number;
}

// Mock data for demonstration (adapted to real API schema)
const mockUsers: UserRead[] = [
    {
        id: '1',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        is_active: true,
        is_superuser: true,
        email_verified: true,
        role: { name: 'Admin', description: 'Administrator', id: 'admin-role' },
        gender: 'male',
        provider: 'email',
        follower_count: 0,
        following_count: 0,
        groups: null,
    },
    {
        id: '2',
        email: 'john.doe@university.edu',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_superuser: false,
        email_verified: true,
        role: { name: 'Student', description: 'Student', id: 'student-role' },
        gender: 'male',
        provider: 'email',
        follower_count: 0,
        following_count: 0,
        groups: null,
    },
    {
        id: '3',
        email: 'jane.smith@institution.ac.ng',
        first_name: 'Jane',
        last_name: 'Smith',
        is_active: false,
        is_superuser: false,
        email_verified: false,
        role: { name: 'Manager', description: 'Manager', id: 'manager-role' },
        gender: 'female',
        provider: 'email',
        follower_count: 0,
        following_count: 0,
        groups: null,
    },
];

const mockUserStats: UserStats = {
    total: 15420,
    active: 12845,
    inactive: 2575,
    verified: 14180,
    unverified: 1240,
    todayRegistrations: 45,
    pendingVerifications: 238,
};

export default function UsersManagementPage() {
    const { user } = useAuth();

    // Development bypass for admin access
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const bypassAuth = searchParams.get('bypass') === 'true';

    // Mock admin user for development (matching API schema)
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

    const [users, setUsers] = useState<UserRead[]>(mockUsers);
    const [stats, setStats] = useState<UserStats>(mockUserStats);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<UserFilters>({});
    const [selectedUsers, setSelectedUsers] = useState<UserRead[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRead | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Load users data
    const loadUsers = async () => {
        try {
            setLoading(true);

            // Call real API endpoints
            const [usersResponse, statsResponse] = await Promise.allSettled([
                adminAPI.users.list({
                    limit: 100,
                    search: searchQuery,
                    role: filters.role
                }),
                adminAPI.stats.getDetailed()
            ]);

            // Process users response
            if (usersResponse.status === 'fulfilled' && usersResponse.value.data) {
                const usersData = usersResponse.value.data;
                if (usersData.data && usersData.data.items && Array.isArray(usersData.data.items)) {
                    // Map to ensure compatibility with UserRead type
                    const usersWithDefaults = usersData.data.items.map(user => ({
                        ...user,
                        groups: null, // IUserReadWithoutGroups doesn't have groups
                    }));
                    setUsers(usersWithDefaults);

                    // Update stats based on users data
                    const activeUsers = usersData.data.items.filter(u => u.is_active).length;
                    const verifiedUsers = usersData.data.items.filter(u => u.email_verified).length;

                    setStats(prev => ({
                        ...prev,
                        total: usersData.data.total || usersData.data.items.length,
                        active: activeUsers,
                        inactive: usersData.data.items.length - activeUsers,
                        verified: verifiedUsers,
                        unverified: usersData.data.items.length - verifiedUsers,
                    }));
                }
            }

            console.log('Users API Response:', usersResponse);

        } catch (error) {
            console.error('Error loading users:', error);
            addNotification({
                type: 'error',
                title: 'Error Loading Users',
                message: 'Failed to load users data. Using cached data.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [searchQuery, filters]);

    // Transform users for table display
    const transformUserForTable = (user: UserRead): UserTableData => {
        const displayName = user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.email?.split('@')[0] || 'Unknown';

        const statusBadge = user.is_active ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Inactive
            </Badge>
        );

        const roleString = typeof user.role === 'string' ? user.role : user.role?.name || 'Student';
        const roleBadge = (
            <Badge
                variant={roleString === 'Admin' ? 'destructive' : roleString === 'Manager' ? 'default' : 'outline'}
            >
                {roleString}
            </Badge>
        );

        return {
            ...user,
            displayName,
            statusBadge,
            roleBadge,
            lastLoginFormatted: 'Never', // API doesn't have last_login_at field
            createdAtFormatted: 'Recently', // API doesn't have created_at field
        };
    };

    // User actions
    const handleActivateUser = async (userId: string) => {
        try {
            await adminAPI.users.activate(userId);
            addNotification({
                type: 'success',
                title: 'User Activated',
                message: 'User has been successfully activated.',
            });
            loadUsers();
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Activation Failed',
                message: 'Failed to activate user. Please try again.',
            });
        }
    };

    const handleDeactivateUser = async (userId: string) => {
        try {
            await adminAPI.users.deactivate(userId);
            addNotification({
                type: 'success',
                title: 'User Deactivated',
                message: 'User has been successfully deactivated.',
            });
            loadUsers();
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Deactivation Failed',
                message: 'Failed to deactivate user. Please try again.',
            });
        }
    };

    const handleSendVerificationEmail = async (userId: string) => {
        try {
            await adminAPI.users.sendVerificationEmail(userId);
            addNotification({
                type: 'success',
                title: 'Verification Email Sent',
                message: 'Verification email has been sent to the user.',
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Email Failed',
                message: 'Failed to send verification email. Please try again.',
            });
        }
    };

    const handleBulkSendVerification = async () => {
        try {
            const unverifiedUserIds = selectedUsers
                .filter(user => !user.email_verified)
                .map(user => user.id);

            if (unverifiedUserIds.length === 0) {
                addNotification({
                    type: 'warning',
                    title: 'No Users Selected',
                    message: 'Please select unverified users to send verification emails.',
                });
                return;
            }

            await adminAPI.users.bulkSendVerification(unverifiedUserIds);
            addNotification({
                type: 'success',
                title: 'Bulk Emails Sent',
                message: `Verification emails sent to ${unverifiedUserIds.length} users.`,
            });
            setSelectedUsers([]);
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Bulk Email Failed',
                message: 'Failed to send bulk verification emails. Please try again.',
            });
        }
    };

    // Handle user creation success
    const handleUserCreated = (newUser: UserRead) => {
        setUsers(prev => [newUser, ...prev]);
        setShowCreateDialog(false);
        loadUsers(); // Refresh the full list
    };

    // Handle user edit
    const handleEditUser = (user: UserRead) => {
        setEditingUser(user);
        setShowEditDialog(true);
    };

    // Handle user update success
    const handleUserUpdated = (updatedUser: UserRead) => {
        setUsers(prev => prev.map(user =>
            user.id === updatedUser.id ? updatedUser : user
        ));
        setShowEditDialog(false);
        setEditingUser(null);
        loadUsers(); // Refresh the full list
    };

    // Data table columns
    const columns = [
        {
            key: 'displayName' as keyof UserTableData,
            header: 'USER',
            cell: (user: UserTableData) => (
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                            {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                    </div>
                    <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'roleBadge' as keyof UserTableData,
            header: 'ROLE',
            cell: (user: UserTableData) => user.roleBadge,
        },
        {
            key: 'statusBadge' as keyof UserTableData,
            header: 'STATUS',
            cell: (user: UserTableData) => (
                <div className="flex items-center space-x-2">
                    {user.statusBadge}
                    {!user.email_verified && (
                        <Badge variant="outline" className="text-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Unverified
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'lastLoginFormatted' as keyof UserTableData,
            header: 'LAST LOGIN',
            cell: (user: UserTableData) => (
                <span className="text-sm">{user.lastLoginFormatted}</span>
            ),
        },
        {
            key: 'createdAtFormatted' as keyof UserTableData,
            header: 'JOINED',
            cell: (user: UserTableData) => (
                <span className="text-sm">{user.createdAtFormatted}</span>
            ),
        },
        {
            key: 'actions' as keyof UserTableData,
            header: '',
            cell: (user: UserTableData) => (
                <div className="flex items-center space-x-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditUser(user)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    {!user.email_verified && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSendVerificationEmail(user.id)}
                        >
                            <Mail className="h-4 w-4" />
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const tableData = users.map(transformUserForTable);

    // Bulk actions
    const bulkActions = [
        {
            label: 'Send Verification Emails',
            onClick: handleBulkSendVerification,
            icon: Mail,
            variant: 'default' as const,
        },
        {
            label: 'Export Selected',
            onClick: (selectedItems: UserTableData[]) => {
                console.log('Exporting:', selectedItems);
                addNotification({
                    type: 'info',
                    title: 'Export Started',
                    message: `Exporting ${selectedItems.length} users...`,
                });
            },
            icon: Download,
            variant: 'outline' as const,
        },
    ];

    // Check if user has admin role (using new permission system)
    const isAdmin = hasPermission(user, 'canManageUsers');

    // Debug logging
    console.log('User Management Access Check:', {
        bypassAuth,
        currentUser,
        userRole: currentUser?.role,
        isAdmin
    });

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <AdminBreadcrumb currentPage="User Management" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-muted-foreground">
                            You need administrator privileges to access user management.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <AdminBreadcrumb currentPage="User Management" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage users, roles, and permissions
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Users
                    </Button>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New User</DialogTitle>
                            </DialogHeader>
                            <UserForm
                                mode="create"
                                onSuccess={handleUserCreated}
                                onCancel={() => setShowCreateDialog(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                        <p className="text-xs text-green-600">
                            +{stats.todayRegistrations} today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {((stats.active / stats.total) * 100).toFixed(1)}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verified</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.verified.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {((stats.verified / stats.total) * 100).toFixed(1)}% verified
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.pendingVerifications}</div>
                        <p className="text-xs text-muted-foreground">
                            Need attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 max-w-sm">
                            <SearchBar
                                placeholder="Search users..."
                                onSearch={(query) => setSearchQuery(query)}
                                defaultValue={searchQuery}
                                showHistory={false}
                                showTrending={false}
                            />
                        </div>
                        <Select
                            value={filters.role || 'all'}
                            onValueChange={(value) => setFilters(prev => ({
                                ...prev,
                                role: value === 'all' ? undefined : value
                            }))}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Student">Student</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) => setFilters(prev => ({
                                ...prev,
                                status: value === 'all' ? undefined : value as any
                            }))}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            More Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <DataTable
                            data={tableData}
                            columns={columns}
                            searchable={false}
                            pagination={true}
                            pageSize={20}
                            actions={bulkActions}
                            emptyMessage="No users found"
                            className="border-0 shadow-none"
                        />
                    )}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <UserForm
                            mode="edit"
                            user={editingUser}
                            onSuccess={handleUserUpdated}
                            onCancel={() => {
                                setShowEditDialog(false);
                                setEditingUser(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}