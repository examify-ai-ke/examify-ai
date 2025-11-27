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
import { FacultyForm } from '@/components/forms/faculty-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
}

// Initial empty state - data will be loaded from API
const initialStats: FacultiesStats = {
    totalFaculties: 0,
    totalDepartments: 0,
    totalInstitutions: 0,
    averageDepartments: 0,
};

export default function FacultiesPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [faculties, setFaculties] = useState<FacultyRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState<FacultiesStats>(initialStats);
    const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<FacultyRead | null>(null);
    const [deletingFaculty, setDeletingFaculty] = useState<FacultyRead | null>(null);
    const [filters, setFilters] = useState<FacultiesFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    // Load faculties data
    const loadFaculties = async () => {
        try {
            setLoading(true);

            // Use the new search endpoint which supports institution_id filtering
            const response = await adminAPI.faculties.search({
                q: filters.search,
                institution_id: filters.institution_id,
                sort_by: 'name',
                sort_order: 'asc',
                skip: currentPage * pageSize,
                limit: pageSize,
            });

            if (response.data?.data) {
                const responseData = response.data.data;
                // Handle paginated response structure
                if (responseData && typeof responseData === 'object' && 'items' in responseData) {
                    // Paginated response
                    const items = responseData.items || [];

                    setFaculties(items);
                    setTotalItems(responseData.total || 0);
                    setTotalPages(Math.ceil((responseData.total || 0) / pageSize));

                    // Update statistics with the total from this response
                    if (!filters.search && !filters.institution_id && currentPage === 0) {
                        setStats(prev => ({ ...prev, totalFaculties: responseData.total || 0 }));
                    }
                } else if (Array.isArray(responseData)) {
                    // Direct array response
                    setFaculties(responseData);
                    setTotalItems(responseData.length);
                    setTotalPages(Math.ceil(responseData.length / pageSize));

                    // Update stats for array response
                    if (!filters.search && !filters.institution_id) {
                        setStats(prev => ({ ...prev, totalFaculties: responseData.length }));
                    }
                } else {
                    // Empty response
                    setFaculties([]);
                    setTotalItems(0);
                    setTotalPages(0);
                }
            } else {
                // Empty response
                setFaculties([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error loading faculties:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load faculties',
                message: 'Please try again later.',
            });
            // Set empty state on error
            setFaculties([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    // Load remaining statistics (departments and institutions only)
    const loadRemainingStats = async () => {
        try {
            setStatsLoading(true);
            console.log('Loading remaining statistics...');

            // Use the clean API method instead of direct API calls
            const response = await adminAPI.faculties.getPartialStats();

            if (response.data) {
                setStats(prev => {
                    const totalFaculties = prev.totalFaculties; // Keep the faculty count from main search
                    const averageDepartments = totalFaculties > 0 ?
                        Number((response.data.totalDepartments / totalFaculties).toFixed(1)) : 0;

                    console.log('Updated statistics:', {
                        totalFaculties,
                        totalDepartments: response.data.totalDepartments,
                        totalInstitutions: response.data.totalInstitutions,
                        averageDepartments,
                    });

                    return {
                        totalFaculties,
                        totalDepartments: response.data.totalDepartments,
                        totalInstitutions: response.data.totalInstitutions,
                        averageDepartments,
                    };
                });
            }
        } catch (error) {
            console.error('Error loading remaining statistics:', error);
        } finally {
            setStatsLoading(false);
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
                setInstitutions(institutionsData.map(inst => ({ id: inst.id, name: inst.name })));
            }
        } catch (error) {
            console.error('Error loading institutions:', error);
        }
    };

    // Delete faculty
    const handleDeleteFaculty = async (faculty: FacultyRead) => {
        try {
            await adminAPI.faculties.delete(faculty.id);
            addNotification({
                type: 'success',
                title: 'Faculty deleted',
                message: `${faculty.name} has been deleted successfully.`,
            });
            loadFaculties();
            loadRemainingStats(); // Fixed: was calling loadStats which doesn't exist anymore
        } catch (error: any) {
            console.error('Error deleting faculty:', error);
            addNotification({
                type: 'error',
                title: 'Failed to delete faculty',
                message: error.message || 'Please try again later.',
            });
        }
        setDeletingFaculty(null);
    };

    // Handle form success
    const handleFormSuccess = async () => {
        try {
            // Close modal first to prevent user from clicking while reloading
            setShowCreateModal(false);
            setEditingFaculty(null);

            // Show loading state
            setLoading(true);

            // Reload data
            await loadFaculties();
            await loadRemainingStats();
        } catch (error) {
            console.error('Error reloading data after form success:', error);
            addNotification({
                type: 'error',
                title: 'Failed to reload data',
                message: 'Please refresh the page to see the latest changes.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Transform faculty data for table display
    const transformFacultyForTable = (faculty: FacultyRead): FacultyTableData => {
        const displayName = faculty.name;

        const institutionsDisplay = (
            <div className="flex flex-wrap gap-1 max-w-xs">
                {faculty.institutions && faculty.institutions.length > 0 ? (
                    <>
                        {faculty.institutions.slice(0, 2).map((institution, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="text-xs whitespace-normal break-words max-w-full"
                            >
                                <Building className="mr-1 h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{institution.name}</span>
                            </Badge>
                        ))}
                        {faculty.institutions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                                +{faculty.institutions.length - 2}
                        </Badge>
                        )}
                    </>
                ) : (
                    <span className="text-gray-500 text-sm italic">No institutions</span>
                )}
            </div>
        );

        const departmentsDisplay = (
            <div className="space-y-1 max-w-xs">
                {faculty.departments && faculty.departments.length > 0 ? (
                    <>
                        {faculty.departments.slice(0, 2).map((department, index) => (
                            <div
                                key={index}
                                className="text-sm text-gray-700 truncate"
                                title={department.name}
                            >
                                • {department.name}
                            </div>
                        ))}
                        {faculty.departments.length > 2 && (
                            <div className="text-xs text-gray-500 italic">
                                +{faculty.departments.length - 2} more
                        </div>
                        )}
                    </>
                ) : (
                    <span className="text-gray-500 text-sm italic">No departments</span>
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
                    <DropdownMenuItem onClick={() => setEditingFaculty(faculty)}>
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
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeletingFaculty(faculty)}
                    >
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

    // Handle page size change
    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page when changing page size
    };

    // Load stats independently
    useEffect(() => {
        loadRemainingStats();
    }, []);

    // Load institutions independently
    useEffect(() => {
        loadInstitutions();
    }, []);

    // Load faculties when filters, page, or page size changes
    useEffect(() => {
        loadFaculties();
    }, [currentPage, filters, pageSize]);

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
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
            ))}
        </div>
    );

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
                <Button onClick={() => setShowCreateModal(true)}>
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
                        <div className="text-2xl font-bold">
                            {statsLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                </div>
                            ) : (
                                stats.totalFaculties
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Across all institutions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                </div>
                            ) : (
                                stats.totalDepartments
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Within all faculties</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Institutions</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                </div>
                            ) : (
                                stats.totalInstitutions
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">With faculties</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Departments</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                </div>
                            ) : (
                                stats.averageDepartments
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Per faculty</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div className="lg:col-span-1">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Search Faculties
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
                                {filters.institution_id && filters.institution_id !== 'all' && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            Institution: {institutions.find(i => i.id === filters.institution_id)?.name || 'Selected'}
                                        </Badge>
                                    </div>
                                )}
                                {!filters.search && !filters.institution_id && (
                                    <span className="text-gray-500">Showing all faculties</span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent className="pt-6">
                    {loading && faculties.length === 0 ? (
                        <TableSkeleton />
                    ) : (
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
                                pageSize,
                                onPageChange: setCurrentPage,
                                onPageSizeChange: handlePageSizeChange,
                            }}
                            emptyMessage="No faculties found. Try adjusting your search criteria."
                            loading={loading}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Create Faculty Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Faculty</DialogTitle>
                        <DialogDescription>
                            Add a new faculty to the system. This will create a new academic faculty that can contain departments.
                        </DialogDescription>
                    </DialogHeader>
                    <FacultyForm
                        mode="create"
                        onSuccess={handleFormSuccess}
                        onCancel={() => setShowCreateModal(false)}
                        embedded={true}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Faculty Modal */}
            <Dialog open={!!editingFaculty} onOpenChange={(open) => !open && setEditingFaculty(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Faculty</DialogTitle>
                        <DialogDescription>
                            Update the faculty information. Changes will be saved immediately.
                        </DialogDescription>
                    </DialogHeader>
                    {editingFaculty && (
                        <FacultyForm
                            mode="edit"
                            faculty={editingFaculty}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setEditingFaculty(null)}
                            embedded={true}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingFaculty} onOpenChange={(open) => !open && setDeletingFaculty(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Faculty</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingFaculty?.name}"? This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingFaculty && handleDeleteFaculty(deletingFaculty)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Faculty
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}