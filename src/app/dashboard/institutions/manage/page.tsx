'use client';

import React, { useState, useEffect } from 'react';
import {
    Building,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    MapPin,
    Globe,
    School,
    Book,
    Users,
    Settings,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ExternalLink,
    Download,
    Upload,
    Copy,
    Archive,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { formatDate } from '@/lib/utils';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type InstitutionRead = components['schemas']['InstitutionRead'];
type InstitutionCreate = components['schemas']['InstitutionCreate'];
type FacultyRead = components['schemas']['FacultyRead'];
type DepartmentRead = components['schemas']['DepartmentRead'];
type CourseRead = components['schemas']['CourseRead'];

// Interface for the display table data
interface InstitutionTableData extends InstitutionRead {
    displayName: string;
    typeBadge: React.ReactNode;
    categoryBadge: React.ReactNode;
    statusBadge: React.ReactNode;
    statsDisplay: React.ReactNode;
    locationDisplay: string;
    actions: React.ReactNode;
}

// Statistics interface
interface InstitutionsStats {
    totalInstitutions: number;
    publicInstitutions: number;
    privateInstitutions: number;
    universities: number;
    colleges: number;
    totalFaculties: number;
    totalDepartments: number;
    totalCourses: number;
}

// Filter interface
interface InstitutionsFilters {
    search?: string;
    institution_type?: 'Public' | 'Private' | 'Other';
    category?: string;
    location?: string;
}

// Mock data
const mockStats: InstitutionsStats = {
    totalInstitutions: 156,
    publicInstitutions: 89,
    privateInstitutions: 67,
    universities: 45,
    colleges: 111,
    totalFaculties: 892,
    totalDepartments: 2134,
    totalCourses: 8567,
};

const mockInstitutions: InstitutionRead[] = [
    {
        id: '1',
        name: 'University of Nairobi',
        description: 'Premier public university in Kenya',
        category: 'University' as any,
        key: 'UON',
        location: 'Nairobi, Kenya',
        institution_type: 'Public' as any,
        full_profile: 'https://uonbi.ac.ke',
        parent_ministry: 'Ministry of Education',
        tags: ['public', 'research', 'comprehensive'],
        faculties: [],
        campuses: [],
        exam_papers: [],
        exams_count: 234,
        campuses_count: 6,
        faculties_count: 12,
        logo: null,
        address: null,
    },
    {
        id: '2',
        name: 'Strathmore University',
        description: 'Leading private university',
        category: 'University' as any,
        key: 'SU',
        location: 'Nairobi, Kenya',
        institution_type: 'Private' as any,
        full_profile: 'https://strathmore.edu',
        parent_ministry: null,
        tags: ['private', 'business', 'technology'],
        faculties: [],
        campuses: [],
        exam_papers: [],
        exams_count: 167,
        campuses_count: 2,
        faculties_count: 8,
        logo: null,
        address: null,
    },
];

export default function InstitutionsManagePage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [institutions, setInstitutions] = useState<InstitutionRead[]>(mockInstitutions);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<InstitutionsStats>(mockStats);
    const [filters, setFilters] = useState<InstitutionsFilters>({});
    const [selectedInstitution, setSelectedInstitution] = useState<InstitutionRead | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const ITEMS_PER_PAGE = 20;

    // Role-based access control
    const currentUser = user || {
        role: { name: 'Admin' },
        email: 'admin@dev.local',
        name: 'Admin User'
    };

    const isAdmin = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'admin' || currentUser?.role === 'Admin')
        : (currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'Admin');

    const isManager = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'manager' || currentUser?.role === 'Manager')
        : (currentUser?.role?.name === 'manager' || currentUser?.role?.name === 'Manager');

    // Check if user has permission to manage institutions
    if (!isAdmin && !isManager) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
                    <p className="mt-2 text-gray-600">
                        You need manager or administrator privileges to access institutions management.
                    </p>
                </div>
            </div>
        );
    }

    // Load institutions data
    const loadInstitutions = async () => {
        try {
            setLoading(true);

            // Connect to backend API
            let response;
            const params = {
                skip: currentPage * ITEMS_PER_PAGE,
                limit: ITEMS_PER_PAGE,
            };

            console.log('🔍 Loading institutions with params:', params);
            console.log('🔍 Search term:', filters.search);
            console.log('🔍 Filters:', filters);

            if (filters.search && filters.search.trim() !== '') {
                // Use search API
                const searchParams = {
                    q: filters.search,
                    institution_type: filters.institution_type,
                    location: filters.location,
                    skip: currentPage * ITEMS_PER_PAGE,
                    limit: ITEMS_PER_PAGE,
                };
                console.log('🔍 Using search API with params:', searchParams);
                response = await adminAPI.institutions.search(searchParams);
            } else {
                // Use list API
                console.log('🔍 Using list API with params:', params);
                response = await adminAPI.institutions.list(params);
            }

            console.log('🔍 API Response:', response);
            console.log('🔍 Response data:', response.data);

            if (response.data) {
                const responseData = response.data;
                console.log('🔍 Response data structure:', {
                    hasItems: !!responseData.items,
                    isArray: Array.isArray(responseData),
                    hasData: !!responseData.data,
                    keys: Object.keys(responseData),
                    responseData
                });

                // Handle the correct API response structure
                if (responseData.data && responseData.data.items) {
                    // Paginated response (correct structure)
                    console.log('🔍 Using paginated response:', responseData.data.items.length, 'items');
                    setInstitutions(responseData.data.items);
                    setTotalItems(responseData.data.total || 0);
                    setTotalPages(Math.ceil((responseData.data.total || 0) / ITEMS_PER_PAGE));
                } else if (responseData.items) {
                    // Direct items response (fallback)
                    console.log('🔍 Using direct items response:', responseData.items.length, 'items');
                    setInstitutions(responseData.items);
                    setTotalItems(responseData.total || 0);
                    setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));
                } else if (Array.isArray(responseData)) {
                    // Direct array response (fallback)
                    console.log('🔍 Using direct array response:', responseData.length, 'items');
                    setInstitutions(responseData);
                    setTotalItems(responseData.length);
                    setTotalPages(Math.ceil(responseData.length / ITEMS_PER_PAGE));
                } else {
                    // Unexpected structure
                    console.log('🔍 Unexpected response structure, using fallback');
                    setInstitutions([]);
                    setTotalItems(0);
                    setTotalPages(0);
                }
            } else {
                console.log('🔍 No response data received');
                setInstitutions([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error loading institutions:', error);

            // Fallback to mock data
            console.log('Using mock data - institutions API not available');
            const filteredData = mockInstitutions.filter(inst => {
                if (filters.search && !inst.name.toLowerCase().includes(filters.search.toLowerCase())) {
                    return false;
                }
                if (filters.institution_type && inst.institution_type !== filters.institution_type) {
                    return false;
                }
                return true;
            });
            setInstitutions(filteredData);
            setTotalItems(filteredData.length);
            setTotalPages(Math.ceil(filteredData.length / ITEMS_PER_PAGE));

            addNotification({
                type: 'warning',
                title: 'Using offline data',
                message: 'Could not connect to server. Showing sample data.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Transform institution data for table display
    const transformInstitutionForTable = (institution: InstitutionRead): InstitutionTableData => {
        const displayName = institution.name;

        const typeBadge = (
            <Badge
                variant={institution.institution_type === 'Public' ? 'default' : 'secondary'}
                className={institution.institution_type === 'Public' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
            >
                {institution.institution_type || 'Unknown'}
            </Badge>
        );

        const categoryBadge = (
            <Badge variant="outline" className="text-xs">
                <School className="mr-1 h-3 w-3" />
                {institution.category}
            </Badge>
        );

        const statusBadge = (
            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
            </Badge>
        );

        const statsDisplay = (
            <div className="flex flex-col space-y-1 text-xs text-gray-600">
                <div className="flex items-center space-x-4">
                    <span>📚 {institution.faculties_count || 0} Faculties</span>
                    <span>📝 {institution.exams_count || 0} Papers</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span>🏢 {institution.campuses_count || 0} Campuses</span>
                </div>
            </div>
        );

        const locationDisplay = institution.location || 'Not specified';

        const actions = (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleViewInstitution(institution.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditInstitution(institution)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageFaculties(institution.id)}>
                        <School className="mr-2 h-4 w-4" />
                        Manage Faculties
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewExamPapers(institution.id)}>
                        <Book className="mr-2 h-4 w-4" />
                        View Exam Papers
                    </DropdownMenuItem>
                    {institution.full_profile && (
                        <DropdownMenuItem onClick={() => window.open(institution.full_profile!, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Website
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDuplicateInstitution(institution.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleDeleteInstitution(institution.id)}
                        className="text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        return {
            ...institution,
            displayName,
            typeBadge,
            categoryBadge,
            statusBadge,
            statsDisplay,
            locationDisplay,
            actions,
        };
    };

    // Action handlers
    const handleCreateInstitution = () => {
        setSelectedInstitution(null);
        setShowCreateDialog(true);
    };

    const handleEditInstitution = (institution: InstitutionRead) => {
        setSelectedInstitution(institution);
        setShowEditDialog(true);
    };

    const handleViewInstitution = (institutionId: string) => {
        window.open(`/dashboard/institutions/${institutionId}`, '_blank');
    };

    const handleDeleteInstitution = async (institutionId: string) => {
        if (!confirm('Are you sure you want to delete this institution? This action cannot be undone.')) return;

        try {
            await adminAPI.institutions.delete(institutionId);
            addNotification({
                type: 'success',
                title: 'Institution Deleted',
                message: 'Institution has been deleted successfully.',
            });
            loadInstitutions();
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to delete the institution. Please try again.',
            });
        }
    };

    const handleManageFaculties = (institutionId: string) => {
        window.open(`/dashboard/institutions/faculties?institution_id=${institutionId}`, '_blank');
    };

    const handleViewExamPapers = (institutionId: string) => {
        addNotification({
            type: 'info',
            title: 'View Exam Papers',
            message: `Opening exam papers for institution ${institutionId}...`,
        });
    };

    const handleDuplicateInstitution = (institutionId: string) => {
        addNotification({
            type: 'info',
            title: 'Duplicate Institution',
            message: `Creating copy of institution ${institutionId}...`,
        });
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(0);
    };

    const handleFilterChange = (key: keyof InstitutionsFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(0);
    };

    // Load data on mount and when filters change
    useEffect(() => {
        loadInstitutions();
    }, [currentPage, filters]);

    // Define table columns
    const columns = [
        {
            key: 'displayName' as keyof InstitutionTableData,
            header: 'Institution',
            cell: (item: InstitutionTableData) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <Building className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 mb-1">{item.displayName}</div>
                        <div className="text-sm text-gray-500 mb-1">{item.key}</div>
                        <div className="flex items-center space-x-2">
                            {item.categoryBadge}
                            {item.typeBadge}
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
            width: '25%',
        },
        {
            key: 'locationDisplay' as keyof InstitutionTableData,
            header: 'Location',
            cell: (item: InstitutionTableData) => (
                <div className="flex items-center text-sm">
                    <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                    {item.locationDisplay}
                </div>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'statsDisplay' as keyof InstitutionTableData,
            header: 'Statistics',
            cell: (item: InstitutionTableData) => item.statsDisplay,
            sortable: false,
            width: '20%',
        },
        {
            key: 'statusBadge' as keyof InstitutionTableData,
            header: 'Status',
            cell: (item: InstitutionTableData) => item.statusBadge,
            sortable: false,
            width: '10%',
        },
        {
            key: 'description' as keyof InstitutionTableData,
            header: 'Description',
            cell: (item: InstitutionTableData) => (
                <div className="text-sm text-gray-600 truncate max-w-[200px]">
                    {item.description || 'No description'}
                </div>
            ),
            sortable: false,
            width: '20%',
        },
        {
            key: 'actions' as keyof InstitutionTableData,
            header: '',
            cell: (item: InstitutionTableData) => item.actions,
            sortable: false,
            width: '10%',
        },
    ];

    const transformedInstitutions = institutions.map(transformInstitutionForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="Institutions Management" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Institutions Management</h1>
                    <p className="text-gray-600">
                        Manage educational institutions, faculties, departments, and courses
                    </p>
                </div>
                <Button onClick={handleCreateInstitution} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Institution</span>
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalInstitutions}</div>
                        <p className="text-xs text-muted-foreground">All registered institutions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Public vs Private</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.publicInstitutions}/{stats.privateInstitutions}</div>
                        <p className="text-xs text-muted-foreground">Public / Private split</p>
                    </CardContent>
                </Card>

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
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <Book className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">All available courses</p>
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
                                    placeholder="Search institutions..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.institution_type || 'all'}
                            onValueChange={(value) => handleFilterChange('institution_type', value === 'all' ? undefined : value as any)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Public">Public</SelectItem>
                                <SelectItem value="Private">Private</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.category || 'all'}
                            onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="University">University</SelectItem>
                                <SelectItem value="College">College</SelectItem>
                                <SelectItem value="Institute">Institute</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <LoadingOverlay isLoading={loading}>
                    <DataTable
                        data={transformedInstitutions}
                        columns={columns}
                        title={`${totalItems} Institutions`}
                        searchable={false}
                        filterable={false}
                        pagination={true}
                        pageSize={ITEMS_PER_PAGE}
                        actions={[
                            {
                                label: 'Export Selected',
                                onClick: (selectedItems: InstitutionTableData[]) => {
                                    addNotification({
                                        type: 'info',
                                        title: 'Export Started',
                                        message: `Exporting ${selectedItems.length} institutions...`,
                                    });
                                },
                                icon: Download,
                                variant: 'outline',
                            },
                            {
                                label: 'Bulk Edit',
                                onClick: (selectedItems: InstitutionTableData[]) => {
                                    addNotification({
                                        type: 'info',
                                        title: 'Bulk Edit',
                                        message: `Editing ${selectedItems.length} institutions...`,
                                    });
                                },
                                icon: Edit,
                                variant: 'outline',
                            },
                        ]}
                        emptyMessage="No institutions found. Create your first institution to get started."
                        loading={loading}
                    />
                </LoadingOverlay>
            </Card>
        </div>
    );
}