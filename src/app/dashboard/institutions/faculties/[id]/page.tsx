'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    School,
    Building,
    BookOpen,
    Users,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Globe,
    Edit,
    ArrowLeft,
    Plus,
    Trash2,
    MoreHorizontal,
    ExternalLink,
    GraduationCap,
    Award,
    TrendingUp,
    Activity,
    Unlink,
    Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { FacultyForm } from '@/components/forms/faculty-form';
import { DepartmentForm } from '@/components/forms/department-form';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type FacultyRead = components['schemas']['FacultyRead'];
type DepartmentReadForFaculty = components['schemas']['DepartmentReadForFaculty'];
type InstitutionForFaculty = components['schemas']['InstitutionForFaculty'];

// Statistics interface
interface FacultyStats {
    totalDepartments: number;
    totalInstitutions: number;
    totalProgrammes: number;
    totalStudents: number;
    averageProgrammesPerDepartment: number;
    establishedYear?: number;
}

// Mock data for fallback
const mockFaculty: FacultyRead = {
    id: '1',
    name: 'Faculty of Engineering',
    description: 'Leading engineering education and research programs with state-of-the-art facilities and world-class faculty members. We provide comprehensive education in various engineering disciplines, fostering innovation and preparing students for successful careers in the industry.',
    departments: [
        { id: 'd1', name: 'Civil Engineering', programmes: [] },
        { id: 'd2', name: 'Electrical Engineering', programmes: [] },
        { id: 'd3', name: 'Mechanical Engineering', programmes: [] },
        { id: 'd4', name: 'Chemical Engineering', programmes: [] },
        { id: 'd5', name: 'Computer Engineering', programmes: [] },
    ],
    department_count: 8,
    institutions: [
        { id: 'i1', name: 'University of Nairobi' }
    ],
    institution_count: 1,
};

const mockStats: FacultyStats = {
    totalDepartments: 8,
    totalInstitutions: 1,
    totalProgrammes: 24,
    totalStudents: 1200,
    averageProgrammesPerDepartment: 3,
    establishedYear: 1961,
};

