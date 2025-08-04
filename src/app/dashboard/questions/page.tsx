'use client';

import React, { useState, useEffect } from 'react';
import {
    HelpCircle,
    Search,
    Filter,
    Eye,
    Star,
    CheckCircle,
    XCircle,
    Hash,
    BookOpen,
    FileText,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    Clock,
    AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type QuestionRead = components['schemas']['QuestionRead'];

// Interface for the display table data
interface QuestionTableData extends QuestionRead {
    displayText: string;
    numberingDisplay: React.ReactNode;
    marksDisplay: React.ReactNode;
    typeDisplay: React.ReactNode;
    statusDisplay: React.ReactNode;
    paperInfo: React.ReactNode;
    createdAtDisplay: React.ReactNode;
    actions: React.ReactNode;
}

// Statistics interface
interface QuestionsOverviewStats {
    totalQuestions: number;
    mainQuestions: number;
    subQuestions: number;
    questionsWithAnswers: number;
    totalMarks: number;
    averageMarks: number;
    recentQuestions: number;
    orphanQuestions: number;
}

// Filter interface
interface QuestionsFilters {
    search?: string;
    numbering_style?: string;
    has_answers?: 'yes' | 'no';
    question_type?: 'main' | 'sub';
    marks_range?: 'low' | 'medium' | 'high';
    exam_paper_id?: string;
}

// Mock data
const mockStats: QuestionsOverviewStats = {
    totalQuestions: 12847,
    mainQuestions: 5234,
    subQuestions: 7613,
    questionsWithAnswers: 11543,
    totalMarks: 67890,
    averageMarks: 5.3,
    recentQuestions: 234,
    orphanQuestions: 45,
};

const mockQuestions: QuestionRead[] = [
    {
        id: '1',
        text: {
            content: 'Explain the fundamental principles of object-oriented programming, including encapsulation, inheritance, and polymorphism. Provide examples for each principle.',
            format: 'text' as any,
        },
        marks: 15,
        numbering_style: 'numeric' as any,
        question_number: '1',
        slug: 'oop-principles-question',
        created_at: '2024-12-15T10:30:00Z',
        question_set_id: 'set-1',
        exam_paper_id: 'paper-1',
        parent_id: null,
        children: [
            {
                id: '1a',
                text: { content: 'Define encapsulation with an example.', format: 'text' as any },
                marks: 5,
                numbering_style: 'alphabetic' as any,
                question_number: '1a',
                created_at: '2024-12-15T10:30:00Z',
                question_set_id: 'set-1',
                exam_paper_id: 'paper-1',
                parent_id: '1',
                children: [],
                answers: [],
                slug: 'encapsulation-definition',
            }
        ],
        answers: [
            {
                id: 'a1',
                content: 'Sample answer for OOP principles...',
                is_correct: true,
                explanation: 'This demonstrates the key concepts...'
            }
        ],
    },
    {
        id: '2',
        text: {
            content: 'Calculate the derivative of f(x) = 3x² + 2x - 5 using the power rule.',
            format: 'text' as any,
        },
        marks: 8,
        numbering_style: 'alphabetic' as any,
        question_number: '2',
        slug: 'derivative-calculation',
        created_at: '2024-12-16T14:20:00Z',
        question_set_id: 'set-2',
        exam_paper_id: 'paper-2',
        parent_id: null,
        children: [],
        answers: [],
    },
    {
        id: '3',
        text: {
            content: 'Define "sustainable development" and explain its three pillars. Discuss how these pillars interact with each other.',
            format: 'text' as any,
        },
        marks: 12,
        numbering_style: 'roman' as any,
        question_number: 'i',
        slug: 'sustainable-development-definition',
        created_at: '2024-12-17T09:15:00Z',
        question_set_id: 'set-1',
        exam_paper_id: 'paper-1',
        parent_id: null,
        children: [],
        answers: [
            {
                id: 'a3',
                content: 'Sustainable development is...',
                is_correct: true,
                explanation: 'The three pillars are environmental, social, and economic...'
            }
        ],
    },
    {
        id: '4',
        text: {
            content: 'What is photosynthesis?',
            format: 'text' as any,
        },
        marks: 3,
        numbering_style: 'numeric' as any,
        question_number: '4',
        slug: 'photosynthesis-definition',
        created_at: '2024-12-18T16:45:00Z',
        question_set_id: 'set-3',
        exam_paper_id: 'paper-3',
        parent_id: null,
        children: [],
        answers: [],
    },
];

export default function AllQuestionsPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [questions, setQuestions] = useState<QuestionRead[]>(mockQuestions);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<QuestionsOverviewStats>(mockStats);
    const [filters, setFilters] = useState<QuestionsFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const ITEMS_PER_PAGE = 20;

    // Load questions data
    const loadQuestions = async () => {
        try {
            setLoading(true);

            // Connect to real backend API (when available)
            if ((adminAPI as any).questions) {
                let response;
                if (filters.search && filters.search.trim() !== '') {
                    response = await (adminAPI as any).questions.search({
                        q: filters.search,
                        numbering_style: filters.numbering_style,
                        marks_min: getMarksRangeMin(filters.marks_range),
                        marks_max: getMarksRangeMax(filters.marks_range),
                        skip: currentPage * ITEMS_PER_PAGE,
                        limit: ITEMS_PER_PAGE,
                    });
                } else {
                    response = await (adminAPI as any).questions.list({
                        skip: currentPage * ITEMS_PER_PAGE,
                        limit: ITEMS_PER_PAGE,
                        ...filters,
                    });
                }

                if (response.data && response.data.data) {
                    const responseData = response.data.data;
                    setQuestions(responseData.items || []);
                    setTotalItems(responseData.total || 0);
                    setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));
                }
            } else {
                // Fallback to mock data
                console.log('Using mock data - questions API not available');
                const filteredData = mockQuestions.filter(question => {
                    if (filters.search && !question.text?.content?.toLowerCase().includes(filters.search.toLowerCase())) {
                        return false;
                    }
                    if (filters.numbering_style && question.numbering_style !== filters.numbering_style) {
                        return false;
                    }
                    if (filters.has_answers === 'yes' && (!question.answers || question.answers.length === 0)) {
                        return false;
                    }
                    if (filters.has_answers === 'no' && question.answers && question.answers.length > 0) {
                        return false;
                    }
                    if (filters.question_type === 'main' && question.parent_id) {
                        return false;
                    }
                    if (filters.question_type === 'sub' && !question.parent_id) {
                        return false;
                    }
                    return true;
                });
                setQuestions(filteredData);
                setTotalItems(filteredData.length);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load questions',
                message: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get marks range
    const getMarksRangeMin = (range?: string) => {
        switch (range) {
            case 'low': return 1;
            case 'medium': return 4;
            case 'high': return 8;
            default: return undefined;
        }
    };

    const getMarksRangeMax = (range?: string) => {
        switch (range) {
            case 'low': return 3;
            case 'medium': return 7;
            case 'high': return undefined;
            default: return undefined;
        }
    };

    // Transform question data for table display
    const transformQuestionForTable = (question: QuestionRead): QuestionTableData => {
        const displayText = question.text?.content || 'No text content';
        const truncatedText = displayText.length > 120 ?
            `${displayText.substring(0, 120)}...` : displayText;

        const numberingDisplay = (
            <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                    <Hash className="mr-1 h-3 w-3" />
                    {question.question_number}
                </Badge>
                <span className="text-xs text-gray-500 capitalize">
                    {question.numbering_style}
                </span>
            </div>
        );

        const marksDisplay = (
            <div className="flex items-center text-sm font-medium">
                <Star className="mr-1 h-4 w-4 text-yellow-500" />
                <span className="font-bold">{question.marks || 0}</span>
                <span className="text-gray-500 ml-1">pts</span>
            </div>
        );

        const typeDisplay = (
            <div className="flex flex-col space-y-1">
                <Badge
                    variant={question.parent_id ? 'secondary' : 'default'}
                    className={question.parent_id ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}
                >
                    {question.parent_id ? 'Sub-question' : 'Main Question'}
                </Badge>
                {question.children && question.children.length > 0 && (
                    <span className="text-xs text-gray-500">
                        {question.children.length} sub-questions
                    </span>
                )}
            </div>
        );

        const statusDisplay = (
            <div className="flex flex-col space-y-1">
                <Badge
                    variant={question.answers && question.answers.length > 0 ? 'default' : 'secondary'}
                    className={question.answers && question.answers.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                >
                    {question.answers && question.answers.length > 0 ? (
                        <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            No Answers
                        </>
                    )}
                </Badge>
            </div>
        );

        const paperInfo = (
            <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center">
                    <BookOpen className="mr-1 h-3 w-3" />
                    <span>Paper: {question.exam_paper_id?.slice(0, 8) || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                    <FileText className="mr-1 h-3 w-3" />
                    <span>Set: {question.question_set_id?.slice(0, 8) || 'N/A'}</span>
                </div>
            </div>
        );

        const createdAtDisplay = (
            <div className="text-xs text-gray-600">
                <div>{formatDate(question.created_at)}</div>
                <div className="text-gray-500">{formatRelativeTime(question.created_at)}</div>
            </div>
        );

        const actions = (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/questions/${question.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Question
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Manage Answers
                    </DropdownMenuItem>
                    {!question.parent_id && (
                        <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Sub-question
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        return {
            ...question,
            displayText: truncatedText,
            numberingDisplay,
            marksDisplay,
            typeDisplay,
            statusDisplay,
            paperInfo,
            createdAtDisplay,
            actions,
        };
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(0);
    };

    const handleFilterChange = (key: keyof QuestionsFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
        setCurrentPage(0);
    };

    // Load data on mount and when filters change
    useEffect(() => {
        loadQuestions();
    }, [currentPage, filters]);

    // Define table columns
    const columns = [
        {
            key: 'displayText' as keyof QuestionTableData,
            header: 'Question',
            cell: (item: QuestionTableData) => (
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <HelpCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 mb-2 leading-tight">{item.displayText}</div>
                        <div className="flex items-center space-x-3 mb-1">
                            {item.numberingDisplay}
                            {item.marksDisplay}
                        </div>
                        <div className="flex items-center space-x-2">
                            {item.typeDisplay}
                        </div>
                    </div>
                </div>
            ),
            sortable: false,
            width: '40%',
        },
        {
            key: 'paperInfo' as keyof QuestionTableData,
            header: 'Paper & Set',
            cell: (item: QuestionTableData) => item.paperInfo,
            sortable: false,
            width: '15%',
        },
        {
            key: 'statusDisplay' as keyof QuestionTableData,
            header: 'Answers',
            cell: (item: QuestionTableData) => item.statusDisplay,
            sortable: false,
            width: '15%',
        },
        {
            key: 'createdAtDisplay' as keyof QuestionTableData,
            header: 'Created',
            cell: (item: QuestionTableData) => item.createdAtDisplay,
            sortable: true,
            width: '15%',
        },
        {
            key: 'actions' as keyof QuestionTableData,
            header: '',
            cell: (item: QuestionTableData) => item.actions,
            sortable: false,
            width: '15%',
        },
    ];

    const transformedQuestions = questions.map(transformQuestionForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="All Questions" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Questions</h1>
                    <p className="text-gray-600">
                        Browse and explore questions from all exam papers
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.mainQuestions.toLocaleString()} main, {stats.subQuestions.toLocaleString()} sub
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">With Answers</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.questionsWithAnswers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {((stats.questionsWithAnswers / stats.totalQuestions) * 100).toFixed(1)}% coverage
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Marks</CardTitle>
                        <Star className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMarks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Avg {stats.averageMarks} per question
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentQuestions}</div>
                        <p className="text-xs text-muted-foreground">Added this week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search questions by content..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.question_type || 'all'}
                            onValueChange={(value) => handleFilterChange('question_type', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Question type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="main">Main Questions</SelectItem>
                                <SelectItem value="sub">Sub-questions</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.has_answers || 'all'}
                            onValueChange={(value) => handleFilterChange('has_answers', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Answer status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Questions</SelectItem>
                                <SelectItem value="yes">With Answers</SelectItem>
                                <SelectItem value="no">Without Answers</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.marks_range || 'all'}
                            onValueChange={(value) => handleFilterChange('marks_range', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Marks range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Marks</SelectItem>
                                <SelectItem value="low">Low (1-3 pts)</SelectItem>
                                <SelectItem value="medium">Medium (4-7 pts)</SelectItem>
                                <SelectItem value="high">High (8+ pts)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <LoadingOverlay isLoading={loading}>
                    <DataTable
                        data={transformedQuestions}
                        columns={columns}
                        title={`${totalItems} Questions`}
                        searchable={false}
                        filterable={false}
                        pagination={true}
                        pageSize={ITEMS_PER_PAGE}
                        emptyMessage="No questions found. Try adjusting your search criteria."
                        loading={loading}
                    />
                </LoadingOverlay>
            </Card>
        </div>
    );
}