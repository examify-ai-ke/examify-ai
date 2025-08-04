'use client';

import React, { useState, useEffect } from 'react';
import {
    HelpCircle,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    FileText,
    BookOpen,
    Users,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Copy,
    Download,
    Upload,
    Clock,
    Star,
    Hash,
    List,
    Grid,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { formatDate } from '@/lib/utils';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type QuestionRead = components['schemas']['QuestionRead'];
type MainQuestionCreate = components['schemas']['MainQuestionCreate'];
type QuestionSetRead = components['schemas']['QuestionSetRead'];
type ExamPaperRead = components['schemas']['ExamPaperRead'];

// Interface for the display table data
interface QuestionTableData extends QuestionRead {
    displayText: string;
    numberingDisplay: React.ReactNode;
    marksDisplay: React.ReactNode;
    typeDisplay: React.ReactNode;
    statusBadge: React.ReactNode;
    paperInfo: React.ReactNode;
    createdAtFormatted: string;
    actions: React.ReactNode;
}

// Statistics interface
interface QuestionsStats {
    totalQuestions: number;
    mainQuestions: number;
    subQuestions: number;
    totalMarks: number;
    averageMarks: number;
    recentQuestions: number;
    questionsWithAnswers: number;
    orphanQuestions: number;
}

// Filter interface
interface QuestionsFilters {
    search?: string;
    question_set_id?: string;
    exam_paper_id?: string;
    numbering_style?: string;
    has_answers?: 'yes' | 'no';
    marks_range?: 'low' | 'medium' | 'high';
}

// Mock data
const mockStats: QuestionsStats = {
    totalQuestions: 2847,
    mainQuestions: 1234,
    subQuestions: 1613,
    totalMarks: 15678,
    averageMarks: 5.5,
    recentQuestions: 89,
    questionsWithAnswers: 2543,
    orphanQuestions: 45,
};

const mockQuestions: QuestionRead[] = [
    {
        id: '1',
        text: {
            content: 'Explain the concept of object-oriented programming and its key principles.',
            format: 'text' as any,
        },
        marks: 10,
        numbering_style: 'numeric' as any,
        question_number: '1',
        slug: 'oop-principles-question',
        created_at: '2024-12-15T10:30:00Z',
        question_set_id: 'set-1',
        exam_paper_id: 'paper-1',
        parent_id: null,
        children: [],
        answers: [],
    },
    {
        id: '2',
        text: {
            content: 'Calculate the derivative of f(x) = 3x² + 2x - 5',
            format: 'text' as any,
        },
        marks: 5,
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
            content: 'Define the term "sustainable development" and explain its importance.',
            format: 'text' as any,
        },
        marks: 8,
        numbering_style: 'roman' as any,
        question_number: '3',
        slug: 'sustainable-development-definition',
        created_at: '2024-12-17T09:15:00Z',
        question_set_id: 'set-1',
        exam_paper_id: 'paper-1',
        parent_id: null,
        children: [],
        answers: [],
    },
];

