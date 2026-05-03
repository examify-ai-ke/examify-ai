'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    Shield,
    AlertCircle,
    CheckCircle,
    Users,
    Settings,
    FileText,
    Database,
    Lock
} from 'lucide-react';
import { adminAPI, type RoleRead } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';

// Role form validation schema
const roleFormSchema = z.object({
    name: z.string()
        .min(2, 'Role name must be at least 2 characters')
        .max(50, 'Role name must not exceed 50 characters')
        .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Role name can only contain letters, numbers, spaces, hyphens, and underscores'),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must not exceed 500 characters'),
    permissions: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
    isSystemRole: z.boolean().default(false),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
    role?: RoleRead;
    mode: 'create' | 'edit';
    onSuccess?: (role: RoleRead) => void;
    onCancel?: () => void;
    className?: string;
}

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
    isRequired?: boolean;
}

// Available permissions organized by category
const availablePermissions: Permission[] = [
    // User Management
    {
        id: 'user.create',
        name: 'Create Users',
        description: 'Ability to create new user accounts',
        category: 'User Management'
    },
    {
        id: 'user.read',
        name: 'View Users',
        description: 'Ability to view user profiles and information',
        category: 'User Management',
        isRequired: true
    },
    {
        id: 'user.update',
        name: 'Edit Users',
        description: 'Ability to modify user accounts and profiles',
        category: 'User Management'
    },
    {
        id: 'user.delete',
        name: 'Delete Users',
        description: 'Ability to delete user accounts (irreversible)',
        category: 'User Management'
    },
    {
        id: 'user.impersonate',
        name: 'Impersonate Users',
        description: 'Ability to log in as other users for support purposes',
        category: 'User Management'
    },

    // Content Management
    {
        id: 'content.create',
        name: 'Create Content',
        description: 'Ability to create exam papers, questions, and study materials',
        category: 'Content Management'
    },
    {
        id: 'content.read',
        name: 'View Content',
        description: 'Ability to view exam papers and questions',
        category: 'Content Management',
        isRequired: true
    },
    {
        id: 'content.update',
        name: 'Edit Content',
        description: 'Ability to modify existing exam papers and questions',
        category: 'Content Management'
    },
    {
        id: 'content.delete',
        name: 'Delete Content',
        description: 'Ability to delete exam papers and questions',
        category: 'Content Management'
    },
    {
        id: 'content.publish',
        name: 'Publish Content',
        description: 'Ability to publish content and make it publicly available',
        category: 'Content Management'
    },

    // Institution Management
    {
        id: 'institution.create',
        name: 'Create Institutions',
        description: 'Ability to add new educational institutions',
        category: 'Institution Management'
    },
    {
        id: 'institution.read',
        name: 'View Institutions',
        description: 'Ability to view institution information',
        category: 'Institution Management'
    },
    {
        id: 'institution.update',
        name: 'Edit Institutions',
        description: 'Ability to modify institution details',
        category: 'Institution Management'
    },
    {
        id: 'institution.delete',
        name: 'Delete Institutions',
        description: 'Ability to remove institutions from the system',
        category: 'Institution Management'
    },

    // System Administration
    {
        id: 'system.settings',
        name: 'System Settings',
        description: 'Ability to modify global system configuration',
        category: 'System Administration'
    },
    {
        id: 'system.backup',
        name: 'System Backup',
        description: 'Ability to create and restore system backups',
        category: 'System Administration'
    },
    {
        id: 'system.logs',
        name: 'View System Logs',
        description: 'Ability to access system logs and audit trails',
        category: 'System Administration'
    },
    {
        id: 'system.monitoring',
        name: 'System Monitoring',
        description: 'Ability to monitor system performance and health',
        category: 'System Administration'
    },

    // Role Management
    {
        id: 'role.create',
        name: 'Create Roles',
        description: 'Ability to create new user roles',
        category: 'Role Management'
    },
    {
        id: 'role.read',
        name: 'View Roles',
        description: 'Ability to view role information',
        category: 'Role Management'
    },
    {
        id: 'role.update',
        name: 'Edit Roles',
        description: 'Ability to modify role permissions and settings',
        category: 'Role Management'
    },
    {
        id: 'role.delete',
        name: 'Delete Roles',
        description: 'Ability to delete custom roles',
        category: 'Role Management'
    },
    {
        id: 'role.assign',
        name: 'Assign Roles',
        description: 'Ability to assign roles to users',
        category: 'Role Management'
    }
];

