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

// Interface for the display table data
interface QuestionSetTableData extends QuestionSetRead {
    displayName: string;
    statusDisplay: React.ReactNode;
    questionsDisplay: React.ReactNode;
    statsDisplay: React.ReactNode;
    examPaperInfo: React.ReactNode;
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

// Filter interface
interface QuestionSetsFilters {
    search?: string;
    has_questions?: 'yes' | 'no';
    exam_paper_id?: string;
    status?: 'active' | 'draft' | 'archived';
}

// Mock data
const mockStats: QuestionSetsStats = {
    totalQuestionSets: 1247,
    totalQuestions: 8934,
    averageQuestionsPerSet: 7.2,
    setsWithQuestions: 1189,
    recentSets: 89,
    emptySets: 58,
};

const mockQuestionSets: QuestionSetRead[] = [
    {
        id: 'qs-1',
        name: 'Computer Science Fundamentals - Part A',
        description: 'Basic programming concepts and algorithms',
        exam_paper_id: 'ep-1',
        exam_paper: {
            id: 'ep-1',
            title: 'Computer Science Final Exam 2024',
            created_at: '2024-12-01T10:00:00Z',
            exam_year: 2024,
            exam_semester: 'Fall',
            institution: {
                id: 'inst-1',
                name: 'University of Nairobi',
                key: 'UON'
            },
            course: {
                id: 'course-1',
                name: 'Computer Science',
                slug: 'computer-science'
            }
        },
        questions: [],
        questions_count: 15,
        total_marks: 75,
        created_at: '2024-12-15T10:30:00Z',
        updated_at: '2024-12-15T10:30:00Z',
    },
    {
        id: 'qs-2',
        name: 'Mathematics - Calculus Section',
        description: 'Differential and integral calculus problems',
        exam_paper_id: 'ep-2',
        exam_paper: {
            id: 'ep-2',
            title: 'Advanced Mathematics Exam',
            created_at: '2024-12-02T14:00:00Z',
            exam_year: 2024,
            exam_semester: 'Fall',
            institution: {
                id: 'inst-2',
                name: 'Strathmore University',
                key: 'SU'
            },
            course: {
                id: 'course-2',
                name: 'Mathematics',
                slug: 'mathematics'
            }
        },
        questions: [],
        questions_count: 8,
        total_marks: 40,
        created_at: '2024-12-16T14:20:00Z',
        updated_at: '2024-12-16T14:20:00Z',
    },
    {
        id: 'qs-3',
        name: 'Biology - Ecology and Environment',
        description: 'Environmental science and ecosystem questions',
        exam_paper_id: 'ep-3',
        exam_paper: {
            id: 'ep-3',
            title: 'Biology Comprehensive Exam',
            created_at: '2024-12-03T09:00:00Z',
            exam_year: 2024,
            exam_semester: 'Spring',
            institution: {
                id: 'inst-1',
                name: 'University of Nairobi',
                key: 'UON'
            },
            course: {
                id: 'course-3',
                name: 'Biology',
                slug: 'biology'
            }
        },
        questions: [],
        questions_count: 12,
        total_marks: 60,
        created_at: '2024-12-17T09:15:00Z',
        updated_at: '2024-12-17T09:15:00Z',
    },
    {
        id: 'qs-4',
        name: 'Physics - Mechanics Problems',
        description: 'Classical mechanics and dynamics',
        exam_paper_id: 'ep-4',
        exam_paper: {
            id: 'ep-4',
            title: 'Physics Midterm Exam',
            created_at: '2024-12-04T11:00:00Z',
            exam_year: 2024,
            exam_semester: 'Fall',
            institution: {
                id: 'inst-3',
                name: 'Moi University',
                key: 'MU'
            },
            course: {
                id: 'course-4',
                name: 'Physics',
                slug: 'physics'
            }
        },
        questions: [],
        questions_count: 0,
        total_marks: 0,
        created_at: '2024-12-18T16:45:00Z',
        updated_at: '2024-12-18T16:45:00Z',
    },
];

export default function QuestionSetsPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [questionSets, setQuestionSets] = useState<QuestionSetRead[]>(mockQuestionSets);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<QuestionSetsStats>(mockStats);
    const [filters, setFilters] = useState<QuestionSetsFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const ITEMS_PER_PAGE = 20;

