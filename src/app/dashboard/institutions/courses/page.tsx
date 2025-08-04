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
    Building2
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
    const { showNotification } = useUIStore();

    // State management
    const [courses, setCourses] = useState<CourseRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProgramme, setSelectedProgramme] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [programmes, setProgrammes] = useState<Array<{ id: string; name: string }>>([]);

    // Load courses from API
    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.courses.list({
                skip: (currentPage - 1) * ITEMS_PER_PAGE,
                limit: ITEMS_PER_PAGE,
                search: searchTerm || undefined,
                programme_id: selectedProgramme || undefined
            });

            if (response.data && response.data.data) {
                const responseData = response.data.data;
                if (responseData && typeof responseData === 'object' && 'items' in responseData) {
                    setCourses(responseData.items || []);
                    setTotalItems(responseData.total || 0);
                    setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));
                } else if (Array.isArray(responseData)) {
                    setCourses(responseData);
                    setTotalItems(responseData.length);
                    setTotalPages(Math.ceil(responseData.length / ITEMS_PER_PAGE));
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
            showNotification('Error loading courses', 'error');
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
            // This would typically come from a programmes API endpoint
            // For now, we'll use mock data
            setProgrammes([
                { id: '1', name: 'Bachelor of Computer Science' },
                { id: '2', name: 'Bachelor of Mathematics' },
                { id: '3', name: 'Bachelor of Business Administration' }
            ]);
        } catch (error) {
            console.error('Error loading programmes:', error);
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadCourses();
        loadProgrammes();
    }, [currentPage, searchTerm, selectedProgramme]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Handle programme filter
    const handleProgrammeFilter = (value: string) => {
        setSelectedProgramme(value === 'all' ? '' : value);
        setCurrentPage(1);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
                showNotification('Course deleted successfully', 'success');
                loadCourses(); // Reload the list
            } catch (error) {
                console.error('Error deleting course:', error);
                showNotification('Error deleting course', 'error');
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

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedProgramme || 'all'} onValueChange={handleProgrammeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by programme" />
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
                </CardContent>
            </Card>

            {/* Courses Table */}
            {transformedCourses.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>All Courses ({totalItems})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={transformedCourses}
                            title="All Courses"
                            searchable={false}
                            filterable={false}
                            pagination={true}
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