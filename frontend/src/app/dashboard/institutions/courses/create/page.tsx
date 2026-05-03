'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { CourseForm } from '@/components/forms/course-form';

const CreateCoursePage: React.FC = () => {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/dashboard/institutions/courses');
    };

    const handleCancel = () => {
        router.push('/dashboard/institutions/courses');
    };

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <AdminBreadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Institutions', href: '/dashboard/institutions' },
                    { label: 'Courses', href: '/dashboard/institutions/courses' },
                    { label: 'Create Course', href: '#' }
                ]}
            />

            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                </Button>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
                <p className="text-muted-foreground">
                    Add a new course to the system
                </p>
            </div>

            <CourseForm
                mode="create"
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default CreateCoursePage;

