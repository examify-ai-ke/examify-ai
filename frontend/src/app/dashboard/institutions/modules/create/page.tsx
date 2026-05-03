'use client';

import React from 'react';
import { ModuleForm } from '@/components/forms/module-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function CreateModulePage() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Institutions', href: '/dashboard/institutions' },
                    { label: 'Modules', href: '/dashboard/institutions/modules' },
                    { label: 'Create Module' }
                ]}
                showHome={false}
            />

            {/* Form */}
            <ModuleForm mode="create" />
        </div>
    );
}

