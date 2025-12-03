'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    BookOpen,
    Users,
    Calendar,
    Building2,
    FileText,
    TrendingUp,
    GraduationCap
} from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import { CourseRead } from '@/types/generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

// Mock data for development/offline use
const mockCourses: CourseRead[] = [
    {
        id: '1',
        name: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science and programming',
        course_acronym: 'CS101',
        programme: {
            id: '1',
            name: 'Bachelor of Computer Science',
            description: 'Comprehensive computer science program',
            department: {
                id: '1',
                name: 'Computer Science Department',
                faculty: {
                    id: '1',
                    name: 'Faculty of Engineering',
                    institution: {
                        id: '1',
                        name: 'University of Technology',
                        slug: 'university-of-technology'
                    }
                }
            }
        },
        modules: [],
        exam_papers: [],
        image: null
    },
    {
        id: '2',
        name: 'Advanced Mathematics',
        description: 'Advanced mathematical concepts and applications',
        course_acronym: 'MATH201',
        programme: {
            id: '2',
            name: 'Bachelor of Mathematics',
            description: 'Mathematics degree program',
            department: {
                id: '2',
                name: 'Mathematics Department',
                faculty: {
                    id: '2',
                    name: 'Faculty of Science',
                    institution: {
                        id: '1',
                        name: 'University of Technology',
                        slug: 'university-of-technology'
                    }
                }
            }
        },
        modules: [],
        exam_papers: [],
        image: null
    },
    {
        id: '3',
        name: 'Business Management',
        description: 'Principles of business management and leadership',
        course_acronym: 'BUS101',
        programme: {
            id: '3',
            name: 'Bachelor of Business Administration',
            description: 'Business administration program',
            department: {
                id: '3',
                name: 'Business Department',
                faculty: {
                    id: '3',
                    name: 'Faculty of Business',
                    institution: {
                        id: '1',
                        name: 'University of Technology',
                        slug: 'university-of-technology'
                    }
                }
            }
        },
        modules: [],
        exam_papers: [],
        image: null
    }
];

const ITEMS_PER_PAGE = 10;

interface CourseTableData {
    id: string;
    name: string;
    acronym: string;
    description: string;
    programme: string;
    faculty: string;
    institution: string;
    modulesCount: number;
    examPapersCount: number;
    actions: string;
}

interface CoursesPageProps { }

