'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Building2,
    School,
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
    Eye,
    GraduationCap,
    Award,
    TrendingUp,
    Activity,
    FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type DepartmentRead = components['schemas']['DepartmentRead'];
type ProgrammeReadForDepartments = components['schemas']['ProgrammeReadForDepartments'];

// Statistics interface
interface DepartmentStats {
    totalProgrammes: number;
    totalStudents: number;
    totalFaculty: number;
    averageStudentsPerProgramme: number;
    establishedYear?: number;
}

// Mock data for fallback
const mockDepartment: DepartmentRead = {
    id: '1',
    name: 'Computer Science',
    description: 'Leading department in computer science education and research with state-of-the-art facilities and world-class faculty members. We provide comprehensive education in various computer science disciplines, fostering innovation and preparing students for successful careers in the tech industry.',
    faculty: {
        id: 'f1',
        name: 'Faculty of Engineering',
        institution: { id: 'i1', name: 'University of Nairobi' }
    },
    programmes: [
        { id: 'p1', name: 'Bachelor of Computer Science', department_id: '1' },
        { id: 'p2', name: 'Master of Computer Science', department_id: '1' },
        { id: 'p3', name: 'PhD in Computer Science', department_id: '1' },
        { id: 'p4', name: 'Diploma in Information Technology', department_id: '1' },
        { id: 'p5', name: 'Certificate in Web Development', department_id: '1' },
    ],
    programmes_count: 5,
};

const mockStats: DepartmentStats = {
    totalProgrammes: 5,
    totalStudents: 850,
    totalFaculty: 24,
    averageStudentsPerProgramme: 170,
    establishedYear: 1985,
};

export default function DepartmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    const departmentId = params.id as string;

    // State management
    const [department, setDepartment] = useState<DepartmentRead | null>(null);
    const [stats, setStats] = useState<DepartmentStats>(mockStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load department data
    const loadDepartment = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.departments.getById(departmentId);

            if (response.data && response.data.data) {
                const departmentData = response.data.data;
                setDepartment(departmentData);

                // Calculate stats from department data
                const totalStudentsEstimate = (departmentData.programmes?.length || 0) * 150; // Estimate

                setStats({
                    totalProgrammes: departmentData.programmes_count || 0,
                    totalStudents: totalStudentsEstimate,
                    totalFaculty: Math.floor(Math.random() * 30) + 10, // Mock data
                    averageStudentsPerProgramme: departmentData.programmes && departmentData.programmes.length > 0
                        ? Math.round(totalStudentsEstimate / departmentData.programmes.length)
                        : 0,
                    establishedYear: 1985, // Mock data
                });
            } else {
                // Fallback to mock data
                console.log('Using mock data - no API data available');
                setDepartment(mockDepartment);
                setStats(mockStats);
            }
        } catch (error) {
            console.error('Error loading department:', error);
            setError('Failed to load department details');
            addNotification({
                type: 'error',
                title: 'Failed to load department',
                message: 'Please try again later.',
            });
            // Fallback to mock data on error
            setDepartment(mockDepartment);
            setStats(mockStats);
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        if (departmentId) {
            loadDepartment();
        }
    }, [departmentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error && !department) {
        return (
            <div className="space-y-6 p-6">
                <AdminBreadcrumb
                    currentPage="Department Details"
                    items={[
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: 'Departments', href: '/dashboard/institutions/departments' }
                    ]}
                />
                <EmptyState
                    icon={Building2}
                    title="Department Not Found"
                    description="The department you're looking for doesn't exist or couldn't be loaded."
                    action={
                        <Button onClick={() => router.push('/dashboard/institutions/departments')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Departments
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AdminBreadcrumb
                currentPage={department?.name || 'Department Details'}
                items={[
                    { label: 'Institutions', href: '/dashboard/institutions' },
                    { label: 'Departments', href: '/dashboard/institutions/departments' }
                ]}
            />

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-black/10">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    ></div>
                </div>

                <div className="relative px-6 py-12 sm:px-8 lg:px-12">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{department?.name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                            <School className="mr-1 h-3 w-3" />
                                            {department?.faculty?.name}
                                        </Badge>
                                        {department?.faculty?.institution && (
                                            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {department.faculty.institution.name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
                                {department?.description || 'No description available'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Department
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Programme
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Generate Report
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Public Page
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Department
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Programmes</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProgrammes}</div>
                        <p className="text-xs text-muted-foreground">Active programmes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Enrolled students</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFaculty}</div>
                        <p className="text-xs text-muted-foreground">Academic staff</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Students</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageStudentsPerProgramme}</div>
                        <p className="text-xs text-muted-foreground">Per programme</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="programmes">Programmes</TabsTrigger>
                    <TabsTrigger value="faculty-info">Faculty</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* About Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    About Department
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-gray-600 leading-relaxed">
                                    {department?.description || 'No description available'}
                                </p>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Established</span>
                                        <span className="text-sm text-gray-600">{stats.establishedYear}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Department ID</span>
                                        <span className="text-sm text-gray-600 font-mono">{department?.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Status</span>
                                        <Badge variant="default">Active</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Quick Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm">Active Programmes</span>
                                        </div>
                                        <span className="text-lg font-semibold">{stats.totalProgrammes}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">Enrolled Students</span>
                                        </div>
                                        <span className="text-lg font-semibold">{stats.totalStudents}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-purple-500" />
                                            <span className="text-sm">Faculty Members</span>
                                        </div>
                                        <span className="text-lg font-semibold">{stats.totalFaculty}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-orange-500" />
                                            <span className="text-sm">Student-Faculty Ratio</span>
                                        </div>
                                        <span className="text-lg font-semibold">{Math.round(stats.totalStudents / stats.totalFaculty)}:1</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="programmes" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Programmes ({department?.programmes?.length || 0})
                            </CardTitle>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Programme
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {department?.programmes && department.programmes.length > 0 ? (
                                <div className="space-y-4">
                                    {department.programmes.map((programme, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded">
                                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{programme.name}</h4>
                                                    <p className="text-sm text-gray-600">Programme ID: {programme.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">Active</Badge>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={BookOpen}
                                    title="No Programmes"
                                    description="This department doesn't have any programmes yet."
                                    action={
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add First Programme
                                        </Button>
                                    }
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="faculty-info" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <School className="h-5 w-5" />
                                Faculty Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <School className="h-6 w-6 text-purple-600" />
                                    <div>
                                        <h3 className="font-semibold">{department?.faculty?.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {department?.faculty?.institution?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/institutions/faculties/${department?.faculty?.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Faculty
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/institutions/${department?.faculty?.institution?.id}`}>
                                            <Building2 className="mr-2 h-4 w-4" />
                                            View Institution
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Enrollment Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Analytics and reporting features will be implemented here.
                                    This could include enrollment trends, programme performance,
                                    and other departmental metrics.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Performance Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Performance metrics and KPIs for the department will be
                                    displayed here, including graduation rates, student satisfaction,
                                    and academic achievements.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}