'use client';

import React, { useState, useEffect } from 'react';
import {
    School,
    Search,
    Filter,
    Eye,
    Building,
    Users,
    BookOpen,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
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
type FacultyRead = components['schemas']['FacultyRead'];

// Interface for the display table data
interface FacultyTableData extends FacultyRead {
    displayName: string;
    institutionsDisplay: React.ReactNode;
    departmentsDisplay: React.ReactNode;
    statsDisplay: React.ReactNode;
    actions: React.ReactNode;
}

// Statistics interface
interface FacultiesStats {
    totalFaculties: number;
    totalDepartments: number;
    totalInstitutions: number;
    averageDepartments: number;
}

// Filter interface
interface FacultiesFilters {
    search?: string;
    institution_id?: string;
    has_departments?: 'yes' | 'no';
}

// Mock data
const mockStats: FacultiesStats = {
    totalFaculties: 892,
    totalDepartments: 2134,
    totalInstitutions: 156,
    averageDepartments: 2.4,
};

const mockFaculties: FacultyRead[] = [
    {
        id: '1',
        name: 'Faculty of Engineering',
        description: 'Leading engineering education and research programs',
        departments: [
            { id: 'd1', name: 'Civil Engineering', programmes: [] },
            { id: 'd2', name: 'Electrical Engineering', programmes: [] },
            { id: 'd3', name: 'Mechanical Engineering', programmes: [] },
        ],
        department_count: 8,
        institutions: [
            { id: 'i1', name: 'University of Nairobi' }
        ],
        institution_count: 1,
    },
    {
        id: '2',
        name: 'Faculty of Medicine',
        description: 'Comprehensive medical education and healthcare training',
        departments: [
            { id: 'd4', name: 'Surgery', programmes: [] },
            { id: 'd5', name: 'Internal Medicine', programmes: [] },
            { id: 'd6', name: 'Pediatrics', programmes: [] },
        ],
        department_count: 12,
        institutions: [
            { id: 'i1', name: 'University of Nairobi' },
            { id: 'i2', name: 'Moi University' }
        ],
        institution_count: 2,
    },
    {
        id: '3',
        name: 'Faculty of Arts',
        description: 'Liberal arts and humanities education',
        departments: [
            { id: 'd7', name: 'Literature', programmes: [] },
            { id: 'd8', name: 'Philosophy', programmes: [] },
            { id: 'd9', name: 'History', programmes: [] },
        ],
        department_count: 15,
        institutions: [
            { id: 'i1', name: 'University of Nairobi' }
        ],
        institution_count: 1,
    },
    {
        id: '4',
        name: 'Faculty of Business',
        description: 'Business administration and management programs',
        departments: [
            { id: 'd10', name: 'Accounting', programmes: [] },
            { id: 'd11', name: 'Marketing', programmes: [] },
        ],
        department_count: 6,
        institutions: [
            { id: 'i3', name: 'Strathmore University' }
        ],
        institution_count: 1,
    },
];

export default function FacultiesPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [faculties, setFaculties] = useState<FacultyRead[]>(mockFaculties);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<FacultiesStats>(mockStats);
    const [filters, setFilters] = useState<FacultiesFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const ITEMS_PER_PAGE = 20;

    // Load faculties data
    const loadFaculties = async () => {
        try {
            setLoading(true);

            // Connect to real backend API
            const response = await adminAPI.faculties.list({
                skip: currentPage * ITEMS_PER_PAGE,
                limit: ITEMS_PER_PAGE,
                search: filters.search,
                institution_id: filters.institution_id,
            });

            if (response.data && response.data.data) {
                const responseData = response.data.data;
                // Handle paginated response structure
                if (responseData && typeof responseData === 'object' && 'items' in responseData) {
                    // Paginated response
                    setFaculties(responseData.items || []);
                    setTotalItems(responseData.total || 0);
                    setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));
                } else if (Array.isArray(responseData)) {
                    // Direct array response
                    setFaculties(responseData);
                    setTotalItems(responseData.length);
                    setTotalPages(Math.ceil(responseData.length / ITEMS_PER_PAGE));
                } else {
                    // Invalid response, use mock data
                    console.log('Invalid API response structure, using mock data');
                    setFaculties(mockFaculties);
                    setTotalItems(mockFaculties.length);
                    setTotalPages(Math.ceil(mockFaculties.length / ITEMS_PER_PAGE));
                }
            } else {
                // Fallback to mock data if API returns no data
                console.log('Using mock data - no API data available');
                const filteredData = mockFaculties.filter(faculty => {
                    if (filters.search && !faculty.name.toLowerCase().includes(filters.search.toLowerCase())) {
                        return false;
                    }
                    if (filters.has_departments === 'yes' && (!faculty.departments || faculty.departments.length === 0)) {
                        return false;
                    }
                    if (filters.has_departments === 'no' && faculty.departments && faculty.departments.length > 0) {
                        return false;
                    }
                    return true;
                });
                setFaculties(filteredData);
                setTotalItems(filteredData.length);
            }
        } catch (error) {
            console.error('Error loading faculties:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load faculties',
                message: 'Please try again later.',
            });
            // Fallback to mock data on error
            setFaculties(mockFaculties);
            setTotalItems(mockFaculties.length);
        } finally {
            setLoading(false);
        }
    };

    // Transform faculty data for table display
    const transformFacultyForTable = (faculty: FacultyRead): FacultyTableData => {
        const displayName = faculty.name;

        const institutionsDisplay = (
            <div className="space-y-1">
                {faculty.institutions && faculty.institutions.length > 0 ? (
                    faculty.institutions.slice(0, 2).map((institution, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                            <Building className="mr-1 h-3 w-3" />
                            {institution.name}
                        </Badge>
                    ))
                ) : (
                    <span className="text-gray-500 text-sm">No institutions</span>
                )}
                {faculty.institutions && faculty.institutions.length > 2 && (
                    <div className="text-xs text-gray-500">
                        +{faculty.institutions.length - 2} more
                    </div>
                )}
            </div>
        );

        const departmentsDisplay = (
            <div className="space-y-1">
                {faculty.departments && faculty.departments.length > 0 ? (
                    faculty.departments.slice(0, 3).map((department, index) => (
                        <div key={index} className="text-sm text-gray-600">
                            {department.name}
                        </div>
                    ))
                ) : (
                    <span className="text-gray-500 text-sm">No departments</span>
                )}
                {faculty.departments && faculty.departments.length > 3 && (
                    <div className="text-xs text-gray-500">
                        +{faculty.departments.length - 3} more
                    </div>
                )}
            </div>
        );

        const statsDisplay = (
            <div className="flex flex-col space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                    <span className="flex items-center">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Departments
                    </span>
                    <span className="font-medium">{faculty.department_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center">
                        <Building className="mr-1 h-3 w-3" />
                        Institutions
                    </span>
                    <span className="font-medium">{faculty.institution_count || 0}</span>
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
                        <Link href={`/dashboard/institutions/faculties/${faculty.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Faculty
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/institutions/departments?faculty=${faculty.id}`}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Departments
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
            ...faculty,
            displayName,
            institutionsDisplay,
            departmentsDisplay,
            statsDisplay,
            actions,
        };
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(0);
    };

    const handleFilterChange = (key: keyof FacultiesFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
        setCurrentPage(0);
    };

    // Load data on mount and when filters change
    useEffect(() => {
        loadFaculties();
    }, [currentPage, filters]);

    // Define table columns
    const columns = [
        {
            key: 'displayName' as keyof FacultyTableData,
            header: 'Faculty',
            cell: (item: FacultyTableData) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <School className="h-8 w-8 text-purple-600" />
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
            key: 'institutionsDisplay' as keyof FacultyTableData,
            header: 'Institutions',
            cell: (item: FacultyTableData) => item.institutionsDisplay,
            sortable: false,
            width: '25%',
        },
        {
            key: 'departmentsDisplay' as keyof FacultyTableData,
            header: 'Departments',
            cell: (item: FacultyTableData) => item.departmentsDisplay,
            sortable: false,
            width: '25%',
        },
        {
            key: 'statsDisplay' as keyof FacultyTableData,
            header: 'Statistics',
            cell: (item: FacultyTableData) => item.statsDisplay,
            sortable: false,
            width: '15%',
        },
        {
            key: 'actions' as keyof FacultyTableData,
            header: '',
            cell: (item: FacultyTableData) => item.actions,
            sortable: false,
            width: '5%',
        },
    ];

    const transformedFaculties = (Array.isArray(faculties) ? faculties : []).map(transformFacultyForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="Faculties" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Faculties</h1>
                    <p className="text-gray-600">
                        Browse and explore academic faculties across institutions
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Faculty
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Faculties</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFaculties}</div>
                        <p className="text-xs text-muted-foreground">Across all institutions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDepartments}</div>
                        <p className="text-xs text-muted-foreground">Within all faculties</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Institutions</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalInstitutions}</div>
                        <p className="text-xs text-muted-foreground">With faculties</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Departments</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageDepartments}</div>
                        <p className="text-xs text-muted-foreground">Per faculty</p>
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
                                    placeholder="Search faculties by name..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.has_departments || 'all'}
                            onValueChange={(value) => handleFilterChange('has_departments', value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Faculties</SelectItem>
                                <SelectItem value="yes">With Departments</SelectItem>
                                <SelectItem value="no">Without Departments</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.institution_id || 'all'}
                            onValueChange={(value) => handleFilterChange('institution_id', value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by institution" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Institutions</SelectItem>
                                <SelectItem value="1">University of Nairobi</SelectItem>
                                <SelectItem value="2">Strathmore University</SelectItem>
                                <SelectItem value="3">Moi University</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <LoadingOverlay isLoading={loading}>
                    <DataTable
                        data={transformedFaculties}
                        columns={columns}
                        title={`${totalItems} Faculties`}
                        searchable={false}
                        filterable={false}
                        pagination={{
                            currentPage,
                            totalPages,
                            totalItems,
                            pageSize: ITEMS_PER_PAGE,
                            onPageChange: setCurrentPage,
                        }}
                        emptyMessage="No faculties found. Try adjusting your search criteria."
                        loading={loading}
                    />
                </LoadingOverlay>
            </Card>
        </div>
    );
}