'use client';

import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    HelpCircle,
    Hash,
    Star,
    CheckCircle,
    AlertTriangle,
    Edit,
    Trash2,
    Eye,
    Plus,
    MoreHorizontal,
    BookOpen,
    FileText,
    MessageSquarePlus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import EditorRenderer from '@/components/ui/editor-renderer';
import { AnswerForm } from '@/components/forms/answer-form';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';

// Type definitions
type QuestionRead = components['schemas']['QuestionRead'];
type QuestionSetRead = components['schemas']['QuestionSetRead'];

// Props interfaces
interface QuestionSetDisplayProps {
    questionSet: QuestionSetRead;
    questions: QuestionRead[];
    onEditQuestion?: (question: QuestionRead) => void;
    onDeleteQuestion?: (questionId: string) => void;
    onViewQuestion?: (questionId: string) => void;
    onAddSubQuestion?: (parentId: string) => void;
    onEditQuestionSet?: (questionSet: QuestionSetRead) => void;
    onDeleteQuestionSet?: (questionSetId: string) => void;
    showActions?: boolean;
    defaultExpanded?: boolean;
    onAnswersChange?: () => void;
}

interface MainQuestionDisplayProps {
    question: QuestionRead;
    subQuestions: QuestionRead[];
    onEditQuestion?: (question: QuestionRead) => void;
    onDeleteQuestion?: (questionId: string) => void;
    onViewQuestion?: (questionId: string) => void;
    onAddSubQuestion?: (parentId: string) => void;
    showActions?: boolean;
    defaultExpanded?: boolean;
    onAnswersChange?: () => void;
}

interface SubQuestionDisplayProps {
    question: QuestionRead;
    onEditQuestion?: (question: QuestionRead) => void;
    onDeleteQuestion?: (questionId: string) => void;
    onViewQuestion?: (questionId: string) => void;
    showActions?: boolean;
    onAnswersChange?: () => void;
}

interface HierarchicalQuestionsProps {
    questionSets: QuestionSetRead[];
    questions: QuestionRead[];
    onEditQuestion?: (question: QuestionRead) => void;
    onDeleteQuestion?: (questionId: string) => void;
    onViewQuestion?: (questionId: string) => void;
    onAddSubQuestion?: (parentId: string) => void;
    onEditQuestionSet?: (questionSet: QuestionSetRead) => void;
    onDeleteQuestionSet?: (questionSetId: string) => void;
    onAddQuestion?: (questionSetId?: string) => void;
    showActions?: boolean;
    defaultExpanded?: boolean;
    emptyMessage?: string;
    onAnswersChange?: () => void;
}

// Helper function to extract text from question
const extractQuestionText = (question: QuestionRead): string => {
    if (question.text?.blocks && Array.isArray(question.text.blocks)) {
        const textBlocks = question.text.blocks
            .filter(block => block.type === 'paragraph' || block.type === 'header')
            .map(block => block.data?.text || '')
            .join(' ');
        return textBlocks || 'No text content';
    }
    return 'No text content';
};

// Helper function to render answer text
const extractAnswerText = (answer: any): string => {
    if (answer.text?.blocks && Array.isArray(answer.text.blocks)) {
        const textBlocks = answer.text.blocks
            .filter((block: any) => block.type === 'paragraph' || block.type === 'header')
            .map((block: any) => block.data?.text || '')
            .join(' ');
        return textBlocks || 'No answer text';
    }
    return 'No answer text';
};

