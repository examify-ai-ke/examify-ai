'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    BookOpen,
    FileText,
    Calendar,
    ArrowLeft,
    Edit,
    Trash2,
    Plus,
    Library,
    FileCheck,
} from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ModuleForm } from '@/components/forms/module-form';

type ModuleRead = components['schemas']['ModuleRead'];

export default function ModuleDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { addNotification } = useUIStore();
    const moduleId = params.id as string;

    // State
    const [module, setModule] = useState<ModuleRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Load module data
    const loadModule = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.modules.getById(moduleId);
            if (response.data?.data) {
                setModule(response.data.data);
            } else {
                setModule(null);
            }
        } catch (error) {
            console.error('Error loading module:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load module',
                message: 'Please try again later.',
            });
            setModule(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadModule();
    }, [moduleId]);

    // Handle delete
    const handleDeleteModule = async () => {
        try {
            await adminAPI.modules.delete(moduleId);
            addNotification({
                type: 'success',
                title: 'Module deleted',
                message: 'The module has been deleted successfully.',
            });
            router.push('/dashboard/institutions/modules');
        } catch (error: any) {
            console.error('Error deleting module:', error);
            addNotification({
                type: 'error',
                title: 'Failed to delete module',
                message: error.message || 'Please try again later.',
            });
        }
    };

    // Handle form success
    const handleFormSuccess = async () => {
        setShowEditModal(false);
        await loadModule();
    };

    // Handle view course
    const handleViewCourse = (courseId: string) => {
        router.push(`/dashboard/institutions/courses/${courseId}`);
    };

    // Handle view exam paper
    const handleViewExamPaper = (examPaperId: string) => {
        router.push(`/dashboard/exam-papers/${examPaperId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!module) {
        return (
            <div className="space-y-6">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
                <EmptyState
                    title="Module not found"
                    description="The requested module could not be found."
                    action={
                        <Button onClick={() => router.push('/dashboard/institutions/modules')}>
                            View All Modules
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Institutions', href: '/dashboard/institutions' },
                    { label: 'Modules', href: '/dashboard/institutions/modules' },
                    { label: module.name }
                ]}
                showHome={false}
            />

            {/* Back Button */}
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            {/* Module Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{module.name}</h1>
                        <Badge variant="secondary">{module.unit_code}</Badge>
                    </div>
                    {module.description && (
                        <p className="text-gray-500 mt-2">{module.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowEditModal(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Module
                    </Button>
                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Associated Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{module.courses?.length || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Exam Papers</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{module.exam_papers_count || module.exam_papers?.length || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="courses" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="courses">Courses ({module.courses?.length || 0})</TabsTrigger>
                    <TabsTrigger value="exams">Exam Papers ({module.exam_papers_count || module.exam_papers?.length || 0})</TabsTrigger>
                </TabsList>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-4">
                    {module.courses && module.courses.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {module.courses.map((course: any) => (
                                <Card
                                    key={course.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => handleViewCourse(course.id)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <BookOpen className="h-5 w-5" />
                                                    {course.name}
                                                </CardTitle>
                                                <CardDescription className="mt-2">
                                                    {course.course_acronym}
                                                </CardDescription>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewCourse(course.id);
                                                }}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {course.description && (
                                        <CardContent>
                                            <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No courses"
                            description="This module is not associated with any courses yet."
                        />
                    )}
                </TabsContent>

                {/* Exam Papers Tab */}
                <TabsContent value="exams" className="space-y-4">
                    {module.exam_papers && module.exam_papers.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {module.exam_papers.map((examPaper: any) => (
                                <Card
                                    key={examPaper.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => handleViewExamPaper(examPaper.id)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    {examPaper.title?.name || 'Untitled Exam'}
                                                </CardTitle>
                                                <CardDescription className="mt-2">
                                                    {examPaper.description?.name || 'No description'}
                                                </CardDescription>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewExamPaper(examPaper.id);
                                                }}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            {examPaper.year && (
                                                <Badge variant="outline">
                                                    <Calendar className="mr-1 h-3 w-3" />
                                                    {examPaper.year}
                                                </Badge>
                                            )}
                                            {examPaper.duration && (
                                                <Badge variant="outline">{examPaper.duration} min</Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No exam papers"
                            description="This module doesn't have any exam papers yet."
                        />
                    )}
                </TabsContent>
            </Tabs>

            {/* Edit Module Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Module</DialogTitle>
                        <DialogDescription>
                            Update module information
                        </DialogDescription>
                    </DialogHeader>
                    <ModuleForm
                        module={module}
                        mode="edit"
                        onSuccess={handleFormSuccess}
                        onCancel={() => setShowEditModal(false)}
                        embedded={true}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Module</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{module.name}&quot;?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteModule} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

