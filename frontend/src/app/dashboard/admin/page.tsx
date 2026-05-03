'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import {
    Users,
    Building2,
    GraduationCap,
    FileText,
    Activity,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    UserPlus,
    Settings,
    Shield,
    BarChart3,
    Mail,
    Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatNumber } from '@/lib/utils';
import { api } from '@/lib/api';
import { adminAPI, adminHelpers } from '@/lib/api-admin';

// Admin statistics interface
interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalInstitutions: number;
    totalFaculties: number;
    totalDepartments: number;
    totalPapers: number;
    todayRegistrations: number;
    pendingVerifications: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
    databaseStatus: 'connected' | 'slow' | 'error';
}

// Recent activity interface
interface RecentActivity {
    id: string;
    type: 'user_registered' | 'user_verified' | 'institution_added' | 'paper_uploaded' | 'system_alert';
    description: string;
    timestamp: string;
    severity: 'info' | 'success' | 'warning' | 'error';
    user?: string;
}

// System alerts interface
interface SystemAlert {
    id: string;
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    resolved: boolean;
}

// Mock data for demonstration (will be replaced with real API calls)
const mockAdminStats: AdminStats = {
    totalUsers: 15420,
    activeUsers: 12845,
    totalInstitutions: 127,
    totalFaculties: 1250,
    totalDepartments: 4300,
    totalPapers: 28690,
    todayRegistrations: 45,
    pendingVerifications: 238,
    systemHealth: 'healthy',
    databaseStatus: 'connected',
};

const mockRecentActivity: RecentActivity[] = [
    {
        id: '1',
        type: 'user_registered',
        description: 'New user registration from University of Lagos',
        timestamp: '2024-12-19T10:30:00Z',
        severity: 'info',
        user: 'John Doe'
    },
    {
        id: '2',
        type: 'institution_added',
        description: 'Covenant University added to the system',
        timestamp: '2024-12-19T09:15:00Z',
        severity: 'success',
        user: 'Admin'
    },
    {
        id: '3',
        type: 'system_alert',
        description: 'Database backup completed successfully',
        timestamp: '2024-12-19T08:00:00Z',
        severity: 'success'
    },
    {
        id: '4',
        type: 'paper_uploaded',
        description: '25 new exam papers uploaded for Computer Science',
        timestamp: '2024-12-19T07:45:00Z',
        severity: 'info',
        user: 'Dr. Smith'
    }
];