// Sub-question component
const SubQuestionDisplay: React.FC<SubQuestionDisplayProps> = ({
    question,
    onEditQuestion,
    onDeleteQuestion,
    onViewQuestion,
    showActions = true,
    onAnswersChange,
}) => {
    const { addNotification } = useUIStore();
    const [showAnswers, setShowAnswers] = useState(false);
    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const [editingAnswer, setEditingAnswer] = useState<any>(null);
    const hasAnswers = question.answers && question.answers.length > 0;

    const handleDeleteAnswer = async (answerId: string) => {
        if (!confirm('Are you sure you want to delete this answer?')) return;

        try {
            const response = await adminAPI.answers.delete(answerId);
            if (!response.error) {
                addNotification({
                    type: 'success',
                    title: 'Answer Deleted',
                    message: 'The answer has been successfully deleted.'
                });
                // Small delay to ensure data is persisted
                await new Promise(resolve => setTimeout(resolve, 500));
                onAnswersChange?.();
            } else {
                throw new Error('Failed to delete answer');
            }
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to delete answer'
            });
        }
    };

    const handleAnswerSuccess = async () => {
        setShowAnswerForm(false);
        setEditingAnswer(null);
        // Small delay to ensure data is persisted
        await new Promise(resolve => setTimeout(resolve, 500));
        onAnswersChange?.();
    };

    return (
        <div className="ml-8 border-l-2 border-indigo-200 pl-4 py-2">
            <div className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-4 transition-colors">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-800">
                                <Hash className="mr-1 h-3 w-3" />
                                {question.question_number}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-indigo-300 text-indigo-700">
                                Sub-question
                            </Badge>
                            <div className="flex items-center text-sm text-amber-600">
                                <Star className="mr-1 h-3 w-3" />
                                {question.marks || 0} marks
                            </div>
                        </div>

                        {/* Render question content using EditorRenderer */}
                        <div className="text-sm text-gray-800 mb-2">
                            {question.text && <EditorRenderer data={question.text} className="prose-sm" />}
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                            <span>Created: {formatDate(question.created_at)}</span>
                            <div className="flex items-center">
                                {hasAnswers ? (
                                    <>
                                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                        {question.answers?.length || 0} Answer{(question.answers?.length || 0) !== 1 ? 's' : ''}
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="mr-1 h-3 w-3 text-orange-500" />
                                        No Answers
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Show/Hide Answers Button */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowAnswers(!showAnswers);
                            }}
                            className="text-xs h-7"
                        >
                            {hasAnswers ? (
                                showAnswers ? `Hide Answers (${question.answers?.length || 0})` : `Show Answers (${question.answers?.length || 0})`
                            ) : (
                                'Add Answer'
                            )}
                        </Button>
                    </div>

                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {onViewQuestion && (
                                    <DropdownMenuItem onClick={() => onViewQuestion(question.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                )}
                                {onEditQuestion && (
                                    <DropdownMenuItem onClick={() => onEditQuestion(question)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {onDeleteQuestion && (
                                    <DropdownMenuItem
                                        onClick={() => onDeleteQuestion(question.id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Answers Section */}
            {showAnswers && (
                <div className="mt-3 ml-4 space-y-2">
                    {hasAnswers && question.answers && question.answers.map((answer: any, index: number) => (
                        <div
                            key={answer.id}
                            className="bg-green-50 border border-green-200 rounded-lg p-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <Badge className="text-xs bg-green-600">Answer {index + 1}</Badge>
                                    {answer.reviewed && (
                                        <Badge variant="outline" className="text-xs border-green-600 text-green-700">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Reviewed
                                        </Badge>
                                    )}
                                    {answer.auto_answer && (
                                        <Badge variant="secondary" className="text-xs">
                                            Auto-generated
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                                        <span>👍 {answer.likes || 0}</span>
                                        <span>👎 {answer.dislikes || 0}</span>
                                    </div>
                                    {showActions && (
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingAnswer(answer);
                                                    setShowAnswerForm(true);
                                                }}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteAnswer(answer.id)}
                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {editingAnswer?.id === answer.id && showAnswerForm ? (
                                <div className="mt-2">
                                    <AnswerForm
                                        questionId={question.id}
                                        answer={editingAnswer}
                                        onSuccess={handleAnswerSuccess}
                                        onCancel={() => {
                                            setEditingAnswer(null);
                                            setShowAnswerForm(false);
                                        }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="text-sm text-gray-800">
                                        {answer.text && <EditorRenderer data={answer.text} className="prose-sm" />}
                                    </div>
                                    {answer.created_by && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            By: {answer.created_by.name || 'Unknown'} • {formatDate(answer.created_at)}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                    
                    {/* Add Answer Form */}
                    {showActions && !editingAnswer && (
                        <div className="mt-2">
                            {showAnswerForm ? (
                                <AnswerForm
                                    questionId={question.id}
                                    onSuccess={handleAnswerSuccess}
                                    onCancel={() => setShowAnswerForm(false)}
                                />
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAnswerForm(true)}
                                    className="w-full"
                                >
                                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                                    Add Answer
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Main question component
const MainQuestionDisplay: React.FC<MainQuestionDisplayProps> = ({
    question,
    subQuestions,
    onEditQuestion,
    onDeleteQuestion,
    onViewQuestion,
    onAddSubQuestion,
    showActions = true,
    defaultExpanded = false,
    onAnswersChange,
}) => {
    const { addNotification } = useUIStore();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [showAnswers, setShowAnswers] = useState(false);
    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const [editingAnswer, setEditingAnswer] = useState<any>(null);
    const hasAnswers = question.answers && question.answers.length > 0;
    const hasSubQuestions = subQuestions.length > 0;

    const handleDeleteAnswer = async (answerId: string) => {
        if (!confirm('Are you sure you want to delete this answer?')) return;

        try {
            const response = await adminAPI.answers.delete(answerId);
            if (!response.error) {
                addNotification({
                    type: 'success',
                    title: 'Answer Deleted',
                    message: 'The answer has been successfully deleted.'
                });
                // Small delay to ensure data is persisted
                await new Promise(resolve => setTimeout(resolve, 500));
                onAnswersChange?.();
            } else {
                throw new Error('Failed to delete answer');
            }
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to delete answer'
            });
        }
    };

    const handleAnswerSuccess = async () => {
        setShowAnswerForm(false);
        setEditingAnswer(null);
        // Small delay to ensure data is persisted
        await new Promise(resolve => setTimeout(resolve, 500));
        onAnswersChange?.();
    };

    return (
        <div className={`border-2 rounded-lg mb-4 transition-all ${isExpanded ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/50'
            }`}>
            <div
                className="p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="h-6 w-6 p-0"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                            <Badge variant="default" className="text-xs bg-blue-600">
                                <Hash className="mr-1 h-3 w-3" />
                                {question.question_number}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-blue-400 text-blue-700">
                                Main Question
                            </Badge>
                            <div className="flex items-center text-sm font-medium text-amber-600">
                                <Star className="mr-1 h-4 w-4" />
                                {question.marks || 0} marks
                            </div>
                            {hasSubQuestions && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {subQuestions.length} sub-question{subQuestions.length !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>

                        {/* Render question content using EditorRenderer */}
                        <div className="text-gray-800 mb-3">
                            {question.text && <EditorRenderer data={question.text} className="prose-sm" />}
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Created: {formatDate(question.created_at)}</span>
                            <div className="flex items-center">
                                {hasAnswers ? (
                                    <>
                                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                        {question.answers?.length || 0} Answer{(question.answers?.length || 0) !== 1 ? 's' : ''}
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="mr-1 h-3 w-3 text-orange-500" />
                                        No Answers
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {onViewQuestion && (
                                    <DropdownMenuItem onClick={() => onViewQuestion(question.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                )}
                                {onEditQuestion && (
                                    <DropdownMenuItem onClick={() => onEditQuestion(question)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {onAddSubQuestion && (
                                    <DropdownMenuItem onClick={() => onAddSubQuestion(question.id)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Sub-question
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {onDeleteQuestion && (
                                    <DropdownMenuItem
                                        onClick={() => onDeleteQuestion(question.id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Main Question Answers */}
                    <div className="border-t border-blue-200 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowAnswers(!showAnswers);
                            }}
                            className="mb-3"
                        >
                            {showAnswers ? 'Hide' : 'Show'} Answers ({hasAnswers ? question.answers?.length || 0 : 0})
                        </Button>

                        {showAnswers && (
                            <div className="space-y-2">
                                {hasAnswers && question.answers && question.answers.map((answer: any, index: number) => (
                                    <div
                                        key={answer.id}
                                        className="bg-green-50 border border-green-200 rounded-lg p-3"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Badge className="text-xs bg-green-600">Answer {index + 1}</Badge>
                                                {answer.reviewed && (
                                                    <Badge variant="outline" className="text-xs border-green-600 text-green-700">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Reviewed
                                                    </Badge>
                                                )}
                                                {answer.auto_answer && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Auto-generated
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-3 text-xs text-gray-600">
                                                    <span>👍 {answer.likes || 0}</span>
                                                    <span>👎 {answer.dislikes || 0}</span>
                                                </div>
                                                {showActions && (
                                                    <div className="flex items-center space-x-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingAnswer(answer);
                                                                setShowAnswerForm(true);
                                                            }}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteAnswer(answer.id);
                                                            }}
                                                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {editingAnswer?.id === answer.id && showAnswerForm ? (
                                            <div className="mt-2">
                                                <AnswerForm
                                                    questionId={question.id}
                                                    answer={editingAnswer}
                                                    onSuccess={handleAnswerSuccess}
                                                    onCancel={() => {
                                                        setEditingAnswer(null);
                                                        setShowAnswerForm(false);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-sm text-gray-800">
                                                    {answer.text && <EditorRenderer data={answer.text} className="prose-sm" />}
                                                </div>
                                                {answer.created_by && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        By: {answer.created_by.name || 'Unknown'} • {formatDate(answer.created_at)}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Add Answer Form */}
                                {showActions && !editingAnswer && (
                                    <div className="mt-2">
                                        {showAnswerForm ? (
                                            <AnswerForm
                                                questionId={question.id}
                                                onSuccess={handleAnswerSuccess}
                                                onCancel={() => setShowAnswerForm(false)}
                                            />
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowAnswerForm(true);
                                                }}
                                                className="w-full"
                                            >
                                                <MessageSquarePlus className="mr-2 h-4 w-4" />
                                                Add Answer
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sub-questions */}
                    <div className="border-t border-blue-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Sub-questions:</h4>
                            {showActions && onAddSubQuestion && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddSubQuestion(question.id);
                                    }}
                                    className="h-8"
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add Sub-question
                                </Button>
                            )}
                        </div>
                        {hasSubQuestions ? (
                            <div className="space-y-2">
                                {subQuestions.map((subQuestion) => (
                                    <SubQuestionDisplay
                                        key={subQuestion.id}
                                        question={subQuestion}
                                        onEditQuestion={onEditQuestion}
                                        onDeleteQuestion={onDeleteQuestion}
                                        onViewQuestion={onViewQuestion}
                                        showActions={showActions}
                                        onAnswersChange={onAnswersChange}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <Hash className="mx-auto h-8 w-8 mb-2 text-gray-300" />
                                <p className="text-sm">No sub-questions yet</p>
                                <p className="text-xs mt-1">Click "Add Sub-question" to create one</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Question set component
const QuestionSetDisplay: React.FC<QuestionSetDisplayProps> = ({
    questionSet,
    questions,
    onEditQuestion,
    onDeleteQuestion,
    onViewQuestion,
    onAddSubQuestion,
    onEditQuestionSet,
    onDeleteQuestionSet,
    showActions = true,
    defaultExpanded = false,
    onAnswersChange,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Filter questions for this question set
    const setQuestions = questions.filter(q => q.question_set_id === questionSet.id);
    const mainQuestions = setQuestions.filter(q => !q.parent_id);

    // Calculate total marks
    const totalMarks = setQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

    return (
        <Card className={`mb-6 transition-all ${isExpanded ? 'border-2 border-purple-500 shadow-lg' : 'border border-purple-200 hover:border-purple-400 hover:shadow-md'
            }`}>
            <CardHeader
                className="pb-3 cursor-pointer hover:bg-purple-50/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="h-8 w-8 p-0"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-purple-600" />
                            ) : (
                                <ChevronRight className="h-5 w-5 text-purple-600" />
                            )}
                        </Button>
                        <BookOpen className={`h-6 w-6 ${isExpanded ? 'text-purple-700' : 'text-purple-600'}`} />
                        <div>
                            <CardTitle className={`text-lg ${isExpanded ? 'text-purple-900' : 'text-gray-900'}`}>
                                Question Set: {questionSet.title || `Set ${questionSet.id.slice(0, 8)}`}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-1">
                                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                                    {mainQuestions.length} main question{mainQuestions.length !== 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                                    {setQuestions.length} total question{setQuestions.length !== 1 ? 's' : ''}
                                </Badge>
                                <div className="flex items-center text-sm text-amber-600 font-semibold">
                                    <Star className="mr-1 h-4 w-4" />
                                    {totalMarks} total marks
                                </div>
                            </div>
                        </div>
                    </div>

                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Question Set Actions</DropdownMenuLabel>
                                {onEditQuestionSet && (
                                    <DropdownMenuItem onClick={() => onEditQuestionSet(questionSet)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Question Set
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {onDeleteQuestionSet && (
                                    <DropdownMenuItem
                                        onClick={() => onDeleteQuestionSet(questionSet.id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Question Set
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-0 bg-purple-50/30">
                    {mainQuestions.length > 0 ? (
                        <div className="space-y-4">
                            {mainQuestions.map((mainQuestion) => {
                                // Try to get sub-questions from children property first, then fall back to filtering
                                const subQuestions = mainQuestion.children && mainQuestion.children.length > 0
                                    ? mainQuestion.children
                                    : setQuestions.filter(q => q.parent_id === mainQuestion.id);

                                return (
                                    <MainQuestionDisplay
                                        key={mainQuestion.id}
                                        question={mainQuestion}
                                        subQuestions={subQuestions}
                                        onEditQuestion={onEditQuestion}
                                        onDeleteQuestion={onDeleteQuestion}
                                        onViewQuestion={onViewQuestion}
                                        onAddSubQuestion={onAddSubQuestion}
                                        showActions={showActions}
                                        defaultExpanded={false}
                                        onAnswersChange={onAnswersChange}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <p>No questions in this question set yet.</p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
};

// Main hierarchical questions component
export const HierarchicalQuestions: React.FC<HierarchicalQuestionsProps> = ({
    questionSets,
    questions,
    onEditQuestion,
    onDeleteQuestion,
    onViewQuestion,
    onAddSubQuestion,
    onEditQuestionSet,
    onDeleteQuestionSet,
    onAddQuestion,
    showActions = true,
    defaultExpanded = false,
    emptyMessage = "No question sets found.",
    onAnswersChange,
}) => {
    if (questionSets.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Question Sets</h3>
                <p className="text-gray-500 mb-4">{emptyMessage}</p>
                {onAddQuestion && (
                    <Button onClick={() => onAddQuestion()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Question
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {questionSets.map((questionSet) => (
                <QuestionSetDisplay
                    key={questionSet.id}
                    questionSet={questionSet}
                    questions={questions}
                    onEditQuestion={onEditQuestion}
                    onDeleteQuestion={onDeleteQuestion}
                    onViewQuestion={onViewQuestion}
                    onAddSubQuestion={onAddSubQuestion}
                    onEditQuestionSet={onEditQuestionSet}
                    onDeleteQuestionSet={onDeleteQuestionSet}
                    showActions={showActions}
                    defaultExpanded={defaultExpanded}
                    onAnswersChange={onAnswersChange}
                />
            ))}
        </div>
    );
};

export default HierarchicalQuestions;
