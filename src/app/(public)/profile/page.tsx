'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Save,
    X,
    Camera,
    Shield,
    Bell,
    Globe,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { components } from '@/types/generated/api';

type IUserUpdate = components['schemas']['IUserUpdate'];
type PasswordChange = components['schemas']['PasswordChange'];

export default function ProfilePage() {
    const { user } = useAuth();
    const { setUser } = useAuthStore();
    const { addNotification } = useUIStore();

    // Check if user is admin or manager - redirect them to dashboard
    if (user && (user.role?.name === 'admin' || user.role?.name === 'manager')) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-bold text-yellow-900 mb-2">Access Restricted</h2>
                    <p className="text-yellow-800 mb-4">
                        Admins and managers should use the dashboard profile page.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/profile">Go to Dashboard Profile</Link>
                    </Button>
                </div>
            </div>
        );
    }
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState<IUserUpdate>({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        state: user?.state || '',
        country: user?.country || '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirmPassword: '',
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            console.log('👤 User data:', user);
            console.log('🖼️ User image:', user.image);
            console.log('📸 Avatar URL (path):', user.image?.media?.path);
            console.log('🔗 Avatar URL (link - double encoded):', user.image?.media?.link);
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                state: user.state || '',
                country: user.country || '',
            });
        }
    }, [user]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Trigger autosave when editing
        if (isEditing) {
            setAutoSaveStatus('saving');
            
            // Clear existing timeout
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            // Set new timeout for autosave (2 seconds after last change)
            autoSaveTimeoutRef.current = setTimeout(() => {
                handleAutoSave({
                    ...formData,
                    [field]: value
                });
            }, 2000);
        }
    };

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAutoSave = async (dataToSave: IUserUpdate) => {
        try {
            console.log('Auto-saving profile with data:', dataToSave);
            const { data, error } = await api.PUT('/api/v1/user', {
                body: dataToSave,
            });

            console.log('Auto-save response:', { data, error });

            if (error) {
                console.error('Auto-save error:', error);
                setAutoSaveStatus('idle');
                return;
            }

            if (data?.data) {
                // Update the auth store with new user data
                setUser(data.data);
                setAutoSaveStatus('saved');
                
                // Reset status after 2 seconds
                setTimeout(() => {
                    setAutoSaveStatus('idle');
                }, 2000);
            }
        } catch (err) {
            console.error('Auto-save exception:', err);
            setAutoSaveStatus('idle');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            console.log('Manual save with data:', formData);
            const { data, error } = await api.PUT('/api/v1/user', {
                body: formData,
            });

            console.log('Save response:', { data, error });

            if (error) {
                console.error('Save error:', error);
                const errorMessage = typeof error.detail === 'string'
                    ? error.detail
                    : Array.isArray(error.detail)
                        ? error.detail.map((e: any) => e.msg).join(', ')
                        : 'Failed to update profile';
                
                addNotification({
                    type: 'error',
                    title: 'Update Failed',
                    message: errorMessage,
                });
                return;
            }

            if (data?.data) {
                // Update the auth store with new user data
                setUser(data.data);
                addNotification({
                    type: 'success',
                    title: 'Profile Updated',
                    message: 'Your profile has been updated successfully.',
                });
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Save exception:', err);
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while updating your profile.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.new_password !== passwordData.confirmPassword) {
            addNotification({
                type: 'error',
                title: 'Password Mismatch',
                message: 'New passwords do not match.',
            });
            return;
        }

        if (passwordData.new_password.length < 8) {
            addNotification({
                type: 'error',
                title: 'Weak Password',
                message: 'Password must be at least 8 characters long.',
            });
            return;
        }

        setIsSaving(true);
        try {
            const { data, error } = await api.POST('/api/v1/login/change_password', {
                body: {
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                } as PasswordChange,
            });

            if (error) {
                const errorMessage = typeof error.detail === 'string'
                    ? error.detail
                    : Array.isArray(error.detail)
                        ? error.detail.map(e => e.msg).join(', ')
                        : 'Failed to change password';
                
                addNotification({
                    type: 'error',
                    title: 'Password Change Failed',
                    message: errorMessage,
                });
                return;
            }

            addNotification({
                type: 'success',
                title: 'Password Changed',
                message: 'Your password has been changed successfully.',
            });
            setShowPasswordDialog(false);
            setPasswordData({
                current_password: '',
                new_password: '',
                confirmPassword: '',
            });
        } catch (err) {
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while changing your password.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Clear autosave timeout
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                state: user.state || '',
                country: user.country || '',
            });
        }
        setAutoSaveStatus('idle');
        setIsEditing(false);
    };

    const handleAvatarClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            addNotification({
                type: 'error',
                title: 'Invalid File',
                message: 'Please select an image file.',
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            addNotification({
                type: 'error',
                title: 'File Too Large',
                message: 'Image must be less than 5MB.',
            });
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('image_file', file);

            // Get auth token
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
            
            // Get base URL
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';

            // Use direct fetch for FormData upload
            const response = await fetch(`${baseUrl}/api/v1/user/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type - let browser set it with boundary
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to upload profile picture' }));
                const errorMessage = typeof errorData.detail === 'string'
                    ? errorData.detail
                    : 'Failed to upload profile picture';
                
                addNotification({
                    type: 'error',
                    title: 'Upload Failed',
                    message: errorMessage,
                });
                return;
            }

            const data = await response.json();
            
            console.log('📤 Upload response:', data);
            console.log('🖼️ Image data:', data?.data?.image);
            console.log('📸 New avatar URL:', data?.data?.image?.media?.link);
            
            if (data?.data) {
                // Update the auth store with new user data
                setUser(data.data);
                addNotification({
                    type: 'success',
                    title: 'Profile Picture Updated',
                    message: 'Your profile picture has been updated successfully.',
                });
            }
        } catch (err) {
            console.error('Avatar upload exception:', err);
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while uploading your profile picture.',
            });
        } finally {
            setIsUploadingAvatar(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                    {isEditing && autoSaveStatus !== 'idle' && (
                        <div className="flex items-center space-x-2 mt-2">
                            {autoSaveStatus === 'saving' && (
                                <span className="text-sm text-yellow-600 flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
                                    <span>Auto-saving...</span>
                                </span>
                            )}
                            {autoSaveStatus === 'saved' && (
                                <span className="text-sm text-green-600 flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Auto-saved</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2"
                >
                    {isEditing ? (
                        <>
                            <X className="h-4 w-4" />
                            <span>Done</span>
                        </>
                    ) : (
                        <>
                            <Edit className="h-4 w-4" />
                            <span>Edit Profile</span>
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Overview */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="relative inline-block">
                                <Avatar className="h-24 w-24 mx-auto">
                                    <AvatarImage 
                                        src={user?.image?.media?.path || '/default-avatar-profile-picture-male-icon.png'} 
                                        alt={user?.full_name || 'User'}
                                    />
                                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                                        {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0"
                                            onClick={handleAvatarClick}
                                            disabled={isUploadingAvatar}
                                        >
                                            {isUploadingAvatar ? (
                                                <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                            ) : (
                                                <Camera className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                            <CardTitle className="mt-4">
                                {user?.first_name} {user?.last_name || 'User'}
                            </CardTitle>
                            <div className="flex items-center justify-center space-x-2">
                                <Badge variant="secondary" className="capitalize">
                                    {user?.role?.name || 'Student'}
                                </Badge>
                                <Badge variant="outline">
                                    Member since {new Date(user?.created_at || Date.now()).getFullYear()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{user?.email}</span>
                            </div>
                            {user?.phone && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user?.location && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Papers Completed</span>
                                <span className="font-semibold">18</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Study Hours</span>
                                <span className="font-semibold">45h</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                                <span className="font-semibold">87.5%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Current Streak</span>
                                <span className="font-semibold">7 days</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.first_name || ''}
                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.last_name || ''}
                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address || ''}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="state">State/Province</Label>
                                    <Input
                                        id="state"
                                        value={formData.state || ''}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={formData.country || ''}
                                        onChange={(e) => handleInputChange('country', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Change Password</p>
                                        <p className="text-sm text-muted-foreground">Update your password</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowPasswordDialog(true)}
                                >
                                    Change
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Bell className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Notification Settings</p>
                                        <p className="text-sm text-muted-foreground">Manage your notifications</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" disabled>
                                    Configure
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Privacy Settings</p>
                                        <p className="text-sm text-muted-foreground">Control your privacy</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" disabled>
                                    Manage
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info about autosave */}
                    {isEditing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                💾 Changes are automatically saved as you type. Click "Done" when finished.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="current-password"
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordData.current_password}
                                    onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                                    placeholder="Enter your current password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPasswords.current ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.new_password}
                                    onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                                    placeholder="Enter new password (min 8 characters)"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPasswords.new ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    placeholder="Confirm new password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPasswords.confirm ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowPasswordDialog(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleChangePassword}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Changing...' : 'Change Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
