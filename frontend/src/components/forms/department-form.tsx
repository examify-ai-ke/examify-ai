'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    Building2,
    Save,
    X,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type DepartmentRead = components['schemas']['DepartmentRead'];
type DepartmentCreate = components['schemas']['DepartmentCreate'];
type DepartmentUpdate = components['schemas']['DepartmentUpdate'];
type FacultyRead = components['schemas']['FacultyRead'];

// Form validation schema
const departmentFormSchema = z.object({
    name: z.string()
        .min(2, 'Department name must be at least 2 characters')
        .max(100, 'Department name must not exceed 100 characters'),
    description: z.string()
        .optional()
        .refine((val) => !val || val.length >= 10, {
            message: 'Description must be at least 10 characters if provided'
        })
        .refine((val) => !val || val.length <= 500, {
            message: 'Description must not exceed 500 characters'
        }),
    faculty_id: z.string()
        .min(1, 'Please select a faculty'),
});

type DepartmentFormData = z.infer<typeof departmentFormSchema>;

interface DepartmentFormProps {
    department?: DepartmentRead;
    mode: 'create' | 'edit';
    onSuccess?: (department: DepartmentRead) => void;
    onCancel?: () => void;
    className?: string;
    embedded?: boolean; // New prop to indicate if form is embedded in a modal
    defaultFacultyId?: string; // New prop to pre-select a faculty
}

export function DepartmentForm({
    department,
    mode,
    onSuccess,
    onCancel,
    className,
    embedded = false,
    defaultFacultyId
}: DepartmentFormProps) {
    const { addNotification } = useUIStore();
    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState<FacultyRead[]>([]);
    const [loadingFaculties, setLoadingFaculties] = useState(true);

    const form = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentFormSchema),
        defaultValues: department ? {
            name: department.name || '',
            description: department.description || '',
            faculty_id: department.faculty?.id || '',
        } : {
            name: '',
            description: '',
            faculty_id: defaultFacultyId || '',
        }
    });

    // Load faculties for dropdown
    useEffect(() => {
        const loadFaculties = async () => {
            try {
                setLoadingFaculties(true);
                const response = await adminAPI.faculties.list({ limit: 100 });
                if (response.data?.data) {
                    const facultiesData = Array.isArray(response.data.data)
                        ? response.data.data
                        : response.data.data.items || [];
                    setFaculties(facultiesData);
                }
            } catch (error) {
                console.error('Error loading faculties:', error);
                addNotification({
                    type: 'error',
                    title: 'Failed to load faculties',
                    message: 'Please try again later.',
                });
            } finally {
                setLoadingFaculties(false);
            }
        };

        loadFaculties();
    }, [addNotification]);

    const onSubmit = async (data: DepartmentFormData) => {
        try {
            setLoading(true);

            let response;
            if (mode === 'create') {
                const createData: DepartmentCreate = {
                    name: data.name,
                    description: data.description || null,
                    faculty_id: data.faculty_id,
                };
                response = await adminAPI.departments.create(createData);
            } else {
                if (!department?.id) {
                    throw new Error('Department ID is required for update');
                }
                const updateData: DepartmentUpdate = {
                    name: data.name,
                    description: data.description || null,
                    faculty_id: data.faculty_id,
                };
                response = await adminAPI.departments.update(department.id, updateData);
            }

            if (response.data?.data) {
                addNotification({
                    type: 'success',
                    title: `Department ${mode === 'create' ? 'created' : 'updated'} successfully`,
                    message: `${data.name} has been ${mode === 'create' ? 'created' : 'updated'}.`,
                });

                // Reset form and call success callback
                form.reset();
                onSuccess?.(response.data.data);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} department:`, error);
            addNotification({
                type: 'error',
                title: `Failed to ${mode === 'create' ? 'create' : 'update'} department`,
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
                {/* Department Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Computer Science Department"
                                    {...field}
                                    disabled={loading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Faculty Selection */}
                <FormField
                    control={form.control}
                    name="faculty_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Faculty *</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={loading || loadingFaculties}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a faculty" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {loadingFaculties ? (
                                        <SelectItem value="loading" disabled>
                                            <LoadingSpinner className="mr-2 h-4 w-4" />
                                            Loading faculties...
                                        </SelectItem>
                                    ) : faculties.length === 0 ? (
                                        <SelectItem value="no-faculties" disabled>
                                            <AlertCircle className="mr-2 h-4 w-4" />
                                            No faculties available
                                        </SelectItem>
                                    ) : (
                                        faculties.map((faculty) => (
                                            <SelectItem key={faculty.id} value={faculty.id}>
                                                {faculty.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
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
                                    placeholder="Describe the department's focus, programs, and academic areas..."
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
                    <Button type="submit" disabled={loading || loadingFaculties}>
                        {loading ? (
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {mode === 'create' ? 'Create Department' : 'Update Department'}
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
                    <Building2 className="h-5 w-5" />
                    {mode === 'create' ? 'Create New Department' : 'Edit Department'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    );
}