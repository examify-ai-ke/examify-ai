'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Mail,
    Shield,
    Eye,
    EyeOff,
    Save,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminAPI, type UserRead } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';

// User form validation schema
const userFormSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    role: z.enum(['Admin', 'Manager', 'Student'], {
        required_error: 'Please select a role',
    }),
    is_active: z.boolean(),
    is_verified: z.boolean(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    confirm_password: z.string().optional(),
}).refine((data) => {
    if (data.password && data.confirm_password) {
        return data.password === data.confirm_password;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
    user?: UserRead;
    mode: 'create' | 'edit';
    onSuccess?: (user: UserRead) => void;
    onCancel?: () => void;
    className?: string;
}

export function UserForm({
    user,
    mode,
    onSuccess,
    onCancel,
    className
}: UserFormProps) {
    const { addNotification } = useUIStore();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm<UserFormData>({
        resolver: zodResolver(userFormSchema),
        defaultValues: user ? {
            email: user.email || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            role: (user.role as any) || 'Student',
            is_active: user.is_active ?? true,
            is_verified: user.is_verified ?? false,
        } : {
            email: '',
            first_name: '',
            last_name: '',
            role: 'Student',
            is_active: true,
            is_verified: false,
        }
    });

    const watchRole = watch('role');
    const watchIsActive = watch('is_active');
    const watchIsVerified = watch('is_verified');

    const onSubmit = async (data: UserFormData) => {
        try {
            setLoading(true);

            if (mode === 'create') {
                // Create new user
                const createData = {
                    email: data.email,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    role: data.role,
                    password: data.password || '',
                    is_active: data.is_active,
                };

                const response = await adminAPI.users.create(createData as any);

                if (response.data) {
                    addNotification({
                        type: 'success',
                        title: 'User Created',
                        message: `User ${data.first_name} ${data.last_name} has been created successfully.`,
                    });

                    // Send verification email if needed
                    if (!data.is_verified && response.data.data) {
                        try {
                            await adminAPI.users.sendVerificationEmail(response.data.data.id);
                            addNotification({
                                type: 'info',
                                title: 'Verification Email Sent',
                                message: 'A verification email has been sent to the user.',
                            });
                        } catch (error) {
                            console.error('Failed to send verification email:', error);
                        }
                    }

                    onSuccess?.(response.data.data);
                    reset();
                }
            } else if (mode === 'edit' && user) {
                // Update existing user
                const updateData = {
                    email: data.email,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    role: data.role,
                    is_active: data.is_active,
                };

                const response = await adminAPI.users.update(user.id, updateData as any);

                if (response.data) {
                    addNotification({
                        type: 'success',
                        title: 'User Updated',
                        message: `User ${data.first_name} ${data.last_name} has been updated successfully.`,
                    });

                    // Handle verification status change
                    if (data.is_verified !== user.is_verified) {
                        if (data.is_verified) {
                            addNotification({
                                type: 'info',
                                title: 'User Verified',
                                message: 'User has been marked as verified.',
                            });
                        }
                    }

                    onSuccess?.(response.data.data);
                }
            }
        } catch (error: any) {
            console.error('User form submission error:', error);

            let errorMessage = 'An unexpected error occurred. Please try again.';

            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }

            addNotification({
                type: 'error',
                title: mode === 'create' ? 'User Creation Failed' : 'User Update Failed',
                message: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        reset();
        onCancel?.();
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-red-100 text-red-800';
            case 'Manager':
                return 'bg-blue-100 text-blue-800';
            case 'Student':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className={cn('space-y-6', className)}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* User Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>User Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    className="pl-10"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    placeholder="John"
                                    {...register('first_name')}
                                />
                                {errors.first_name && (
                                    <p className="text-sm text-red-600">{errors.first_name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    placeholder="Doe"
                                    {...register('last_name')}
                                />
                                {errors.last_name && (
                                    <p className="text-sm text-red-600">{errors.last_name.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Fields (Create Mode Only) */}
                        {mode === 'create' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...register('password')}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600">{errors.password.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm_password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...register('confirm_password')}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.confirm_password && (
                                        <p className="text-sm text-red-600">{errors.confirm_password.message}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Role and Permissions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Shield className="h-5 w-5" />
                            <span>Role & Permissions</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={watchRole}
                                onValueChange={(value) => setValue('role', value as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Student">Student</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Admin">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-600">{errors.role.message}</p>
                            )}

                            {/* Role Description */}
                            <div className="mt-2">
                                <Badge className={getRoleBadgeColor(watchRole)}>
                                    {watchRole}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {watchRole === 'Admin' && 'Full system access with user management capabilities.'}
                                    {watchRole === 'Manager' && 'Can manage institution content and view analytics.'}
                                    {watchRole === 'Student' && 'Basic access to browse and search exam papers.'}
                                </p>
                            </div>
                        </div>

                        {/* Status Toggles */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        User can log in and access the system
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={watchIsActive}
                                    onCheckedChange={(checked) => setValue('is_active', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_verified">Email Verified</Label>
                                    <p className="text-sm text-muted-foreground">
                                        User has verified their email address
                                    </p>
                                </div>
                                <Switch
                                    id="is_verified"
                                    checked={watchIsVerified}
                                    onCheckedChange={(checked) => setValue('is_verified', checked)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {mode === 'create' ? 'Create User' : 'Update User'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}