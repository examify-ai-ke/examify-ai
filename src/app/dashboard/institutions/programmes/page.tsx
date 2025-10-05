'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    GraduationCap,
    Plus,
    Search,
    Filter,
    BookOpen,
    Building2,
    School,
    Eye,
    Edit,
    Trash2,
    FileText,
} from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ProgrammeForm } from '@/components/forms/programme-form';
import { Badge } from '@/components/ui/badge';

type ProgrammeRead = components['schemas']['ProgrammeRead'];

export default function ProgrammesPage() {
    const router = useRouter();
    const { addNotification } = useUIStore();

    // State
    const [programmes, setProgrammes] = useState<ProgrammeRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(0); // 0-based for API
    const [pageSize, setPageSize] = useState(10);

    // Filter & Sort state
    const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedProgramme, setSelectedProgramme] = useState<ProgrammeRead | null>(null);

    // Statistics
    const [stats, setStats] = useState({
        totalProgrammes: 0,
        totalCourses: 0,
        totalDepartments: 0,
        totalExamPapers: 0,
        averageCourses: 0,
    });

    // Load departments for filter
    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const response: any = await adminAPI.departments.list({ limit: 100 });
                if (response.data?.data) {
                    const data = response.data.data;
                    const depts = data.items || [];
                    setDepartments(depts.map((dept: any) => ({ id: dept.id, name: dept.name })));
                }
            } catch (error) {
                console.error('Error loading departments:', error);
            }
        };
        loadDepartments();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(0); // Reset to first page on new search
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load programmes
    const loadProgrammes = useCallback(async () => {
        try {
            setLoading(true);
            const skip = currentPage * pageSize;

            // Always use search endpoint for filtering and sorting
            const response: any = await adminAPI.programmes.search({
                q: debouncedSearch || undefined,
                department_id: selectedDepartmentId !== 'all' ? selectedDepartmentId : undefined,
                sort_by: sortBy,
                sort_order: sortOrder,
                skip,
                limit: pageSize,
            });

            if (response.data?.data) {
                const data = response.data.data;
                setProgrammes(data.items || []);
                setTotal(data.total || 0);

                // Calculate stats using backend count fields
                const items = data.items || [];
                const totalCourses = items.reduce((sum: number, prog: any) => {
                    return sum + (prog.courses_count || 0);
                }, 0);
                const totalDepartments = items.reduce((sum: number, prog: any) => {
                    return sum + (prog.departments_count || 0);
                }, 0);
                const totalExamPapers = items.reduce((sum: number, prog: any) => {
                    return sum + (prog.exam_papers_count || 0);
                }, 0);
                const avgCourses = items.length > 0 ? totalCourses / items.length : 0;

                setStats({
                    totalProgrammes: data.total || 0,
                    totalCourses,
                    totalDepartments,
                    totalExamPapers,
                    averageCourses: Number(avgCourses.toFixed(1)),
                });
            }
        } catch (error) {
            console.error('Error loading programmes:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load programmes',
                message: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedSearch, selectedDepartmentId, sortBy, sortOrder, addNotification]);

    useEffect(() => {
        loadProgrammes();
    }, [loadProgrammes]);

    // Handle delete
    const handleDelete = async () => {
        if (!selectedProgramme) return;

        try {
            await adminAPI.programmes.delete(selectedProgramme.id);
            addNotification({
                type: 'success',
                title: 'Programme deleted',
                message: `${selectedProgramme.name} has been deleted successfully.`,
            });
            setShowDeleteDialog(false);
            setSelectedProgramme(null);
            loadProgrammes();
        } catch (error: any) {
            console.error('Error deleting programme:', error);
            addNotification({
                type: 'error',
                title: 'Failed to delete programme',
                message: error.message || 'Please try again later.',
            });
        }
    };

    // Table columns
    const columns = [
        {
            key: 'name' as keyof ProgrammeRead,
            header: 'Programme Name',
            cell: (programme: ProgrammeRead) => (
                <div>
                    <div className="font-medium">{programme.name}</div>
                    {programme.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]" title={programme.description}>
                            {programme.description.length > 50
                                ? `${programme.description.substring(0, 50)}...`
                                : programme.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'departments' as keyof ProgrammeRead,
            header: 'Department',
            cell: (programme: ProgrammeRead) => {
                // Handle departments as array
                const departments = programme.departments || [];
                if (departments.length === 0) {
                    return <span className="text-sm text-muted-foreground">N/A</span>;
                }

                return (
                    <div className="text-sm">
                        {departments.map((dept: any, index) => (
                            <div key={dept.id || index}>
                                <div>{dept.name}</div>
                                {dept.faculty && (
                                    <div className="text-xs text-muted-foreground">{dept.faculty.name}</div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'courses_count' as keyof ProgrammeRead,
            header: 'Courses',
            cell: (programme: ProgrammeRead) => (
                <div className="text-center">
                    <Badge variant="secondary">
                        {programme.courses_count || 0}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'exam_papers_count' as keyof ProgrammeRead,
            header: 'Exam Papers',
            cell: (programme: ProgrammeRead) => (
                <div className="text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {programme.exam_papers_count || 0}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'id' as keyof ProgrammeRead,
            header: 'Actions',
            cell: (programme: ProgrammeRead) => (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/institutions/programmes/${programme.id}`);
                        }}
                    >
                        View
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProgramme(programme);
                            setShowEditModal(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProgramme(programme);
                            setShowDeleteDialog(true);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    if (loading && programmes.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AdminBreadcrumb
                currentPage="Programmes"
                items={[
                    { label: 'Institutions', href: '/dashboard/institutions' },
                ]}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Programmes</h1>
                    <p className="text-muted-foreground">Manage academic programmes across departments</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Programme
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Programmes</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProgrammes}</div>
                        <p className="text-xs text-muted-foreground">Academic programmes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">Across all programmes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Exam Papers</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalExamPapers}</div>
                        <p className="text-xs text-muted-foreground">Across all programmes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDepartments}</div>
                        <p className="text-xs text-muted-foreground">With programmes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        {/* Search and Filters Row */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search programmes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Department Filter */}
                            <Select
                                value={selectedDepartmentId}
                                onValueChange={(value) => {
                                    setSelectedDepartmentId(value);
                                    setCurrentPage(0);
                                }}
                            >
                                <SelectTrigger className="w-full lg:w-[250px]">
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Sort By */}
                            <Select
                                value={sortBy}
                                onValueChange={(value: 'name' | 'created_at') => {
                                    setSortBy(value);
                                    setCurrentPage(0);
                                }}
                            >
                                <SelectTrigger className="w-full lg:w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="created_at">Date Created</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort Order */}
                            <Select
                                value={sortOrder}
                                onValueChange={(value: 'asc' | 'desc') => {
                                    setSortOrder(value);
                                    setCurrentPage(0);
                                }}
                            >
                                <SelectTrigger className="w-full lg:w-[150px]">
                                    <SelectValue placeholder="Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">Ascending</SelectItem>
                                    <SelectItem value="desc">Descending</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Clear Filters Button */}
                            {(searchQuery || selectedDepartmentId !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedDepartmentId('all');
                                        setSortBy('name');
                                        setSortOrder('asc');
                                        setCurrentPage(0);
                                    }}
                                    className="whitespace-nowrap"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {!loading && programmes.length === 0 && !searchQuery ? (
                        <div className="py-12">
                            <EmptyState
                                icon={GraduationCap}
                                title="No programmes found"
                                description="Create your first programme to get started"
                            />
                            <div className="flex justify-center mt-4">
                                <Button onClick={() => setShowCreateModal(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Programme
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={programmes}
                            loading={loading}
                            searchable={false}
                            emptyMessage={searchQuery ? 'No programmes match your search' : 'No programmes found'}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: Math.ceil(total / pageSize),
                                totalItems: total,
                                pageSize: pageSize,
                                onPageChange: (newPage: number) => setCurrentPage(newPage),
                                onPageSizeChange: (newSize: number) => {
                                    setPageSize(newSize);
                                    setCurrentPage(0); // Reset to first page when changing page size
                                },
                            }}
                            onRowClick={(programme) => router.push(`/dashboard/institutions/programmes/${programme.id}`)}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Programme</DialogTitle>
                        <DialogDescription>
                            Add a new academic programme to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <ProgrammeForm
                        mode="create"
                        onSuccess={() => {
                            setShowCreateModal(false);
                            loadProgrammes();
                        }}
                        onCancel={() => setShowCreateModal(false)}
                        embedded={true}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Programme</DialogTitle>
                        <DialogDescription>
                            Update programme information.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProgramme && (
                        <ProgrammeForm
                            programme={selectedProgramme}
                            mode="edit"
                            onSuccess={() => {
                                setShowEditModal(false);
                                setSelectedProgramme(null);
                                loadProgrammes();
                            }}
                            onCancel={() => {
                                setShowEditModal(false);
                                setSelectedProgramme(null);
                            }}
                            embedded={true}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Programme?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedProgramme?.name}"? This action cannot be undone.
                            All associated courses will be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedProgramme(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Programme
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

