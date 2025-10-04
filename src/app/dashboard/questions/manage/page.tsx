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
import { HierarchicalQuestions } from '@/components/ui/hierarchical-questions';
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
import { useRouter } from 'next/navigation';
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

// Filter interface - matches API parameters
interface QuestionsFilters {
    search?: string;
    question_set_id?: string;
    exam_paper_id?: string;
    numbering_style?: string;
    has_answers?: 'yes' | 'no';
    marks_range?: 'low' | 'medium' | 'high';
}

// Initial empty states - data will be loaded from API
const initialStats: QuestionsStats = {
    totalQuestions: 0,
    mainQuestions: 0,
    subQuestions: 0,
    totalMarks: 0,
    averageMarks: 0,
    recentQuestions: 0,
    questionsWithAnswers: 0,
    orphanQuestions: 0,
};

export default function QuestionsManagePage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();
    const router = useRouter();

    // State management
    const [questions, setQuestions] = useState<QuestionRead[]>([]);
    const [questionSets, setQuestionSets] = useState<QuestionSetRead[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<QuestionsStats>(initialStats);
    const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('hierarchical');
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

            // Build API parameters
            const apiParams: any = {
                skip: currentPage * ITEMS_PER_PAGE,
                limit: ITEMS_PER_PAGE,
            };

            // Add filters to API params
            if (filters.question_set_id) {
                apiParams.question_set_id = filters.question_set_id;
            }
            if (filters.exam_paper_id) {
                apiParams.exam_paper_id = filters.exam_paper_id;
            }

            // Load questions and question sets in parallel
            const [questionsResponse, questionSetsResponse] = await Promise.all([
                // Load questions
                filters.search
                    ? adminAPI.questions.search({
                        q: filters.search,
                        skip: apiParams.skip,
                        limit: apiParams.limit,
                        question_set_id: apiParams.question_set_id,
                        exam_paper_id: apiParams.exam_paper_id,
                        has_answers: filters.has_answers === 'yes' ? true : filters.has_answers === 'no' ? false : undefined,
                        numbering_style: filters.numbering_style,
                    })
                    : adminAPI.questions.list(apiParams),
                // Load question sets
                adminAPI.questionSets.list({ limit: 20 }) // Load all question sets
            ]);

            if (questionsResponse.data?.data) {
                const responseData = questionsResponse.data.data;
                const questionsData = responseData.items || [];

                setQuestions(questionsData);
                setTotalItems(responseData.total || 0);
                setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));

                // Calculate stats from the loaded data
                calculateStats(questionsData, responseData.total || 0);
            }

            if (questionSetsResponse.data?.data) {
                const questionSetsData = questionSetsResponse.data.data;
                setQuestionSets(questionSetsData.items || []);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load questions',
                message: error instanceof Error ? error.message : 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics from questions data
    const calculateStats = (questionsData: QuestionRead[], total: number) => {
        const mainQuestions = questionsData.filter(q => !q.parent_id).length;
        const subQuestions = questionsData.filter(q => q.parent_id).length;
        const questionsWithAnswers = questionsData.filter(q => q.answers && q.answers.length > 0).length;
        const totalMarks = questionsData.reduce((sum, q) => sum + (q.marks || 0), 0);
        const averageMarks = questionsData.length > 0 ? totalMarks / questionsData.length : 0;

        // For recent questions, we'll count questions created in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentQuestions = questionsData.filter(q => new Date(q.created_at) > sevenDaysAgo).length;

        // Orphan questions are those without question_set_id or exam_paper_id
        const orphanQuestions = questionsData.filter(q => !q.question_set_id && !q.exam_paper_id).length;

        setStats({
            totalQuestions: total,
            mainQuestions,
            subQuestions,
            totalMarks,
            averageMarks: Math.round(averageMarks * 10) / 10, // Round to 1 decimal
            recentQuestions,
            questionsWithAnswers,
            orphanQuestions,
        });
    };

    // Transform question data for table display
    const transformQuestionForTable = (question: QuestionRead): QuestionTableData => {
        // Extract text content from the QuestionTextSchema structure
        let displayText = 'No text content';
        if (question.text?.blocks && Array.isArray(question.text.blocks)) {
            // Extract text from blocks (Editor.js format)
            const textBlocks = question.text.blocks
                .filter(block => block.type === 'paragraph' || block.type === 'header')
                .map(block => block.data?.text || '')
                .join(' ');
            displayText = textBlocks || 'No text content';
        }

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
        router.push(`/dashboard/questions/${questionId}`);
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;

        try {
            await adminAPI.questions.delete(questionId);
            addNotification({
                type: 'success',
                title: 'Question Deleted',
                message: 'Question has been deleted successfully.',
            });
            loadQuestions(); // Reload the questions list
        } catch (error) {
            console.error('Error deleting question:', error);
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: error instanceof Error ? error.message : 'Failed to delete the question. Please try again.',
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

    // Load statistics from API if available
    const loadQuestionStats = async () => {
        try {
            const response = await adminAPI.questions.getStats();
            if (response.data?.data) {
                // If API provides stats, use them
                const apiStats = response.data.data as any; // Type assertion for API stats
                setStats({
                    totalQuestions: (apiStats.total_questions as number) || 0,
                    mainQuestions: (apiStats.main_questions as number) || 0,
                    subQuestions: (apiStats.sub_questions as number) || 0,
                    totalMarks: (apiStats.total_marks as number) || 0,
                    averageMarks: (apiStats.average_marks as number) || 0,
                    recentQuestions: (apiStats.recent_questions as number) || 0,
                    questionsWithAnswers: (apiStats.questions_with_answers as number) || 0,
                    orphanQuestions: (apiStats.orphan_questions as number) || 0,
                });
            }
        } catch (error) {
            console.log('Stats API not available, using calculated stats');
            // Stats will be calculated from loaded questions data
        }
    };

    // Load data on mount and when filters change
    useEffect(() => {
        loadQuestions();
        loadQuestionStats();
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
                    <div className="flex items-center space-x-1 mr-4">
                        <Button
                            variant={viewMode === 'hierarchical' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('hierarchical')}
                        >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Hierarchical
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                        >
                            <List className="h-4 w-4 mr-1" />
                            Table
                        </Button>
                    </div>
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

            {/* Questions Display */}
            <LoadingOverlay isLoading={loading}>
                {viewMode === 'hierarchical' ? (
                    <HierarchicalQuestions
                        questionSets={questionSets}
                        questions={questions}
                        onEditQuestion={handleEditQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        onViewQuestion={handleViewQuestion}
                        onAddSubQuestion={handleAddSubQuestion}
                        onEditQuestionSet={(questionSet) => {
                            addNotification({
                                type: 'info',
                                title: 'Edit Question Set',
                                message: `Opening editor for question set ${questionSet.title || questionSet.id}...`,
                            });
                        }}
                        onDeleteQuestionSet={async (questionSetId) => {
                            if (confirm('Are you sure you want to delete this question set? This will also delete all questions in it.')) {
                                try {
                                    await adminAPI.questionSets.delete(questionSetId);
                                    addNotification({
                                        type: 'success',
                                        title: 'Question Set Deleted',
                                        message: 'Question set has been deleted successfully.',
                                    });
                                    loadQuestions();
                                } catch (error) {
                                    addNotification({
                                        type: 'error',
                                        title: 'Delete Failed',
                                        message: 'Failed to delete the question set. Please try again.',
                                    });
                                }
                            }
                        }}
                        onAddQuestion={() => handleCreateQuestion()}
                        showActions={true}
                        defaultExpanded={false}
                        emptyMessage="No question sets found. Create your first question to get started."
                    />
                ) : (
                    <Card>
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
                    </Card>
                )}
            </LoadingOverlay>
        </div>
    );
}