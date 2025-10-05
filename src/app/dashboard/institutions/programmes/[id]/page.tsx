'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    GraduationCap,
    BookOpen,
    Building2,
    School,
    Edit,
    Trash2,
    ArrowLeft,
    Plus,
    Eye,
    MoreHorizontal,
    FileText,
} from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
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
import { ProgrammeForm } from '@/components/forms/programme-form';

type ProgrammeRead = components['schemas']['ProgrammeRead'];

export default function ProgrammeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { addNotification } = useUIStore();

    const programmeId = params.id as string;

    // State
    const [programme, setProgramme] = useState<ProgrammeRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Load programme data
    const loadProgramme = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.programmes.getById(programmeId);

            if (response.data?.data) {
                setProgramme(response.data.data);
            } else {
                setProgramme(null);
            }
        } catch (error) {
            console.error('Error loading programme:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load programme',
                message: 'Please try again later.',
            });
            setProgramme(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (programmeId) {
            loadProgramme();
        }
    }, [programmeId]);

    // Handle delete
    const handleDelete = async () => {
        if (!programme) return;

        try {
            await adminAPI.programmes.delete(programme.id);
            addNotification({
                type: 'success',
                title: 'Programme deleted',
                message: `${programme.name} has been deleted successfully.`,
            });
            router.push('/dashboard/institutions/programmes');
        } catch (error: any) {
            console.error('Error deleting programme:', error);
            addNotification({
                type: 'error',
                title: 'Failed to delete programme',
                message: error.message || 'Please try again later.',
            });
        }
        setShowDeleteDialog(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!programme) {
        return (
            <div className="space-y-6 p-6">
                <AdminBreadcrumb
                    currentPage="Programme Details"
                    items={[
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: 'Programmes', href: '/dashboard/institutions/programmes' },
                    ]}
                />
                <EmptyState
                    icon={GraduationCap}
                    title="Programme not found"
                    description="The programme you're looking for doesn't exist or has been removed."
                    action={
                        <Button onClick={() => router.push('/dashboard/institutions/programmes')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Programmes
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Hero Section */}
            <div className="relative h-72 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/30"></div>

                {/* Content */}
                <div className="relative container mx-auto px-6 py-8 h-full flex flex-col justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard/institutions/programmes')}
                            className="text-white/90 hover:text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Programmes
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Badge className="bg-purple-500/90 text-white border-0 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                                    Programme
                                </Badge>
                                {/* Handle departments array */}
                                {programme.departments && programme.departments.length > 0 && (
                                    <Badge variant="outline" className="bg-white/10 text-white/90 border-white/30 backdrop-blur-sm px-3 py-1.5">
                                        {programme.departments[0].name}
                                    </Badge>
                                )}
                                {programme.department && !programme.departments && (
                                    <Badge variant="outline" className="bg-white/10 text-white/90 border-white/30 backdrop-blur-sm px-3 py-1.5">
                                        {programme.department.name}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                                {programme.name}
                            </h1>
                            <p className="text-white/80 text-lg max-w-3xl leading-relaxed">
                                {programme.description || 'Academic programme offering comprehensive education and training'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:gap-2">
                            <Button
                                onClick={() => setShowEditModal(true)}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Programme
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/institutions/programmes/${programme.id}/edit`)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Programme
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                <AdminBreadcrumb
                    currentPage={programme.name}
                    items={[
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: 'Programmes', href: '/dashboard/institutions/programmes' },
                    ]}
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Courses</p>
                                    <p className="text-2xl font-bold">{programme.courses_count || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Departments</p>
                                    <p className="text-2xl font-bold">{programme.departments_count || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Exam Papers</p>
                                    <p className="text-2xl font-bold">{programme.exam_papers_count || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <GraduationCap className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Students</p>
                                    <p className="text-2xl font-bold">-</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="courses">Courses</TabsTrigger>
                        <TabsTrigger value="department">Department Info</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Programme Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {programme.description || 'No description available'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground">Departments</h4>
                                        <p className="font-semibold">{programme.departments_count || 0}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground">Courses</h4>
                                        <p className="font-semibold">{programme.courses_count || 0}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground">Exam Papers</h4>
                                        <p className="font-semibold">{programme.exam_papers_count || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Courses Tab */}
                    <TabsContent value="courses" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        Programme Courses ({programme.courses_count || 0})
                                    </CardTitle>
                                    <Button size="sm" onClick={() => router.push('/dashboard/institutions/courses/create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Course
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {programme.courses && programme.courses.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {programme.courses.map((course) => (
                                            <Card
                                                key={course.id}
                                                className="hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => router.push(`/dashboard/institutions/courses/${course.id}`)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold mb-1">{course.name}</h4>
                                                            {course.course_acronym && (
                                                                <Badge variant="outline" className="mt-1">
                                                                    {course.course_acronym}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/dashboard/institutions/courses/${course.id}`);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={BookOpen}
                                        title="No courses yet"
                                        description="This programme doesn't have any courses yet."
                                        action={
                                            <Button onClick={() => router.push('/dashboard/institutions/courses/create')}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add First Course
                                            </Button>
                                        }
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Department Info Tab */}
                    <TabsContent value="department" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Department Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(programme.departments && programme.departments.length > 0) || programme.department ? (
                                    <div className="space-y-3">
                                        {/* Handle departments array */}
                                        {programme.departments && programme.departments.length > 0 ? (
                                            programme.departments.map((dept) => (
                                                <div key={dept.id} className="p-4 border rounded-lg">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Building2 className="h-6 w-6 text-blue-600" />
                                                        <div>
                                                            <h3 className="font-semibold">{dept.name}</h3>
                                                            {dept.faculty && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {dept.faculty.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/institutions/departments/${dept.id}`)}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Department
                                                    </Button>
                                                </div>
                                            ))
                                        ) : programme.department ? (
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Building2 className="h-6 w-6 text-blue-600" />
                                                    <div>
                                                        <h3 className="font-semibold">{programme.department.name}</h3>
                                                        {programme.department.faculty && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {programme.department.faculty.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/dashboard/institutions/departments/${programme.department?.id}`)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Department
                                                </Button>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No department assigned</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Programme</DialogTitle>
                        <DialogDescription>
                            Update programme information.
                        </DialogDescription>
                    </DialogHeader>
                    <ProgrammeForm
                        programme={programme}
                        mode="edit"
                        onSuccess={() => {
                            setShowEditModal(false);
                            loadProgramme();
                        }}
                        onCancel={() => setShowEditModal(false)}
                        embedded={true}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Programme?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{programme.name}"? This action cannot be undone.
                            All associated courses will be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Programme
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

