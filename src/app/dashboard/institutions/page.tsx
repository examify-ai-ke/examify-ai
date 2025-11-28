'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2,
    Search,
    Filter,
    Eye,
    MapPin,
    Phone,
    Mail,
    Globe,
    GraduationCap,
    FileText,
    ChevronLeft,
    ChevronRight,
    SortAsc,
    ExternalLink,
    Plus,
    Edit,
    Trash2,
    Grid,
    List,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { InstitutionForm } from '@/components/forms/institution-form';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type InstitutionRead = components['schemas']['InstitutionRead'];



// Statistics interface
interface InstitutionsOverviewStats {
    totalInstitutions: number;
    publicInstitutions: number;
    privateInstitutions: number;
    totalFaculties: number;
    totalExamPapers: number;
    averageExamPapers: number;
}



// Mock data
const mockStats: InstitutionsOverviewStats = {
    totalInstitutions: 156,
    publicInstitutions: 89,
    privateInstitutions: 67,
    totalFaculties: 892,
    totalExamPapers: 15678,
    averageExamPapers: 100.5,
};

const mockInstitutions: InstitutionRead[] = [
    {
        id: '1',
        name: 'University of Nairobi',
        description: 'The University of Nairobi is Kenya\'s largest and oldest public university, established in 1956. It offers a wide range of programs and is a leading institution for research and higher education in East Africa.',
        category: 'University' as any,
        key: 'UON',
        location: 'Nairobi County',
        institution_type: 'Public' as any,
        full_profile: 'https://uonbi.ac.ke',
        parent_ministry: 'Ministry of Education',
        tags: ['public', 'research', 'comprehensive'],
        faculties: [],
        campuses: [],
        exam_papers: [],
        exams_count: 1234,
        campuses_count: 6,
        faculties_count: 12,
        logo: null,
        address: null,
        kuccps_institution_url: 'https://students.kuccps.net/institutions/1/university-of-nairobi',
        slug: 'university-of-nairobi',
    },
    {
        id: '2',
        name: 'Strathmore University',
        description: 'Strathmore University is a reputable private university in Nairobi, known for offering market-driven programs in business, technology, and social sciences, focusing on practical skills and innovation.',
        category: 'University' as any,
        key: 'SU',
        location: 'Nairobi County',
        institution_type: 'Private' as any,
        full_profile: 'https://strathmore.edu',
        parent_ministry: null,
        tags: ['private', 'business', 'technology'],
        faculties: [],
        campuses: [],
        exam_papers: [],
        exams_count: 567,
        campuses_count: 2,
        faculties_count: 8,
        logo: null,
        address: null,
        kuccps_institution_url: 'https://students.kuccps.net/institutions/2/strathmore-university',
        slug: 'strathmore-university',
    },
    {
        id: '3',
        name: 'Technical University of Kenya',
        description: 'The Technical University of Kenya (TUK) is a public university in Nairobi, specializing in technical education, applied sciences, engineering, and technology. It evolved from the Kenya Polytechnic, offering practical skills and academic excellence.',
        category: 'University' as any,
        key: 'TUK',
        location: 'Nairobi County',
        institution_type: 'Public' as any,
        full_profile: 'http://www.tukenya.ac.ke/',
        parent_ministry: 'Ministry of Education',
        tags: ['public', 'technical', 'engineering'],
        faculties: [],
        campuses: [],
        exam_papers: [],
        exams_count: 890,
        campuses_count: 3,
        faculties_count: 6,
        logo: null,
        address: null,
        kuccps_institution_url: 'https://students.kuccps.net/institutions/3/technical-university-of-kenya',
        slug: 'technical-university-of-kenya',
    },
    {
        id: '4',
        name: 'Zetech University',
        description: 'Zetech University is a reputable private university in Ruiru, Kiambu County, known for offering market-driven programs in technology, business, and media, focusing on practical skills and innovation.',
        category: 'University' as any,
        key: 'ZETECH',
        location: 'Kiambu County',
        institution_type: 'Private' as any,
        full_profile: 'https://zetech.ac.ke/',
        parent_ministry: null,
        tags: ['private', 'technology', 'media'],
        faculties: [],
        campuses: [],
        exam_papers: [],
        exams_count: 234,
        campuses_count: 2,
        faculties_count: 4,
        logo: null,
        address: null,
        kuccps_institution_url: 'https://students.kuccps.net/institutions/4/zetech-university',
        slug: 'zetech-university',
    },
];

