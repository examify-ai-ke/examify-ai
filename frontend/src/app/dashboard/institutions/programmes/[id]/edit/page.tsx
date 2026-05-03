'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgrammeForm } from '@/components/forms/programme-form';

type ProgrammeRead = components['schemas']['ProgrammeRead'];

export default function EditProgrammePage() {
    const params = useParams();
    const router = useRouter();
    const { addNotification } = useUIStore();

    const programmeId = params.id as string;
    const [programme, setProgramme] = useState<ProgrammeRead | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        if (programmeId) {
            loadProgramme();
        }
    }, [programmeId, addNotification]);

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
                    currentPage="Edit Programme"
                    items={[
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: 'Programmes', href: '/dashboard/institutions/programmes' },
                    ]}
                />
                <EmptyState
                    icon={GraduationCap}
                    title="Programme not found"
                    description="The programme you're trying to edit doesn't exist or has been removed."
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
        <div className="space-y-6">
            <AdminBreadcrumb
                currentPage="Edit Programme"
                items={[
                    { label: 'Institutions', href: '/dashboard/institutions' },
                    { label: 'Programmes', href: '/dashboard/institutions/programmes' },
                    { label: programme.name, href: `/dashboard/institutions/programmes/${programme.id}` },
                ]}
            />

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            <div className="max-w-3xl">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle>Edit Programme</CardTitle>
                                <CardDescription>
                                    Update information for {programme.name}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ProgrammeForm
                            programme={programme}
                            mode="edit"
                            onSuccess={() => router.push(`/dashboard/institutions/programmes/${programme.id}`)}
                            onCancel={() => router.back()}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

