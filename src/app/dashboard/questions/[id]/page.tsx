'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    HelpCircle,
    Hash,
    Star,
    BookOpen,
    FileText,
    Edit,
    Plus,
    Trash2,
    ArrowLeft,
    Clock,
    CheckCircle,
    AlertTriangle,
    Users,
    Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type QuestionRead = components['schemas']['QuestionRead'];
type AnswerReadForQuestion = components['schemas']['AnswerReadForQuestion'];

export default function QuestionDetailPage() {
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
    const [subQuestions, setSubQuestions] = useState<QuestionRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    // Load question data
    const loadQuestion = async () => {
        try {
            setLoading(true);

            if (!questionId) {
                throw new Error('Question ID is required');
            }

            console.log('Loading question details for ID:', questionId);

            // Load the main question
            const questionResponse = await adminAPI.questions.getById(questionId as string);

            if (!questionResponse.data?.data) {
                throw new Error('Question not found');
            }

            const questionData = questionResponse.data.data;
            setQuestion(questionData);

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

            // If this is a main question, load its sub-questions
            if (!questionData.parent_id) {
                try {
                    const subQuestionsResponse = await adminAPI.questions.list({
                        parent_id: questionData.id,
                        limit: 100
                    });
                    if (subQuestionsResponse.data?.data?.items) {
                        setSubQuestions(subQuestionsResponse.data.data.items);
                    }
                } catch (error) {
                    console.warn('Failed to load sub-questions:', error);
                }
            }

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

    // Handle question deletion
    const handleDelete = async () => {
        if (!question) return;

        if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(true);

            await adminAPI.questions.delete(question.id);
            addNotification({
                type: 'success',
                title: 'Question Deleted',
                message: 'The question has been deleted successfully.',
            });
            router.push('/dashboard/questions');
        } catch (error) {
            console.error('Error deleting question:', error);
            addNotification({
                type: 'error',
                title: 'Deletion Failed',
                message: error instanceof Error ? error.message : 'Failed to delete question. Please try again.',
            });
        } finally {
            setDeleting(false);
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
    const hasSubQuestions = subQuestions.length > 0;
    const hasAnswers = question.answers && question.answers.length > 0;

    // Helper function to extract text from Editor.js format
    const extractQuestionText = (questionData: QuestionRead): string => {
        if (questionData.text?.blocks && Array.isArray(questionData.text.blocks)) {
            const textBlocks = questionData.text.blocks
                .filter(block => block.type === 'paragraph' || block.type === 'header')
                .map(block => block.data?.text || '')
                .join(' ');
            return textBlocks || 'No text content';
        }
        return 'No text content';
    };

    // Helper function to sort sub-questions by their question_number
    const sortSubQuestions = (subQuestions: QuestionRead[]): QuestionRead[] => {
        return [...subQuestions].sort((a, b) => {
            // Extract numeric or alphabetic parts for sorting
            const aNum = a.question_number;
            const bNum = b.question_number;

            // Try to parse as numbers first
            const aNumeric = parseInt(aNum);
            const bNumeric = parseInt(bNum);

            if (!isNaN(aNumeric) && !isNaN(bNumeric)) {
                return aNumeric - bNumeric;
            }

            // Fall back to string comparison for alphabetic numbering
            return aNum.localeCompare(bNum);
        });
    };

    // Helper function to format question number based on numbering style
    const formatQuestionNumber = (questionNumber: string, numberingStyle: string, isSubQuestion = false): string => {
        if (isSubQuestion) {
            // For sub-questions, show them as sub-parts
            switch (numberingStyle) {
                case 'roman':
                    return `(${questionNumber})`;
                case 'alpha':
                    return `(${questionNumber})`;
                default:
                    return `(${questionNumber})`;
            }
        }
        return questionNumber;
    };

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Questions', href: '/dashboard/questions' },
                    { label: question.question_number, href: `/dashboard/questions/${question.id}` },
                ]}
                currentPage={`Question ${question.question_number}`}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Question {formatQuestionNumber(question.question_number, question.numbering_style, !isMainQuestion)}
                        </h1>
                        <Badge variant={isMainQuestion ? 'default' : 'secondary'} className="text-lg px-3 py-1">
                            {isMainQuestion ? 'Main Question' : 'Sub-Question'}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                            {question.numbering_style} numbering
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
                                <span>Sub-question of </span>
                                <Link href={`/dashboard/questions/${parentQuestion.id}`} className="text-blue-600 hover:underline font-medium ml-1">
                                    Question {formatQuestionNumber(parentQuestion.question_number, parentQuestion.numbering_style)}
                                </Link>
                            </div>
                        )}
                        {isMainQuestion && hasSubQuestions && (
                            <div className="flex items-center">
                                <Hash className="mr-1 h-4 w-4 text-green-500" />
                                <span>{subQuestions.length} sub-question{subQuestions.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={() => router.push(`/dashboard/questions/${question.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting ? (
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Question Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                                    Question Content
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                        {formatQuestionNumber(question.question_number, question.numbering_style, !isMainQuestion)}
                                    </Badge>
                                    <Badge variant={isMainQuestion ? 'default' : 'secondary'} className="text-xs">
                                        {isMainQuestion ? 'Main' : 'Sub'}
                                    </Badge>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!isMainQuestion && parentQuestion && (
                                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-200 rounded-r">
                                    <div className="flex items-center space-x-2 text-sm text-blue-800 mb-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        <span className="font-medium">Parent Question:</span>
                                        <Link href={`/dashboard/questions/${parentQuestion.id}`} className="hover:underline">
                                            Question {formatQuestionNumber(parentQuestion.question_number, parentQuestion.numbering_style)}
                                        </Link>
                                    </div>
                                    <p className="text-sm text-blue-700 italic">
                                        {extractQuestionText(parentQuestion).substring(0, 150)}...
                                    </p>
                                </div>
                            )}

                            <div className="prose max-w-none">
                                <p className="text-lg leading-relaxed">
                                    {extractQuestionText(question)}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Hash className="mr-1 h-4 w-4" />
                                    <span>Number: {formatQuestionNumber(question.question_number, question.numbering_style, !isMainQuestion)}</span>
                                </div>
                                <div className="flex items-center">
                                    <Star className="mr-1 h-4 w-4 text-yellow-500" />
                                    <span>{question.marks} marks</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4" />
                                    <span>Created {formatRelativeTime(question.created_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sub-Questions */}
                    {isMainQuestion && hasSubQuestions && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Hash className="h-5 w-5 text-green-600 mr-2" />
                                        Sub-Questions ({subQuestions.length})
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Sub-Question
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {sortSubQuestions(subQuestions).map((subQuestion, index) => (
                                        <div key={subQuestion.id} className="border-l-4 border-blue-200 bg-blue-50/30 rounded-lg p-4 hover:bg-blue-50/50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                                                Sub-Question {formatQuestionNumber(subQuestion.question_number, subQuestion.numbering_style, true)}
                                                            </Badge>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {subQuestion.numbering_style} style
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                            <Star className="h-3 w-3 text-yellow-500" />
                                                            <span className="font-medium">{subQuestion.marks} marks</span>
                                                        </div>
                                                    </div>
                                                    <div className="pl-4 border-l-2 border-gray-200">
                                                        <p className="text-gray-900 leading-relaxed">
                                                            {extractQuestionText(subQuestion)}
                                                        </p>
                                                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                                                            <div className="flex items-center">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                <span>Created {formatRelativeTime(subQuestion.created_at)}</span>
                                                            </div>
                                                            {subQuestion.answers && subQuestion.answers.length > 0 && (
                                                                <div className="flex items-center">
                                                                    <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                                                    <span>{subQuestion.answers.length} answer{subQuestion.answers.length !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="ghost" asChild className="text-blue-600 hover:text-blue-800 hover:bg-blue-100">
                                                        <Link href={`/dashboard/questions/${subQuestion.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-gray-600 hover:text-gray-800 hover:bg-gray-100" asChild>
                                                        <Link href={`/dashboard/questions/${subQuestion.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Answers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    Answers ({question.answers?.length || 0})
                                </div>
                                <Button size="sm" variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Answer
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {hasAnswers ? (
                                <div className="space-y-4">
                                    {question.answers!.map((answer) => (
                                        <div key={answer.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={'default'}>
                                                        Answer
                                                    </Badge>
                                                    <span className="text-sm text-gray-600">
                                                        by {((answer as any)?.created_by as any)?.full_name || 'Unknown'}
                                                    </span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-gray-900 mb-3">
                                                {(() => {
                                                    const fb = (answer.text as any)?.blocks?.[0];
                                                    const txt = typeof fb?.data?.['text'] === 'string' ? fb.data['text'] : '';
                                                    return txt || 'No answer text';
                                                })()}
                                            </p>
                                            {(answer as any).explanation && (
                                                <div className="bg-blue-50 p-3 rounded">
                                                    <p className="text-sm text-blue-800">
                                                        <strong>Explanation:</strong> {(answer as any).explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>No answers have been provided for this question yet.</p>
                                    <Button className="mt-4" variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Answer
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
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
                                <span className="text-sm font-medium text-gray-600">Numbering Style</span>
                                <span className="text-sm capitalize">{question.numbering_style}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Marks</span>
                                <span className="text-sm font-semibold">{question.marks}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Created</span>
                                <span className="text-sm">{formatDate(question.created_at)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Question Set ID</span>
                                <span className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {question.question_set_id ? question.question_set_id.slice(0, 8) + '...' : 'None'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Exam Paper ID</span>
                                <span className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {question.exam_paper_id ? question.exam_paper_id.slice(0, 8) + '...' : 'None'}
                                </span>
                            </div>

                            {question.parent_id && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Parent Question</span>
                                    <Link href={`/dashboard/questions/${question.parent_id}`} className="text-sm text-blue-600 hover:underline">
                                        {parentQuestion ? `Question ${parentQuestion.question_number}` : 'View Parent'}
                                    </Link>
                                </div>
                            )}

                            {question.slug && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Slug</span>
                                    <span className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                        {question.slug}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                {isMainQuestion ? 'Add Sub-Question' : 'Add Answer'}
                            </Button>

                            <Button className="w-full" variant="outline" size="sm">
                                <BookOpen className="mr-2 h-4 w-4" />
                                View Exam Paper
                            </Button>

                            <Button className="w-full" variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                View Question Set
                            </Button>

                            <Button className="w-full" variant="outline" size="sm">
                                <Users className="mr-2 h-4 w-4" />
                                Share Question
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Sub-Questions</span>
                                <span className="text-sm font-semibold">
                                    {subQuestions.length}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Answers</span>
                                <span className="text-sm font-semibold">
                                    {question.answers?.length || 0}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Marks</span>
                                <span className="text-sm font-semibold">
                                    {(question.marks || 0) + subQuestions.reduce((sum, child) => sum + (child.marks || 0), 0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
