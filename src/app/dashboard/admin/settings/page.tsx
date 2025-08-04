'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Globe,
    Shield,
    Mail,
    Database,
    Bell,
    Palette,
    Users,
    Monitor,
    Save,
    RefreshCw,
    Download,
    Upload,
    AlertTriangle,
    CheckCircle,
    Info,
    Key,
    Server,
    HardDrive,
    Clock,
    Eye,
    EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';

// Types for settings
interface GeneralSettings {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    contactEmail: string;
    supportEmail: string;
    timezone: string;
    language: string;
    dateFormat: string;
    enableRegistration: boolean;
    enableGuestAccess: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
}

interface SecuritySettings {
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireUppercase: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    enableTwoFactor: boolean;
    allowPasswordReset: boolean;
    requireEmailVerification: boolean;
    ipWhitelist: string[];
    enableAuditLog: boolean;
}

interface EmailSettings {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    smtpSecurity: 'none' | 'tls' | 'ssl';
    fromEmail: string;
    fromName: string;
    replyToEmail: string;
    enableEmailNotifications: boolean;
    welcomeEmailEnabled: boolean;
    passwordResetEmailEnabled: boolean;
    emailTemplates: {
        welcome: string;
        passwordReset: string;
        verification: string;
    };
}

interface BackupSettings {
    enableAutoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupTime: string;
    retentionDays: number;
    backupLocation: 'local' | 's3' | 'ftp';
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
    ftpHost?: string;
    ftpUsername?: string;
    ftpPassword?: string;
    ftpPath?: string;
}

interface SystemInfo {
    version: string;
    uptime: string;
    lastBackup: string;
    storageUsed: string;
    storageTotal: string;
    memoryUsage: string;
    cpuUsage: string;
    activeUsers: number;
    totalUsers: number;
    databaseSize: string;
}

// Mock data
const mockGeneralSettings: GeneralSettings = {
    siteName: 'Exampapel',
    siteDescription: 'Your comprehensive exam papers management platform',
    siteUrl: 'https://exampapel.com',
    contactEmail: 'contact@exampapel.com',
    supportEmail: 'support@exampapel.com',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    enableRegistration: true,
    enableGuestAccess: false,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt']
};

const mockSecuritySettings: SecuritySettings = {
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableTwoFactor: false,
    allowPasswordReset: true,
    requireEmailVerification: true,
    ipWhitelist: [],
    enableAuditLog: true
};

const mockEmailSettings: EmailSettings = {
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'noreply@exampapel.com',
    smtpPassword: '',
    smtpSecurity: 'tls',
    fromEmail: 'noreply@exampapel.com',
    fromName: 'Exampapel System',
    replyToEmail: 'support@exampapel.com',
    enableEmailNotifications: true,
    welcomeEmailEnabled: true,
    passwordResetEmailEnabled: true,
    emailTemplates: {
        welcome: 'Welcome to Exampapel! Your account has been created successfully.',
        passwordReset: 'Click the link below to reset your password.',
        verification: 'Please verify your email address by clicking the link below.'
    }
};

const mockBackupSettings: BackupSettings = {
    enableAutoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    backupLocation: 'local'
};

const mockSystemInfo: SystemInfo = {
    version: '1.0.0',
    uptime: '15 days, 4 hours',
    lastBackup: '2024-12-19 02:00:00',
    storageUsed: '2.4 GB',
    storageTotal: '10 GB',
    memoryUsage: '45%',
    cpuUsage: '12%',
    activeUsers: 1247,
    totalUsers: 15420,
    databaseSize: '1.2 GB'
};

