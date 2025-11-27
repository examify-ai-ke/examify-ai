'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    RefreshCw,
    Unlink,
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
import { api } from '@/lib/api';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type QuestionRead = components['schemas']['QuestionRead'];
type QuestionSetRead = components['schemas']['QuestionSetRead'];

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
    question_type?: 'main' | 'sub' | 'all';
    marks_range?: 'low' | 'medium' | 'high';
    exam_paper_id?: string;
    question_set_id?: string;
    institution_id?: string;
    course_id?: string;
    module_id?: string;
    programme_id?: string;
    numbering_style?: string;
    has_answers?: 'yes' | 'no' | 'all';
    sort_by?: 'relevance' | 'marks' | 'created_at';
    sort_order?: 'asc' | 'desc';
}

// Always uses backend API - no mock data

export default function AllQuestionsPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();
    const router = useRouter();

    // State management
    const [questions, setQuestions] = useState<QuestionRead[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('table');
    const [stats, setStats] = useState<QuestionsOverviewStats>({
        totalQuestions: 0,
        mainQuestions: 0,
        subQuestions: 0,
        questionsWithAnswers: 0,
        totalMarks: 0,
        averageMarks: 0,
        recentQuestions: 0,
        orphanQuestions: 0,
    });
    const [filters, setFilters] = useState<QuestionsFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [apiStatus, setApiStatus] = useState<'connected' | 'error'>('error');
    const hasInitializedRef = useRef(false);

    // Academic hierarchy data for filters
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [programmes, setProgrammes] = useState<any[]>([]);
    const [loadingHierarchy, setLoadingHierarchy] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);

    // Load academic hierarchy data for filters independently
    useEffect(() => {
        const loadHierarchyData = async () => {
            try {
                setLoadingHierarchy(true);
                const [institutionsResponse, coursesResponse, modulesResponse, programmesResponse] = await Promise.all([
                    adminAPI.institutions.list({ limit: 100 }),
                    adminAPI.courses.list({ limit: 100 }),
                    adminAPI.modules.list({ limit: 100 }),
                    adminAPI.programmes.list({ limit: 100 })
                ]);

                setInstitutions(institutionsResponse.data?.data?.items || []);
                setCourses(coursesResponse.data?.data?.items || []);
                setModules(modulesResponse.data?.data?.items || []);
                setProgrammes(programmesResponse.data?.data?.items || []);
            } catch (error) {
                console.error('Error loading hierarchy data:', error);
            } finally {
                setLoadingHierarchy(false);
            }
        };

        loadHierarchyData();
    }, []);

    // Load stats independently
    useEffect(() => {
        const loadStats = async () => {
            try {
                setStatsLoading(true);
                console.log('Loading stats...');
                
                // Get a reasonable sample for stats calculation
                const statsResponse = await adminAPI.questions.list({
                    skip: 0,
                    limit: 100, // Reduced from 1000 for better performance
                    include_children: true,
                });

                console.log('Stats response:', statsResponse);

                if (statsResponse.data?.data) {
                    const responseData = statsResponse.data.data;
                    const questionsData = responseData.items || [];
                    const totalFromAPI = responseData.total || 0;

                    console.log('Questions data for stats:', questionsData.length, 'Total from API:', totalFromAPI);

                    const totalSubQuestions = questionsData.reduce((sum: any, q: any) => sum + (q.children?.length || 0), 0);
                    const questionsWithAnswers = questionsData.filter((q: any) => q.answers && q.answers.length > 0).length;
                    const totalMarks = questionsData.reduce((sum: any, q: any) => {
                        const mainMarks = q.marks || 0;
                        const subMarks = (q.children || []).reduce((subSum: any, sub: any) => subSum + (sub.marks || 0), 0);
                        return sum + mainMarks + subMarks;
                    }, 0);
                    const totalQuestionCount = questionsData.length + totalSubQuestions;
                    const averageMarks = totalQuestionCount > 0 ? totalMarks / totalQuestionCount : 0;

                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    const recentQuestions = questionsData.filter((q: any) => new Date(q.created_at) > sevenDaysAgo).length;

                    const orphanQuestions = questionsData.filter((q: any) => !q.question_set_id && !q.exam_paper_id).length;

                    const calculatedStats = {
                        totalQuestions: totalFromAPI, // Use total from API for accurate count
                        mainQuestions: questionsData.length,
                        subQuestions: totalSubQuestions,
                        questionsWithAnswers,
                        totalMarks,
                        averageMarks: Math.round(averageMarks * 10) / 10,
                        recentQuestions,
                        orphanQuestions,
                    };

                    console.log('Calculated stats:', calculatedStats);
                    setStats(calculatedStats);
                }
            } catch (error) {
                console.error('Error loading stats:', error);
                addNotification({
                    type: 'error',
                    title: 'Failed to load statistics',
                    message: 'Could not load question statistics. Please refresh the page.',
                });
            } finally {
                setStatsLoading(false);
            }
        };

        loadStats();
    }, [addNotification]);

    // Check if any filters are active
    const hasActiveFilters = () => {
        return !!(
            filters.search ||
            filters.question_type ||
            filters.marks_range ||
            filters.exam_paper_id ||
            filters.question_set_id ||
            filters.institution_id ||
            filters.course_id ||
            filters.module_id ||
            filters.programme_id ||
            filters.numbering_style ||
            (filters.has_answers && filters.has_answers !== 'all')
        );
    };

    // Load questions data
    const loadQuestions = async () => {
        try {
            setLoading(true);
            
            const useSearchEndpoint = hasActiveFilters();
            console.log(`Loading questions using ${useSearchEndpoint ? 'search' : 'list'} endpoint...`);

            let questionsResponse;

            if (useSearchEndpoint) {
                // Use search endpoint when filters are active
                const searchParams: any = {
                    question_type: filters.question_type || 'main',
                    include_children: true,
                    skip: currentPage * pageSize,
                    limit: pageSize,
                    highlight: true,
                };

                // Add search query if provided
                if (filters.search && filters.search.trim() !== '') {
                    searchParams.q = filters.search.trim();
                }

                // Add filters
                if (filters.exam_paper_id) searchParams.exam_paper_id = filters.exam_paper_id;
                if (filters.question_set_id) searchParams.question_set_id = filters.question_set_id;
                if (filters.institution_id) searchParams.institution_id = filters.institution_id;
                if (filters.course_id) searchParams.course_id = filters.course_id;
                if (filters.module_id) searchParams.module_id = filters.module_id;
                if (filters.programme_id) searchParams.programme_id = filters.programme_id;
                if (filters.numbering_style) searchParams.numbering_style = filters.numbering_style;
                if (filters.has_answers && filters.has_answers !== 'all') {
                    searchParams.has_answers = filters.has_answers === 'yes';
                }

                // Add marks range filter
                if (filters.marks_range) {
                    const marksMin = getMarksRangeMin(filters.marks_range);
                    const marksMax = getMarksRangeMax(filters.marks_range);
                    if (marksMin !== undefined) searchParams.marks_min = marksMin;
                    if (marksMax !== undefined) searchParams.marks_max = marksMax;
                }

                // Add sorting
                searchParams.sort_by = filters.sort_by || 'relevance';
                searchParams.sort_order = filters.sort_order || 'desc';

                questionsResponse = await adminAPI.questions.search(searchParams);
            } else {
                // Use list endpoint for initial load (no filters)
                questionsResponse = await adminAPI.questions.list({
                    skip: currentPage * pageSize,
                    limit: pageSize,
                    include_children: true,
                });
            }

            console.log('Questions API response:', questionsResponse);

            if (questionsResponse.data?.data) {
                const responseData = questionsResponse.data.data;
                const questionsData = responseData.items || [];

                // Questions already include their children from the API
                setQuestions(questionsData);
                setTotalItems(responseData.total || 0);
                setTotalPages(Math.ceil((responseData.total || 0) / pageSize));

                setApiStatus('connected');
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            setApiStatus('error');
            addNotification({
                type: 'error',
                title: 'Failed to load questions',
                message: error instanceof Error ? error.message : 'Please try again later.',
            });

            // Do not fallback – keep empty state
            setQuestions([]);
            setTotalItems(0);
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
        // The API returns QuestionTextSchema for text with blocks; derive a plain preview
        const firstBlock = question.text?.blocks?.[0];
        // Most editors store paragraph text under data.text
        const blockText = typeof firstBlock?.data?.['text'] === 'string' ? (firstBlock?.data?.['text'] as string) : '';
        const displayText = blockText || 'No text content';
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
                    {question.parent_id && (
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleRemoveSubQuestion(question.parent_id!, question.id)}
                        >
                            <Unlink className="mr-2 h-4 w-4" />
                            Remove from Main Question
                        </DropdownMenuItem>
                    )}
                    {!question.parent_id && question.question_set_id && (
                        <DropdownMenuItem
                            className="text-orange-600"
                            onClick={() => handleUnlinkFromQuestionSet(question.id)}
                        >
                            <Unlink className="mr-2 h-4 w-4" />
                            Unlink from Question Set
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

    // Handle removing sub-question from main question
    const handleRemoveSubQuestion = async (mainQuestionId: string, subQuestionId: string) => {
        try {
            await adminAPI.questions.removeSubQuestion(mainQuestionId, subQuestionId);
            useUIStore.getState().addNotification({
                type: 'success',
                title: 'Success',
                message: 'Sub-question removed successfully'
            });
            // Reload questions to reflect changes
            void loadQuestions();
        } catch (error) {
            console.error('Error removing sub-question:', error);
            useUIStore.getState().addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to remove sub-question'
            });
        }
    };

    // Handle unlinking question from question set
    const handleUnlinkFromQuestionSet = async (mainQuestionId: string) => {
        try {
            await adminAPI.questions.unlinkFromQuestionSet(mainQuestionId);
            useUIStore.getState().addNotification({
                type: 'success',
                title: 'Success',
                message: 'Question unlinked from question set successfully'
            });
            // Reload questions to reflect changes
            void loadQuestions();
        } catch (error) {
            console.error('Error unlinking from question set:', error);
            useUIStore.getState().addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to unlink from question set'
            });
        }
    };

    // Load questions when filters/page change
    useEffect(() => {
        void loadQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filters, pageSize]);

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
            width: '45%',
        },
        {
            key: 'createdAtDisplay' as keyof QuestionTableData,
            header: 'Created',
            cell: (item: QuestionTableData) => item.createdAtDisplay,
            sortable: true,
            width: '15%',
        },
        {
            key: 'institution' as keyof QuestionTableData,
            header: 'Institution',
            cell: (item: QuestionTableData) => (
                <div className="max-w-[120px]">
                    <div className="font-medium text-sm truncate" title={item.institution?.name || 'N/A'}>
                        {item.institution?.name || 'N/A'}
                    </div>
                </div>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'programme' as keyof QuestionTableData,
            header: 'Programme',
            cell: (item: QuestionTableData) => (
                <div className="max-w-[120px]">
                    <div className="font-medium text-sm truncate" title={item.programme?.name || 'N/A'}>
                        {item.programme?.name || 'N/A'}
                    </div>
                </div>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'course' as keyof QuestionTableData,
            header: 'Course',
            cell: (item: QuestionTableData) => (
                <div className="max-w-[120px]">
                    <div className="font-medium text-sm truncate" title={item.course?.name || 'N/A'}>
                        {item.course?.name || 'N/A'}
                    </div>
                </div>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'modules' as keyof QuestionTableData,
            header: 'Modules',
            cell: (item: QuestionTableData) => (
                <div className="max-w-[150px]">
                    {item.modules && item.modules.length > 0 ? (
                        <div className="space-y-1">
                            {item.modules.slice(0, 2).map((module, index) => (
                                <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded truncate" title={module.name || 'Unnamed Module'}>
                                    {module.name || 'Unnamed Module'}
                                </div>
                            ))}
                            {item.modules.length > 2 && (
                                <div className="text-xs text-gray-500">
                                    +{item.modules.length - 2} more
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm">No modules</span>
                    )}
                </div>
            ),
            sortable: false,
            width: '20%',
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
            <AdminBreadcrumb currentPage="All Questions" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Questions Bank</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and organize all questions in the system
                    </p>
                    {/* API Status Indicator */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' :
                            'bg-red-500'
                            }`} />
                        <span className={`text-sm ${apiStatus === 'connected' ? 'text-green-700' :
                            'text-red-700'
                            }`}>
                            {apiStatus === 'connected' ? 'Connected to Backend' :
                                'API Connection Error'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-1 mr-2">
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
                    <Button
                        variant="outline"
                        onClick={loadQuestions}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/dashboard/questions/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Question
                        </Button>
                    </Link>
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
                        {statsLoading ? (
                            <LoadingSpinner className="h-8 w-8" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.mainQuestions.toLocaleString()} main, {stats.subQuestions.toLocaleString()} sub
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">With Answers</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <LoadingSpinner className="h-8 w-8" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.questionsWithAnswers.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.totalQuestions > 0 ? ((stats.questionsWithAnswers / stats.totalQuestions) * 100).toFixed(1) : 0}% coverage
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Marks</CardTitle>
                        <Star className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <LoadingSpinner className="h-8 w-8" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalMarks.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    Avg {stats.averageMarks} per question
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <LoadingSpinner className="h-8 w-8" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.recentQuestions}</div>
                                <p className="text-xs text-muted-foreground">Added this week</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search questions by content, number, or slug..."
                                className="pl-10"
                                value={filters.search || ''}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {/* Academic Hierarchy Filters */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-700">Academic Hierarchy Filters</h3>
                            <div className="flex items-center space-x-3">
                                {/* Institution Filter */}
                                <Select
                                    value={filters.institution_id || 'all'}
                                    onValueChange={(value) => handleFilterChange('institution_id', value)}
                                    disabled={loadingHierarchy}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Institution" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Institutions</SelectItem>
                                        {institutions.map((institution) => (
                                            <SelectItem key={institution.id} value={institution.id}>
                                                {institution.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Programme Filter */}
                                <Select
                                    value={filters.programme_id || 'all'}
                                    onValueChange={(value) => handleFilterChange('programme_id', value)}
                                    disabled={loadingHierarchy}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Programme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Programmes</SelectItem>
                                        {programmes.map((programme) => (
                                            <SelectItem key={programme.id} value={programme.id}>
                                                {programme.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Course Filter */}
                                <Select
                                    value={filters.course_id || 'all'}
                                    onValueChange={(value) => handleFilterChange('course_id', value)}
                                    disabled={loadingHierarchy}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Courses</SelectItem>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Module Filter */}
                                <Select
                                    value={filters.module_id || 'all'}
                                    onValueChange={(value) => handleFilterChange('module_id', value)}
                                    disabled={loadingHierarchy}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Modules</SelectItem>
                                        {modules.map((module) => (
                                            <SelectItem key={module.id} value={module.id}>
                                                {module.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Clear Filters Button */}
                                {(filters.search ||
                                    filters.institution_id !== 'all' ||
                                    filters.course_id !== 'all' ||
                                    filters.module_id !== 'all' ||
                                    filters.programme_id !== 'all') && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFilters({});
                                                setCurrentPage(0);
                                            }}
                                        >
                                            Clear All Filters
                                        </Button>
                                    )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions Display */}
            <LoadingOverlay isLoading={loading}>
                {viewMode === 'hierarchical' ? (
                    <div className="space-y-4">
                        {questions.length > 0 ? (
                            questions.map((mainQuestion) => (
                                <Card key={mainQuestion.id} className="border border-gray-200">
                                    <CardContent className="p-6">
                                        {/* Main Question */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <HelpCircle className="h-6 w-6 text-blue-600" />
                                                    <Badge variant="default" className="text-sm">
                                                        <Hash className="mr-1 h-4 w-4" />
                                                        {mainQuestion.question_number}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-sm">
                                                        Main Question
                                                    </Badge>
                                                    <div className="flex items-center text-sm font-medium text-amber-600">
                                                        <Star className="mr-1 h-4 w-4" />
                                                        {mainQuestion.marks || 0} marks
                                                    </div>
                                                    {mainQuestion.children && mainQuestion.children.length > 0 && (
                                                        <Badge variant="secondary" className="text-sm">
                                                            {mainQuestion.children.length} sub-question{mainQuestion.children.length !== 1 ? 's' : ''}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <p className="text-gray-800 font-medium">
                                                        {(() => {
                                                            if (mainQuestion.text?.blocks && Array.isArray(mainQuestion.text.blocks)) {
                                                                const textBlocks = mainQuestion.text.blocks
                                                                    .filter(block => block.type === 'paragraph' || block.type === 'header')
                                                                    .map(block => block.data?.text || '')
                                                                    .join(' ');
                                                                const text = textBlocks || 'No text content';
                                                                return text.length > 200 ? `${text.substring(0, 200)}...` : text;
                                                            }
                                                            return 'No text content';
                                                        })()}
                                                    </p>
                                                </div>

                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>Created: {formatDate(mainQuestion.created_at)}</span>
                                                    <div className="flex items-center">
                                                        {mainQuestion.answers && mainQuestion.answers.length > 0 ? (
                                                            <>
                                                                <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                                                Has Answers
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertTriangle className="mr-1 h-4 w-4 text-orange-500" />
                                                                No Answers
                                                            </>
                                                        )}
                                                    </div>
                                                    {mainQuestion.question_set_id && (
                                                        <span>Set: {mainQuestion.question_set_id.slice(0, 8)}</span>
                                                    )}
                                                    {mainQuestion.exam_paper_id && (
                                                        <span>Paper: {mainQuestion.exam_paper_id.slice(0, 8)}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/questions/${mainQuestion.id}`)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => addNotification({
                                                        type: 'info',
                                                        title: 'Edit Question',
                                                        message: `Opening editor for question ${mainQuestion.question_number}...`,
                                                    })}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => addNotification({
                                                        type: 'info',
                                                        title: 'Add Sub-question',
                                                        message: `Adding sub-question to question ${mainQuestion.question_number}...`,
                                                    })}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Sub-question
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={async () => {
                                                            if (confirm('Are you sure you want to delete this question?')) {
                                                                try {
                                                                    await adminAPI.questions.delete(mainQuestion.id);
                                                                    addNotification({
                                                                        type: 'success',
                                                                        title: 'Question Deleted',
                                                                        message: 'Question has been deleted successfully.',
                                                                    });
                                                                    loadQuestions();
                                                                } catch (error) {
                                                                    addNotification({
                                                                        type: 'error',
                                                                        title: 'Delete Failed',
                                                                        message: 'Failed to delete the question. Please try again.',
                                                                    });
                                                                }
                                                            }
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Sub-questions */}
                                        {mainQuestion.children && mainQuestion.children.length > 0 && (
                                            <div className="ml-8 border-l-2 border-blue-200 pl-6 space-y-3">
                                                {mainQuestion.children.map((subQuestion) => (
                                                    <div key={subQuestion.id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    <Hash className="mr-1 h-3 w-3" />
                                                                    {subQuestion.question_number}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    Sub-question
                                                                </Badge>
                                                                <div className="flex items-center text-xs text-amber-600">
                                                                    <Star className="mr-1 h-3 w-3" />
                                                                    {subQuestion.marks || 0} marks
                                                                </div>
                                                            </div>

                                                            <p className="text-sm text-gray-700 mb-2">
                                                                {(() => {
                                                                    if (subQuestion.text?.blocks && Array.isArray(subQuestion.text.blocks)) {
                                                                        const textBlocks = subQuestion.text.blocks
                                                                            .filter(block => block.type === 'paragraph' || block.type === 'header')
                                                                            .map(block => block.data?.text || '')
                                                                            .join(' ');
                                                                        const text = textBlocks || 'No text content';
                                                                        return text.length > 150 ? `${text.substring(0, 150)}...` : text;
                                                                    }
                                                                    return 'No text content';
                                                                })()}
                                                            </p>

                                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                <span>Created: {formatDate(subQuestion.created_at)}</span>
                                                                <div className="flex items-center">
                                                                    {subQuestion.answers && subQuestion.answers.length > 0 ? (
                                                                        <>
                                                                            <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                                                            Has Answers
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

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                    <MoreHorizontal className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/questions/${subQuestion.id}`)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => addNotification({
                                                                    type: 'info',
                                                                    title: 'Edit Sub-question',
                                                                    message: `Opening editor for sub-question ${subQuestion.question_number}...`,
                                                                })}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={async () => {
                                                                        if (confirm('Are you sure you want to delete this sub-question?')) {
                                                                            try {
                                                                                await adminAPI.questions.delete(subQuestion.id);
                                                                                addNotification({
                                                                                    type: 'success',
                                                                                    title: 'Sub-question Deleted',
                                                                                    message: 'Sub-question has been deleted successfully.',
                                                                                });
                                                                                loadQuestions();
                                                                            } catch (error) {
                                                                                addNotification({
                                                                                    type: 'error',
                                                                                    title: 'Delete Failed',
                                                                                    message: 'Failed to delete the sub-question. Please try again.',
                                                                                });
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <HelpCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Questions Found</h3>
                                <p className="text-gray-500 mb-4">No questions match your current search criteria or create your first question.</p>
                                <Link href="/dashboard/questions/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Question
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Pagination for Hierarchical View */}
                        {questions.length > 0 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-500">
                                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} questions
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(0)}
                                        disabled={currentPage === 0}
                                    >
                                        First
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-500">
                                        Page {currentPage + 1} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage >= totalPages - 1}
                                    >
                                        Next
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(totalPages - 1)}
                                        disabled={currentPage >= totalPages - 1}
                                    >
                                        Last
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        {/* Quick Filters Above Table */}
                        <div className="p-6 pb-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <h3 className="text-lg font-semibold">{totalItems} Questions</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">Quick filters:</span>
                                        <Select
                                            value={filters.question_type || 'main'}
                                            onValueChange={(value) => handleFilterChange('question_type', value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="main">Main</SelectItem>
                                                <SelectItem value="sub">Sub</SelectItem>
                                                <SelectItem value="all">All</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={filters.has_answers || 'all'}
                                            onValueChange={(value) => handleFilterChange('has_answers', value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Answers" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="yes">With</SelectItem>
                                                <SelectItem value="no">Without</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={filters.sort_by || 'relevance'}
                                            onValueChange={(value) => handleFilterChange('sort_by', value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Sort" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="relevance">Relevance</SelectItem>
                                                <SelectItem value="marks">Marks</SelectItem>
                                                <SelectItem value="created_at">Date</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DataTable
                            data={transformedQuestions}
                            columns={columns}
                            searchable={false}
                            filterable={false}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: totalPages,
                                totalItems: totalItems,
                                pageSize: pageSize,
                                onPageChange: setCurrentPage,
                                onPageSizeChange: (newPageSize: number) => {
                                    setPageSize(newPageSize);
                                    setCurrentPage(0); // Reset to first page when changing page size
                                }
                            }}
                            emptyMessage="No questions found. Try adjusting your search criteria."
                            loading={loading}
                        />
                    </Card>
                )}
            </LoadingOverlay>
        </div>
    );
}