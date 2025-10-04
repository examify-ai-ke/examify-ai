'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft,
    Save,
    X,
    HelpCircle,
    Hash,
    Star,
    FileText,
    AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { formatDate } from '@/lib/utils';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type QuestionRead = components['schemas']['QuestionRead'];
type MainQuestionUpdate = components['schemas']['MainQuestionUpdate'];
type SubQuestionUpdate = components['schemas']['SubQuestionUpdate'];
type NumberingStyleEnum = components['schemas']['NumberingStyleEnum'];

// Form validation schema - simplified
const questionEditSchema = z.object({
    question_number: z.string().min(1, 'Question number is required'),
    marks: z.number().min(0, 'Marks must be non-negative'),
    numbering_style: z.enum(['roman', 'alpha'] as const),
    question_set_id: z.string().nullable().optional(),
    exam_paper_id: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
});

type QuestionEditFormData = z.infer<typeof questionEditSchema>;

export default function EditQuestionPage() {
    const router = useRouter();
    const routeParams = useParams();
    const questionId = Array.isArray((routeParams as any)?.id)
        ? (routeParams as any)?.id?.[0]
        : (routeParams as any)?.id;
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [question, setQuestion] = useState<QuestionRead | null>(null);
    const [parentQuestion, setParentQuestion] = useState<QuestionRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [questionText, setQuestionText] = useState('');

    // Form setup
    const form = useForm<QuestionEditFormData>({
        resolver: zodResolver(questionEditSchema),
        defaultValues: {
            question_number: '',
            marks: 0,
            numbering_style: 'roman',
            question_set_id: null,
            exam_paper_id: null,
            parent_id: null,
        },
    });

    // Load question data
    const loadQuestion = async () => {
        try {
            setLoading(true);

            if (!questionId) {
                throw new Error('Question ID is required');
            }

            console.log('Loading question for editing:', questionId);

            // Load the main question
            const questionResponse = await adminAPI.questions.getById(questionId as string);

            if (!questionResponse.data?.data) {
                throw new Error('Question not found');
            }

            const questionData = questionResponse.data.data;
            setQuestion(questionData);

            // Extract text from Editor.js format for editing
            const extractedText = extractQuestionText(questionData);
            setQuestionText(extractedText);

            // If this is a sub-question, load its parent
            if (questionData.parent_id) {
                try {
                    const parentResponse = await adminAPI.questions.getById(questionData.parent_id);
                    if (parentResponse.data?.data) {
                        setParentQuestion(parentResponse.data.data);
                    }
                } catch (error) {
                    console.warn('Failed to load parent question:', error);
                }
            }

            // Populate form with question data
            form.reset({
                question_number: questionData.question_number || '',
                marks: questionData.marks || 0,
                numbering_style: (questionData.numbering_style as NumberingStyleEnum) || 'roman',
                question_set_id: questionData.question_set_id || null,
                exam_paper_id: questionData.exam_paper_id || null,
                parent_id: questionData.parent_id || null,
            });

        } catch (error) {
            console.error('Error loading question:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load question',
                message: error instanceof Error ? error.message : 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        if (questionId) {
            loadQuestion();
        }
    }, [questionId]);

    // Helper function to extract text from Editor.js format
    const extractQuestionText = (questionData: QuestionRead): string => {
        if (questionData.text?.blocks && Array.isArray(questionData.text.blocks)) {
            const textBlocks = questionData.text.blocks
                .filter(block => block.type === 'paragraph' || block.type === 'header')
                .map(block => block.data?.text || '')
                .join(' ');
            return textBlocks || '';
        }
        return '';
    };

    // Convert plain text to Editor.js format
    const convertTextToEditorJS = (text: string) => {
        return {
            time: Date.now(),
            blocks: [
                {
                    id: `block_${Date.now()}`,
                    type: 'paragraph',
                    data: {
                        text: text.trim(),
                    },
                },
            ],
            version: '2.28.2',
        };
    };

    // Handle form submission
    const onSubmit = async (data: QuestionEditFormData) => {
        if (!question) return;

        try {
            setSaving(true);

            // Validate required fields manually
            if (!data.question_number.trim()) {
                addNotification({
                    type: 'error',
                    title: 'Validation Error',
                    message: 'Question number is required.',
                });
                return;
            }

            if (!questionText.trim()) {
                addNotification({
                    type: 'error',
                    title: 'Validation Error',
                    message: 'Question text is required.',
                });
                return;
            }

            // Convert plain text to Editor.js format
            const editorJSText = convertTextToEditorJS(questionText);

            // Prepare update data based on question type
            const updateData = {
                question_number: data.question_number.trim(),
                marks: data.marks,
                numbering_style: data.numbering_style,
                text: editorJSText,
                ...(question.parent_id ? {
                    // Sub-question update
                    parent_id: question.parent_id, // Keep the existing parent_id
                } : {
                    // Main question update
                    question_set_id: question.question_set_id, // Keep existing IDs
                    exam_paper_id: question.exam_paper_id,
                }),
            };

            console.log('Updating question with data:', updateData);

            const response = await adminAPI.questions.update(question.id, updateData);

            if (response.data?.data) {
                addNotification({
                    type: 'success',
                    title: 'Question Updated',
                    message: 'The question has been updated successfully.',
                });
                router.push(`/dashboard/questions/${question.id}`);
            } else {
                throw new Error('Failed to update question');
            }
        } catch (error) {
            console.error('Error updating question:', error);
            addNotification({
                type: 'error',
                title: 'Update Failed',
                message: error instanceof Error ? error.message : 'Failed to update question. Please try again.',
            });
        } finally {
            setSaving(false);
        }
    };

    // Handle save button click
    const handleSave = async () => {
        if (!question) return;

        try {
            setSaving(true);

            // Get form values
            const formValues = form.getValues();

            // Validate required fields manually
            if (!formValues.question_number?.trim()) {
                addNotification({
                    type: 'error',
                    title: 'Validation Error',
                    message: 'Question number is required.',
                });
                return;
            }

            if (!questionText.trim()) {
                addNotification({
                    type: 'error',
                    title: 'Validation Error',
                    message: 'Question text is required.',
                });
                return;
            }

            // Convert plain text to Editor.js format
            const editorJSText = convertTextToEditorJS(questionText);

            // Prepare update data based on question type
            const updateData = {
                question_number: formValues.question_number.trim(),
                marks: formValues.marks || 0,
                numbering_style: formValues.numbering_style || 'roman',
                text: editorJSText,
                ...(question.parent_id ? {
                    // Sub-question update
                    parent_id: question.parent_id, // Keep the existing parent_id
                } : {
                    // Main question update
                    question_set_id: question.question_set_id, // Keep existing IDs
                    exam_paper_id: question.exam_paper_id,
                }),
            };

            console.log('Updating question with data:', updateData);

            const response = await adminAPI.questions.update(question.id, updateData);

            if (response.data?.data) {
                addNotification({
                    type: 'success',
                    title: 'Question Updated',
                    message: 'The question has been updated successfully.',
                });
                router.push(`/dashboard/questions/${question.id}`);
            } else {
                throw new Error('Failed to update question');
            }
        } catch (error) {
            console.error('Error updating question:', error);
            addNotification({
                type: 'error',
                title: 'Update Failed',
                message: error instanceof Error ? error.message : 'Failed to update question. Please try again.',
            });
        } finally {
            setSaving(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (form.formState.isDirty || questionText !== extractQuestionText(question || {} as QuestionRead)) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.push(`/dashboard/questions/${questionId}`);
            }
        } else {
            router.push(`/dashboard/questions/${questionId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!question) {
        return (
            <div className="space-y-6 p-6">
                <AdminBreadcrumb currentPage="Question Not Found" />
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Question Not Found</h1>
                    <p className="text-gray-600 mt-2">The question you're looking for doesn't exist.</p>
                    <Button className="mt-4" onClick={() => router.push('/dashboard/questions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Questions
                    </Button>
                </div>
            </div>
        );
    }

    const isMainQuestion = !question.parent_id;

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Questions', href: '/dashboard/questions' },
                    { label: question.question_number, href: `/dashboard/questions/${question.id}` },
                    { label: 'Edit', href: `/dashboard/questions/${question.id}/edit` },
                ]}
                currentPage={`Edit Question ${question.question_number}`}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Question {question.question_number}
                        </h1>
                        <Badge variant={isMainQuestion ? 'default' : 'secondary'} className="text-lg px-3 py-1">
                            {isMainQuestion ? 'Main Question' : 'Sub-Question'}
                        </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600">
                        <div className="flex items-center">
                            <Star className="mr-1 h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{question.marks} marks</span>
                        </div>
                        {parentQuestion && (
                            <div className="flex items-center">
                                <ArrowLeft className="mr-1 h-4 w-4 text-blue-500" />
                                <span>Sub-question of Question {parentQuestion.question_number}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {saving ? (
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Question Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                                    Question Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="questionText">Question Text</Label>
                                    <Textarea
                                        id="questionText"
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        placeholder="Enter the question text..."
                                        className="min-h-[200px] mt-2"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter the question content. This will be converted to the appropriate format.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parent Question Context (for sub-questions) */}
                        {!isMainQuestion && parentQuestion && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <ArrowLeft className="h-5 w-5 text-blue-600 mr-2" />
                                        Parent Question Context
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-blue-50 border-l-4 border-blue-200 rounded-r">
                                        <div className="flex items-center space-x-2 text-sm text-blue-800 mb-2">
                                            <span className="font-medium">Question {parentQuestion.question_number}:</span>
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            {extractQuestionText(parentQuestion)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Question Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Question Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="questionNumber">Question Number</Label>
                                    <Input
                                        id="questionNumber"
                                        {...form.register('question_number')}
                                        placeholder="e.g., 1, 2, a, b, i, ii"
                                        className="mt-1"
                                    />
                                    {form.formState.errors.question_number && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {form.formState.errors.question_number.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="marks">Marks</Label>
                                    <Input
                                        id="marks"
                                        type="number"
                                        min="0"
                                        {...form.register('marks', { valueAsNumber: true })}
                                        placeholder="e.g., 5"
                                        className="mt-1"
                                    />
                                    {form.formState.errors.marks && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {form.formState.errors.marks.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="numberingStyle">Numbering Style</Label>
                                    <Select
                                        value={form.watch('numbering_style')}
                                        onValueChange={(value: NumberingStyleEnum) => form.setValue('numbering_style', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select numbering style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="roman">Roman (i, ii, iii)</SelectItem>
                                            <SelectItem value="alpha">Alphabetic (a, b, c)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.numbering_style && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {form.formState.errors.numbering_style.message}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Question Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Question Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Type</span>
                                    <Badge variant={isMainQuestion ? 'default' : 'secondary'}>
                                        {isMainQuestion ? 'Main Question' : 'Sub-Question'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Created</span>
                                    <span className="text-sm">{formatDate(question.created_at)}</span>
                                </div>

                                {question.question_set_id && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Question Set ID</span>
                                        <span className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                            {question.question_set_id.slice(0, 8)}...
                                        </span>
                                    </div>
                                )}

                                {question.exam_paper_id && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Exam Paper ID</span>
                                        <span className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                            {question.exam_paper_id.slice(0, 8)}...
                                        </span>
                                    </div>
                                )}

                                {question.parent_id && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Parent Question</span>
                                        <span className="text-sm text-blue-600">
                                            {parentQuestion ? `Question ${parentQuestion.question_number}` : 'Loading...'}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Save Status */}
                        {form.formState.isDirty && (
                            <Card className="border-orange-200 bg-orange-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-2 text-orange-800">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Unsaved Changes</span>
                                    </div>
                                    <p className="text-sm text-orange-700 mt-1">
                                        You have unsaved changes. Don't forget to save your work.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