export function RoleForm({
    role,
    mode,
    onSuccess,
    onCancel,
    className
}: RoleFormProps) {
    const { addNotification } = useUIStore();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        role?.permissions || []
    );

    const form = useForm<RoleFormData>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: {
            name: role?.name || '',
            description: role?.description || '',
            permissions: role?.permissions || [],
            isActive: true,
            isSystemRole: false,
        },
    });

    const onSubmit = async (data: RoleFormData) => {
        setIsLoading(true);

        try {
            const roleData = {
                ...data,
                permissions: selectedPermissions,
            };

            let result;
            if (mode === 'create') {
                result = await adminAPI.roles.create(roleData as any);
            } else {
                result = await adminAPI.roles.update(role!.id, roleData as any);
            }

            if (result.data) {
                onSuccess?.(result.data);
                addNotification({
                    type: 'success',
                    title: `Role ${mode === 'create' ? 'Created' : 'Updated'}`,
                    message: `Role "${data.name}" has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
                });
            }
        } catch (error) {
            console.error('Role form error:', error);
            addNotification({
                type: 'error',
                title: 'Operation Failed',
                message: `Failed to ${mode} role. Please try again.`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        onCancel?.();
    };

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        setSelectedPermissions(prev => {
            if (checked) {
                return [...prev, permissionId];
            } else {
                return prev.filter(id => id !== permissionId);
            }
        });
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'User Management':
                return <Users className="h-4 w-4" />;
            case 'Content Management':
                return <FileText className="h-4 w-4" />;
            case 'Institution Management':
                return <Database className="h-4 w-4" />;
            case 'System Administration':
                return <Settings className="h-4 w-4" />;
            case 'Role Management':
                return <Shield className="h-4 w-4" />;
            default:
                return <Lock className="h-4 w-4" />;
        }
    };

    const getPermissionsByCategory = () => {
        return availablePermissions.reduce((acc, permission) => {
            if (!acc[permission.category]) {
                acc[permission.category] = [];
            }
            acc[permission.category].push(permission);
            return acc;
        }, {} as Record<string, Permission[]>);
    };

    const requiredPermissions = availablePermissions.filter(p => p.isRequired).map(p => p.id);
    const selectedCount = selectedPermissions.length;
    const totalPermissions = availablePermissions.length;

    return (
        <div className={`space-y-4 ${className}`}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shield className="h-5 w-5" />
                                <span>Role Information</span>
                            </CardTitle>
                            <CardDescription>
                                Define the basic details for this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Content Moderator, Course Manager"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            A unique, descriptive name for this role
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the purpose and responsibilities of this role..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            A clear description of what this role can do and its responsibilities
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Permissions Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Lock className="h-5 w-5" />
                                    <span>Permissions</span>
                                </div>
                                <Badge variant="secondary">
                                    {selectedCount} of {totalPermissions} selected
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Configure what actions users with this role can perform
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Required Permissions Alert */}
                            {requiredPermissions.length > 0 && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Some permissions are required for all roles and cannot be disabled.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Permissions by Category */}
                            {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        {getCategoryIcon(category)}
                                        <h3 className="text-sm font-semibold">{category}</h3>
                                        <Badge variant="outline" className="text-xs">
                                            {permissions.filter(p => selectedPermissions.includes(p.id)).length} / {permissions.length}
                                        </Badge>
                                    </div>

                                    <div className="grid gap-2 md:grid-cols-2 pl-4">
                                        {permissions.map((permission) => {
                                            const isSelected = selectedPermissions.includes(permission.id);
                                            const isRequired = permission.isRequired;

                                            return (
                                                <div
                                                    key={permission.id}
                                                    className={`flex items-start space-x-2 p-2 border rounded-md ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                                                        } ${isRequired ? 'border-green-200 bg-green-50' : ''}`}
                                                >
                                                    <Checkbox
                                                        id={permission.id}
                                                        checked={isSelected || isRequired}
                                                        disabled={isRequired}
                                                        onCheckedChange={(checked) =>
                                                            handlePermissionChange(permission.id, checked as boolean)
                                                        }
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <label
                                                            htmlFor={permission.id}
                                                            className="text-xs font-medium cursor-pointer flex items-center space-x-1 mb-1"
                                                        >
                                                            <span className="truncate">{permission.name}</span>
                                                            {isRequired && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Required
                                                                </Badge>
                                                            )}
                                                            {isSelected && !isRequired && (
                                                                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                                                            )}
                                                        </label>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {permission.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {category !== 'Role Management' && <Separator />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Form Actions - Sticky at bottom */}
                    <div className="sticky bottom-0 bg-white border-t pt-4 mt-6 flex items-center justify-end space-x-3 -mx-4 -mb-4 px-4 pb-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span className="hidden sm:inline">{mode === 'create' ? 'Creating...' : 'Updating...'}</span>
                                    <span className="sm:hidden">...</span>
                                </div>
                            ) : (
                                <span>{mode === 'create' ? 'Create Role' : 'Update Role'}</span>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}