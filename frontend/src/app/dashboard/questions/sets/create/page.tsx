'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    FolderOpen,
    ArrowLeft,
    Save,
    Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type QuestionSetCreate = components['schemas']['QuestionSetCreate'];
type QuestionSetTitleEnum = components['schemas']['QuestionSetTitleEnum'];

// Form validation schema
const questionSetSchema = z.object({
    title: z.enum([
        'Question One',
        'Question Two', 
        'Question Three',
        'Question Four',
        'Question Five',
        'Question Six',
        'Question Seven',
        'Question Eight',
        'Question Nine',
        'Question Ten'
    ] as const),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
});

type QuestionSetFormData = z.infer<typeof questionSetSchema>;

export default function CreateQuestionSetPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [loading, setLoading] = useState(false);

    // Form instance
    const form = useForm<QuestionSetFormData>({
        resolver: zodResolver(questionSetSchema),
        defaultValues: {
            title: 'Question One',
            description: '',
        },
    });

    // Handle form submission
    const handleSubmit = async (data: QuestionSetFormData) => {
        try {
            setLoading(true);

            if (adminAPI.questionSets) {
                const response = await adminAPI.questionSets.create(data);
                
                if (response.data?.data) {
                    addNotification({
                        type: 'success',
                        title: 'Question Set Created',
                        message: 'Question set has been created successfully!',
                    });
                    router.push('/dashboard/questions/sets');
                }
            }
        } catch (error) {
            console.error('Error creating question set:', error);
            addNotification({
                type: 'error',
                title: 'Creation Failed',
                message: 'Failed to create question set. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb 
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Question Sets', href: '/dashboard/questions/sets' },
                    { label: 'Create', href: '/dashboard/questions/sets/create' },
                ]}
                currentPage="Create Question Set"
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Question Set</h1>
                    <p className="text-gray-600">
                        Create a new question set to organize related questions
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Form Container */}
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FolderOpen className="h-5 w-5 text-blue-600 mr-2" />
                        Question Set Details
                    </CardTitle>
                </CardHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <CardContent className="space-y-6">
                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Set Title</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Question One">Question One</SelectItem>
                                                <SelectItem value="Question Two">Question Two</SelectItem>
                                                <SelectItem value="Question Three">Question Three</SelectItem>
                                                <SelectItem value="Question Four">Question Four</SelectItem>
                                                <SelectItem value="Question Five">Question Five</SelectItem>
                                                <SelectItem value="Question Six">Question Six</SelectItem>
                                                <SelectItem value="Question Seven">Question Seven</SelectItem>
                                                <SelectItem value="Question Eight">Question Eight</SelectItem>
                                                <SelectItem value="Question Nine">Question Nine</SelectItem>
                                                <SelectItem value="Question Ten">Question Ten</SelectItem>
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
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what this question set covers..."
                                                className="min-h-[120px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-3 p-6 border-t">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <LoadingSpinner className="mr-2 h-4 w-4" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Create Question Set
                            </Button>
                        </div>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