export default function SystemSettingsPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

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

    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    // Settings state
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(mockGeneralSettings);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(mockSecuritySettings);
    const [emailSettings, setEmailSettings] = useState<EmailSettings>(mockEmailSettings);
    const [backupSettings, setBackupSettings] = useState<BackupSettings>(mockBackupSettings);
    const [systemInfo, setSystemInfo] = useState<SystemInfo>(mockSystemInfo);

    // Load settings
    const loadSettings = async () => {
        try {
            setLoading(true);
            // In production, load from API
            // const response = await adminAPI.settings.getAll();
            // setGeneralSettings(response.data.general);
            // setSecuritySettings(response.data.security);
            // setEmailSettings(response.data.email);
            // setBackupSettings(response.data.backup);
            // setSystemInfo(response.data.system);
        } catch (error) {
            console.error('Error loading settings:', error);
            addNotification({
                type: 'error',
                title: 'Error Loading Settings',
                message: 'Failed to load system settings.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Save settings
    const saveSettings = async (settingsType: string, data: any) => {
        try {
            setSaving(true);
            // In production, save to API
            // await adminAPI.settings.update(settingsType, data);

            addNotification({
                type: 'success',
                title: 'Settings Saved',
                message: `${settingsType} settings have been saved successfully.`,
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            addNotification({
                type: 'error',
                title: 'Save Failed',
                message: 'Failed to save settings. Please try again.',
            });
        } finally {
            setSaving(false);
        }
    };

    // Test email configuration
    const testEmailConfig = async () => {
        try {
            // await adminAPI.settings.testEmail();
            addNotification({
                type: 'success',
                title: 'Email Test Successful',
                message: 'Test email sent successfully.',
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Email Test Failed',
                message: 'Failed to send test email. Please check your configuration.',
            });
        }
    };

    // Create backup
    const createBackup = async () => {
        try {
            // await adminAPI.settings.createBackup();
            addNotification({
                type: 'success',
                title: 'Backup Created',
                message: 'System backup created successfully.',
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Backup Failed',
                message: 'Failed to create backup. Please try again.',
            });
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    // Check if user has admin role
    const isAdmin = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'admin' || currentUser?.role === 'Admin')
        : (currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'Admin');

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <AdminBreadcrumb currentPage="System Settings" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
            <AdminBreadcrumb currentPage="System Settings" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground">
                        Configure system-wide settings and preferences
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => loadSettings()}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={createBackup}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Create Backup
                    </Button>
                </div>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general" className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">Email</span>
                    </TabsTrigger>
                    <TabsTrigger value="backup" className="flex items-center space-x-2">
                        <Database className="h-4 w-4" />
                        <span className="hidden sm:inline">Backup</span>
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <span className="hidden sm:inline">System</span>
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Globe className="h-5 w-5" />
                                <span>General Settings</span>
                            </CardTitle>
                            <CardDescription>
                                Configure basic site information and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        value={generalSettings.siteName}
                                        onChange={(e) => setGeneralSettings(prev => ({
                                            ...prev,
                                            siteName: e.target.value
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siteUrl">Site URL</Label>
                                    <Input
                                        id="siteUrl"
                                        value={generalSettings.siteUrl}
                                        onChange={(e) => setGeneralSettings(prev => ({
                                            ...prev,
                                            siteUrl: e.target.value
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">Site Description</Label>
                                <Textarea
                                    id="siteDescription"
                                    value={generalSettings.siteDescription}
                                    onChange={(e) => setGeneralSettings(prev => ({
                                        ...prev,
                                        siteDescription: e.target.value
                                    }))}
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Contact Email</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={generalSettings.contactEmail}
                                        onChange={(e) => setGeneralSettings(prev => ({
                                            ...prev,
                                            contactEmail: e.target.value
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supportEmail">Support Email</Label>
                                    <Input
                                        id="supportEmail"
                                        type="email"
                                        value={generalSettings.supportEmail}
                                        onChange={(e) => setGeneralSettings(prev => ({
                                            ...prev,
                                            supportEmail: e.target.value
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select
                                        value={generalSettings.timezone}
                                        onValueChange={(value) => setGeneralSettings(prev => ({
                                            ...prev,
                                            timezone: value
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Select
                                        value={generalSettings.language}
                                        onValueChange={(value) => setGeneralSettings(prev => ({
                                            ...prev,
                                            language: value
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateFormat">Date Format</Label>
                                    <Select
                                        value={generalSettings.dateFormat}
                                        onValueChange={(value) => setGeneralSettings(prev => ({
                                            ...prev,
                                            dateFormat: value
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Access Control</h3>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Enable User Registration</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow new users to register accounts
                                        </p>
                                    </div>
                                    <Switch
                                        checked={generalSettings.enableRegistration}
                                        onCheckedChange={(checked) => setGeneralSettings(prev => ({
                                            ...prev,
                                            enableRegistration: checked
                                        }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Enable Guest Access</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow anonymous users to browse content
                                        </p>
                                    </div>
                                    <Switch
                                        checked={generalSettings.enableGuestAccess}
                                        onCheckedChange={(checked) => setGeneralSettings(prev => ({
                                            ...prev,
                                            enableGuestAccess: checked
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={() => saveSettings('General', generalSettings)}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shield className="h-5 w-5" />
                                <span>Security Settings</span>
                            </CardTitle>
                            <CardDescription>
                                Configure password policies and security measures
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Password Policy</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                                        <Input
                                            id="passwordMinLength"
                                            type="number"
                                            min="6"
                                            max="50"
                                            value={securitySettings.passwordMinLength}
                                            onChange={(e) => setSecuritySettings(prev => ({
                                                ...prev,
                                                passwordMinLength: parseInt(e.target.value)
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                        <Input
                                            id="sessionTimeout"
                                            type="number"
                                            min="5"
                                            max="1440"
                                            value={securitySettings.sessionTimeout}
                                            onChange={(e) => setSecuritySettings(prev => ({
                                                ...prev,
                                                sessionTimeout: parseInt(e.target.value)
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Require Special Characters</Label>
                                        <Switch
                                            checked={securitySettings.passwordRequireSpecial}
                                            onCheckedChange={(checked) => setSecuritySettings(prev => ({
                                                ...prev,
                                                passwordRequireSpecial: checked
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Require Numbers</Label>
                                        <Switch
                                            checked={securitySettings.passwordRequireNumbers}
                                            onCheckedChange={(checked) => setSecuritySettings(prev => ({
                                                ...prev,
                                                passwordRequireNumbers: checked
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Require Uppercase Letters</Label>
                                        <Switch
                                            checked={securitySettings.passwordRequireUppercase}
                                            onCheckedChange={(checked) => setSecuritySettings(prev => ({
                                                ...prev,
                                                passwordRequireUppercase: checked
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Login Security</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                        <Input
                                            id="maxLoginAttempts"
                                            type="number"
                                            min="3"
                                            max="10"
                                            value={securitySettings.maxLoginAttempts}
                                            onChange={(e) => setSecuritySettings(prev => ({
                                                ...prev,
                                                maxLoginAttempts: parseInt(e.target.value)
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                                        <Input
                                            id="lockoutDuration"
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={securitySettings.lockoutDuration}
                                            onChange={(e) => setSecuritySettings(prev => ({
                                                ...prev,
                                                lockoutDuration: parseInt(e.target.value)
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label>Enable Two-Factor Authentication</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Require 2FA for all admin accounts
                                            </p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.enableTwoFactor}
                                            onCheckedChange={(checked) => setSecuritySettings(prev => ({
                                                ...prev,
                                                enableTwoFactor: checked
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Allow Password Reset</Label>
                                        <Switch
                                            checked={securitySettings.allowPasswordReset}
                                            onCheckedChange={(checked) => setSecuritySettings(prev => ({
                                                ...prev,
                                                allowPasswordReset: checked
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Require Email Verification</Label>
                                        <Switch
                                            checked={securitySettings.requireEmailVerification}
                                            onCheckedChange={(checked) => setSecuritySettings(prev => ({
                                                ...prev,
                                                requireEmailVerification: checked
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Enable Audit Logging</Label>
                                        <Switch
                                            checked={securitySettings.enableAuditLog}
                                            onCheckedChange={(checked) => setSecuritySettings(prev => ({
                                                ...prev,
                                                enableAuditLog: checked
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={() => saveSettings('Security', securitySettings)}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Email Settings */}
                <TabsContent value="email" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Mail className="h-5 w-5" />
                                <span>Email Configuration</span>
                            </CardTitle>
                            <CardDescription>
                                Configure SMTP settings and email templates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">SMTP Configuration</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpHost">SMTP Host</Label>
                                        <Input
                                            id="smtpHost"
                                            value={emailSettings.smtpHost}
                                            onChange={(e) => setEmailSettings(prev => ({
                                                ...prev,
                                                smtpHost: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpPort">SMTP Port</Label>
                                        <Input
                                            id="smtpPort"
                                            type="number"
                                            value={emailSettings.smtpPort}
                                            onChange={(e) => setEmailSettings(prev => ({
                                                ...prev,
                                                smtpPort: parseInt(e.target.value)
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpUsername">SMTP Username</Label>
                                        <Input
                                            id="smtpUsername"
                                            value={emailSettings.smtpUsername}
                                            onChange={(e) => setEmailSettings(prev => ({
                                                ...prev,
                                                smtpUsername: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="smtpPassword"
                                                type={showPasswords ? 'text' : 'password'}
                                                value={emailSettings.smtpPassword}
                                                onChange={(e) => setEmailSettings(prev => ({
                                                    ...prev,
                                                    smtpPassword: e.target.value
                                                }))}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                            >
                                                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpSecurity">Security</Label>
                                        <Select
                                            value={emailSettings.smtpSecurity}
                                            onValueChange={(value: 'none' | 'tls' | 'ssl') => setEmailSettings(prev => ({
                                                ...prev,
                                                smtpSecurity: value
                                            }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="tls">TLS</SelectItem>
                                                <SelectItem value="ssl">SSL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fromEmail">From Email</Label>
                                        <Input
                                            id="fromEmail"
                                            type="email"
                                            value={emailSettings.fromEmail}
                                            onChange={(e) => setEmailSettings(prev => ({
                                                ...prev,
                                                fromEmail: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fromName">From Name</Label>
                                        <Input
                                            id="fromName"
                                            value={emailSettings.fromName}
                                            onChange={(e) => setEmailSettings(prev => ({
                                                ...prev,
                                                fromName: e.target.value
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Email Notifications</h3>
                                    <Button
                                        variant="outline"
                                        onClick={testEmailConfig}
                                        className="flex items-center space-x-2"
                                    >
                                        <Mail className="h-4 w-4" />
                                        <span>Test Configuration</span>
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Enable Email Notifications</Label>
                                        <Switch
                                            checked={emailSettings.enableEmailNotifications}
                                            onCheckedChange={(checked) => setEmailSettings(prev => ({
                                                ...prev,
                                                enableEmailNotifications: checked
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Welcome Email</Label>
                                        <Switch
                                            checked={emailSettings.welcomeEmailEnabled}
                                            onCheckedChange={(checked) => setEmailSettings(prev => ({
                                                ...prev,
                                                welcomeEmailEnabled: checked
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Password Reset Email</Label>
                                        <Switch
                                            checked={emailSettings.passwordResetEmailEnabled}
                                            onCheckedChange={(checked) => setEmailSettings(prev => ({
                                                ...prev,
                                                passwordResetEmailEnabled: checked
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={() => saveSettings('Email', emailSettings)}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Backup Settings */}
                <TabsContent value="backup" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Database className="h-5 w-5" />
                                <span>Backup Configuration</span>
                            </CardTitle>
                            <CardDescription>
                                Configure automatic backups and restore options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Enable Automatic Backup</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically create system backups
                                        </p>
                                    </div>
                                    <Switch
                                        checked={backupSettings.enableAutoBackup}
                                        onCheckedChange={(checked) => setBackupSettings(prev => ({
                                            ...prev,
                                            enableAutoBackup: checked
                                        }))}
                                    />
                                </div>

                                {backupSettings.enableAutoBackup && (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label>Backup Frequency</Label>
                                                <Select
                                                    value={backupSettings.backupFrequency}
                                                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setBackupSettings(prev => ({
                                                        ...prev,
                                                        backupFrequency: value
                                                    }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="daily">Daily</SelectItem>
                                                        <SelectItem value="weekly">Weekly</SelectItem>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Backup Time</Label>
                                                <Input
                                                    type="time"
                                                    value={backupSettings.backupTime}
                                                    onChange={(e) => setBackupSettings(prev => ({
                                                        ...prev,
                                                        backupTime: e.target.value
                                                    }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Retention Days</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={backupSettings.retentionDays}
                                                    onChange={(e) => setBackupSettings(prev => ({
                                                        ...prev,
                                                        retentionDays: parseInt(e.target.value)
                                                    }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Backup Location</Label>
                                            <Select
                                                value={backupSettings.backupLocation}
                                                onValueChange={(value: 'local' | 's3' | 'ftp') => setBackupSettings(prev => ({
                                                    ...prev,
                                                    backupLocation: value
                                                }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="local">Local Storage</SelectItem>
                                                    <SelectItem value="s3">Amazon S3</SelectItem>
                                                    <SelectItem value="ftp">FTP Server</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={() => saveSettings('Backup', backupSettings)}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Information */}
                <TabsContent value="system" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* System Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Monitor className="h-5 w-5" />
                                    <span>System Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Version</span>
                                        <Badge variant="secondary">{systemInfo.version}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Uptime</span>
                                        <span className="text-sm font-medium">{systemInfo.uptime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Last Backup</span>
                                        <span className="text-sm font-medium">{systemInfo.lastBackup}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Server className="h-5 w-5" />
                                    <span>Performance</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Memory Usage</span>
                                        <span className="text-sm font-medium">{systemInfo.memoryUsage}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">CPU Usage</span>
                                        <span className="text-sm font-medium">{systemInfo.cpuUsage}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Database Size</span>
                                        <span className="text-sm font-medium">{systemInfo.databaseSize}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Storage Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <HardDrive className="h-5 w-5" />
                                    <span>Storage</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Used</span>
                                        <span className="text-sm font-medium">{systemInfo.storageUsed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Total</span>
                                        <span className="text-sm font-medium">{systemInfo.storageTotal}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: '24%' }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>Users</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Active Users</span>
                                        <span className="text-sm font-medium">{systemInfo.activeUsers.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Total Users</span>
                                        <span className="text-sm font-medium">{systemInfo.totalUsers.toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Actions</CardTitle>
                            <CardDescription>
                                Perform system maintenance and administrative tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Button variant="outline" className="flex items-center space-x-2">
                                    <Download className="h-4 w-4" />
                                    <span>Export Data</span>
                                </Button>
                                <Button variant="outline" className="flex items-center space-x-2">
                                    <Upload className="h-4 w-4" />
                                    <span>Import Data</span>
                                </Button>
                                <Button variant="outline" className="flex items-center space-x-2">
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Clear Cache</span>
                                </Button>
                                <Button variant="destructive" className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Reset System</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}