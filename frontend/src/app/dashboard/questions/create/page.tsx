'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    HelpCircle,
    Plus,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Hash,
    Star,
    BookOpen,
    FileText,
    Save,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
type MainQuestionCreate = components['schemas']['MainQuestionCreate'];
type SubQuestionCreate = components['schemas']['SubQuestionCreate'];
type QuestionSetRead = components['schemas']['QuestionSetRead'];
type ExamPaperRead = components['schemas']['ExamPaperRead'];

// Form validation schemas
const mainQuestionSchema = z.object({
    text: z.string().min(10, 'Question text must be at least 10 characters'),
    marks: z.number().min(1, 'Marks must be at least 1').max(100, 'Marks cannot exceed 100'),
    numbering_style: z.enum(['roman', 'alpha', 'numerical']),
    question_number: z.string().min(1, 'Question number is required'),
    question_set_id: z.string().min(1, 'Question set is required'),
    exam_paper_id: z.string().min(1, 'Exam paper is required'),
});

const subQuestionSchema = z.object({
    text: z.string().min(10, 'Question text must be at least 10 characters'),
    marks: z.number().min(1, 'Marks must be at least 1').max(50, 'Marks cannot exceed 50'),
    numbering_style: z.enum(['roman', 'alpha', 'numerical']),
    question_number: z.string().min(1, 'Question number is required'),
    parent_id: z.string().min(1, 'Parent question is required'),
});

type MainQuestionFormData = z.infer<typeof mainQuestionSchema>;
type SubQuestionFormData = z.infer<typeof subQuestionSchema>;

// Question type enum
enum QuestionType {
    MAIN = 'main',
    SUB = 'sub',
}

// Form steps
enum FormStep {
    TYPE_SELECTION = 0,
    BASIC_INFO = 1,
    QUESTION_CONTENT = 2,
    MARKS_AND_NUMBERING = 3,
    REVIEW = 4,
}

