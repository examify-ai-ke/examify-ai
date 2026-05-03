'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';
import { ModuleForm } from '@/components/forms/module-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';

type ModuleRead = components['schemas']['ModuleRead'];

export default function EditModulePage() {
    const params = useParams();
    const router = useRouter();
    const { addNotification } = useUIStore();
    const moduleId = params.id as string;

    const [module, setModule] = useState<ModuleRead | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        loadModule();
    }, [moduleId]);

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
                    { label: module.name, href: `/dashboard/institutions/modules/${moduleId}` },
                    { label: 'Edit' }
                ]}
                showHome={false}
            />

            {/* Form */}
            <ModuleForm
                module={module}
                mode="edit"
                onSuccess={() => router.push(`/dashboard/institutions/modules/${moduleId}`)}
            />
        </div>
    );
}

