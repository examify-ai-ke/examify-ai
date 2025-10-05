'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

type ProgrammeRead = components['schemas']['ProgrammeRead'];

// Validation schema
const programmeSchema = z.object({
    name: z.string().min(2, 'Programme name must be at least 2 characters'),
    description: z.string().optional(),
    department_id: z.string().min(1, 'Department is required'),
});

type ProgrammeFormData = z.infer<typeof programmeSchema>;

interface ProgrammeFormProps {
    programme?: ProgrammeRead;
    mode?: 'create' | 'edit';
    onSuccess?: () => void;
    onCancel?: () => void;
    embedded?: boolean;
    defaultDepartmentId?: string;
}

export const ProgrammeForm: React.FC<ProgrammeFormProps> = ({
    programme,
    mode = 'create',
    onSuccess,
    onCancel,
    embedded = false,
    defaultDepartmentId
}) => {
    const { addNotification } = useUIStore();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Array<{ id: string; name: string; faculty?: { name: string } }>>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty }
    } = useForm<ProgrammeFormData>({
        resolver: zodResolver(programmeSchema),
        defaultValues: {
            name: programme?.name || '',
            description: programme?.description || '',
            department_id: programme?.department?.id || defaultDepartmentId || '',
        }
    });

    const selectedDepartmentId = watch('department_id');

    // Load departments for dropdown
    useEffect(() => {
        const loadDepartments = async () => {
            try {
                setLoadingDepartments(true);
                const response = await adminAPI.departments.list({ limit: 100 });
                if (response.data?.data) {
                    const departmentsData = Array.isArray(response.data.data)
                        ? response.data.data
                        : response.data.data.items || [];
                    setDepartments(departmentsData.map((dept: any) => ({
                        id: dept.id,
                        name: dept.name,
                        faculty: dept.faculty
                    })));
                }
            } catch (error) {
                console.error('Error loading departments:', error);
                addNotification({
                    type: 'error',
                    title: 'Failed to load departments',
                    message: 'Please refresh the page to try again.',
                });
            } finally {
                setLoadingDepartments(false);
            }
        };

        loadDepartments();
    }, [addNotification]);

    const onSubmit = async (data: ProgrammeFormData) => {
        try {
            setLoading(true);

            if (mode === 'create') {
                await adminAPI.programmes.create({
                    name: data.name,
                    description: data.description || '',
                    department_id: data.department_id,
                });

                addNotification({
                    type: 'success',
                    title: 'Programme created',
                    message: `${data.name} has been created successfully.`,
                });
            } else if (mode === 'edit' && programme) {
                await adminAPI.programmes.update(programme.id, {
                    name: data.name,
                    description: data.description || '',
                    department_id: data.department_id,
                });

                addNotification({
                    type: 'success',
                    title: 'Programme updated',
                    message: `${data.name} has been updated successfully.`,
                });
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} programme:`, error);
            addNotification({
                type: 'error',
                title: `Failed to ${mode === 'create' ? 'create' : 'update'} programme`,
                message: error.message || 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Programme Name */}
            <div className="space-y-2">
                <Label htmlFor="name">
                    Programme Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Bachelor of Computer Science"
                    disabled={loading}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Enter programme description..."
                    rows={4}
                    disabled={loading}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            {/* Department Selection */}
            <div className="space-y-2">
                <Label htmlFor="department_id">
                    Department <span className="text-red-500">*</span>
                </Label>
                {loadingDepartments ? (
                    <div className="flex items-center gap-2 p-2 border rounded">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading departments...</span>
                    </div>
                ) : (
                    <Select
                        value={selectedDepartmentId}
                        onValueChange={(value) => setValue('department_id', value, { shouldDirty: true })}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name} {dept.faculty && `(${dept.faculty.name})`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {errors.department_id && (
                    <p className="text-sm text-red-500">{errors.department_id.message}</p>
                )}
            </div>

            {/* Form Actions */}
            <div className={`flex ${embedded ? 'justify-end' : 'justify-between'} gap-3 pt-4`}>
                {!embedded && onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                )}
                {embedded && onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading || !isDirty}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {mode === 'create' ? 'Creating...' : 'Saving...'}
                        </>
                    ) : (
                        <>{mode === 'create' ? 'Create Programme' : 'Save Changes'}</>
                    )}
                </Button>
            </div>
        </form>
    );
};