export default function CreateQuestionPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [currentStep, setCurrentStep] = useState(FormStep.TYPE_SELECTION);
    const [questionType, setQuestionType] = useState<QuestionType | null>(null);
    const [loading, setLoading] = useState(false);
    const [examPapers, setExamPapers] = useState<ExamPaperRead[]>([]);
    const [questionSets, setQuestionSets] = useState<QuestionSetRead[]>([]);
    const [mainQuestions, setMainQuestions] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Form instances
    const mainQuestionForm = useForm<MainQuestionFormData>({
        resolver: zodResolver(mainQuestionSchema),
        defaultValues: {
            text: '',
            marks: 5,
            numbering_style: 'roman',
            question_number: '',
            question_set_id: '',
            exam_paper_id: '',
        },
    });

    const subQuestionForm = useForm<SubQuestionFormData>({
        resolver: zodResolver(subQuestionSchema),
        defaultValues: {
            text: '',
            marks: 3,
            numbering_style: 'alpha',
            question_number: '',
            parent_id: '',
        },
    });

    // Load exam papers and question sets for dropdowns
    const loadLookupData = async () => {
        try {
            setLoadingData(true);

            // Load exam papers
            if (adminAPI.examPapers) {
                const papersResponse = await adminAPI.examPapers.list({ skip: 0, limit: 100 });
                if (papersResponse.data?.data?.items) {
                    setExamPapers(papersResponse.data.data.items as ExamPaperRead[]);
                }
            }

            // Load question sets
            if ((adminAPI as any).questionSets) {
                const setsResponse = await (adminAPI as any).questionSets.list({ skip: 0, limit: 100 });
                if (setsResponse.data?.data?.items) {
                    setQuestionSets(setsResponse.data.data.items as QuestionSetRead[]);
                }
            }

            // Load main questions for sub-question parent selection
            if ((adminAPI as any).questions) {
                const questionsResponse = await (adminAPI as any).questions.list({ skip: 0, limit: 100 });
                if (questionsResponse.data?.data?.items) {
                    const mainQuestionsOnly = questionsResponse.data.data.items.filter(
                        (q: any) => !q.parent_id
                    );
                    setMainQuestions(mainQuestionsOnly);
                }
            }
        } catch (error) {
            console.error('Error loading lookup data:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load data',
                message: 'Could not load exam papers and question sets.',
            });
        } finally {
            setLoadingData(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        loadLookupData();
    }, []);

    // Handle question type selection
    const handleQuestionTypeSelect = (type: QuestionType) => {
        setQuestionType(type);
        setCurrentStep(FormStep.BASIC_INFO);
    };

    // Navigation functions
    const nextStep = () => {
        if (currentStep < FormStep.REVIEW) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > FormStep.TYPE_SELECTION) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (questionType === QuestionType.MAIN) {
                const mainQuestionData = mainQuestionForm.getValues();
                
                // Format the text according to QuestionTextSchema
                const formattedData: MainQuestionCreate = {
                    text: {
                        time: Date.now(),
                        blocks: [
                            {
                                id: `block_${Date.now()}`,
                                type: 'paragraph',
                                data: {
                                    text: mainQuestionData.text
                                }
                            }
                        ]
                    },
                    marks: mainQuestionData.marks,
                    numbering_style: mainQuestionData.numbering_style,
                    question_number: mainQuestionData.question_number,
                    question_set_id: mainQuestionData.question_set_id,
                    exam_paper_id: mainQuestionData.exam_paper_id,
                };

                const response = await (adminAPI as any).questions.createMain(formattedData);
                
                if (response.data?.data) {
                    addNotification({
                        type: 'success',
                        title: 'Question Created',
                        message: 'Main question has been created successfully!',
                    });
                    router.push('/dashboard/questions');
                }
            } else if (questionType === QuestionType.SUB) {
                const subQuestionData = subQuestionForm.getValues();
                
                // Format the text according to QuestionTextSchema
                const formattedData: SubQuestionCreate = {
                    text: {
                        time: Date.now(),
                        blocks: [
                            {
                                id: `block_${Date.now()}`,
                                type: 'paragraph',
                                data: {
                                    text: subQuestionData.text
                                }
                            }
                        ]
                    },
                    marks: subQuestionData.marks,
                    numbering_style: subQuestionData.numbering_style,
                    question_number: subQuestionData.question_number,
                    parent_id: subQuestionData.parent_id,
                };

                const response = await (adminAPI as any).questions.createSubQuestion(formattedData);
                
                if (response.data?.data) {
                    addNotification({
                        type: 'success',
                        title: 'Question Created',
                        message: 'Sub-question has been created successfully!',
                    });
                    router.push('/dashboard/questions');
                }
            }
        } catch (error) {
            console.error('Error creating question:', error);
            addNotification({
                type: 'error',
                title: 'Creation Failed',
                message: 'Failed to create question. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Check if current step is valid
    const isCurrentStepValid = () => {
        if (currentStep === FormStep.TYPE_SELECTION) return questionType !== null;
        if (currentStep === FormStep.BASIC_INFO) return true;
        if (currentStep === FormStep.QUESTION_CONTENT) {
            return questionType === QuestionType.MAIN ? 
                mainQuestionForm.formState.isValid : 
                subQuestionForm.formState.isValid;
        }
        if (currentStep === FormStep.MARKS_AND_NUMBERING) {
            return questionType === QuestionType.MAIN ? 
                mainQuestionForm.formState.isValid : 
                subQuestionForm.formState.isValid;
        }
        return true;
    };

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case FormStep.TYPE_SELECTION:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Choose Question Type</h2>
                            <p className="text-gray-600 mt-2">
                                Select whether you want to create a main question or a sub-question
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card 
                                className={`cursor-pointer transition-all hover:shadow-lg ${
                                    questionType === QuestionType.MAIN ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => handleQuestionTypeSelect(QuestionType.MAIN)}
                            >
                                <CardContent className="p-6 text-center">
                                    <HelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Main Question</h3>
                                    <p className="text-gray-600">
                                        Create a standalone question that can have sub-questions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card 
                                className={`cursor-pointer transition-all hover:shadow-lg ${
                                    questionType === QuestionType.SUB ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => handleQuestionTypeSelect(QuestionType.SUB)}
                            >
                                <CardContent className="p-6 text-center">
                                    <Hash className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sub-Question</h3>
                                    <p className="text-gray-600">
                                        Create a question that belongs to a main question
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case FormStep.BASIC_INFO:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                            <p className="text-gray-600 mt-2">
                                {questionType === QuestionType.MAIN 
                                    ? 'Set up the basic details for your main question'
                                    : 'Set up the basic details for your sub-question'
                                }
                            </p>
                        </div>

                        {questionType === QuestionType.MAIN ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={mainQuestionForm.control}
                                    name="exam_paper_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Exam Paper</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select exam paper" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {loadingData ? (
                                                        <div className="flex justify-center py-4">
                                                            <LoadingSpinner />
                                                        </div>
                                                    ) : examPapers.length === 0 ? (
                                                        <div className="text-center text-muted-foreground py-4">
                                                            No exam papers available
                                                        </div>
                                                    ) : (
                                                        examPapers.map((paper) => (
                                                            <SelectItem key={paper.id} value={paper.id}>
                                                                {paper.title?.name || 'Untitled'} ({paper.year_of_exam || 'N/A'})
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={mainQuestionForm.control}
                                    name="question_set_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Set</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select question set" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {loadingData ? (
                                                        <div className="flex justify-center py-4">
                                                            <LoadingSpinner />
                                                        </div>
                                                    ) : questionSets.length === 0 ? (
                                                        <div className="text-center text-muted-foreground py-4">
                                                            No question sets available
                                                        </div>
                                                    ) : (
                                                        questionSets.map((set) => (
                                                            <SelectItem key={set.id} value={set.id}>
                                                                {set.title || `Question Set ${set.id.slice(0, 8)}`}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <FormField
                                    control={subQuestionForm.control}
                                    name="parent_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Parent Question</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select parent question" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {loadingData ? (
                                                        <div className="flex justify-center py-4">
                                                            <LoadingSpinner />
                                                        </div>
                                                    ) : mainQuestions.length === 0 ? (
                                                        <div className="text-center text-muted-foreground py-4">
                                                            No main questions available
                                                        </div>
                                                    ) : (
                                                        mainQuestions.map((question) => (
                                                            <SelectItem key={question.id} value={question.id}>
                                                                {question.text?.content?.substring(0, 50)}...
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );

            case FormStep.QUESTION_CONTENT:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Question Content</h2>
                            <p className="text-gray-600 mt-2">
                                Write the actual question text
                            </p>
                        </div>

                        {questionType === QuestionType.MAIN ? (
                            <FormField
                                control={mainQuestionForm.control}
                                name="text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Text</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter your question here..."
                                                className="min-h-[200px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={subQuestionForm.control}
                                name="text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Text</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter your question here..."
                                                className="min-h-[200px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                );

            case FormStep.MARKS_AND_NUMBERING:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Marks & Numbering</h2>
                            <p className="text-gray-600 mt-2">
                                Set the marks allocation and question numbering
                            </p>
                        </div>

                        {questionType === QuestionType.MAIN ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={mainQuestionForm.control}
                                    name="marks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marks</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={mainQuestionForm.control}
                                    name="numbering_style"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numbering Style</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="roman">Roman (i, ii, iii)</SelectItem>
                                                    <SelectItem value="alpha">Alpha (a, b, c)</SelectItem>
                                                    <SelectItem value="numerical">Numerical (1, 2, 3)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={mainQuestionForm.control}
                                    name="question_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="1"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={subQuestionForm.control}
                                    name="marks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marks</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={subQuestionForm.control}
                                    name="numbering_style"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numbering Style</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="roman">Roman (i, ii, iii)</SelectItem>
                                                    <SelectItem value="alpha">Alpha (a, b, c)</SelectItem>
                                                    <SelectItem value="numerical">Numerical (1, 2, 3)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={subQuestionForm.control}
                                    name="question_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="a"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );

            case FormStep.REVIEW:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Review & Create</h2>
                            <p className="text-gray-600 mt-2">
                                Review your question details before creating
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    Question Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {questionType === QuestionType.MAIN ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Type:</span>
                                                <Badge className="ml-2">Main Question</Badge>
                                            </div>
                                            <div>
                                                <span className="font-medium">Marks:</span>
                                                <span className="ml-2">{mainQuestionForm.watch('marks')} pts</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Number:</span>
                                                <span className="ml-2">{mainQuestionForm.watch('question_number')}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Style:</span>
                                                <span className="ml-2 capitalize">{mainQuestionForm.watch('numbering_style')}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Question:</span>
                                            <p className="mt-2 text-gray-700 bg-gray-50 p-3 rounded">
                                                {mainQuestionForm.watch('text')}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Type:</span>
                                                <Badge variant="secondary">Sub-Question</Badge>
                                            </div>
                                            <div>
                                                <span className="font-medium">Marks:</span>
                                                <span className="ml-2">{subQuestionForm.watch('marks')} pts</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Number:</span>
                                                <span className="ml-2">{subQuestionForm.watch('question_number')}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Style:</span>
                                                <span className="ml-2 capitalize">{subQuestionForm.watch('numbering_style')}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Question:</span>
                                            <p className="mt-2 text-gray-700 bg-gray-50 p-3 rounded">
                                                {subQuestionForm.watch('text')}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    // Render step indicator
    const renderStepIndicator = () => {
        const steps = [
            { name: 'Type', icon: HelpCircle },
            { name: 'Basic Info', icon: FileText },
            { name: 'Content', icon: BookOpen },
            { name: 'Marks', icon: Star },
            { name: 'Review', icon: CheckCircle },
        ];

        return (
            <div className="flex items-center justify-center space-x-4 mb-8">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div key={step.name} className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                isCompleted 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : isActive 
                                        ? 'bg-blue-500 border-blue-500 text-white' 
                                        : 'bg-gray-100 border-gray-300 text-gray-500'
                            }`}>
                                {isCompleted ? (
                                    <CheckCircle className="h-5 w-5" />
                                ) : (
                                    <Icon className="h-5 w-5" />
                                )}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${
                                isActive ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                                {step.name}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`w-16 h-0.5 mx-4 ${
                                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb 
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Questions', href: '/dashboard/questions' },
                    { label: 'Create', href: '/dashboard/questions/create' },
                ]}
                currentPage="Create Question"
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Question</h1>
                    <p className="text-gray-600">
                        {questionType === QuestionType.MAIN 
                            ? 'Create a new main question for an exam paper'
                            : questionType === QuestionType.SUB
                                ? 'Create a new sub-question'
                                : 'Choose the type of question you want to create'
                        }
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Form Container */}
            <Card className="max-w-4xl mx-auto">
                <CardContent className="p-8">
                    {questionType === QuestionType.MAIN ? (
                        <Form {...mainQuestionForm}>
                            {renderStepContent()}
                        </Form>
                    ) : questionType === QuestionType.SUB ? (
                        <Form {...subQuestionForm}>
                            {renderStepContent()}
                        </Form>
                    ) : (
                        renderStepContent()
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === FormStep.TYPE_SELECTION}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex space-x-3">
                            {currentStep === FormStep.REVIEW ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="min-w-[120px]"
                                >
                                    {loading ? (
                                        <LoadingSpinner className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Create Question
                                </Button>
                            ) : (
                                <Button
                                    onClick={nextStep}
                                    disabled={!isCurrentStepValid()}
                                    className="min-w-[120px]"
                                >
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
