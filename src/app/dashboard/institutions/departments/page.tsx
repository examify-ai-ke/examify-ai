'use client';

import React, { useState, useEffect } from 'react';
import {
    Building2,
    Search,
    Filter,
    Eye,
    BookOpen,
    Users,
    GraduationCap,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    School,
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
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type DepartmentRead = components['schemas']['DepartmentRead'];

// Interface for the display table data
interface DepartmentTableData extends DepartmentRead {
    displayName: string;
    facultyDisplay: React.ReactNode;
    programmesDisplay: React.ReactNode;
    statsDisplay: React.ReactNode;
    actions: React.ReactNode;
}

// Statistics interface
interface DepartmentsStats {
    totalDepartments: number;
    totalProgrammes: number;
    totalFaculties: number;
    averageProgrammes: number;
}

// Filter interface
interface DepartmentsFilters {
    search?: string;
    faculty_id?: string;
    has_programmes?: 'yes' | 'no';
}

// Mock data
const mockStats: DepartmentsStats = {
    totalDepartments: 1247,
    totalProgrammes: 3891,
    totalFaculties: 156,
    averageProgrammes: 3.1,
};

const mockDepartments: DepartmentRead[] = [
    {
        id: '1',
        name: 'Computer Science',
        description: 'Leading department in computer science education and research',
        faculty: {
            id: 'f1',
            name: 'Faculty of Engineering',
            institution: { id: 'i1', name: 'University of Nairobi' }
        },
        programmes: [
            { id: 'p1', name: 'Bachelor of Computer Science', department_id: '1' },
            { id: 'p2', name: 'Master of Computer Science', department_id: '1' },
            { id: 'p3', name: 'PhD in Computer Science', department_id: '1' },
        ],
        programmes_count: 3,
    },
    {
        id: '2',
        name: 'Electrical Engineering',
        description: 'Excellence in electrical and electronic engineering education',
        faculty: {
            id: 'f1',
            name: 'Faculty of Engineering',
            institution: { id: 'i1', name: 'University of Nairobi' }
        },
        programmes: [
            { id: 'p4', name: 'Bachelor of Electrical Engineering', department_id: '2' },
            { id: 'p5', name: 'Master of Electrical Engineering', department_id: '2' },
        ],
        programmes_count: 2,
    },
    {
        id: '3',
        name: 'Internal Medicine',
        description: 'Comprehensive medical education and clinical training',
        faculty: {
            id: 'f2',
            name: 'Faculty of Medicine',
            institution: { id: 'i1', name: 'University of Nairobi' }
        },
        programmes: [
            { id: 'p6', name: 'Bachelor of Medicine', department_id: '3' },
            { id: 'p7', name: 'Master of Internal Medicine', department_id: '3' },
            { id: 'p8', name: 'Diploma in Clinical Medicine', department_id: '3' },
        ],
        programmes_count: 3,
    },
    {
        id: '4',
        name: 'Business Administration',
        description: 'Modern business education and management training',
        faculty: {
            id: 'f3',
            name: 'Faculty of Business',
            institution: { id: 'i2', name: 'Strathmore University' }
        },
        programmes: [
            { id: 'p9', name: 'Bachelor of Business Administration', department_id: '4' },
            { id: 'p10', name: 'MBA', department_id: '4' },
        ],
        programmes_count: 2,
    },
];

export default function DepartmentsPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [departments, setDepartments] = useState<DepartmentRead[]>(mockDepartments);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<DepartmentsStats>(mockStats);
    const [filters, setFilters] = useState<DepartmentsFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const ITEMS_PER_PAGE = 20;

    // Load departments data
    const loadDepartments = async () => {
        try {
            setLoading(true);

            // Connect to real backend API
            const response = await adminAPI.departments.list({
                skip: currentPage * ITEMS_PER_PAGE,
                limit: ITEMS_PER_PAGE,
                search: filters.search,
                faculty_id: filters.faculty_id,
            });

            if (response.data && response.data.data) {
                const responseData = response.data.data;
                // Handle paginated response structure
                if (responseData && typeof responseData === 'object' && 'items' in responseData) {
                    // Paginated response
                    setDepartments(responseData.items || []);
                    setTotalItems(responseData.total || 0);
                    setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));
                } else if (Array.isArray(responseData)) {
                    // Direct array response
                    setDepartments(responseData);
                    setTotalItems(responseData.length);
                    setTotalPages(Math.ceil(responseData.length / ITEMS_PER_PAGE));
                } else {
                    // Invalid response, use mock data
                    console.log('Invalid API response structure, using mock data');
                    setDepartments(mockDepartments);
                    setTotalItems(mockDepartments.length);
                    setTotalPages(Math.ceil(mockDepartments.length / ITEMS_PER_PAGE));
                }
            } else {
                // Fallback to mock data if API returns no data
                console.log('Using mock data - no API data available');
                const filteredData = mockDepartments.filter(department => {
                    if (filters.search && !department.name.toLowerCase().includes(filters.search.toLowerCase())) {
                        return false;
                    }
                    if (filters.has_programmes === 'yes' && (!department.programmes || department.programmes.length === 0)) {
                        return false;
                    }
                    if (filters.has_programmes === 'no' && department.programmes && department.programmes.length > 0) {
                        return false;
                    }
                    return true;
                });
                setDepartments(filteredData);
                setTotalItems(filteredData.length);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load departments',
                message: 'Please try again later.',
            });
            // Fallback to mock data on error
            setDepartments(mockDepartments);
            setTotalItems(mockDepartments.length);
        } finally {
            setLoading(false);
        }
    };

    // Transform department data for table display
    const transformDepartmentForTable = (department: DepartmentRead): DepartmentTableData => {
        const displayName = department.name;

        const facultyDisplay = (
            <div className="space-y-1">
                <Badge variant="outline" className="text-xs">
                    <School className="mr-1 h-3 w-3" />
                    {department.faculty?.name || 'No faculty'}
                </Badge>
                {department.faculty?.institution && (
                    <div className="text-xs text-gray-500">
                        {department.faculty.institution.name}
                    </div>
                )}
            </div>
        );

        const programmesDisplay = (
            <div className="space-y-1">
                {department.programmes && department.programmes.length > 0 ? (
                    department.programmes.slice(0, 3).map((programme, index) => (
                        <div key={index} className="text-sm text-gray-600">
                            {programme.name}
                        </div>
                    ))
                ) : (
                    <span className="text-gray-500 text-sm">No programmes</span>
                )}
                {department.programmes && department.programmes.length > 3 && (
                    <div className="text-xs text-gray-500">
                        +{department.programmes.length - 3} more
                    </div>
                )}
            </div>
        );

        const statsDisplay = (
            <div className="flex flex-col space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                    <span className="flex items-center">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Programmes
                    </span>
                    <span className="font-medium">{department.programmes_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        Students
                    </span>
                    <span className="font-medium">{Math.floor(Math.random() * 500) + 50}</span>
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
                        <Link href={`/dashboard/institutions/departments/${department.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Department
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/institutions/programmes?department=${department.id}`}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Programmes
                        </Link>
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
            ...department,
            displayName,
            facultyDisplay,
            programmesDisplay,
            statsDisplay,
            actions,
        };
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(0);
    };

    const handleFilterChange = (key: keyof DepartmentsFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
        setCurrentPage(0);
    };

    // Load data on mount and when filters change
    useEffect(() => {
        loadDepartments();
    }, [currentPage, filters]);

    // Define table columns
    const columns = [
        {
            key: 'displayName' as keyof DepartmentTableData,
            header: 'Department',
            cell: (item: DepartmentTableData) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 mb-1">{item.displayName}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                            {item.description || 'No description available'}
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
            width: '30%',
        },
        {
            key: 'facultyDisplay' as keyof DepartmentTableData,
            header: 'Faculty & Institution',
            cell: (item: DepartmentTableData) => item.facultyDisplay,
            sortable: false,
            width: '25%',
        },
        {
            key: 'programmesDisplay' as keyof DepartmentTableData,
            header: 'Programmes',
            cell: (item: DepartmentTableData) => item.programmesDisplay,
            sortable: false,
            width: '25%',
        },
        {
            key: 'statsDisplay' as keyof DepartmentTableData,
            header: 'Statistics',
            cell: (item: DepartmentTableData) => item.statsDisplay,
            sortable: false,
            width: '15%',
        },
        {
            key: 'actions' as keyof DepartmentTableData,
            header: '',
            cell: (item: DepartmentTableData) => item.actions,
            sortable: false,
            width: '5%',
        },
    ];

    const transformedDepartments = (Array.isArray(departments) ? departments : []).map(transformDepartmentForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="Departments" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Departments</h1>
                    <p className="text-gray-600">
                        Browse and explore academic departments across faculties
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDepartments}</div>
                        <p className="text-xs text-muted-foreground">Across all faculties</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Programmes</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProgrammes}</div>
                        <p className="text-xs text-muted-foreground">Within all departments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faculties</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFaculties}</div>
                        <p className="text-xs text-muted-foreground">With departments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Programmes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageProgrammes}</div>
                        <p className="text-xs text-muted-foreground">Per department</p>
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
                                    placeholder="Search departments by name..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.has_programmes || 'all'}
                            onValueChange={(value) => handleFilterChange('has_programmes', value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by programmes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="yes">With Programmes</SelectItem>
                                <SelectItem value="no">Without Programmes</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.faculty_id || 'all'}
                            onValueChange={(value) => handleFilterChange('faculty_id', value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by faculty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Faculties</SelectItem>
                                <SelectItem value="f1">Faculty of Engineering</SelectItem>
                                <SelectItem value="f2">Faculty of Medicine</SelectItem>
                                <SelectItem value="f3">Faculty of Business</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <LoadingOverlay isLoading={loading}>
                    <DataTable
                        data={transformedDepartments}
                        columns={columns}
                        title={`${totalItems} Departments`}
                        searchable={false}
                        filterable={false}
                        pagination={{
                            currentPage,
                            totalPages,
                            totalItems,
                            pageSize: ITEMS_PER_PAGE,
                            onPageChange: setCurrentPage,
                        }}
                        emptyMessage="No departments found. Try adjusting your search criteria."
                        loading={loading}
                    />
                </LoadingOverlay>
            </Card>
        </div>
    );
}