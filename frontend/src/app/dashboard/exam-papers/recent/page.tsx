'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Eye,
    Edit,
    Trash2,
    Download,
    Search,
    Clock,
    Building2,
    BookOpen,
    FileText,
    AlertCircle,
    Calendar,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { adminAPI, type ExamPaperRead } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import { formatDate, formatRelativeTime } from '@/lib/utils';

// Interface for table data
interface ExamPaperTableData extends ExamPaperRead {
    titleDisplay: React.ReactNode;
    institutionDisplay: React.ReactNode;
    courseDisplay: React.ReactNode;
    dateDisplay: React.ReactNode;
    statsDisplay: React.ReactNode;
    actions: React.ReactNode;
}

export default function RecentExamPapersPage() {
    const router = useRouter();
    const { addNotification } = useUIStore();
    const hasInitializedRef = useRef(false);

    // State management
    const [examPapers, setExamPapers] = useState<ExamPaperRead[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Load recent exam papers
    const loadRecentExamPapers = async () => {
        try {
            setLoading(true);
            console.log('Loading recent exam papers...');

            // Use the getOrderedByCreatedAt endpoint with descendent order
            const response = await adminAPI.examPapers.getOrderedByCreatedAt({
                skip: currentPage * pageSize, // API uses skip/limit pagination
                limit: pageSize,
                order: 'descendent', // Most recent first
            });

            console.log('Recent exam papers response:', response);

            if (response.data?.data) {
                const responseData = response.data.data;
                const papersData = responseData.items || [];

                setExamPapers(papersData);
                setTotalItems(responseData.total || 0);
                setTotalPages(Math.ceil((responseData.total || 0) / pageSize));
            }
        } catch (error) {
            console.error('Error loading recent exam papers:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load exam papers',
                message: error instanceof Error ? error.message : 'Please try again later.',
            });
            setExamPapers([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            void loadRecentExamPapers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload when page changes
    useEffect(() => {
        if (!hasInitializedRef.current) return;
        void loadRecentExamPapers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    // Transform exam paper data for table display
    const transformExamPaperForTable = (examPaper: ExamPaperRead): ExamPaperTableData => {
        const titleDisplay = (
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                        {(examPaper.title as any)?.name || 'Untitled Exam'}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                        {(examPaper.description as any)?.name || 'No description'}
                    </div>
                    {examPaper.tags && examPaper.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {examPaper.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {examPaper.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{examPaper.tags.length - 3} more
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );

        const institutionDisplay = (
            <div className="max-w-[150px]">
                <div className="flex items-center space-x-2 mb-1">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium truncate" title={examPaper.institution?.name}>
                        {examPaper.institution?.name || 'N/A'}
                    </span>
                </div>
                {examPaper.institution?.acronym && (
                    <Badge variant="outline" className="text-xs">
                        {examPaper.institution.acronym}
                    </Badge>
                )}
            </div>
        );

        const courseDisplay = (
            <div className="max-w-[150px]">
                <div className="flex items-center space-x-2 mb-1">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium truncate" title={examPaper.course?.name}>
                        {examPaper.course?.name || 'N/A'}
                    </span>
                </div>
                {examPaper.year_of_exam && (
                    <div className="text-xs text-gray-500">Year: {examPaper.year_of_exam}</div>
                )}
            </div>
        );

        const dateDisplay = (
            <div className="text-sm">
                <div className="flex items-center space-x-1 mb-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-900">
                        {examPaper.exam_date ? formatDate(examPaper.exam_date) : 'N/A'}
                    </span>
                </div>
                {examPaper.created_at && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Added {formatRelativeTime(examPaper.created_at)}</span>
                    </div>
                )}
            </div>
        );

        const statsDisplay = (
            <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600">
                        {examPaper.question_sets?.length || 0} sets
                    </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">
                        {examPaper.modules?.length || 0} modules
                    </span>
                </div>
                {examPaper.exam_duration && (
                    <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600">{examPaper.exam_duration} min</span>
                    </div>
                )}
            </div>
        );

        const actions = (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                        </svg>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/exam-papers/${examPaper.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/exam-papers/${examPaper.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
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
            ...examPaper,
            titleDisplay,
            institutionDisplay,
            courseDisplay,
            dateDisplay,
            statsDisplay,
            actions,
        };
    };

    // Filter exam papers by search query
    const filteredExamPapers = examPapers.filter((paper) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const title = (paper.title as any)?.name?.toLowerCase() || '';
        const institution = paper.institution?.name?.toLowerCase() || '';
        const course = paper.course?.name?.toLowerCase() || '';
        return title.includes(query) || institution.includes(query) || course.includes(query);
    });

    // Define table columns
    const columns = [
        {
            key: 'titleDisplay' as keyof ExamPaperTableData,
            header: 'Exam Paper',
            cell: (item: ExamPaperTableData) => item.titleDisplay,
            sortable: false,
            width: '35%',
        },
        {
            key: 'institutionDisplay' as keyof ExamPaperTableData,
            header: 'Institution',
            cell: (item: ExamPaperTableData) => item.institutionDisplay,
            sortable: false,
            width: '15%',
        },
        {
            key: 'courseDisplay' as keyof ExamPaperTableData,
            header: 'Course',
            cell: (item: ExamPaperTableData) => item.courseDisplay,
            sortable: false,
            width: '15%',
        },
        {
            key: 'dateDisplay' as keyof ExamPaperTableData,
            header: 'Date',
            cell: (item: ExamPaperTableData) => item.dateDisplay,
            sortable: false,
            width: '15%',
        },
        {
            key: 'statsDisplay' as keyof ExamPaperTableData,
            header: 'Details',
            cell: (item: ExamPaperTableData) => item.statsDisplay,
            sortable: false,
            width: '15%',
        },
        {
            key: 'actions' as keyof ExamPaperTableData,
            header: '',
            cell: (item: ExamPaperTableData) => item.actions,
            sortable: false,
            width: '5%',
        },
    ];

    const transformedExamPapers = filteredExamPapers.map(transformExamPaperForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="Recent Exam Papers" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        Recent Exam Papers
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Recently added exam papers, sorted by creation date
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={loadRecentExamPapers}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Statistics Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{totalItems}</div>
                                <div className="text-sm text-gray-600">Total Papers</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Clock className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{examPapers.length}</div>
                                <div className="text-sm text-gray-600">On This Page</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{totalPages}</div>
                                <div className="text-sm text-gray-600">Total Pages</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                        <Search className="h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search by title, institution, or course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent className="pt-6">
                    {loading && examPapers.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : transformedExamPapers.length === 0 ? (
                        <EmptyState
                            icon={AlertCircle}
                            title="No exam papers found"
                            description={
                                searchQuery
                                    ? 'Try adjusting your search query'
                                    : 'No recent exam papers available'
                            }
                        />
                    ) : (
                        <DataTable
                            data={transformedExamPapers}
                            columns={columns}
                            searchable={false}
                            filterable={false}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: totalPages,
                                totalItems: totalItems,
                                pageSize: pageSize,
                                onPageChange: (newPage: number) => setCurrentPage(newPage),
                                onPageSizeChange: (newSize: number) => {
                                    setPageSize(newSize);
                                    setCurrentPage(0);
                                },
                            }}
                            loading={loading}
                            emptyMessage="No exam papers found"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
