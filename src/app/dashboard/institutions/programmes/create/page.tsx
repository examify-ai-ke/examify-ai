'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { ProgrammeForm } from '@/components/forms/programme-form';

export default function CreateProgrammePage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <AdminBreadcrumb
                currentPage="Create Programme"
                items={[
                    { label: 'Institutions', href: '/dashboard/institutions' },
                    { label: 'Programmes', href: '/dashboard/institutions/programmes' },
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
                                <CardTitle>Create New Programme</CardTitle>
                                <CardDescription>
                                    Add a new academic programme to the system
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ProgrammeForm
                            mode="create"
                            onSuccess={() => router.push('/dashboard/institutions/programmes')}
                            onCancel={() => router.back()}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