export default function FacultyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    const facultyId = params.id as string;

    // State management
    const [faculty, setFaculty] = useState<FacultyRead | null>(null);
    const [stats, setStats] = useState<FacultyStats>(mockStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [departmentToUnlink, setDepartmentToUnlink] = useState<string | null>(null);

    // Load faculty data
    const loadFaculty = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Loading faculty with ID:', facultyId);
            const response = await adminAPI.faculties.getById(facultyId);
            console.log('Faculty API response:', response);

            if (response.data?.data) {
                const facultyData = response.data.data;
                console.log('Faculty data received:', facultyData);
                setFaculty(facultyData);

                // Calculate stats from faculty data
                const totalProgrammes = facultyData.departments?.reduce((acc, dept) =>
                    acc + (dept.programmes?.length || 0), 0) || 0;

                setStats({
                    totalDepartments: facultyData.department_count || facultyData.departments?.length || 0,
                    totalInstitutions: facultyData.institution_count || facultyData.institutions?.length || 0,
                    totalProgrammes,
                    totalStudents: Math.floor(Math.random() * 2000) + 500, // Mock data - TODO: get from API
                    averageProgrammesPerDepartment: facultyData.departments && facultyData.departments.length > 0
                        ? Math.round(totalProgrammes / facultyData.departments.length * 10) / 10
                        : 0,
                });
                console.log('Faculty loaded successfully:', facultyData.name);
            } else {
                console.warn('No faculty data in response:', response);
                throw new Error('No faculty data received from API');
            }
        } catch (error) {
            console.error('Error loading faculty:', error);
            setError('Failed to load faculty details');
            addNotification({
                type: 'error',
                title: 'Failed to load faculty',
                message: error instanceof Error ? error.message : 'Please try again later.',
            });

            // Don't fallback to mock data - show error state instead
            setFaculty(null);
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        if (facultyId) {
            loadFaculty();
        }
    }, [facultyId]);

    // Handle form success
    const handleFormSuccess = async () => {
        setShowEditModal(false);
        setShowAddDepartmentModal(false);
        await loadFaculty(); // Reload faculty data
    };

    // Handle delete faculty
    const handleDeleteFaculty = async () => {
        if (!faculty) return;

        try {
            await adminAPI.faculties.delete(faculty.id);
            addNotification({
                type: 'success',
                title: 'Faculty deleted',
                message: `${faculty.name} has been deleted successfully.`,
            });
            router.push('/dashboard/institutions/faculties');
        } catch (error: any) {
            console.error('Error deleting faculty:', error);
            addNotification({
                type: 'error',
                title: 'Failed to delete faculty',
                message: error.message || 'Please try again later.',
            });
        }
        setShowDeleteDialog(false);
    };

    // Handle unlink department
    const handleUnlinkDepartment = async () => {
        if (!departmentToUnlink) return;

        try {
            await adminAPI.faculties.removeDepartment(facultyId, departmentToUnlink);
            addNotification({
                type: 'success',
                title: 'Department unlinked',
                message: 'The department has been removed from this faculty.',
            });
            setDepartmentToUnlink(null);
            loadFaculty();
        } catch (error: any) {
            console.error('Error unlinking department:', error);
            addNotification({
                type: 'error',
                title: 'Failed to unlink department',
                message: error.message || 'Please try again later.',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error && !faculty) {
        return (
            <div className="space-y-6 p-6">
                <AdminBreadcrumb currentPage="Faculty Details" />
                <EmptyState
                    icon={School}
                    title="Faculty Not Found"
                    description={error}
                    action={
                        <Button onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Button>
                    }
                />
            </div>
        );
    }

    if (!faculty) {
        return (
            <div className="space-y-6 p-6">
                <AdminBreadcrumb currentPage="Faculty Details" />
                <EmptyState
                    icon={School}
                    title="Faculty Not Found"
                    description="The requested faculty could not be found or does not exist."
                    action={
                        <div className="flex gap-4">
                            <Button onClick={() => router.back()} variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go Back
                            </Button>
                            <Button onClick={() => loadFaculty()}>
                                Try Again
                            </Button>
                        </div>
                    }
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-black/10">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}
                    ></div>
                </div>

                <div className="relative px-6 py-12 lg:py-20">
                    <div className="max-w-7xl mx-auto">
                        {/* Breadcrumb */}
                        <div className="mb-8">
                            <AdminBreadcrumb
                                currentPage={faculty.name}
                                items={[
                                    { label: 'Institutions', href: '/dashboard/institutions' },
                                    { label: 'Faculties', href: '/dashboard/institutions/faculties' },
                                ]}
                            />
                        </div>

                        {/* Hero Content */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <School className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-white/30">
                                            Faculty
                                        </Badge>
                                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                                            {faculty.name}
                                        </h1>
                                    </div>
                                </div>

                                <p className="text-xl text-white/90 mb-8 max-w-3xl leading-relaxed">
                                    {faculty.description || 'Comprehensive academic faculty providing excellence in education and research.'}
                                </p>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="h-5 w-5 text-white/80" />
                                            <span className="text-white/80 text-sm">Departments</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white mt-1">
                                            {stats.totalDepartments}
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <div className="flex items-center space-x-2">
                                            <Building className="h-5 w-5 text-white/80" />
                                            <span className="text-white/80 text-sm">Institutions</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white mt-1">
                                            {stats.totalInstitutions}
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <div className="flex items-center space-x-2">
                                            <GraduationCap className="h-5 w-5 text-white/80" />
                                            <span className="text-white/80 text-sm">Programmes</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white mt-1">
                                            {stats.totalProgrammes}
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-5 w-5 text-white/80" />
                                            <span className="text-white/80 text-sm">Students</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white mt-1">
                                            {stats.totalStudents.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        size="lg"
                                        className="bg-white text-purple-600 hover:bg-white/90"
                                        onClick={() => setShowEditModal(true)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Faculty
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-white/30 text-white hover:bg-white/10"
                                        onClick={() => setShowAddDepartmentModal(true)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Department
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                                <MoreHorizontal className="mr-2 h-4 w-4" />
                                                More
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Public Page
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Users className="mr-2 h-4 w-4" />
                                                Manage Staff
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => setShowDeleteDialog(true)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Faculty
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Hero Image/Icon */}
                            <div className="hidden lg:block lg:ml-12">
                                <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                                    <School className="h-32 w-32 text-white/60" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="departments">Departments</TabsTrigger>
                            <TabsTrigger value="institutions">Institutions</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {/* Detailed Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.totalDepartments}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Active departments
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Programmes</CardTitle>
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.totalProgrammes}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Academic programmes
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Student Enrollment</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Current students
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Avg. Programmes</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.averageProgrammesPerDepartment}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Per department
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>About This Faculty</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed">
                                        {faculty.description || 'This faculty provides comprehensive education and research opportunities across multiple disciplines. Our commitment to academic excellence and innovation drives our mission to prepare students for successful careers and contribute to society through research and development.'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button
                                            variant="outline"
                                            className="h-auto p-4 flex flex-col items-center space-y-2"
                                            onClick={() => setShowAddDepartmentModal(true)}
                                        >
                                            <Plus className="h-6 w-6" />
                                            <span>Add Department</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-auto p-4 flex flex-col items-center space-y-2"
                                            onClick={() => {
                                                // TODO: Implement manage staff functionality
                                                alert('Manage Staff functionality coming soon!');
                                            }}
                                        >
                                            <Users className="h-6 w-6" />
                                            <span>Manage Staff</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-auto p-4 flex flex-col items-center space-y-2"
                                            onClick={() => {
                                                // Navigate to programmes view
                                                router.push(`/dashboard/institutions/programmes?faculty=${faculty?.id}`);
                                            }}
                                        >
                                            <BookOpen className="h-6 w-6" />
                                            <span>View Programmes</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="departments" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Departments</CardTitle>
                                        <Button
                                            size="sm"
                                            onClick={() => setShowAddDepartmentModal(true)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Department
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {faculty.departments && faculty.departments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {faculty.departments.map((department) => (
                                                <Card
                                                    key={department.id}
                                                    className="hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => router.push(`/dashboard/institutions/departments/${department.id}`)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center space-x-3 flex-1">
                                                                <div className="flex-shrink-0">
                                                                    <BookOpen className="h-8 w-8 text-blue-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-medium text-gray-900 truncate">
                                                                        {department.name}
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        {department.programmes?.length || 0} programmes
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1 ml-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        router.push(`/dashboard/institutions/departments/${department.id}`);
                                                                    }}
                                                                    title="View department details"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDepartmentToUnlink(department.id);
                                                                    }}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    title="Remove department from faculty"
                                                                >
                                                                    <Unlink className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={BookOpen}
                                            title="No Departments"
                                            description="This faculty doesn't have any departments yet."
                                            action={
                                                <Button onClick={() => setShowAddDepartmentModal(true)}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add First Department
                                                </Button>
                                            }
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="institutions" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Associated Institutions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {faculty.institutions && faculty.institutions.length > 0 ? (
                                        <div className="space-y-4">
                                            {faculty.institutions.map((institution) => (
                                                <Card key={institution.id} className="hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0">
                                                                <Building className="h-8 w-8 text-green-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-gray-900">
                                                                    {institution.name}
                                                                </h3>
                                                                <p className="text-sm text-gray-500">
                                                                    Primary institution
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => router.push(`/dashboard/institutions/${institution.id}`)}
                                                            >
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                View
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Building}
                                            title="No Institutions"
                                            description="This faculty is not associated with any institutions."
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Faculty Analytics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-medium">Growth Metrics</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Student Growth</span>
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                        +12.5%
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Programme Growth</span>
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                        +8.3%
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Research Output</span>
                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                        +15.2%
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="font-medium">Performance Indicators</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Graduation Rate</span>
                                                    <span className="font-medium">94.2%</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Employment Rate</span>
                                                    <span className="font-medium">87.6%</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Research Funding</span>
                                                    <span className="font-medium">$2.4M</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Edit Faculty Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Faculty</DialogTitle>
                        <DialogDescription>
                            Update the faculty information. Changes will be saved immediately.
                        </DialogDescription>
                    </DialogHeader>
                    {faculty && (
                        <FacultyForm
                            mode="edit"
                            faculty={faculty}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setShowEditModal(false)}
                            embedded={true}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Department Modal */}
            <Dialog open={showAddDepartmentModal} onOpenChange={setShowAddDepartmentModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Department</DialogTitle>
                        <DialogDescription>
                            Create a new department within this faculty.
                        </DialogDescription>
                    </DialogHeader>
                    {faculty ? (
                        <DepartmentForm
                            mode="create"
                            defaultFacultyId={faculty.id}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setShowAddDepartmentModal(false)}
                            embedded={true}
                        />
                    ) : (
                        <div className="p-4 text-center">
                            <p>Loading faculty information...</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Faculty</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{faculty?.name}"? This action cannot be undone and will remove all associated departments and data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteFaculty}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Faculty
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Unlink Department Confirmation */}
            <AlertDialog open={!!departmentToUnlink} onOpenChange={(open) => !open && setDepartmentToUnlink(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Department from Faculty?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will unlink the department from this faculty. The department itself will not be deleted
                            and can be added back to this faculty later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnlinkDepartment}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remove Department
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 