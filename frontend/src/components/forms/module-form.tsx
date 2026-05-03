'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type ModuleRead = components['schemas']['ModuleRead'];
type ModuleCreate = components['schemas']['ModuleCreate'];
type ModuleUpdate = components['schemas']['ModuleUpdate'];

// Validation schema
const moduleSchema = z.object({
    name: z.string().min(3, 'Module name must be at least 3 characters').max(200, 'Module name is too long'),
    description: z.string().optional().nullable(),
    unit_code: z.string().min(2, 'Unit code must be at least 2 characters').max(50, 'Unit code is too long'),
    course_id: z.string().uuid('Please select a course').optional(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface ModuleFormProps {
    module?: ModuleRead;
    courseId?: string; // Pre-select course when adding from course details
    mode?: 'create' | 'edit';
    onSuccess?: () => void;
    onCancel?: () => void;
    embedded?: boolean;
}

export const ModuleForm: React.FC<ModuleFormProps> = ({
    module,
    courseId,
    mode = 'create',
    onSuccess,
    onCancel,
    embedded = false
}) => {
    const { addNotification } = useUIStore();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<Array<{ id: string; name: string; course_acronym: string }>>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty }
    } = useForm<ModuleFormData>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            name: module?.name || '',
            description: module?.description || '',
            unit_code: module?.unit_code || '',
            course_id: courseId || module?.courses?.[0]?.id || '',
        }
    });

    const selectedCourseId = watch('course_id');

    // Load courses for dropdown
    useEffect(() => {
        const loadCourses = async () => {
            try {
                setLoadingCourses(true);
                const response = await adminAPI.courses.list({ limit: 100 });
                if (response.data?.data) {
                    const coursesData = Array.isArray(response.data.data)
                        ? response.data.data
                        : response.data.data.items || [];
                    setCourses(coursesData.map((course: any) => ({
                        id: course.id,
                        name: course.name,
                        course_acronym: course.course_acronym
                    })));
                }
            } catch (error) {
                console.error('Error loading courses:', error);
                addNotification({
                    type: 'error',
                    title: 'Failed to load courses',
                    message: 'Please refresh the page to try again.',
                });
            } finally {
                setLoadingCourses(false);
            }
        };

        loadCourses();
    }, []);

    const onSubmit = async (data: ModuleFormData) => {
        try {
            setLoading(true);

            if (mode === 'create') {
                // Create new module
                const moduleData: ModuleCreate = {
                    name: data.name,
                    description: data.description || null,
                    unit_code: data.unit_code,
                };

                const response = await adminAPI.modules.create(moduleData);

                // If course_id is provided and not "none", add the module to the course
                if (data.course_id && data.course_id !== 'none' && response.data?.data?.id) {
                    try {
                        await adminAPI.courses.addModule(data.course_id, response.data.data.id);
                    } catch (error) {
                        console.error('Error adding module to course:', error);
                        // Module is created, but linking failed
                        addNotification({
                            type: 'warning',
                            title: 'Module created',
                            message: 'Module was created but could not be linked to the course. You can link it manually.',
                        });
                        if (onSuccess) {
                            onSuccess();
                        }
                        return;
                    }
                }

                addNotification({
                    type: 'success',
                    title: 'Module created',
                    message: 'The module has been created successfully.',
                });
            } else {
                // Update existing module
                if (!module?.id) {
                    throw new Error('Module ID is required for updates');
                }

                const moduleData: ModuleUpdate = {
                    name: data.name,
                    description: data.description || null,
                    unit_code: data.unit_code,
                };

                // Update the module basic info
                await adminAPI.modules.update(module.id, moduleData);

                // Handle course relationship update if course selection changed
                if (data.course_id && data.course_id !== 'none') {
                    // Check if the course relationship changed
                    const currentCourseId = module.courses?.[0]?.id;
                    if (currentCourseId !== data.course_id) {
                        try {
                            // Remove from old course if exists
                            if (currentCourseId) {
                                await adminAPI.courses.removeModule(currentCourseId, module.id);
                            }
                            // Add to new course
                            await adminAPI.courses.addModule(data.course_id, module.id);
                        } catch (error) {
                            console.error('Error updating module-course relationship:', error);
                            addNotification({
                                type: 'warning',
                                title: 'Module updated',
                                message: 'Module was updated but course relationship could not be changed. You can update it manually.',
                            });
                            if (onSuccess) {
                                onSuccess();
                            }
                            return;
                        }
                    }
                } else if (data.course_id === 'none') {
                    // Remove from current course if "none" is selected
                    const currentCourseId = module.courses?.[0]?.id;
                    if (currentCourseId) {
                        try {
                            await adminAPI.courses.removeModule(currentCourseId, module.id);
                        } catch (error) {
                            console.error('Error removing module from course:', error);
                        }
                    }
                }

                addNotification({
                    type: 'success',
                    title: 'Module updated',
                    message: 'The module has been updated successfully.',
                });
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error saving module:', error);
            addNotification({
                type: 'error',
                title: `Failed to ${mode === 'create' ? 'create' : 'update'} module`,
                message: error.message || 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const FormContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Module Name */}
            <div className="space-y-2">
                <Label htmlFor="name">
                    Module Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Data Structures and Algorithms"
                    disabled={loading}
                />
                {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
            </div>

            {/* Unit Code */}
            <div className="space-y-2">
                <Label htmlFor="unit_code">
                    Unit Code <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="unit_code"
                    {...register('unit_code')}
                    placeholder="e.g., CS201"
                    disabled={loading}
                />
                {errors.unit_code && (
                    <p className="text-sm text-red-600">{errors.unit_code.message}</p>
                )}
            </div>

            {/* Course Selection (optional - only show if not pre-selected from parent) */}
            {!courseId && (
                <div className="space-y-2">
                    <Label htmlFor="course_id">
                        Link to Course (Optional)
                    </Label>
                    <Select
                        value={selectedCourseId}
                        onValueChange={(value) => setValue('course_id', value, { shouldDirty: true })}
                        disabled={loading || loadingCourses}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select a course (optional)"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {loadingCourses ? (
                                <SelectItem value="loading" disabled>
                                    Loading courses...
                                </SelectItem>
                            ) : courses.length === 0 ? (
                                <SelectItem value="no-courses" disabled>
                                    No courses available
                                </SelectItem>
                            ) : (
                                courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.course_acronym} - {course.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {errors.course_id && (
                        <p className="text-sm text-red-600">{errors.course_id.message}</p>
                    )}
                </div>
            )}

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe the module content, learning outcomes, and key topics..."
                    disabled={loading}
                    rows={5}
                />
                {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-4">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading || (!isDirty && mode === 'edit')}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'create' ? 'Create Module' : 'Update Module'}
                </Button>
            </div>
        </form>
    );

    if (embedded) {
        return FormContent;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{mode === 'create' ? 'Create New Module' : 'Edit Module'}</CardTitle>
            </CardHeader>
            <CardContent>{FormContent}</CardContent>
        </Card>
    );
};

