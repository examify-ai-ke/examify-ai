'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import { CourseRead } from '@/types/generated/api';
import { Button } from '@/components/ui/button';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CourseForm } from '@/components/forms/course-form';

const EditCoursePage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const { addNotification } = useUIStore();

    const courseId = params.id as string;

    const [course, setCourse] = useState<CourseRead | null>(null);
    const [loading, setLoading] = useState(true);

    // Load course data
    useEffect(() => {
        const loadCourse = async () => {
            try {
                setLoading(true);
                const response = await adminAPI.courses.getById(courseId);

                if (response.data && response.data.data) {
                    setCourse(response.data.data);
                } else {
                    addNotification({
                        type: 'error',
                        title: 'Course not found',
                        message: 'The course you are trying to edit does not exist.',
                    });
                    router.push('/dashboard/institutions/courses');
                }
            } catch (error) {
                console.error('Error loading course:', error);
                addNotification({
                    type: 'error',
                    title: 'Failed to load course',
                    message: 'Please try again later.',
                });
                router.push('/dashboard/institutions/courses');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    const handleSuccess = () => {
        router.push(`/dashboard/institutions/courses/${courseId}`);
    };

    const handleCancel = () => {
        router.push(`/dashboard/institutions/courses/${courseId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto py-6">
                <AdminBreadcrumb
                    items={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: 'Courses', href: '/dashboard/institutions/courses' },
                        { label: 'Edit Course', href: '#' }
                    ]}
                />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!course) {
        return null;
    }

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <AdminBreadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Institutions', href: '/dashboard/institutions' },
                    { label: 'Courses', href: '/dashboard/institutions/courses' },
                    { label: course.name, href: `/dashboard/institutions/courses/${courseId}` },
                    { label: 'Edit', href: '#' }
                ]}
            />

            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Course
                </Button>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
                <p className="text-muted-foreground">
                    Update the course information below
                </p>
            </div>

            <CourseForm
                course={course}
                mode="edit"
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default EditCoursePage;

