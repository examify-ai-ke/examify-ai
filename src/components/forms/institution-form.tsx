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
    Building,
    Save,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type InstitutionRead = components['schemas']['InstitutionRead'];
type InstitutionCreate = components['schemas']['InstitutionCreate'];
type InstitutionUpdate = components['schemas']['InstitutionUpdate'];

// Form validation schema
const institutionFormSchema = z.object({
    name: z.string()
        .min(2, 'Institution name must be at least 2 characters')
        .max(200, 'Institution name must not exceed 200 characters'),
    description: z.string()
        .nullable()
        .optional()
        .refine((val) => !val || val.length >= 10, {
            message: 'Description must be at least 10 characters if provided'
        })
        .refine((val) => !val || val.length <= 1000, {
            message: 'Description must not exceed 1000 characters'
        }),
    category: z.enum(['University', 'College', 'TVET', 'TVC', 'TTI', 'Other']),
    key: z.string()
        .optional()
        .refine((val) => !val || val.length <= 10, {
            message: 'Key must not exceed 10 characters'
        }),
    location: z.string()
        .optional()
        .refine((val) => !val || val.length <= 200, {
            message: 'Location must not exceed 200 characters'
        }),
    institution_type: z.enum(['Public', 'Private']).nullable(),
    full_profile: z.string()
        .optional()
        .refine((val) => !val || val.startsWith('http'), {
            message: 'Website URL must start with http:// or https://'
        }),
    parent_ministry: z.string()
        .optional()
        .refine((val) => !val || val.length <= 200, {
            message: 'Parent ministry must not exceed 200 characters'
        }),
    tags: z.string()
        .optional(),
});

type InstitutionFormData = z.infer<typeof institutionFormSchema>;

interface InstitutionFormProps {
    institution?: InstitutionRead;
    mode: 'create' | 'edit';
    onSuccess?: (institution: InstitutionRead) => void;
    onCancel?: () => void;
    className?: string;
    embedded?: boolean; // New prop to indicate if form is embedded in a modal
}