    // Load question sets data
    const loadQuestionSets = async () => {
        try {
            setLoading(true);

            // Connect to real backend API (when available)
            if ((adminAPI as any).questionSets) {
                const response = await (adminAPI as any).questionSets.list({
                    skip: currentPage * ITEMS_PER_PAGE,
                    limit: ITEMS_PER_PAGE,
                    ...filters,
                });

                if (response.data && response.data.data) {
                    const responseData = response.data.data;
                    setQuestionSets(responseData.items || []);
                    setTotalItems(responseData.total || 0);
                    setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));
                }
            } else {
                // Fallback to mock data
                console.log('Using mock data - question sets API not available');
                const filteredData = mockQuestionSets.filter(set => {
                    if (filters.search && !set.name.toLowerCase().includes(filters.search.toLowerCase())) {
                        return false;
                    }
                    if (filters.has_questions === 'yes' && (!set.questions_count || set.questions_count === 0)) {
                        return false;
                    }
                    if (filters.has_questions === 'no' && set.questions_count && set.questions_count > 0) {
                        return false;
                    }
                    return true;
                });
                setQuestionSets(filteredData);
                setTotalItems(filteredData.length);
            }
        } catch (error) {
            console.error('Error loading question sets:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load question sets',
                message: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Transform question set data for table display
    const transformQuestionSetForTable = (questionSet: QuestionSetRead): QuestionSetTableData => {
        const displayName = questionSet.name;

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
                <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{questionSet.total_marks || 0}</span>
                    <span className="text-gray-500 ml-1">marks</span>
                </div>
            </div>
        );

        const statsDisplay = (
            <div className="flex flex-col space-y-1 text-xs text-gray-600">
                <div>
                    Avg: {questionSet.questions_count && questionSet.questions_count > 0 ?
                        ((questionSet.total_marks || 0) / questionSet.questions_count).toFixed(1) : 0} marks/question
                </div>
                {questionSet.questions_count === 0 && (
                    <div className="text-orange-600">No questions added</div>
                )}
            </div>
        );

        const examPaperInfo = (
            <div className="space-y-1">
                <div className="font-medium text-sm">
                    {questionSet.exam_paper?.title || 'No exam paper'}
                </div>
                <div className="text-xs text-gray-600">
                    {questionSet.exam_paper?.course?.name} • {questionSet.exam_paper?.exam_year}
                </div>
                <div className="text-xs text-gray-500">
                    {questionSet.exam_paper?.institution?.name}
                </div>
            </div>
        );

        const createdAtDisplay = (
            <div className="text-xs text-gray-600">
                <div>{formatDate(questionSet.created_at)}</div>
                <div className="text-gray-500">{formatRelativeTime(questionSet.created_at)}</div>
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
            examPaperInfo,
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
                            {item.description || 'No description available'}
                        </div>
                        <div className="flex items-center space-x-2">
                            {item.statusDisplay}
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
            width: '30%',
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
            width: '20%',
        },
        {
            key: 'examPaperInfo' as keyof QuestionSetTableData,
            header: 'Exam Paper',
            cell: (item: QuestionSetTableData) => item.examPaperInfo,
            sortable: false,
            width: '25%',
        },
        {
            key: 'createdAtDisplay' as keyof QuestionSetTableData,
            header: 'Created',
            cell: (item: QuestionSetTableData) => item.createdAtDisplay,
            sortable: true,
            width: '15%',
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
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Question Set
                </Button>
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

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search question sets by name..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.has_questions || 'all'}
                            onValueChange={(value) => handleFilterChange('has_questions', value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by questions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Question Sets</SelectItem>
                                <SelectItem value="yes">With Questions</SelectItem>
                                <SelectItem value="no">Empty Sets</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) => handleFilterChange('status', value)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <LoadingOverlay isLoading={loading}>
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
                </LoadingOverlay>
            </Card>
        </div>
    );
}