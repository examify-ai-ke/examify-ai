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
import { DepartmentForm } from '@/components/forms/department-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
    institution_id?: string;
}

// Initial empty state - data will be loaded from API
const initialStats: DepartmentsStats = {
    totalDepartments: 0,
    totalProgrammes: 0,
    totalFaculties: 0,
    averageProgrammes: 0,
};

export default function DepartmentsPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [departments, setDepartments] = useState<DepartmentRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState<DepartmentsStats>(initialStats);
    const [faculties, setFaculties] = useState<{ id: string; name: string }[]>([]);
    const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<DepartmentRead | null>(null);
    const [deletingDepartment, setDeletingDepartment] = useState<DepartmentRead | null>(null);
    const [filters, setFilters] = useState<DepartmentsFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    // Load departments data
    const loadDepartments = async () => {
        try {
            setLoading(true);

            // Use list endpoint for initial load without filters, search endpoint for filtering
            let response;
            if (filters.search || filters.faculty_id || filters.institution_id) {
                // Use search endpoint when filters are applied
                response = await adminAPI.departments.search({
                    q: filters.search,
                    faculty_id: filters.faculty_id,
                    institution_id: filters.institution_id,
                    sort_by: 'name',
                    sort_order: 'asc',
                    skip: currentPage * pageSize,
                    limit: pageSize,
                });
            } else {
                // Use list endpoint for initial load
                response = await adminAPI.departments.list({
                    skip: currentPage * pageSize,
                    limit: pageSize,
                });
            }

            if (response.data?.data) {
                const responseData = response.data.data;
                // Handle paginated response structure
                if (responseData && typeof responseData === 'object' && 'items' in responseData) {
                    // Paginated response
                    setDepartments(responseData.items || []);
                    setTotalItems(responseData.total || 0);
                    setTotalPages(Math.ceil((responseData.total || 0) / pageSize));
                } else if (Array.isArray(responseData)) {
                    // Direct array response
                    setDepartments(responseData);
                    setTotalItems(responseData.length);
                    setTotalPages(Math.ceil(responseData.length / pageSize));
                } else {
                    // Empty response
                    setDepartments([]);
                    setTotalItems(0);
                    setTotalPages(0);
                }
            } else {
                // Empty response
                setDepartments([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load departments',
                message: 'Please try again later.',
            });
            // Set empty state on error
            setDepartments([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    // Load statistics
    const loadStats = async () => {
        try {
            setStatsLoading(true);
            console.log('Loading department statistics...');

            // Use the clean API method instead of direct API calls
            const response = await adminAPI.departments.getStats();

            if (response.data) {
                console.log('Setting department stats:', response.data);
                setStats(response.data);
            } else {
                console.warn('No department statistics data received');
            }
        } catch (error) {
            console.error('Error loading department statistics:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Load faculties for filter dropdown
    const loadFaculties = async () => {
        try {
            const response = await adminAPI.faculties.list({ limit: 100 });
            if (response.data?.data) {
                const facultiesData = Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data.data.items || [];
                setFaculties(facultiesData.map((faculty: any) => ({ id: faculty.id, name: faculty.name })));
            }
        } catch (error) {
            console.error('Error loading faculties:', error);
        }
    };

    // Load institutions for filter dropdown
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

    // Delete department
    const handleDeleteDepartment = async (department: DepartmentRead) => {
        try {
            await adminAPI.departments.delete(department.id!);
            addNotification({
                type: 'success',
                title: 'Department deleted',
                message: `${department.name} has been deleted successfully.`,
            });
            
            // Reset to first page after deletion
            setCurrentPage(0);
            
            // Reload data
            await loadDepartments();
            await loadStats();
        } catch (error: any) {
            console.error('Error deleting department:', error);
            addNotification({
                type: 'error',
                title: 'Failed to delete department',
                message: error.message || 'Please try again later.',
            });
        } finally {
            setDeletingDepartment(null);
        }
    };

    // Handle form success
    const handleFormSuccess = async () => {
        try {
            setShowCreateModal(false);
            setEditingDepartment(null);
            
            // Reset to first page
            setCurrentPage(0);
            
            // Reload data
            await loadDepartments();
            await loadStats();
        } catch (error) {
            console.error('Error reloading data after form success:', error);
            addNotification({
                type: 'error',
                title: 'Failed to reload data',
                message: 'Please refresh the page to see the latest changes.',
            });
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
                    <DropdownMenuItem onClick={() => setEditingDepartment(department)}>
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
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeletingDepartment(department)}
                    >
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

    // Handle page size change
    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page when changing page size
    };

    // Load stats independently
    useEffect(() => {
        loadStats();
    }, []);

    // Load faculties independently
    useEffect(() => {
        loadFaculties();
    }, []);

    // Load institutions independently
    useEffect(() => {
        loadInstitutions();
    }, []);

    // Load departments when filters, page, or page size changes
    useEffect(() => {
        loadDepartments();
    }, [currentPage, filters, pageSize]);

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

    // Skeleton loader for table
    const TableSkeleton = () => (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
            ))}
        </div>
    );

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
                <Button onClick={() => setShowCreateModal(true)}>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Search Departments
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filter by Faculty */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Filter by Faculty
                            </label>
                            <Select
                                value={filters.faculty_id || 'all'}
                                onValueChange={(value) => handleFilterChange('faculty_id', value)}
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
                                value={filters.institution_id || 'all'}
                                onValueChange={(value) => handleFilterChange('institution_id', value)}
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

                        {/* Active Filters Info */}
                        <div className="flex items-end">
                            <div className="text-sm text-muted-foreground">
                                {filters.search && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary">
                                            Search: {filters.search}
                                        </Badge>
                                    </div>
                                )}
                                {filters.faculty_id && filters.faculty_id !== 'all' && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary">
                                            Faculty: {faculties.find(f => f.id === filters.faculty_id)?.name || 'Selected'}
                                        </Badge>
                                    </div>
                                )}
                                {filters.institution_id && filters.institution_id !== 'all' && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            Institution: {institutions.find(i => i.id === filters.institution_id)?.name || 'Selected'}
                                        </Badge>
                                    </div>
                                )}
                                {!filters.search && !filters.faculty_id && !filters.institution_id && (
                                    <span className="text-gray-500">Showing all departments</span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent className="pt-6">
                    {loading && departments.length === 0 ? (
                        <TableSkeleton />
                    ) : (
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
                                pageSize,
                                onPageChange: setCurrentPage,
                                onPageSizeChange: handlePageSizeChange,
                            }}
                            emptyMessage="No departments found. Try adjusting your search criteria."
                            loading={loading}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Create Department Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Department</DialogTitle>
                        <DialogDescription>
                            Add a new department to a faculty. This will create a new academic department that can contain programmes.
                        </DialogDescription>
                    </DialogHeader>
                    <DepartmentForm
                        mode="create"
                        onSuccess={handleFormSuccess}
                        onCancel={() => setShowCreateModal(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Department Modal */}
            <Dialog open={!!editingDepartment} onOpenChange={(open) => !open && setEditingDepartment(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>
                            Update the department information. Changes will be saved immediately.
                        </DialogDescription>
                    </DialogHeader>
                    {editingDepartment && (
                        <DepartmentForm
                            mode="edit"
                            department={editingDepartment}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setEditingDepartment(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingDepartment} onOpenChange={(open) => !open && setDeletingDepartment(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Department</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingDepartment?.name}"? This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingDepartment && handleDeleteDepartment(deletingDepartment)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Department
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}