export function InstitutionForm({
    institution,
    mode,
    onSuccess,
    onCancel,
    className,
    embedded = false
}: InstitutionFormProps) {
    const { addNotification } = useUIStore();
    const [loading, setLoading] = useState(false);
    const [checkingName, setCheckingName] = useState(false);

    // Function to check if institution name already exists
    const checkInstitutionNameExists = async (name: string): Promise<boolean> => {
        if (!name || name.trim().length < 2) return false;

        try {
            setCheckingName(true);
            // Search for institutions with this exact name
            const response = await adminAPI.institutions.search({
                q: name.trim(),
                limit: 10
            });

            if (response.data?.data?.items) {
                // Check if any institution has the exact same name (case-insensitive)
                const exactMatch = response.data.data.items.find(
                    (inst: InstitutionRead) => inst.name.toLowerCase() === name.trim().toLowerCase() &&
                        // If editing, exclude the current institution
                        (mode === 'create' || inst.id !== institution?.id)
                );
                return !!exactMatch;
            }
            return false;
        } catch (error) {
            console.error('Error checking institution name:', error);
            return false; // Don't block submission on API error
        } finally {
            setCheckingName(false);
        }
    };

    const form = useForm<InstitutionFormData>({
        resolver: zodResolver(institutionFormSchema),
        defaultValues: institution ? {
            name: institution.name || '',
            description: institution.description || '',
            category: institution.category || 'University',
            key: institution.key || '',
            location: institution.location || '',
            institution_type: institution.institution_type || 'Public',
            full_profile: institution.full_profile || '',
            parent_ministry: institution.parent_ministry || '',
            tags: institution.tags?.join(', ') || '',
        } : {
            name: '',
            description: '',
            category: 'University' as const,
            key: '',
            location: '',
            institution_type: 'Public' as const,
            full_profile: '',
            parent_ministry: '',
            tags: '',
        }
    });

    const onSubmit = async (data: InstitutionFormData) => {
        try {
            setLoading(true);

            // Check for duplicate name before submitting (for create mode)
            if (mode === 'create') {
                const nameExists = await checkInstitutionNameExists(data.name);
                if (nameExists) {
                    form.setError('name', {
                        type: 'manual',
                        message: `"${data.name}" is already taken. Please choose a different name.`
                    });
                    addNotification({
                        type: 'error',
                        title: 'Institution name already exists',
                        message: `An institution with the name "${data.name}" already exists. Please choose a different name.`,
                    });
                    return;
                }
            }

            let response;
            if (mode === 'create') {
                const createData: InstitutionCreate = {
                    name: data.name,
                    description: data.description || null,
                    category: data.category,
                    key: data.key || null,
                    location: data.location || null,
                    institution_type: data.institution_type,
                    full_profile: data.full_profile || null,
                    parent_ministry: data.parent_ministry || null,
                    image_id: null,
                    tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
                    address: null,
                };
                response = await adminAPI.institutions.create(createData);
            } else {
                if (!institution?.id) {
                    throw new Error('Institution ID is required for update');
                }
                const updateData: InstitutionUpdate = {
                    name: data.name,
                    description: data.description || null,
                    category: data.category,
                    key: data.key || null,
                    location: data.location || null,
                    institution_type: data.institution_type,
                    full_profile: data.full_profile || null,
                    parent_ministry: data.parent_ministry || null,
                    tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
                };
                response = await adminAPI.institutions.update(institution.id, updateData);
            }

            if (response.data?.data) {
                addNotification({
                    type: 'success',
                    title: `Institution ${mode === 'create' ? 'created' : 'updated'} successfully`,
                    message: `${data.name} has been ${mode === 'create' ? 'created' : 'updated'}.`,
                });

                // Reset form and call success callback
                form.reset();
                onSuccess?.(response.data.data);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} institution:`, error);

            // Handle specific error cases
            let errorTitle = `Failed to ${mode === 'create' ? 'create' : 'update'} institution`;
            let errorMessage = 'Please try again later.';

            // Check for duplicate name error (UniqueViolation)
            if (error?.message?.includes('duplicate key value violates unique constraint') ||
                error?.message?.includes('Institution_name_key') ||
                error?.message?.includes('already exists') ||
                error?.status === 500) {

                // Check if it's specifically about the institution name
                if (error?.message?.includes('name') || error?.message?.includes(data.name)) {
                    errorTitle = 'Institution name already exists';
                    errorMessage = `An institution with the name "${data.name}" already exists. Please choose a different name.`;

                    // Set form error on the name field
                    form.setError('name', {
                        type: 'manual',
                        message: `"${data.name}" is already taken. Please choose a different name.`
                    });
                } else {
                    errorTitle = 'Duplicate institution detected';
                    errorMessage = 'An institution with these details already exists. Please check your information and try again.';
                }
            }
            // Check for other validation errors
            else if (error?.status === 400 || error?.status === 422) {
                errorTitle = 'Validation error';
                errorMessage = error?.message || 'Please check your input and try again.';
            }
            // Check for permission errors
            else if (error?.status === 403) {
                errorTitle = 'Permission denied';
                errorMessage = 'You do not have permission to perform this action.';
            }
            // Check for network/server errors
            else if (error?.status >= 500) {
                errorTitle = 'Server error';
                errorMessage = 'The server encountered an error. Please try again later.';
            }
            // Generic error handling
            else {
                errorMessage = error?.message || errorMessage;
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

    const handleCancel = () => {
        form.reset();
        onCancel?.();
    };

    const formContent = (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Institution Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Institution Name *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        placeholder="e.g., University of Nairobi"
                                        {...field}
                                        disabled={loading}
                                    />
                                    {checkingName && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <LoadingSpinner className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
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
                                    placeholder="Describe the institution's mission, vision, and academic focus..."
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={loading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="University">University</SelectItem>
                                        <SelectItem value="College">College</SelectItem>
                                        <SelectItem value="TVET">TVET</SelectItem>
                                        <SelectItem value="TVC">TVC</SelectItem>
                                        <SelectItem value="TTI">TTI</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Institution Type */}
                    <FormField
                        control={form.control}
                        name="institution_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || ''}
                                    disabled={loading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Public">Public</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key */}
                    <FormField
                        control={form.control}
                        name="key"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Key/Abbreviation</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., UON"
                                        {...field}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Location */}
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Nairobi, Kenya"
                                        {...field}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Website */}
                    <FormField
                        control={form.control}
                        name="full_profile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website URL</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="https://example.com"
                                        {...field}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Parent Ministry */}
                    <FormField
                        control={form.control}
                        name="parent_ministry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent Ministry</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Ministry of Education"
                                        {...field}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Tags */}
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., research, public, comprehensive (comma-separated)"
                                    {...field}
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
                    <Button type="submit" disabled={loading || checkingName}>
                        {loading || checkingName ? (
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {loading ?
                            (mode === 'create' ? 'Creating...' : 'Updating...') :
                            checkingName ? 'Checking name...' :
                                (mode === 'create' ? 'Create Institution' : 'Update Institution')
                        }
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
        <Card className={cn('w-full max-w-4xl', className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {mode === 'create' ? 'Create New Institution' : 'Edit Institution'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    );
}
