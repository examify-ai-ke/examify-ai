'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    Download,
    Trash2,
    Edit,
    Eye,
    FileText,
    Calendar,
    Clock,
    Building,
    BookOpen,
    Users,
    Star,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    AlertCircle,
    Archive,
    Share2,
    Copy,
    ExternalLink,
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
import { adminAPI, type ExamPaperRead } from '@/lib/api-admin';
import { formatDate, formatRelativeTime } from '@/lib/utils';

// Interface for the display table data extending the API schema
interface PaperTableData extends ExamPaperRead {
    displayTitle: string;
    institutionBadge: React.ReactNode;
    courseBadge: React.ReactNode;
    statusBadge: React.ReactNode;
    dateFormatted: string;
    durationFormatted: string;
    questionCount: string;
    actions: React.ReactNode;
}

// Statistics interface
interface PapersStats {
    totalPapers: number;
    publishedPapers: number;
    draftPapers: number;
    archivedPapers: number;
    totalQuestions: number;
    recentPapers: number;
}

// Filter interface matching API search parameters
interface PapersFilters {
    search?: string;
    year?: string;
    institution_id?: string;
    course_id?: string;
    sort_by?: 'title' | 'date' | 'duration' | 'relevance';
    sort_order?: 'asc' | 'desc';
}

// Mock data - will be replaced with real data from API
const mockStats: PapersStats = {
    totalPapers: 1247,
    publishedPapers: 1089,
    draftPapers: 158,
    archivedPapers: 45,
    totalQuestions: 8943,
    recentPapers: 23,
};

