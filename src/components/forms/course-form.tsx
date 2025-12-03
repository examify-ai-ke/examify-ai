'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { getErrorMessage } from '@/lib/api';
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
    course_acronym: z.union([z.string().min(2, 'Course acronym must be at least 2 characters').max(20, 'Course acronym is too long'), z.literal('')]).optional().nullable(),
    programme_id: z.string().min(1, 'Please select a programme'),
    faculty_id: z.union([z.string().uuid('Invalid faculty'), z.literal('')]).optional().nullable(),
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
    const [formError, setFormError] = useState<string | null>(null);
    const [programmes, setProgrammes] = useState<Array<{ id: string; name: string }>>([]);
    const [loadingProgrammes, setLoadingProgrammes] = useState(true);
    const [faculties, setFaculties] = useState<Array<{ id: string; name: string }>>([]);
    const [loadingFaculties, setLoadingFaculties] = useState(true);

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
            faculty_id: course?.faculty?.id || '',
        }
    });

    const selectedProgrammeId = watch('programme_id');
    const selectedFacultyId = watch('faculty_id');

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
                    setFaculties(facultiesData.map((fac: any) => ({ id: fac.id, name: fac.name })));
                }
            } catch (error) {
                console.error('Error loading faculties:', error);
                addNotification({
                    type: 'error',
                    title: 'Failed to load faculties',
                    message: 'Please refresh the page to try again.',
                });
            } finally {
                setLoadingFaculties(false);
            }
        };

        loadFaculties();
    }, []);

    const onSubmit = async (data: CourseFormData) => {
        try {
            setFormError(null);
            setLoading(true);

            if (mode === 'create') {
                // Create new course
                const courseData: CourseCreate = {
                    name: data.name,
                    description: data.description || null,
                    course_acronym: data.course_acronym,
                    programme_id: data.programme_id,
                    faculty_id: data.faculty_id || null,
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
                    faculty_id: data.faculty_id || null,
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
            
            // Extract error message using utility function
            const rawErrorMessage = getErrorMessage(error);
            let errorMessage = 'Please try again later.';
            
            // Check for duplicate course name error
            if (rawErrorMessage.includes('duplicate key value violates unique constraint "Course_name_key"') ||
                rawErrorMessage.includes('Key (name)') ||
                rawErrorMessage.includes('already exists') ||
                (rawErrorMessage.includes('Duplicate entry') && rawErrorMessage.includes('name'))) {
                errorMessage = 'A course with this name already exists. Please use a different name.';
            }
            // Check for duplicate course acronym error
            else if (rawErrorMessage.includes('duplicate key value violates unique constraint "Course_course_acronym_key"') ||
                     (rawErrorMessage.includes('course_acronym') && rawErrorMessage.includes('duplicate'))) {
                errorMessage = 'A course with this acronym already exists. Please use a different acronym.';
            }
            // Check for other integrity errors
            else if (rawErrorMessage.includes('IntegrityError') || 
                     rawErrorMessage.includes('duplicate key') ||
                     rawErrorMessage.includes('Duplicate entry')) {
                errorMessage = 'This course already exists in the database. Please check the course details and try again.';
            }
            // Check for validation errors
            else if (rawErrorMessage.includes('ValidationError') ||
                     rawErrorMessage.includes('Invalid') ||
                     rawErrorMessage.includes('validation')) {
                errorMessage = 'Invalid course data. Please check all fields and try again.';
            }
            // Use the original error message if it's meaningful
            else if (rawErrorMessage && rawErrorMessage !== 'Failed to fetch' && rawErrorMessage.length > 5) {
                errorMessage = rawErrorMessage;
            }
            
            // Set form error to display in the form
            setFormError(errorMessage);
            
            addNotification({
                type: 'error',
                title: `Failed to ${mode === 'create' ? 'create' : 'update'} course`,
                message: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const FormContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-900">Error</h3>
                            <p className="text-sm text-red-800 mt-1">{formError}</p>
                        </div>
                    </div>
                </div>
            )}
            
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
                    Course Code/Acronym (Optional)
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

            {/* Faculty Selection (Optional) */}
            <div className="space-y-2">
                <Label htmlFor="faculty_id">
                    Faculty (Optional)
                </Label>
                <Select
                    value={selectedFacultyId || 'none'}
                    onValueChange={(value) => setValue('faculty_id', value === 'none' ? null : value, { shouldDirty: true })}
                    disabled={loading || loadingFaculties}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={loadingFaculties ? "Loading faculties..." : "Select a faculty (optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                        {loadingFaculties ? (
                            <SelectItem value="loading" disabled>
                                Loading faculties...
                            </SelectItem>
                        ) : faculties.length === 0 ? (
                            <SelectItem value="no-faculties" disabled>
                                No faculties available
                            </SelectItem>
                        ) : (
                            <>
                                <SelectItem value="none">None</SelectItem>
                                {faculties.map((faculty) => (
                                    <SelectItem key={faculty.id} value={faculty.id}>
                                        {faculty.name}
                                    </SelectItem>
                                ))}
                            </>
                        )}
                    </SelectContent>
                </Select>
                {errors.faculty_id && (
                    <p className="text-sm text-red-600">{errors.faculty_id.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                    Optionally associate this course directly with a faculty
                </p>
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