const mockSystemAlerts: SystemAlert[] = [
    {
        id: '1',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Server memory usage is at 85%. Consider scaling up.',
        timestamp: '2024-12-19T09:30:00Z',
        resolved: false
    },
    {
        id: '2',
        type: 'info',
        title: 'Scheduled Maintenance',
        message: 'Database maintenance scheduled for tomorrow at 2 AM UTC.',
        timestamp: '2024-12-19T08:00:00Z',
        resolved: false
    }
];

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<AdminStats>(mockAdminStats);
    const [activities, setActivities] = useState<RecentActivity[]>(mockRecentActivity);
    const [alerts, setAlerts] = useState<SystemAlert[]>(mockSystemAlerts);
    const [loading, setLoading] = useState(false);

    // Load admin statistics
    const loadAdminStats = async () => {
        try {
            setLoading(true);

            // Call real API endpoints using the admin API utilities
            const [healthResponse, detailedStatsResponse, usersResponse, rolesResponse, institutionsResponse] = await Promise.allSettled([
                adminAPI.health.getDetailed(),
                adminAPI.stats.getDetailed(),
                adminAPI.users.list({ limit: 100 }),
                adminAPI.roles.list(),
                adminAPI.institutions.list({ limit: 50 })
            ]);

            // Process the responses and update stats
            console.log('API Responses:', {
                healthResponse,
                detailedStatsResponse,
                usersResponse,
                rolesResponse,
                institutionsResponse
            });

            // Update stats based on real API responses when available
            // For now, gracefully fallback to mock data if API calls fail
            let updatedStats = { ...mockAdminStats };

            // Process users data if available
            if (usersResponse.status === 'fulfilled' && usersResponse.value.data) {
                const users = adminHelpers.extractItems(usersResponse.value);
                const total = adminHelpers.extractTotal(usersResponse.value);
                
                if (users.length > 0) {
                    updatedStats.totalUsers = total || users.length;

                    // Calculate activity summary
                    const activitySummary = adminHelpers.generateActivitySummary(users);
                    updatedStats.todayRegistrations = activitySummary.todayRegistrations;
                    updatedStats.pendingVerifications = activitySummary.pendingVerifications;

                    // Estimate active users (users who logged in recently or are verified)
                    updatedStats.activeUsers = users.filter((user: any) =>
                        user.is_verified || user.is_active
                    ).length;
                }
            }

            // Process health data if available
            if (healthResponse.status === 'fulfilled' && healthResponse.value.data) {
                const healthData = healthResponse.value.data as any;
                updatedStats.systemHealth = adminHelpers.formatHealthStatus(healthData);
                updatedStats.databaseStatus = (healthData?.database_status || healthData?.database || 'connected') as any;
            }

            // Process institutions data if available
            if (institutionsResponse.status === 'fulfilled' && institutionsResponse.value.data) {
                const institutions = adminHelpers.extractItems(institutionsResponse.value);
                const total = adminHelpers.extractTotal(institutionsResponse.value);
                updatedStats.totalInstitutions = total || institutions.length;
            }

            setStats(updatedStats);

        } catch (error) {
            console.error('Error loading admin stats:', error);
            // Keep using mock data if all API calls fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminStats();
    }, []);

    // Get activity icon
    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'user_registered':
                return <UserPlus className="h-4 w-4" />;
            case 'user_verified':
                return <CheckCircle className="h-4 w-4" />;
            case 'institution_added':
                return <Building2 className="h-4 w-4" />;
            case 'paper_uploaded':
                return <FileText className="h-4 w-4" />;
            case 'system_alert':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    // Get severity color
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'success':
                return 'text-green-600 bg-green-100';
            case 'warning':
                return 'text-yellow-600 bg-yellow-100';
            case 'error':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-blue-600 bg-blue-100';
        }
    };

    // Check if user has admin role
    const isAdmin = user?.role?.name?.toLowerCase() === 'admin' || user?.is_superuser;

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <AdminBreadcrumb currentPage="Overview" />
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
            <AdminBreadcrumb currentPage="Admin Dashboard" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        System overview and administrative controls
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge variant={stats.systemHealth === 'healthy' ? 'default' : 'destructive'}>
                        {stats.systemHealth === 'healthy' ? '🟢' : '🔴'} System {stats.systemHealth}
                    </Badge>
                    <Button>
                        <Settings className="h-4 w-4 mr-2" />
                        System Settings
                    </Button>
                </div>
            </div>

            {/* Key Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
                        <p className="text-xs text-green-600">
                            +{stats.todayRegistrations} today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.activeUsers)}</div>
                        <p className="text-xs text-muted-foreground">
                            {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Institutions</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.totalInstitutions)}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatNumber(stats.totalFaculties)} faculties
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Exam Papers</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.totalPapers)}</div>
                        <p className="text-xs text-blue-600">
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            Growing daily
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* System Health & Pending Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">System Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Database</span>
                            <Badge variant={stats.databaseStatus === 'connected' ? 'default' : 'destructive'}>
                                <Database className="h-3 w-3 mr-1" />
                                {stats.databaseStatus}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">API Status</span>
                            <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Operational
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Storage</span>
                            <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Normal
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pending Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Email Verifications</span>
                            <Badge variant="outline">{stats.pendingVerifications}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">System Alerts</span>
                            <Badge variant="outline">{alerts.filter(a => !a.resolved).length}</Badge>
                        </div>
                        <Button size="sm" className="w-full">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Bulk Verifications
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Users className="h-4 w-4 mr-2" />
                            Manage Users
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Building2 className="h-4 w-4 mr-2" />
                            Add Institution
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & System Alerts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activities.slice(0, 6).map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className={cn(
                                        'flex-shrink-0 p-1 rounded-full',
                                        getSeverityColor(activity.severity)
                                    )}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {activity.description}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatDate(activity.timestamp)}</span>
                                            {activity.user && (
                                                <>
                                                    <span>•</span>
                                                    <span>{activity.user}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">System Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {alerts.slice(0, 4).map((alert) => (
                                <div key={alert.id} className="border-l-4 border-yellow-400 pl-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">{alert.title}</h4>
                                        <Badge
                                            variant={alert.type === 'error' ? 'destructive' : 'outline'}
                                            className="text-xs"
                                        >
                                            {alert.type}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {alert.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatDate(alert.timestamp)}
                                    </p>
                                </div>
                            ))}
                            {alerts.length === 0 && (
                                <div className="text-center py-4">
                                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No active alerts</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}