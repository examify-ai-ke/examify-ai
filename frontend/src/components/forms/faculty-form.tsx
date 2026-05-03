'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    School,
    Save,
    X,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type FacultyRead = components['schemas']['FacultyRead'];
type FacultyCreate = components['schemas']['FacultyCreate'];
type FacultyUpdate = components['schemas']['FacultyUpdate'];

// Faculty form validation schema
const facultyFormSchema = z.object({
    name: z.string()
        .min(2, 'Faculty name must be at least 2 characters')
        .max(100, 'Faculty name must not exceed 100 characters'),        
    description: z.string()
        .nullable()
        .optional()
        .refine((val) => !val || val.length >= 10, {
            message: 'Description must be at least 10 characters if provided'
        })
        .refine((val) => !val || val.length <= 500, {
            message: 'Description must not exceed 500 characters'
        }),
});

type FacultyFormData = z.infer<typeof facultyFormSchema>;

interface FacultyFormProps {
    faculty?: FacultyRead;
    mode: 'create' | 'edit';
    onSuccess?: (faculty: FacultyRead) => void;
    onCancel?: () => void;
    className?: string;
    embedded?: boolean; // New prop to indicate if form is embedded in a modal
}

export function FacultyForm({
    faculty,
    mode,
    onSuccess,
    onCancel,
    className,
    embedded = false
}: FacultyFormProps) {
    const { addNotification } = useUIStore();
    const [loading, setLoading] = useState(false);

    const form = useForm<FacultyFormData>({
        resolver: zodResolver(facultyFormSchema),
        defaultValues: faculty ? {
            name: faculty.name || '',
            description: faculty.description || '',
        } : {
            name: '',
            description: '',
        }
    });

    const onSubmit = async (data: FacultyFormData) => {
        try {
            setLoading(true);

            let response;
            if (mode === 'create') {
                const createData: FacultyCreate = {
                    name: data.name,
                    description: data.description || null,
                };
                response = await adminAPI.faculties.create(createData);
            } else {
                if (!faculty?.id) {
                    throw new Error('Faculty ID is required for update');
                }
                const updateData: FacultyUpdate = {
                    name: data.name,
                    description: data.description || null,
                };
                response = await adminAPI.faculties.update(faculty.id, updateData);
            }

            if (response.data?.data) {
                addNotification({
                    type: 'success',
                    title: `Faculty ${mode === 'create' ? 'created' : 'updated'} successfully`,
                    message: `${data.name} has been ${mode === 'create' ? 'created' : 'updated'}.`,
                });

                // Reset form and call success callback
                form.reset();
                onSuccess?.(response.data.data);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} faculty:`, error);
            addNotification({
                type: 'error',
                title: `Failed to ${mode === 'create' ? 'create' : 'update'} faculty`,
                message: error.message || 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        onCancel?.();
    };

    const formContent = (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Faculty Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Faculty Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Faculty of Engineering"
                                    {...field}
                                    disabled={loading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the faculty's focus, mission, and academic areas..."
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value || ''}
                                    disabled={loading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {mode === 'create' ? 'Create Faculty' : 'Update Faculty'}
                    </Button>
                </div>
            </form>
        </Form>
    );

    // If embedded in a modal, don't wrap in Card
    if (embedded) {
        return <div className={className}>{formContent}</div>;
    }

    // Default standalone form with Card wrapper
    return (
        <Card className={cn('w-full max-w-2xl', className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    {mode === 'create' ? 'Create New Faculty' : 'Edit Faculty'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    );
}
