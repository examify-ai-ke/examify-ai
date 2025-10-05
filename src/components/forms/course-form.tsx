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

type CourseRead = components['schemas']['CourseRead'];
type CourseCreate = components['schemas']['CourseCreate'];
type CourseUpdate = components['schemas']['CourseUpdate'];

// Validation schema
const courseSchema = z.object({
    name: z.string().min(3, 'Course name must be at least 3 characters').max(200, 'Course name is too long'),
    description: z.string().optional().nullable(),
    course_acronym: z.string().min(2, 'Course acronym must be at least 2 characters').max(20, 'Course acronym is too long'),
    programme_id: z.string().uuid('Please select a programme'),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
    course?: CourseRead;
    mode?: 'create' | 'edit';
    onSuccess?: () => void;
    onCancel?: () => void;
    embedded?: boolean;
}

export const CourseForm: React.FC<CourseFormProps> = ({
    course,
    mode = 'create',
    onSuccess,
    onCancel,
    embedded = false
}) => {
    const { addNotification } = useUIStore();
    const [loading, setLoading] = useState(false);
    const [programmes, setProgrammes] = useState<Array<{ id: string; name: string }>>([]);
    const [loadingProgrammes, setLoadingProgrammes] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty }
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            name: course?.name || '',
            description: course?.description || '',
            course_acronym: course?.course_acronym || '',
            programme_id: course?.programme?.id || '',
        }
    });

    const selectedProgrammeId = watch('programme_id');

    // Load programmes for dropdown
    useEffect(() => {
        const loadProgrammes = async () => {
            try {
                setLoadingProgrammes(true);
                const response = await adminAPI.programmes.list({ limit: 100 });
                if (response.data?.data) {
                    const programmesData = Array.isArray(response.data.data)
                        ? response.data.data
                        : response.data.data.items || [];
                    setProgrammes(programmesData.map((prog: any) => ({ id: prog.id, name: prog.name })));
                }
            } catch (error) {
                console.error('Error loading programmes:', error);
                addNotification({
                    type: 'error',
                    title: 'Failed to load programmes',
                    message: 'Please refresh the page to try again.',
                });
            } finally {
                setLoadingProgrammes(false);
            }
        };

        loadProgrammes();
    }, []);

    const onSubmit = async (data: CourseFormData) => {
        try {
            setLoading(true);

            if (mode === 'create') {
                // Create new course
                const courseData: CourseCreate = {
                    name: data.name,
                    description: data.description || null,
                    course_acronym: data.course_acronym,
                    programme_id: data.programme_id,
                };

                await adminAPI.courses.create(courseData);

                addNotification({
                    type: 'success',
                    title: 'Course created',
                    message: 'The course has been created successfully.',
                });
            } else {
                // Update existing course
                if (!course?.id) {
                    throw new Error('Course ID is required for updates');
                }

                const courseData: CourseUpdate = {
                    name: data.name,
                    description: data.description || null,
                    course_acronym: data.course_acronym,
                    programme_id: data.programme_id,
                };

                await adminAPI.courses.update(course.id, courseData);

                addNotification({
                    type: 'success',
                    title: 'Course updated',
                    message: 'The course has been updated successfully.',
                });
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error saving course:', error);
            addNotification({
                type: 'error',
                title: `Failed to ${mode === 'create' ? 'create' : 'update'} course`,
                message: error.message || 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const FormContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Course Name */}
            <div className="space-y-2">
                <Label htmlFor="name">
                    Course Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Introduction to Computer Science"
                    disabled={loading}
                />
                {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
            </div>

            {/* Course Acronym */}
            <div className="space-y-2">
                <Label htmlFor="course_acronym">
                    Course Code/Acronym <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="course_acronym"
                    {...register('course_acronym')}
                    placeholder="e.g., CS101"
                    disabled={loading}
                />
                {errors.course_acronym && (
                    <p className="text-sm text-red-600">{errors.course_acronym.message}</p>
                )}
            </div>

            {/* Programme Selection */}
            <div className="space-y-2">
                <Label htmlFor="programme_id">
                    Programme <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedProgrammeId}
                    onValueChange={(value) => setValue('programme_id', value, { shouldDirty: true })}
                    disabled={loading || loadingProgrammes}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={loadingProgrammes ? "Loading programmes..." : "Select a programme"} />
                    </SelectTrigger>
                    <SelectContent>
                        {loadingProgrammes ? (
                            <SelectItem value="loading" disabled>
                                Loading programmes...
                            </SelectItem>
                        ) : programmes.length === 0 ? (
                            <SelectItem value="no-programmes" disabled>
                                No programmes available
                            </SelectItem>
                        ) : (
                            programmes.map((programme) => (
                                <SelectItem key={programme.id} value={programme.id}>
                                    {programme.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                {errors.programme_id && (
                    <p className="text-sm text-red-600">{errors.programme_id.message}</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe the course, its objectives, and key topics..."
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
                    {mode === 'create' ? 'Create Course' : 'Update Course'}
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
                <CardTitle>{mode === 'create' ? 'Create New Course' : 'Edit Course'}</CardTitle>
            </CardHeader>
            <CardContent>{FormContent}</CardContent>
        </Card>
    );
};