const CoursesPage: React.FC<CoursesPageProps> = () => {
    const router = useRouter();
    const { addNotification } = useUIStore();

    // State management
    const [courses, setCourses] = useState<CourseRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProgramme, setSelectedProgramme] = useState<string>('');
    const [selectedFaculty, setSelectedFaculty] = useState<string>('');
    const [selectedInstitution, setSelectedInstitution] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [programmes, setProgrammes] = useState<Array<{ id: string; name: string }>>([]);
    const [faculties, setFaculties] = useState<Array<{ id: string; name: string }>>([]);
    const [institutions, setInstitutions] = useState<Array<{ id: string; name: string }>>([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalProgrammes: 0,
        totalModules: 0,
        totalExamPapers: 0,
        averageModules: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Load courses from API
    const loadCourses = async () => {
        try {
            setLoading(true);
            
            // Use list endpoint for initial load without filters, search endpoint for filtering
            let response;
            if (searchTerm || selectedProgramme || selectedFaculty || selectedInstitution) {
                // Use search endpoint when filters are applied
                response = await adminAPI.courses.search({
                    q: searchTerm || undefined,
                    programme_id: selectedProgramme || undefined,
                    institution_id: selectedInstitution || undefined,
                    sort_by: 'name',
                    sort_order: 'asc',
                    skip: currentPage * pageSize,
                    limit: pageSize,
                });
            } else {
                // Use list endpoint for initial load
                response = await adminAPI.courses.list({
                    skip: currentPage * pageSize,
                    limit: pageSize,
                });
            }

            if (response.data && response.data.data) {
                const responseData = response.data.data;
                if (responseData && typeof responseData === 'object' && 'items' in responseData) {
                    setCourses(responseData.items || []);
                    setTotalItems(responseData.total || 0);
                    setTotalPages(Math.ceil((responseData.total || 0) / pageSize));
                } else if (Array.isArray(responseData)) {
                    setCourses(responseData);
                    setTotalItems(responseData.length);
                    setTotalPages(Math.ceil(responseData.length / pageSize));
                } else {
                    console.log('Invalid API response structure, using mock data');
                    setCourses(mockCourses);
                    setTotalItems(mockCourses.length);
                    setTotalPages(Math.ceil(mockCourses.length / ITEMS_PER_PAGE));
                }
            } else {
                console.log('No API response, using mock data');
                setCourses(mockCourses);
                setTotalItems(mockCourses.length);
                setTotalPages(Math.ceil(mockCourses.length / ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load courses',
                message: 'Please try again later.',
            });
            // Fallback to mock data
            setCourses(mockCourses);
            setTotalItems(mockCourses.length);
            setTotalPages(Math.ceil(mockCourses.length / ITEMS_PER_PAGE));
        } finally {
            setLoading(false);
        }
    };

    // Load programmes for filter
    const loadProgrammes = async () => {
        try {
            const response = await adminAPI.programmes.list({ limit: 100 });
            if (response.data?.data) {
                const programmesData = Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data.data.items || [];
                setProgrammes(programmesData.map((prog: any) => ({ id: prog.id, name: prog.name })));
            }
        } catch (error) {
            console.error('Error loading programmes:', error);
        }
    };

    // Load faculties for filter
    const loadFaculties = async () => {
        try {
            const response = await adminAPI.faculties.list({ limit: 100 });
            if (response.data?.data) {
                const facultiesData = Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data.data.items || [];
                setFaculties(facultiesData.map((fac: any) => ({ id: fac.id, name: fac.name })));
            }
        } catch (error) {
            console.error('Error loading faculties:', error);
        }
    };

    // Load institutions for filter
    const loadInstitutions = async () => {
        try {
            const response = await adminAPI.institutions.list({ limit: 100 });
            if (response.data?.data) {
                const institutionsData = Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data.data.items || [];
                setInstitutions(institutionsData.map((inst: any) => ({ id: inst.id, name: inst.name })));
            }
        } catch (error) {
            console.error('Error loading institutions:', error);
        }
    };

    // Load statistics
    const loadStats = async () => {
        try {
            setStatsLoading(true);
            console.log('Loading statistics from Stats API...');

            // Use the Stats API endpoint
            const response = await adminAPI.stats.getDetailed();

            if (response.data) {
                console.log('Setting stats from Stats API:', response.data);
                setStats({
                    totalCourses: response.data.totalCourses || response.data.courses_count || 0,
                    totalProgrammes: response.data.totalProgrammes || response.data.programmes_count || 0,
                    totalModules: response.data.totalModules || response.data.modules_count || 0,
                    totalExamPapers: response.data.totalExamPapers || response.data.exam_papers_count || 0,
                    averageModules: response.data.averageModules || 0,
                });
            } else {
                console.warn('No statistics data received');
            }
        } catch (error) {
            console.error('Error loading statistics from Stats API:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Load filter options independently on mount
    useEffect(() => {
        loadProgrammes();
    }, []);

    useEffect(() => {
        loadFaculties();
    }, []);

    useEffect(() => {
        loadInstitutions();
    }, []);

    // Load stats independently on mount
    useEffect(() => {
        loadStats();
    }, []);

    // Load courses when filters/pagination change
    useEffect(() => {
        loadCourses();
    }, [currentPage, searchTerm, selectedProgramme, selectedFaculty, selectedInstitution, pageSize]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Handle programme filter
    const handleProgrammeFilter = (value: string) => {
        setSelectedProgramme(value === 'all' ? '' : value);
        setCurrentPage(0);
    };

    // Handle faculty filter
    const handleFacultyFilter = (value: string) => {
        setSelectedFaculty(value === 'all' ? '' : value);
        setCurrentPage(0);
    };

    // Handle institution filter
    const handleInstitutionFilter = (value: string) => {
        setSelectedInstitution(value === 'all' ? '' : value);
        setCurrentPage(0);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle page size change
    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page
    };

    // Transform course data for table display
    const transformCourseForTable = (course: CourseRead): CourseTableData => ({
        id: course.id,
        name: course.name,
        acronym: course.course_acronym || 'N/A',
        description: course.description || 'No description available',
        programme: course.programme?.name || 'N/A',
        faculty: course.faculty?.name || course.programme?.department?.faculty?.name || 'N/A',
        institution: course.programme?.department?.faculty?.institution?.name || 'N/A',
        modulesCount: course.modules?.length || 0,
        examPapersCount: course.exam_papers?.length || 0,
        actions: course.id
    });

    // Handle course actions
    const handleViewCourse = (courseId: string) => {
        router.push(`/dashboard/institutions/courses/${courseId}`);
    };

    const handleEditCourse = (courseId: string) => {
        router.push(`/dashboard/institutions/courses/${courseId}/edit`);
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (confirm('Are you sure you want to delete this course?')) {
            try {
                await adminAPI.courses.delete(courseId);
                addNotification({
                    type: 'success',
                    title: 'Course deleted',
                    message: 'The course has been deleted successfully.',
                });
                loadCourses(); // Reload the list
            } catch (error) {
                console.error('Error deleting course:', error);
                addNotification({
                    type: 'error',
                    title: 'Failed to delete course',
                    message: 'Please try again later.',
                });
            }
        }
    };

    // Define table columns
    const columns = [
        {
            key: 'name' as keyof CourseTableData,
            header: 'Course Name',
            cell: (item: CourseTableData) => (
                <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.acronym}</span>
                </div>
            ),
            sortable: true,
            width: '25%',
        },
        {
            key: 'programme' as keyof CourseTableData,
            header: 'Programme',
            cell: (item: CourseTableData) => (
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{item.programme}</span>
                </div>
            ),
            sortable: true,
            width: '20%',
        },
        {
            key: 'faculty' as keyof CourseTableData,
            header: 'Faculty',
            cell: (item: CourseTableData) => (
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{item.faculty}</span>
                </div>
            ),
            sortable: true,
            width: '20%',
        },
        {
            key: 'modulesCount' as keyof CourseTableData,
            header: 'Modules',
            cell: (item: CourseTableData) => (
                <Badge variant="secondary">
                    {item.modulesCount} modules
                </Badge>
            ),
            sortable: true,
            width: '10%',
        },
        {
            key: 'examPapersCount' as keyof CourseTableData,
            header: 'Exam Papers',
            cell: (item: CourseTableData) => (
                <Badge variant="outline">
                    {item.examPapersCount} papers
                </Badge>
            ),
            sortable: true,
            width: '15%',
        },
        {
            key: 'actions' as keyof CourseTableData,
            header: 'Actions',
            cell: (item: CourseTableData) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCourse(item.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCourse(item.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDeleteCourse(item.id)}
                            className="text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Course
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            sortable: false,
            width: '10%',
        }
    ];

    // Filtered and transformed courses for table
    const transformedCourses = (Array.isArray(courses) ? courses : []).map(transformCourseForTable);

    // Skeleton loader component for table rows
    const TableSkeleton = () => (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="container mx-auto py-6">
            <AdminBreadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Institutions', href: '/dashboard/institutions' },
                    { label: 'Courses', href: '/dashboard/institutions/courses' }
                ]}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                    <p className="text-muted-foreground">
                        Manage and organize academic courses across all programmes
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/institutions/courses/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                                <p className="text-xs text-muted-foreground">Across all programmes</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Programmes</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalProgrammes}</div>
                                <p className="text-xs text-muted-foreground">Active programmes</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalModules}</div>
                                <p className="text-xs text-muted-foreground">Course modules</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Exam Papers</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalExamPapers}</div>
                                <p className="text-xs text-muted-foreground">Available papers</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Modules</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.averageModules}</div>
                                <p className="text-xs text-muted-foreground">Per course</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Search Courses
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filter by Programme */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Filter by Programme
                            </label>
                            <Select
                                value={selectedProgramme || 'all'}
                                onValueChange={handleProgrammeFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Programmes" />
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
                        </div>

                        {/* Filter by Faculty */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Filter by Faculty
                            </label>
                            <Select
                                value={selectedFaculty || 'all'}
                                onValueChange={handleFacultyFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Faculties" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Faculties</SelectItem>
                                    {faculties.map((faculty) => (
                                        <SelectItem key={faculty.id} value={faculty.id}>
                                            {faculty.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter by Institution */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Filter by Institution
                            </label>
                            <Select
                                value={selectedInstitution || 'all'}
                                onValueChange={handleInstitutionFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Institutions" />
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
                        </div>
                    </div>

                    {/* Active Filters Info */}
                    <div className="mt-4 text-sm text-muted-foreground">
                        {searchTerm && (
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary">
                                    Search: {searchTerm}
                                </Badge>
                            </div>
                        )}
                        {selectedProgramme && selectedProgramme !== 'all' && (
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary">
                                    Programme: {programmes.find(p => p.id === selectedProgramme)?.name || 'Selected'}
                                </Badge>
                            </div>
                        )}
                        {selectedFaculty && selectedFaculty !== 'all' && (
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary">
                                    Faculty: {faculties.find(f => f.id === selectedFaculty)?.name || 'Selected'}
                                </Badge>
                            </div>
                        )}
                        {selectedInstitution && selectedInstitution !== 'all' && (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    Institution: {institutions.find(i => i.id === selectedInstitution)?.name || 'Selected'}
                                </Badge>
                            </div>
                        )}
                        {!searchTerm && !selectedProgramme && !selectedFaculty && !selectedInstitution && (
                            <span className="text-gray-500">Showing all courses</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Courses Table */}
            <Card>
                <CardContent className="pt-6">
                    {loading && courses.length === 0 ? (
                        <TableSkeleton />
                    ) : transformedCourses.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={transformedCourses}
                            title={`${totalItems} Courses`}
                            searchable={false}
                            filterable={false}
                            pagination={{
                                currentPage,
                                totalPages,
                                totalItems,
                                pageSize,
                                onPageChange: setCurrentPage,
                                onPageSizeChange: handlePageSizeChange,
                            }}
                            emptyMessage="No courses found. Try adjusting your search criteria."
                            loading={loading}
                        />
                    ) : (
                        <EmptyState
                            icon={BookOpen}
                            title="No courses found"
                            description="Get started by creating your first course."
                            action={
                                <Button onClick={() => router.push('/dashboard/institutions/courses/create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Course
                                </Button>
                            }
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CoursesPage; 