export default function ExamPapersManagePage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [papers, setPapers] = useState<ExamPaperRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [stats, setStats] = useState<PapersStats>(mockStats);
    const [filters, setFilters] = useState<PapersFilters>({
        sort_by: 'date',
        sort_order: 'desc',
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const ITEMS_PER_PAGE = 20;

    // Role-based access control
    const currentUser = user || {
        role: { name: 'Admin' }, // Development bypass
        email: 'admin@dev.local',
        name: 'Admin User'
    };

    const isAdmin = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'admin' || currentUser?.role === 'Admin')
        : (currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'Admin');

    const isManager = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'manager' || currentUser?.role === 'Manager')
        : (currentUser?.role?.name === 'manager' || currentUser?.role?.name === 'Manager');

    // Check if user has permission to manage papers
    if (!isAdmin && !isManager) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
                    <p className="mt-2 text-gray-600">
                        You need manager or administrator privileges to access the exam papers management.
                    </p>
                </div>
            </div>
        );
    }

    // Load exam papers data
    const loadPapers = async () => {
        try {
            setLoading(true);

            let response;

            // Connect to real backend API (when available)
            if ((adminAPI as any).examPapers && filters.search && filters.search.trim() !== '') {
                response = await (adminAPI as any).examPapers.search({
                    q: filters.search,
                    year: filters.year,
                    institution_id: filters.institution_id,
                    course_id: filters.course_id,
                    sort_by: filters.sort_by,
                    sort_order: filters.sort_order,
                    skip: currentPage * ITEMS_PER_PAGE,
                    limit: ITEMS_PER_PAGE,
                });
            } else if ((adminAPI as any).examPapers) {
                response = await (adminAPI as any).examPapers.list({
                    skip: currentPage * ITEMS_PER_PAGE,
                    limit: ITEMS_PER_PAGE,
                });
            } else {
                // Fallback to mock data when API is not available
                console.log('Using mock data - exam papers API not available');
                response = {
                    data: {
                        data: {
                            items: [],
                            total: 0
                        }
                    }
                };
            }

            if (response.data && response.data.data) {
                const responseData = response.data.data;
                setPapers(responseData.items || []);
                setTotalItems(responseData.total || 0);
                setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error loading exam papers:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load exam papers',
                message: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Transform paper data for table display
    const transformPaperForTable = (paper: ExamPaperRead): PaperTableData => {
        const displayTitle = paper.title?.name || paper.identifying_name || 'Untitled Paper';
        const institutionName = paper.institution?.name || 'Unknown Institution';
        const courseName = paper.course?.name || 'No Course';
        const questionCount = paper.question_sets?.reduce((total, set) => total + (set.questions?.length || 0), 0) || 0;

        return {
            ...paper,
            displayTitle,
            institutionBadge: (
                <Badge variant="secondary" className="text-xs">
                    <Building className="mr-1 h-3 w-3" />
                    {institutionName}
                </Badge>
            ),
            courseBadge: paper.course ? (
                <Badge variant="outline" className="text-xs">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {courseName}
                </Badge>
            ) : null,
            statusBadge: (
                <Badge variant="default" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Published
                </Badge>
            ),
            dateFormatted: paper.exam_date ? formatDate(paper.exam_date) : 'No Date',
            durationFormatted: `${paper.exam_duration} min`,
            questionCount: `${questionCount} questions`,
            actions: (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewPaper(paper.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPaper(paper.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePaper(paper.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSharePaper(paper.id)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleArchivePaper(paper.id)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDeletePaper(paper.id)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        };
    };

    // Define table columns
    const columns = [
        {
            key: 'displayTitle' as keyof PaperTableData,
            header: 'Title',
            cell: (item: PaperTableData) => (
                <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div>
                        <div className="font-medium">{item.displayTitle}</div>
                        {item.description?.name && (
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                {item.description.name}
                            </div>
                        )}
                    </div>
                </div>
            ),
            sortable: true,
            width: '25%',
        },
        {
            key: 'institutionBadge' as keyof PaperTableData,
            header: 'Institution',
            cell: (item: PaperTableData) => item.institutionBadge,
            sortable: false,
            width: '20%',
        },
        {
            key: 'courseBadge' as keyof PaperTableData,
            header: 'Course',
            cell: (item: PaperTableData) => item.courseBadge || (
                <span className="text-gray-400 text-sm">No Course</span>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'year_of_exam' as keyof PaperTableData,
            header: 'Year',
            cell: (item: PaperTableData) => (
                <Badge variant="outline" className="text-xs">
                    <Calendar className="mr-1 h-3 w-3" />
                    {item.year_of_exam || 'Unknown'}
                </Badge>
            ),
            sortable: true,
            width: '10%',
        },
        {
            key: 'durationFormatted' as keyof PaperTableData,
            header: 'Duration',
            cell: (item: PaperTableData) => (
                <div className="flex items-center text-sm">
                    <Clock className="mr-1 h-3 w-3 text-gray-400" />
                    {item.durationFormatted}
                </div>
            ),
            sortable: true,
            width: '10%',
        },
        {
            key: 'questionCount' as keyof PaperTableData,
            header: 'Questions',
            cell: (item: PaperTableData) => (
                <div className="text-sm text-gray-600">
                    {item.questionCount}
                </div>
            ),
            sortable: false,
            width: '10%',
        },
        {
            key: 'statusBadge' as keyof PaperTableData,
            header: 'Status',
            cell: (item: PaperTableData) => item.statusBadge,
            sortable: false,
            width: '10%',
        },
        {
            key: 'actions' as keyof PaperTableData,
            header: '',
            cell: (item: PaperTableData) => item.actions,
            sortable: false,
            width: '5%',
        },
    ];

    // Action handlers
    const handleCreatePaper = () => {
        // Navigate to paper creation page
        addNotification({
            type: 'info',
            title: 'Navigation',
            message: 'Redirecting to paper creation...',
        });
    };

    const handleViewPaper = (paperId: string) => {
        addNotification({
            type: 'info',
            title: 'View Paper',
            message: `Opening paper ${paperId}...`,
        });
    };

    const handleEditPaper = (paperId: string) => {
        addNotification({
            type: 'info',
            title: 'Edit Paper',
            message: `Opening editor for paper ${paperId}...`,
        });
    };

    const handleDeletePaper = async (paperId: string) => {
        if (!confirm('Are you sure you want to delete this exam paper?')) return;

        try {
            // Connect to real backend API (when available)
            if ((adminAPI as any).examPapers) {
                await (adminAPI as any).examPapers.delete(paperId);
                addNotification({
                    type: 'success',
                    title: 'Paper Deleted',
                    message: 'Exam paper has been deleted successfully.',
                });
            } else {
                // Fallback when API is not available
                console.log('Mock delete - exam papers API not available:', paperId);
                addNotification({
                    type: 'success',
                    title: 'Paper Deleted (Mock)',
                    message: 'Exam paper deletion simulated successfully.',
                });
            }
            loadPapers(); // Reload the list
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to delete the exam paper. Please try again.',
            });
        }
    };

    const handleDuplicatePaper = (paperId: string) => {
        addNotification({
            type: 'info',
            title: 'Duplicate Paper',
            message: `Creating copy of paper ${paperId}...`,
        });
    };

    const handleSharePaper = (paperId: string) => {
        addNotification({
            type: 'info',
            title: 'Share Paper',
            message: `Sharing paper ${paperId}...`,
        });
    };

    const handleArchivePaper = (paperId: string) => {
        addNotification({
            type: 'info',
            title: 'Archive Paper',
            message: `Archiving paper ${paperId}...`,
        });
    };

    const handleBulkDelete = (selectedItems: PaperTableData[]) => {
        if (!confirm(`Are you sure you want to delete ${selectedItems.length} papers?`)) return;

        addNotification({
            type: 'warning',
            title: 'Bulk Delete',
            message: `Deleting ${selectedItems.length} papers...`,
        });
    };

    const handleBulkExport = (selectedItems: PaperTableData[]) => {
        addNotification({
            type: 'info',
            title: 'Export Papers',
            message: `Exporting ${selectedItems.length} papers...`,
        });
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(0);
    };

    const handleFilterChange = (key: keyof PapersFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(0);
    };

    // Load data on mount and when filters change
    useEffect(() => {
        loadPapers();
    }, [currentPage, filters]);

    const transformedPapers = papers.map(transformPaperForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="Exam Papers Management" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exam Papers</h1>
                    <p className="text-gray-600">
                        Manage exam papers, questions, and institutional content
                    </p>
                </div>
                <Button onClick={handleCreatePaper} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Paper</span>
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPapers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">All exam papers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.publishedPapers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Live papers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Draft</CardTitle>
                        <Edit className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.draftPapers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Archived</CardTitle>
                        <Archive className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.archivedPapers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Old papers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Questions</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total questions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent</CardTitle>
                        <Star className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentPapers}</div>
                        <p className="text-xs text-muted-foreground">This week</p>
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
                                    placeholder="Search exam papers..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.year || 'all'}
                            onValueChange={(value) => handleFilterChange('year', value === 'all' ? undefined : value)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                <SelectItem value="2024/2025">2024/2025</SelectItem>
                                <SelectItem value="2023/2024">2023/2024</SelectItem>
                                <SelectItem value="2022/2023">2022/2023</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.sort_by || 'date'}
                            onValueChange={(value) => handleFilterChange('sort_by', value)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="duration">Duration</SelectItem>
                                <SelectItem value="relevance">Relevance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <LoadingOverlay isLoading={loading}>
                    <DataTable
                        data={transformedPapers}
                        columns={columns}
                        title={`${totalItems} Exam Papers`}
                        searchable={false} // We handle search separately
                        filterable={false} // We handle filters separately
                        pagination={true}
                        pageSize={ITEMS_PER_PAGE}
                        actions={[
                            {
                                label: 'Export Selected',
                                onClick: handleBulkExport,
                                icon: Download,
                                variant: 'outline',
                            },
                            {
                                label: 'Delete Selected',
                                onClick: handleBulkDelete,
                                icon: Trash2,
                                variant: 'destructive',
                            },
                        ]}
                        emptyMessage="No exam papers found. Create your first exam paper to get started."
                        loading={loading}
                    />
                </LoadingOverlay>
            </Card>
        </div>
    );
}