export default function AllInstitutionsPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();
    const router = useRouter();

    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // Default to list view

    // Real data state
    const [institutions, setInstitutions] = useState<InstitutionRead[]>([]);
    const [totalInstitutions, setTotalInstitutions] = useState(0);
    const [stats, setStats] = useState<InstitutionsOverviewStats>(mockStats);

    // Calculate pagination
    const totalPages = Math.ceil(totalInstitutions / itemsPerPage);
    const institutionsData = {
        items: institutions,
        total: totalInstitutions,
        page: currentPage,
        size: itemsPerPage,
        pages: totalPages,
        previous_page: currentPage > 1 ? currentPage - 1 : null,
        next_page: currentPage < totalPages ? currentPage + 1 : null,
    };

    // API functions
    const loadInstitutions = async () => {
        try {
            setLoading(true);

            let response;
            const params = {
                limit: itemsPerPage,
                skip: (currentPage - 1) * itemsPerPage,
            };

            console.log('🔍 Loading institutions with params:', params);
            console.log('🔍 Search term:', searchTerm);
            console.log('🔍 Selected type:', selectedType);

            if (searchTerm && searchTerm.trim() !== '') {
                // Use search API
                const searchParams = {
                    q: searchTerm,
                    institution_type: selectedType !== 'all' ? selectedType as 'Public' | 'Private' | 'Other' : undefined,
                    limit: itemsPerPage,
                    skip: (currentPage - 1) * itemsPerPage,
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
                    setInstitutions(responseData.data.items as InstitutionRead[]);
                    setTotalInstitutions(responseData.data.total || 0);
                } else if ((responseData as any).items) {
                    // Direct items response (fallback)
                    console.log('🔍 Using direct items response:', (responseData as any).items.length, 'items');
                    setInstitutions((responseData as any).items);
                    setTotalInstitutions((responseData as any).total || 0);
                } else if (Array.isArray(responseData)) {
                    // Direct array response (fallback)
                    console.log('🔍 Using direct array response:', responseData.length, 'items');
                    setInstitutions(responseData as InstitutionRead[]);
                    setTotalInstitutions(responseData.length);
                } else {
                    // Unexpected structure
                    console.log('🔍 Unexpected response structure, trying fallback');
                    setInstitutions([]);
                    setTotalInstitutions(0);
                }
            } else {
                console.log('🔍 No response data received');
                setInstitutions([]);
                setTotalInstitutions(0);
            }
        } catch (error) {
            console.error('Error loading institutions:', error);

            // Fallback to mock data
            console.log('Using mock data - institutions API not available');
            const filteredData = mockInstitutions.filter(inst => {
                if (searchTerm && !inst.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return false;
                }
                if (selectedType !== 'all' && inst.institution_type !== selectedType) {
                    return false;
                }
                return true;
            });
            setInstitutions(filteredData);
            setTotalInstitutions(filteredData.length);

            addNotification({
                type: 'warning',
                title: 'Using offline data',
                message: 'Could not connect to server. Showing sample data.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle form success
    const handleFormSuccess = async () => {
        setShowCreateModal(false);
        await loadInstitutions();
    };

    // Handle edit institution
    const handleEditInstitution = (institutionId: string) => {
        router.push(`/dashboard/institutions/${institutionId}/edit`);
    };

    // Handle delete institution
    const handleDeleteInstitution = async (institutionId: string, institutionName: string) => {
        if (window.confirm(`Are you sure you want to delete "${institutionName}"? This action cannot be undone.`)) {
            try {
                const response = await adminAPI.institutions.delete(institutionId);
                if (!response.error) {
                    addNotification({
                        type: 'success',
                        title: 'Institution Deleted',
                        message: `${institutionName} has been deleted successfully`,
                    });
                    await loadInstitutions();
                } else {
                    throw new Error('Failed to delete institution');
                }
            } catch (error) {
                console.error('Error deleting institution:', error);
                addNotification({
                    type: 'error',
                    title: 'Delete Error',
                    message: 'Failed to delete institution. Please try again.',
                });
            }
        }
    };

    // Handle create institution
    const handleCreateInstitution = () => {
        setShowCreateModal(true);
    };

    // Check user permissions
    const currentUser = user || {
        role: { name: 'Student' },
        email: 'student@dev.local',
    };

    const isAdmin = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'admin' || currentUser?.role === 'Admin')
        : (currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'Admin');

    const isManager = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'manager' || currentUser?.role === 'Manager')
        : (currentUser?.role?.name === 'manager' || currentUser?.role?.name === 'Manager');

    const canCreateInstitution = isAdmin || isManager;

    // Utility functions
    const truncateText = (text: string | null | undefined, maxLength: number) => {
        if (!text) return 'No description available';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getUniqueLocations = () => {
        // Use both real data and mock data for locations
        const allInstitutions = institutions.length > 0 ? institutions : mockInstitutions;
        const locations = allInstitutions
            .map((item) => item.location)
            .filter((location): location is string => Boolean(location));
        return [...new Set(locations)].sort();
    };

    const renderPagination = () => {
        const { page, pages, previous_page, next_page } = institutionsData;
        const pageNumbers = [];

        // Calculate page range to show
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);

        for (let i = startPage;i <= endPage;i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, institutionsData.total)} of{' '}
                        {institutionsData.total} institutions
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(previous_page || 1)}
                        disabled={!previous_page}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    {startPage > 1 && (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)}>
                                1
                            </Button>
                            {startPage > 2 && <span className="px-2">...</span>}
                        </>
                    )}

                    {pageNumbers.map((pageNum) => (
                        <Button
                            key={pageNum}
                            variant={pageNum === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                        >
                            {pageNum}
                        </Button>
                    ))}

                    {endPage < pages && (
                        <>
                            {endPage < pages - 1 && <span className="px-2">...</span>}
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(pages)}>
                                {pages}
                            </Button>
                        </>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(next_page || pages)}
                        disabled={!next_page}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    // Load data on mount and when dependencies change
    useEffect(() => {
        loadInstitutions();
    }, [currentPage, itemsPerPage, selectedType, selectedCategory]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (currentPage === 1) {
                loadInstitutions();
            } else {
                setCurrentPage(1); // This will trigger loadInstitutions via the first useEffect
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <AdminBreadcrumb currentPage="All Institutions" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Educational Institutions</h1>
                    <p className="text-muted-foreground">
                        Discover {institutionsData.total} educational institutions across Kenya
                    </p>
                </div>
                {canCreateInstitution && (
                    <Button onClick={handleCreateInstitution} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Institution
                    </Button>
                )}
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Search & Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search institutions by name, location, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Institution Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Public">Public</SelectItem>
                                <SelectItem value="Private">Private</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="University">University</SelectItem>
                                <SelectItem value="College">College</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                            <SelectTrigger>
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                {getUniqueLocations().map((location) => (
                                    <SelectItem key={location} value={location}>
                                        {location}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name A-Z</SelectItem>
                                <SelectItem value="type">Institution Type</SelectItem>
                                <SelectItem value="category">Category</SelectItem>
                                <SelectItem value="location">Location</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{institutionsData.total} institutions found</span>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Items per page:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6">6</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="24">24</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border rounded-lg p-1">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="h-8 px-3"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="h-8 px-3"
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm">
                        <SortAsc className="h-4 w-4 mr-2" />
                        Sort Options
                    </Button>
                </div>
            </div>

            {/* Institution List/Grid View */}
            {loading ? (
                // Loading skeleton
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {Array.from({ length: itemsPerPage }).map((_, index) => (
                        viewMode === 'grid' ? (
                            <Card key={index} className="animate-pulse">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card key={index} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 bg-gray-200 rounded"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    ))}
                </div>
            ) : institutionsData.items.length > 0 ? (
                viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {institutionsData.items.map((institution) => (
                            <Card key={institution.id} className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {institution.logo ? (
                                                <img
                                                    src={institution.logo.media?.link || '/placeholder.svg'}
                                                    alt={institution.logo.media?.title || 'Institution logo'}
                                                    className="w-12 h-12 object-contain rounded"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                                    <Building2 className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg leading-tight">{institution.name}</CardTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {institution.key || 'N/A'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <Badge
                                            className={
                                                institution.institution_type === 'Public'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }
                                        >
                                            {institution.institution_type}
                                        </Badge>
                                        <Badge variant="secondary">{institution.category}</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <CardDescription className="text-sm leading-relaxed">
                                        {truncateText(institution.description, 120)}
                                    </CardDescription>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{institution.location || 'Location not specified'}</span>
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <GraduationCap className="h-4 w-4 text-primary" />
                                                <span className="font-semibold text-sm">{institution.faculties_count || 0}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Faculties</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Building2 className="h-4 w-4 text-primary" />
                                                <span className="font-semibold text-sm">{institution.campuses_count || 0}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Campuses</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <FileText className="h-4 w-4 text-primary" />
                                                <span className="font-semibold text-sm">{institution.exams_count || 0}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Exams</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button className="flex-1" size="sm" asChild>
                                            <Link href={`/dashboard/institutions/${institution.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                        {institution.full_profile ? (
                                            <Button variant="outline" size="sm" asChild>
                                                <a
                                                    href={institution.full_profile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1"
                                                >
                                                    <Globe className="h-3 w-3" />
                                                    Website
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" disabled>
                                                <Globe className="h-3 w-3" />
                                                No Website
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    // List View
                    <div className="space-y-4">
                        {institutionsData.items.map((institution) => (
                            <Card key={institution.id} className="hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {institution.logo ? (
                                                <img
                                                    src={institution.logo.media?.link || '/placeholder.svg'}
                                                    alt={institution.logo.media?.title || 'Institution logo'}
                                                    className="w-16 h-16 object-contain rounded"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                                    <Building2 className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold truncate">{institution.name}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {institution.key || 'N/A'}
                                                    </Badge>
                                                    <Badge
                                                        className={
                                                            institution.institution_type === 'Public'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }
                                                    >
                                                        {institution.institution_type}
                                                    </Badge>
                                                    <Badge variant="secondary">{institution.category}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{institution.location || 'Location not specified'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <GraduationCap className="h-4 w-4" />
                                                        <span>{institution.faculties_count || 0} faculties</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-4 w-4" />
                                                        <span>{institution.campuses_count || 0} campuses</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="h-4 w-4" />
                                                        <span>{institution.exams_count || 0} exams</span>
                                                    </div>
                                                </div>
                                                {institution.description && (
                                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                        {truncateText(institution.description, 100)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" asChild>
                                                <Link href={`/dashboard/institutions/${institution.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                            {(canCreateInstitution) && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditInstitution(institution.id)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteInstitution(institution.id, institution.name)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            ) : (
                // Empty state
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No institutions found</h3>
                    <p className="text-gray-600 text-center max-w-md">
                        {searchTerm ?
                            `No institutions match your search "${searchTerm}". Try adjusting your search criteria.` :
                            'No institutions are available at the moment.'
                        }
                    </p>
                </div>
            )}

            {/* Pagination */}
            <Card>
                <CardContent className="pt-6">{renderPagination()}</CardContent>
            </Card>

            {/* Create Institution Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Add New Institution</DialogTitle>
                        <DialogDescription>
                            Add a new educational institution to the system. This will make it available for browsing and exam paper management.
                        </DialogDescription>
                    </DialogHeader>
                    <InstitutionForm
                        mode="create"
                        onSuccess={handleFormSuccess}
                        onCancel={() => setShowCreateModal(false)}
                        embedded={true}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}