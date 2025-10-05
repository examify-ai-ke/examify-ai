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
    department: string;
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
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedInstitution, setSelectedInstitution] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [programmes, setProgrammes] = useState<Array<{ id: string; name: string }>>([]);
    const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
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
            // Use the new search endpoint which supports multiple filtering options
            const response = await adminAPI.courses.search({
                q: searchTerm || undefined,
                programme_id: selectedProgramme || undefined,
                department_id: selectedDepartment || undefined,
                institution_id: selectedInstitution || undefined,
                sort_by: 'name',
                sort_order: 'asc',
                skip: currentPage * pageSize,
                limit: pageSize,
            });

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

    // Load departments for filter
    const loadDepartments = async () => {
        try {
            const response = await adminAPI.departments.list({ limit: 100 });
            if (response.data?.data) {
                const departmentsData = Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data.data.items || [];
                setDepartments(departmentsData.map((dept: any) => ({ id: dept.id, name: dept.name })));
            }
        } catch (error) {
            console.error('Error loading departments:', error);
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
            console.log('Loading course statistics...');

            const response = await adminAPI.courses.getStats();

            if (response.data) {
                console.log('Setting course stats:', response.data);
                setStats(response.data);
            } else {
                console.warn('No course statistics data received');
            }
        } catch (error) {
            console.error('Error loading course statistics:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Load data on component mount and when filters/pagination change
    useEffect(() => {
        loadCourses();
    }, [currentPage, searchTerm, selectedProgramme, selectedDepartment, selectedInstitution, pageSize]);

    // Load filter options and stats on mount
    useEffect(() => {
        loadProgrammes();
        loadDepartments();
        loadInstitutions();
        loadStats();
    }, []);

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

    // Handle department filter
    const handleDepartmentFilter = (value: string) => {
        setSelectedDepartment(value === 'all' ? '' : value);
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
        department: course.programme?.department?.name || 'N/A',
        faculty: course.programme?.department?.faculty?.name || 'N/A',
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
            key: 'department' as keyof CourseTableData,
            header: 'Department',
            cell: (item: CourseTableData) => (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{item.department}</span>
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

    if (loading && courses.length === 0) {
        return (
            <div className="container mx-auto py-6">
                <AdminBreadcrumb
                    items={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: 'Courses', href: '/dashboard/institutions/courses' }
                    ]}
                />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

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

                        {/* Filter by Department */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Filter by Department
                            </label>
                            <Select
                                value={selectedDepartment || 'all'}
                                onValueChange={handleDepartmentFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((department) => (
                                        <SelectItem key={department.id} value={department.id}>
                                            {department.name}
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
                        {selectedDepartment && selectedDepartment !== 'all' && (
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary">
                                    Department: {departments.find(d => d.id === selectedDepartment)?.name || 'Selected'}
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
                        {!searchTerm && !selectedProgramme && !selectedDepartment && !selectedInstitution && (
                            <span className="text-gray-500">Showing all courses</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Courses Table */}
            {transformedCourses.length > 0 ? (
                <Card>
                    <CardContent className="pt-6">
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
                    </CardContent>
                </Card>
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
        </div>
    );
};

export default CoursesPage; 