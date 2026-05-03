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

// Programme type options matching the API enum
const PROGRAMME_TYPES = [
    { value: 'Certificate', label: 'Certificate' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Bachelors/Undergraduate', label: 'Bachelors/Undergraduate' },
    { value: 'Masters', label: 'Masters' },
    { value: 'Doctorate', label: 'Doctorate' },
    { value: 'Postgraduate Diploma', label: 'Postgraduate Diploma' },
    { value: 'PhD Programmes', label: 'PhD Programmes' },
    { value: 'Online MBA', label: 'Online MBA' },
    { value: 'Others', label: 'Others' },
] as const;

// Validation schema
const programmeSchema = z.object({
    name: z.enum([
        'Certificate',
        'Diploma',
        'Bachelors/Undergraduate',
        'Masters',
        'Doctorate',
        'Postgraduate Diploma',
        'PhD Programmes',
        'Online MBA',
        'Others'
    ], {
        required_error: 'Programme type is required',
        invalid_type_error: 'Please select a valid programme type',
    }),
    description: z.string().optional(),
    department_id: z.string().optional(), // Department is optional
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
            name: programme?.name || 'Bachelors/Undergraduate',
            description: programme?.description || '',
            department_id: programme?.department?.id || defaultDepartmentId || '',
        }
    });

    const selectedProgrammeName = watch('name');
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
                const createData: any = {
                    name: data.name,
                    description: data.description || null,
                };
                
                // Only include department_id if it's provided
                if (data.department_id) {
                    createData.department_id = data.department_id;
                }

                await adminAPI.programmes.create(createData);

                addNotification({
                    type: 'success',
                    title: 'Programme created',
                    message: `${data.name} has been created successfully.`,
                });
            } else if (mode === 'edit' && programme) {
                const updateData: any = {
                    name: data.name,
                    description: data.description || null,
                };
                
                // Only include department_id if it's provided
                if (data.department_id) {
                    updateData.department_id = data.department_id;
                }

                await adminAPI.programmes.update(programme.id, updateData);

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
            
            // Default error message
            let errorMessage = 'Please try again later.';
            let errorTitle = `Failed to ${mode === 'create' ? 'create' : 'update'} programme`;
            
            // Check if this is a duplicate programme error
            // The error message from the database contains "duplicate key value violates unique constraint"
            const errorString = JSON.stringify(error).toLowerCase();
            const isDuplicateError = 
                errorString.includes('duplicate') || 
                errorString.includes('already exists') ||
                errorString.includes('unique constraint') ||
                (error.response?.status === 409) ||
                (error.status === 409);
            
            if (isDuplicateError) {
                errorTitle = 'Programme already exists';
                errorMessage = `A programme of type "${data.name}" already exists. Each programme type can only be created once. Please select a different programme type.`;
            }
            // Handle validation errors from FastAPI
            else if (error.response?.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    errorMessage = error.response.data.detail
                        .map((err: any) => err.msg || err.message)
                        .join(', ');
                } else if (typeof error.response.data.detail === 'string') {
                    errorMessage = error.response.data.detail;
                }
            }
            // Handle other error formats
            else if (error.data?.detail) {
                if (Array.isArray(error.data.detail)) {
                    errorMessage = error.data.detail
                        .map((err: any) => err.msg || err.message)
                        .join(', ');
                } else if (typeof error.data.detail === 'string') {
                    errorMessage = error.data.detail;
                }
            }
            // Fallback to error message if available
            else if (error.message) {
                errorMessage = error.message;
            }
            
            addNotification({
                type: 'error',
                title: errorTitle,
                message: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Programme Type */}
            <div className="space-y-2">
                <Label htmlFor="name">
                    Programme Type <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedProgrammeName}
                    onValueChange={(value) => setValue('name', value as any, { shouldDirty: true })}
                    disabled={loading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select programme type" />
                    </SelectTrigger>
                    <SelectContent>
                        {PROGRAMME_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                    Department <span className="text-gray-400">(Optional)</span>
                </Label>
                {loadingDepartments ? (
                    <div className="flex items-center gap-2 p-2 border rounded">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading departments...</span>
                    </div>
                ) : (
                    <Select
                        value={selectedDepartmentId || 'none'}
                        onValueChange={(value) => setValue('department_id', value === 'none' ? '' : value, { shouldDirty: true })}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a department (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">
                                <span className="text-gray-500">No department</span>
                            </SelectItem>
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

