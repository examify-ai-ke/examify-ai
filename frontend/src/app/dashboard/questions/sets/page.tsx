'use client';

import React, { useState, useEffect } from 'react';
import {
    FolderOpen,
    Search,
    Filter,
    Eye,
    BookOpen,
    HelpCircle,
    Calendar,
    Star,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    Clock,
    FileText,
    Users,
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
type QuestionSetRead = components['schemas']['QuestionSetRead'];
type QuestionRead = components['schemas']['QuestionRead'];

// Interface for the display table data
interface QuestionSetTableData extends QuestionSetRead {
    displayName: string;
    statusDisplay: React.ReactNode;
    questionsDisplay: React.ReactNode;
    statsDisplay: React.ReactNode;
    createdAtDisplay: React.ReactNode;
    actions: React.ReactNode;
}

// Statistics interface
interface QuestionSetsStats {
    totalQuestionSets: number;
    totalQuestions: number;
    averageQuestionsPerSet: number;
    setsWithQuestions: number;
    recentSets: number;
    emptySets: number;
}

// Filter interface - simplified to match actual API
interface QuestionSetsFilters {
    search?: string;
}

export default function QuestionSetsPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [questionSets, setQuestionSets] = useState<QuestionSetRead[]>([]);
    const [questions, setQuestions] = useState<QuestionRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('hierarchical');
    const [stats, setStats] = useState<QuestionSetsStats>({
        totalQuestionSets: 0,
        totalQuestions: 0,
        averageQuestionsPerSet: 0,
        setsWithQuestions: 0,
        recentSets: 0,
        emptySets: 0,
    });
    const [filters, setFilters] = useState<QuestionSetsFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const ITEMS_PER_PAGE = 20;

    // Load question sets data
    const loadQuestionSets = async () => {
        try {
            setLoading(true);

            console.log('Loading question sets and questions from API...');

            // Load question sets and questions in parallel
            const [questionSetsResponse, questionsResponse] = await Promise.all([
                adminAPI.questionSets.list({
                    skip: currentPage * ITEMS_PER_PAGE,
                    limit: ITEMS_PER_PAGE,
                }),
                adminAPI.questions.list({ limit: 100 }) // Load questions to show in hierarchy (API max limit is 100)
            ]);

            // console.log('Question sets API response:', questionSetsResponse);
            // console.log('Questions API response:', questionsResponse);

            if (!questionSetsResponse.error && questionSetsResponse.data) {
                const responseData = questionSetsResponse.data.data || questionSetsResponse.data;
                const items = responseData.items || [];

                // console.log('Question sets loaded:', items);
                setQuestionSets(items);
                setTotalItems(responseData.total || items.length);
                setTotalPages(Math.ceil((responseData.total || items.length) / ITEMS_PER_PAGE));

                // Calculate stats from loaded data
                const totalQuestions = items.reduce((sum: number, set: QuestionSetRead) =>
                    sum + (set.questions_count || 0), 0);
                const setsWithQuestions = items.filter((set: QuestionSetRead) =>
                    set.questions_count && set.questions_count > 0).length;
                const emptySets = items.length - setsWithQuestions;

                setStats({
                    totalQuestionSets: items.length,
                    totalQuestions,
                    averageQuestionsPerSet: items.length > 0 ? totalQuestions / items.length : 0,
                    setsWithQuestions,
                    recentSets: items.length, // For now, assume all are recent
                    emptySets,
                });
            } else {
                console.error('Error in question sets response:', questionSetsResponse.error);
                throw new Error(questionSetsResponse.error?.message || 'Failed to load question sets');
            }

            // Load questions data
            if (!questionsResponse.error && questionsResponse.data) {
                const questionsData = questionsResponse.data.data || questionsResponse.data;
                const questionsItems = questionsData.items || [];
                console.log('Questions loaded:', questionsItems);
                setQuestions(questionsItems);
            }
        } catch (error) {
            console.error('Error loading question sets:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load question sets',
                message: error instanceof Error ? error.message : 'Please try again later.',
            });
            // Set empty state on error
            setQuestionSets([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    // Transform question set data for table display
    const transformQuestionSetForTable = (questionSet: QuestionSetRead): QuestionSetTableData => {
        // Use title from the API schema (enum value)
        const displayName = questionSet.title || `Question Set ${questionSet.id.slice(0, 8)}`;

        const statusDisplay = (
            <Badge
                variant={questionSet.questions_count && questionSet.questions_count > 0 ? 'default' : 'secondary'}
                className={questionSet.questions_count && questionSet.questions_count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            >
                {questionSet.questions_count && questionSet.questions_count > 0 ? 'Active' : 'Empty'}
            </Badge>
        );

        const questionsDisplay = (
            <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                    <HelpCircle className="mr-1 h-4 w-4 text-purple-500" />
                    <span className="font-medium">{questionSet.questions_count || 0}</span>
                    <span className="text-gray-500 ml-1">questions</span>
                </div>
                {questionSet.questions && questionSet.questions.length > 0 && (
                    <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-500" />
                        <span className="font-medium">
                            {questionSet.questions.reduce((sum, q) => sum + (q.marks || 0), 0)}
                        </span>
                        <span className="text-gray-500 ml-1">marks</span>
                    </div>
                )}
            </div>
        );

        const statsDisplay = (
            <div className="flex flex-col space-y-1 text-xs text-gray-600">
                {questionSet.questions && questionSet.questions.length > 0 ? (
                    <div>
                        Avg: {(questionSet.questions.reduce((sum, q) => sum + (q.marks || 0), 0) / questionSet.questions.length).toFixed(1)} marks/question
                    </div>
                ) : (
                    <div className="text-orange-600">No questions added</div>
                )}
                {questionSet.slug && (
                    <div className="text-gray-500">ID: {questionSet.slug}</div>
                )}
            </div>
        );

        const createdAtDisplay = (
            <div className="text-xs text-gray-600">
                <div>ID: {questionSet.id.slice(0, 8)}...</div>
                <div className="text-gray-500">
                    {questionSet.slug ? `Slug: ${questionSet.slug}` : 'No slug'}
                </div>
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
                        <Link href={`/dashboard/questions/sets/${questionSet.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Set
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/questions?question_set_id=${questionSet.id}`}>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            View Questions
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Questions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        return {
            ...questionSet,
            displayName,
            statusDisplay,
            questionsDisplay,
            statsDisplay,
            createdAtDisplay,
            actions,
        };
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(0);
    };

    const handleFilterChange = (key: keyof QuestionSetsFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
        setCurrentPage(0);
    };

    // Load data on mount and when filters change
    useEffect(() => {
        loadQuestionSets();
    }, [currentPage, filters]);

    // Define table columns
    const columns = [
        {
            key: 'displayName' as keyof QuestionSetTableData,
            header: 'Question Set',
            cell: (item: QuestionSetTableData) => (
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <FolderOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 mb-1">{item.displayName}</div>
                        <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {item.slug ? `Slug: ${item.slug}` : `ID: ${item.id.slice(0, 8)}...`}
                        </div>
                        <div className="flex items-center space-x-2">
                            {item.statusDisplay}
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
            width: '40%',
        },
        {
            key: 'questionsDisplay' as keyof QuestionSetTableData,
            header: 'Questions & Marks',
            cell: (item: QuestionSetTableData) => (
                <div className="space-y-2">
                    {item.questionsDisplay}
                    {item.statsDisplay}
                </div>
            ),
            sortable: false,
            width: '30%',
        },
        {
            key: 'createdAtDisplay' as keyof QuestionSetTableData,
            header: 'Details',
            cell: (item: QuestionSetTableData) => item.createdAtDisplay,
            sortable: true,
            width: '20%',
        },
        {
            key: 'actions' as keyof QuestionSetTableData,
            header: '',
            cell: (item: QuestionSetTableData) => item.actions,
            sortable: false,
            width: '10%',
        },
    ];

    const transformedQuestionSets = questionSets.map(transformQuestionSetForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="Question Sets" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Question Sets</h1>
                    <p className="text-gray-600">
                        Manage organized collections of questions for exam papers
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
                            <FileText className="h-4 w-4 mr-1" />
                            Table
                        </Button>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/questions/sets/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Question Set
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Question Sets</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQuestionSets.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.setsWithQuestions} with questions, {stats.emptySets} empty
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Avg {stats.averageQuestionsPerSet} per set
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Sets</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentSets}</div>
                        <p className="text-xs text-muted-foreground">Created this week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search question sets by title..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question Sets Display */}
            <LoadingOverlay isLoading={loading}>
                {viewMode === 'hierarchical' ? (
                    <HierarchicalQuestions
                        questionSets={questionSets}
                        questions={questions}
                        onEditQuestion={(question) => {
                            addNotification({
                                type: 'info',
                                title: 'Edit Question',
                                message: `Opening editor for question ${question.question_number}...`,
                            });
                        }}
                        onDeleteQuestion={async (questionId) => {
                            if (confirm('Are you sure you want to delete this question?')) {
                                try {
                                    await adminAPI.questions.delete(questionId);
                                    addNotification({
                                        type: 'success',
                                        title: 'Question Deleted',
                                        message: 'Question has been deleted successfully.',
                                    });
                                    loadQuestionSets();
                                } catch (error) {
                                    addNotification({
                                        type: 'error',
                                        title: 'Delete Failed',
                                        message: 'Failed to delete the question. Please try again.',
                                    });
                                }
                            }
                        }}
                        onViewQuestion={(questionId) => {
                            addNotification({
                                type: 'info',
                                title: 'View Question',
                                message: `Opening details for question ${questionId}...`,
                            });
                        }}
                        onAddSubQuestion={(parentId) => {
                            addNotification({
                                type: 'info',
                                title: 'Add Sub-question',
                                message: `Adding sub-question to question ${parentId}...`,
                            });
                        }}
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
                                    loadQuestionSets();
                                } catch (error) {
                                    addNotification({
                                        type: 'error',
                                        title: 'Delete Failed',
                                        message: 'Failed to delete the question set. Please try again.',
                                    });
                                }
                            }
                        }}
                        onAddQuestion={() => {
                            addNotification({
                                type: 'info',
                                title: 'Add Question',
                                message: 'Question creation feature coming soon...',
                            });
                        }}
                        showActions={true}
                        defaultExpanded={true}
                        emptyMessage="No question sets found. Create your first question set to get started."
                    />
                ) : (
                    <Card>
                        <DataTable
                            data={transformedQuestionSets}
                            columns={columns}
                            title={`${totalItems} Question Sets`}
                            searchable={false}
                            filterable={false}
                            pagination={true}
                            pageSize={ITEMS_PER_PAGE}
                            emptyMessage="No question sets found. Create your first question set to get started."
                            loading={loading}
                        />
                    </Card>
                )}
            </LoadingOverlay>
        </div>
    );
}