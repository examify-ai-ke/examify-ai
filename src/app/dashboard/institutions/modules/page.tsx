'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, BookOpen, FileCheck, TrendingUp } from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import type { components } from '@/types/generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ModuleForm } from '@/components/forms/module-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb } from '@/components/ui/breadcrumb';

type ModuleRead = components['schemas']['ModuleRead'];

export default function ModulesPage() {
    const router = useRouter();
    const { addNotification } = useUIStore();

    // State
    const [modules, setModules] = useState<ModuleRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedUnitCode, setSelectedUnitCode] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalModules, setTotalModules] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingModule, setEditingModule] = useState<ModuleRead | null>(null);
    const [deletingModule, setDeletingModule] = useState<ModuleRead | null>(null);

    // Filters
    const [courses, setCourses] = useState<Array<{ id: string; name: string; course_acronym: string }>>([]);

    // Statistics
    const [stats, setStats] = useState({
        totalModules: 0,
        totalCourses: 0,
        totalExamPapers: 0,
        averageModulesPerCourse: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Refs to prevent duplicate calls
    const statsLoadedRef = useRef(false);
    const coursesLoadedRef = useRef(false);

    // Load statistics (memoized to prevent duplicate calls)
    const loadStats = useCallback(async () => {
        if (statsLoadedRef.current) return;
        statsLoadedRef.current = true;

        try {
            setStatsLoading(true);
            const response = await adminAPI.modules.getStats();
            if (response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error loading module statistics:', error);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // Load courses for filter (memoized to prevent duplicate calls)
    const loadCourses = useCallback(async () => {
        if (coursesLoadedRef.current) return;
        coursesLoadedRef.current = true;

        try {
            const response = await adminAPI.courses.list({ limit: 100 });
            if (response.data?.data) {
                const coursesData = Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data.data.items || [];
                setCourses(coursesData.map((course: any) => ({
                    id: course.id,
                    name: course.name,
                    course_acronym: course.course_acronym
                })));
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    }, []);

    // Load modules (memoized with dependencies)
    const loadModules = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {
                skip: currentPage * pageSize,
                limit: pageSize,
            };

            if (searchQuery.trim()) {
                params.q = searchQuery.trim();
            }
            if (selectedCourse) {
                params.course_id = selectedCourse;
            }
            if (selectedUnitCode.trim()) {
                params.unit_code = selectedUnitCode.trim();
            }

            const response = await adminAPI.modules.search(params);

            if (response.data?.data) {
                const responseData = response.data.data;
                const items = responseData.items || [];
                setModules(items);
                setTotalModules(responseData.total || 0);
                setTotalPages(responseData.pages || 0);
            } else {
                setModules([]);
                setTotalModules(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error loading modules:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load modules',
                message: 'Please try again later.',
            });
            setModules([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, selectedCourse, selectedUnitCode, addNotification]);

    // Initial load
    useEffect(() => {
        loadStats();
        loadCourses();
    }, []);

    // Reload modules when filters or pagination change
    useEffect(() => {
        loadModules();
    }, [currentPage, pageSize, searchQuery, selectedCourse, selectedUnitCode]);

    // Handle page size change
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0);
    };

    // Handle form success
    const handleFormSuccess = async () => {
        setShowCreateModal(false);
        setEditingModule(null);
        await loadModules();
        await loadStats();
    };

    // Handle delete
    const handleDeleteModule = async () => {
        if (!deletingModule) return;

        try {
            await adminAPI.modules.delete(deletingModule.id);
            addNotification({
                type: 'success',
                title: 'Module deleted',
                message: 'The module has been deleted successfully.',
            });
            setDeletingModule(null);
            await loadModules();
            await loadStats();
        } catch (error: any) {
            console.error('Error deleting module:', error);
            addNotification({
                type: 'error',
                title: 'Failed to delete module',
                message: error.message || 'Please try again later.',
            });
        }
    };

    // Table columns
    const columns = [
        {
            header: 'Unit Code',
            key: 'unit_code' as keyof ModuleRead,
            cell: (row: ModuleRead) => (
                <div className="font-medium">{row.unit_code}</div>
            ),
        },
        {
            header: 'Module Name',
            key: 'name' as keyof ModuleRead,
            cell: (row: ModuleRead) => (
                <div>
                    <div className="font-medium">{row.name}</div>
                    {row.description && (
                        <div className="text-sm text-gray-500 truncate max-w-md">
                            {row.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Courses',
            key: 'courses' as keyof ModuleRead,
            cell: (row: ModuleRead) => {
                const courseCount = row.courses?.length || 0;
                return (
                    <div className="space-y-1">
                        {courseCount > 0 ? (
                            <>
                                <Badge variant="secondary">{courseCount} course{courseCount !== 1 ? 's' : ''}</Badge>
                                <div className="text-xs text-gray-500 space-y-0.5">
                                    {row.courses?.slice(0, 2).map((course: any) => (
                                        <div key={course.id}>{course.course_acronym} - {course.name}</div>
                                    ))}
                                    {courseCount > 2 && (
                                        <div className="font-medium">+{courseCount - 2} more</div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Badge variant="outline">No courses</Badge>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Exam Papers',
            key: 'exam_papers' as keyof ModuleRead,
            cell: (row: ModuleRead) => {
                const paperCount = row.exam_papers_count || row.exam_papers?.length || 0;
                return (
                    <Badge variant={paperCount > 0 ? 'default' : 'outline'}>
                        {paperCount} paper{paperCount !== 1 ? 's' : ''}
                    </Badge>
                );
            },
        },
        {
            header: 'Actions',
            key: 'id' as keyof ModuleRead,
            cell: (row: ModuleRead) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/institutions/modules/${row.id}`)}
                    >
                        View
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingModule(row)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingModule(row)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    if (loading && modules.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Institutions', href: '/dashboard/institutions' },
                    { label: 'Modules' }
                ]}
                showHome={false}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Modules</h1>
                    <p className="text-gray-500 mt-1">
                        Manage course modules and their content
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Module
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <div className="text-2xl font-bold">{stats.totalModules}</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <div className="text-2xl font-bold">{stats.totalCourses}</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Exam Papers</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <div className="text-2xl font-bold">{stats.totalExamPapers}</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Modules/Course</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <div className="text-2xl font-bold">{stats.averageModulesPerCourse}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter Modules</CardTitle>
                    <CardDescription>
                        Search and filter modules by name, unit code, or course
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <Input
                                placeholder="Search by name or description..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(0);
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Unit Code</label>
                            <Input
                                placeholder="Search by unit code..."
                                value={selectedUnitCode}
                                onChange={(e) => {
                                    setSelectedUnitCode(e.target.value);
                                    setCurrentPage(0);
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Filter by Course</label>
                            <Select
                                value={selectedCourse || 'all'}
                                onValueChange={(value) => {
                                    setSelectedCourse(value === 'all' ? '' : value);
                                    setCurrentPage(0);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All courses</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.course_acronym} - {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(searchQuery || selectedCourse || selectedUnitCode) && (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500">Active filters:</span>
                            {searchQuery && (
                                <Badge variant="secondary">
                                    Search: {searchQuery}
                                </Badge>
                            )}
                            {selectedUnitCode && (
                                <Badge variant="secondary">
                                    Unit Code: {selectedUnitCode}
                                </Badge>
                            )}
                            {selectedCourse && (
                                <Badge variant="secondary">
                                    Course: {courses.find(c => c.id === selectedCourse)?.name}
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCourse('');
                                    setSelectedUnitCode('');
                                    setCurrentPage(0);
                                }}
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modules Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Modules ({totalModules})</CardTitle>
                    <CardDescription>
                        View and manage all modules in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {modules.length === 0 ? (
                        <EmptyState
                            title="No modules found"
                            description={
                                searchQuery || selectedCourse || selectedUnitCode
                                    ? 'Try adjusting your filters'
                                    : 'Get started by creating your first module'
                            }
                            action={
                                <Button onClick={() => setShowCreateModal(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Module
                                </Button>
                            }
                        />
                    ) : (
                        <DataTable
                            columns={columns}
                            data={modules}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: totalPages,
                                totalItems: totalModules,
                                pageSize: pageSize,
                                onPageChange: setCurrentPage,
                                onPageSizeChange: handlePageSizeChange,
                            }}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Create Module Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Module</DialogTitle>
                    </DialogHeader>
                    <ModuleForm
                        mode="create"
                        onSuccess={handleFormSuccess}
                        onCancel={() => setShowCreateModal(false)}
                        embedded={true}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Module Modal */}
            <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Module</DialogTitle>
                    </DialogHeader>
                    {editingModule && (
                        <ModuleForm
                            module={editingModule}
                            mode="edit"
                            onSuccess={handleFormSuccess}
                            onCancel={() => setEditingModule(null)}
                            embedded={true}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingModule} onOpenChange={() => setDeletingModule(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Module</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{deletingModule?.name}&quot;?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteModule} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