export default function QuestionsManagePage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [questions, setQuestions] = useState<QuestionRead[]>(mockQuestions);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<QuestionsStats>(mockStats);
    const [filters, setFilters] = useState<QuestionsFilters>({});
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionRead | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const ITEMS_PER_PAGE = 20;

    // Role-based access control
    const currentUser = user || {
        role: { name: 'Admin' },
        email: 'admin@dev.local',
        name: 'Admin User'
    };

    const isAdmin = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'admin' || currentUser?.role === 'Admin')
        : (currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'Admin');

    const isManager = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'manager' || currentUser?.role === 'Manager')
        : (currentUser?.role?.name === 'manager' || currentUser?.role?.name === 'Manager');

    // Check if user has permission to manage questions
    if (!isAdmin && !isManager) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
                    <p className="mt-2 text-gray-600">
                        You need manager or administrator privileges to access questions management.
                    </p>
                </div>
            </div>
        );
    }

    // Load questions data
    const loadQuestions = async () => {
        try {
            setLoading(true);

            // Connect to real backend API (when available)
            if ((adminAPI as any).questions) {
                const response = await (adminAPI as any).questions.list({
                    skip: currentPage * ITEMS_PER_PAGE,
                    limit: ITEMS_PER_PAGE,
                    ...filters,
                });

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
                    if (filters.question_set_id && question.question_set_id !== filters.question_set_id) {
                        return false;
                    }
                    if (filters.exam_paper_id && question.exam_paper_id !== filters.exam_paper_id) {
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

    // Transform question data for table display
    const transformQuestionForTable = (question: QuestionRead): QuestionTableData => {
        const displayText = question.text?.content || 'No text content';
        const truncatedText = displayText.length > 100 ?
            `${displayText.substring(0, 100)}...` : displayText;

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
                {question.marks || 0} marks
            </div>
        );

        const typeDisplay = (
            <div className="flex flex-col space-y-1">
                <Badge variant={question.parent_id ? 'secondary' : 'default'} className="text-xs">
                    {question.parent_id ? 'Sub-question' : 'Main Question'}
                </Badge>
                {question.children && question.children.length > 0 && (
                    <span className="text-xs text-gray-500">
                        {question.children.length} sub-questions
                    </span>
                )}
            </div>
        );

        const statusBadge = (
            <Badge
                variant={question.answers && question.answers.length > 0 ? 'default' : 'secondary'}
                className={question.answers && question.answers.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            >
                {question.answers && question.answers.length > 0 ? (
                    <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Has Answers
                    </>
                ) : (
                    <>
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        No Answers
                    </>
                )}
            </Badge>
        );

        const paperInfo = (
            <div className="text-xs text-gray-600">
                <div>Paper: {question.exam_paper_id || 'N/A'}</div>
                <div>Set: {question.question_set_id || 'N/A'}</div>
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
                    <DropdownMenuItem onClick={() => handleViewQuestion(question.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageAnswers(question.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Manage Answers
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddSubQuestion(question.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Sub-question
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDuplicateQuestion(question.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600"
                    >
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
            statusBadge,
            paperInfo,
            createdAtFormatted: formatDate(question.created_at),
            actions,
        };
    };

    // Action handlers
    const handleCreateQuestion = () => {
        setSelectedQuestion(null);
        setShowCreateDialog(true);
    };

    const handleEditQuestion = (question: QuestionRead) => {
        setSelectedQuestion(question);
        setShowEditDialog(true);
    };

    const handleViewQuestion = (questionId: string) => {
        addNotification({
            type: 'info',
            title: 'View Question',
            message: `Opening details for question ${questionId}...`,
        });
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;

        try {
            if ((adminAPI as any).questions) {
                await (adminAPI as any).questions.delete(questionId);
                addNotification({
                    type: 'success',
                    title: 'Question Deleted',
                    message: 'Question has been deleted successfully.',
                });
            } else {
                // Mock delete
                setQuestions(prev => prev.filter(q => q.id !== questionId));
                addNotification({
                    type: 'success',
                    title: 'Question Deleted (Mock)',
                    message: 'Question deletion simulated successfully.',
                });
            }
            loadQuestions();
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to delete the question. Please try again.',
            });
        }
    };

    const handleManageAnswers = (questionId: string) => {
        addNotification({
            type: 'info',
            title: 'Manage Answers',
            message: `Opening answer management for question ${questionId}...`,
        });
    };

    const handleAddSubQuestion = (parentQuestionId: string) => {
        addNotification({
            type: 'info',
            title: 'Add Sub-question',
            message: `Adding sub-question to question ${parentQuestionId}...`,
        });
    };

    const handleDuplicateQuestion = (questionId: string) => {
        addNotification({
            type: 'info',
            title: 'Duplicate Question',
            message: `Creating copy of question ${questionId}...`,
        });
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(0);
    };

    const handleFilterChange = (key: keyof QuestionsFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value }));
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
                        <div className="font-medium text-gray-900 mb-1">{item.displayText}</div>
                        <div className="flex items-center space-x-2 mb-1">
                            {item.numberingDisplay}
                        </div>
                        <div className="flex items-center space-x-2">
                            {item.marksDisplay}
                            {item.typeDisplay}
                        </div>
                    </div>
                </div>
            ),
            sortable: false,
            width: '35%',
        },
        {
            key: 'paperInfo' as keyof QuestionTableData,
            header: 'Paper & Set',
            cell: (item: QuestionTableData) => item.paperInfo,
            sortable: false,
            width: '15%',
        },
        {
            key: 'statusBadge' as keyof QuestionTableData,
            header: 'Status',
            cell: (item: QuestionTableData) => item.statusBadge,
            sortable: false,
            width: '15%',
        },
        {
            key: 'createdAtFormatted' as keyof QuestionTableData,
            header: 'Created',
            cell: (item: QuestionTableData) => (
                <div className="text-sm text-gray-600">
                    <div>{item.createdAtFormatted}</div>
                </div>
            ),
            sortable: true,
            width: '15%',
        },
        {
            key: 'actions' as keyof QuestionTableData,
            header: '',
            cell: (item: QuestionTableData) => item.actions,
            sortable: false,
            width: '10%',
        },
    ];

    const transformedQuestions = questions.map(transformQuestionForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="Questions Management" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Questions Management</h1>
                    <p className="text-gray-600">
                        Manage exam questions, answers, and question sets
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => addNotification({ type: 'info', title: 'Import', message: 'Question import feature coming soon...' })}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button onClick={handleCreateQuestion} className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Question</span>
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQuestions}</div>
                        <p className="text-xs text-muted-foreground">All questions in system</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Main vs Sub</CardTitle>
                        <List className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.mainQuestions}/{stats.subQuestions}</div>
                        <p className="text-xs text-muted-foreground">Main / Sub questions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">With Answers</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.questionsWithAnswers}</div>
                        <p className="text-xs text-muted-foreground">
                            {((stats.questionsWithAnswers / stats.totalQuestions) * 100).toFixed(1)}% coverage
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Marks</CardTitle>
                        <Star className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageMarks}</div>
                        <p className="text-xs text-muted-foreground">Per question average</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search questions..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.has_answers || 'all'}
                            onValueChange={(value) => handleFilterChange('has_answers', value === 'all' ? undefined : value as any)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by answers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Questions</SelectItem>
                                <SelectItem value="yes">With Answers</SelectItem>
                                <SelectItem value="no">Without Answers</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.numbering_style || 'all'}
                            onValueChange={(value) => handleFilterChange('numbering_style', value === 'all' ? undefined : value)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Numbering style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Styles</SelectItem>
                                <SelectItem value="numeric">Numeric (1, 2, 3)</SelectItem>
                                <SelectItem value="alphabetic">Alphabetic (a, b, c)</SelectItem>
                                <SelectItem value="roman">Roman (i, ii, iii)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.marks_range || 'all'}
                            onValueChange={(value) => handleFilterChange('marks_range', value === 'all' ? undefined : value as any)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Marks range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Marks</SelectItem>
                                <SelectItem value="low">Low (1-3)</SelectItem>
                                <SelectItem value="medium">Medium (4-7)</SelectItem>
                                <SelectItem value="high">High (8+)</SelectItem>
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
                        actions={[
                            {
                                label: 'Export Selected',
                                onClick: (selectedItems: QuestionTableData[]) => {
                                    addNotification({
                                        type: 'info',
                                        title: 'Export Started',
                                        message: `Exporting ${selectedItems.length} questions...`,
                                    });
                                },
                                icon: Download,
                                variant: 'outline',
                            },
                            {
                                label: 'Bulk Edit Marks',
                                onClick: (selectedItems: QuestionTableData[]) => {
                                    addNotification({
                                        type: 'info',
                                        title: 'Bulk Edit',
                                        message: `Editing marks for ${selectedItems.length} questions...`,
                                    });
                                },
                                icon: Edit,
                                variant: 'outline',
                            },
                            {
                                label: 'Delete Selected',
                                onClick: (selectedItems: QuestionTableData[]) => {
                                    if (confirm(`Are you sure you want to delete ${selectedItems.length} questions?`)) {
                                        addNotification({
                                            type: 'warning',
                                            title: 'Bulk Delete',
                                            message: `Deleting ${selectedItems.length} questions...`,
                                        });
                                    }
                                },
                                icon: Trash2,
                                variant: 'destructive',
                            },
                        ]}
                        emptyMessage="No questions found. Create your first question to get started."
                        loading={loading}
                    />
                </LoadingOverlay>
            </Card>
        </div>
    );
}