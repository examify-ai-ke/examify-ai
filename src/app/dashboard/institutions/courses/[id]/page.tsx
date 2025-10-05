'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    BookOpen,
    Users,
    Calendar,
    Building2,
    FileText,
    BarChart3,
    Edit,
    Trash2,
    ArrowLeft,
    Eye,
    Plus,
    GraduationCap,
    Library,
    Clock,
    Award,
    Unlink
} from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { useUIStore } from '@/stores/ui';
import { CourseRead } from '@/types/generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ModuleForm } from '@/components/forms/module-form';
import { AddModulesToCourse } from '@/components/forms/add-modules-to-course';

// Mock data for development/offline use
const mockCourse: CourseRead = {
    id: '1',
    name: 'Introduction to Computer Science',
    description: 'This comprehensive course introduces students to the fundamental concepts of computer science and programming. Students will learn about algorithms, data structures, programming paradigms, and software development principles. The course combines theoretical knowledge with practical hands-on programming exercises.',
    course_acronym: 'CS101',
    programme: {
        id: '1',
        name: 'Bachelor of Computer Science',
        description: 'Comprehensive computer science program covering software development, algorithms, and computer systems',
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
    modules: [
        {
            id: '1',
            name: 'Programming Fundamentals',
            description: 'Basic programming concepts and syntax'
        },
        {
            id: '2',
            name: 'Data Structures',
            description: 'Arrays, linked lists, stacks, and queues'
        },
        {
            id: '3',
            name: 'Algorithms',
            description: 'Sorting, searching, and algorithm analysis'
        }
    ],
    exam_papers: [
        {
            id: '1',
            title: 'CS101 Midterm Exam 2023',
            year: '2023',
            duration: 120,
            total_marks: 100
        },
        {
            id: '2',
            title: 'CS101 Final Exam 2023',
            year: '2023',
            duration: 180,
            total_marks: 150
        }
    ],
    image: null
};

interface CourseDetailsPageProps { }

const CourseDetailsPage: React.FC<CourseDetailsPageProps> = () => {
    const params = useParams();
    const router = useRouter();
    const { addNotification } = useUIStore();

    const courseId = params.id as string;

    // State management
    const [course, setCourse] = useState<CourseRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddModuleModal, setShowAddModuleModal] = useState(false);
    const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
    const [showAddExamPaperModal, setShowAddExamPaperModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [moduleToUnlink, setModuleToUnlink] = useState<string | null>(null);

    // Load course data
    const loadCourse = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.courses.getById(courseId);

            if (response.data && response.data.data) {
                setCourse(response.data.data);
            } else {
                setCourse(null);
            }
        } catch (error) {
            console.error('Error loading course:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load course',
                message: 'Please try again later.',
            });
            setCourse(null);
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    // Handle course actions
    const handleEditCourse = () => {
        router.push(`/dashboard/institutions/courses/${courseId}/edit`);
    };

    const handleDeleteCourse = async () => {
        try {
            await adminAPI.courses.delete(courseId);
            addNotification({
                type: 'success',
                title: 'Course deleted',
                message: 'The course has been deleted successfully.',
            });
            router.push('/dashboard/institutions/courses');
        } catch (error: any) {
            console.error('Error deleting course:', error);
            addNotification({
                type: 'error',
                title: 'Failed to delete course',
                message: error.message || 'Please try again later.',
            });
        }
        setShowDeleteDialog(false);
    };

    const handleViewModule = (moduleId: string) => {
        router.push(`/dashboard/institutions/modules/${moduleId}`);
    };

    const handleUnlinkModule = async () => {
        if (!moduleToUnlink) return;

        try {
            await adminAPI.courses.removeModule(courseId, moduleToUnlink);
            addNotification({
                type: 'success',
                title: 'Module unlinked',
                message: 'The module has been removed from this course.',
            });
            setModuleToUnlink(null);
            loadCourse();
        } catch (error: any) {
            console.error('Error unlinking module:', error);
            addNotification({
                type: 'error',
                title: 'Failed to unlink module',
                message: error.message || 'Please try again later.',
            });
        }
    };

    const handleViewExamPaper = (examPaperId: string) => {
        router.push(`/dashboard/exam-papers/${examPaperId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto py-6">
                <AdminBreadcrumb
                    items={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: 'Courses', href: '/dashboard/institutions/courses' },
                        { label: 'Course Details', href: '#' }
                    ]}
                />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto py-6">
                <AdminBreadcrumb
                    items={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: 'Courses', href: '/dashboard/institutions/courses' },
                        { label: 'Course Details', href: '#' }
                    ]}
                />
                <EmptyState
                    icon={BookOpen}
                    title="Course not found"
                    description="The course you're looking for doesn't exist or has been removed."
                    action={
                        <Button onClick={() => router.push('/dashboard/institutions/courses')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Hero Section */}
            <div className="relative h-72 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zM10 10c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zM90 90c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/30"></div>

                {/* Content */}
                <div className="relative container mx-auto px-6 py-8 h-full flex flex-col justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard/institutions/courses')}
                            className="text-white/90 hover:text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Badge className="bg-blue-500/90 text-white border-0 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                                    {course.course_acronym}
                                </Badge>
                                <Badge variant="outline" className="bg-white/10 text-white/90 border-white/30 backdrop-blur-sm px-3 py-1.5">
                                    {course.programme?.department?.faculty?.institution?.name}
                                </Badge>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                                {course.name}
                            </h1>
                            <p className="text-white/80 text-lg max-w-3xl leading-relaxed">
                                {course.description}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:gap-2">
                            <Button
                                onClick={handleEditCourse}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Course
                            </Button>
                            <Button
                                onClick={() => setShowDeleteDialog(true)}
                                variant="destructive"
                                className="bg-red-600/90 hover:bg-red-700 text-white border-0"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                <AdminBreadcrumb
                    items={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: 'Courses', href: '/dashboard/institutions/courses' },
                        { label: course.name, href: '#' }
                    ]}
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Modules</p>
                                    <p className="text-2xl font-bold">{course.modules?.length || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Exam Papers</p>
                                    <p className="text-2xl font-bold">{course.exam_papers?.length || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <GraduationCap className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Programme</p>
                                    <p className="text-lg font-semibold truncate">{course.programme?.name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Department</p>
                                    <p className="text-lg font-semibold truncate">{course.programme?.department?.name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="modules">Modules</TabsTrigger>
                        <TabsTrigger value="exam-papers">Exam Papers</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Course Information */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        Course Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-sm text-muted-foreground">Course Code</h4>
                                            <p className="font-semibold">{course.course_acronym}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm text-muted-foreground">Programme</h4>
                                            <p className="font-semibold">{course.programme?.name}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Hierarchy Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Academic Hierarchy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                            <Building2 className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium">Institution</p>
                                                <p className="text-sm text-muted-foreground">{course.programme?.department?.faculty?.institution?.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                            <GraduationCap className="h-4 w-4 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium">Faculty</p>
                                                <p className="text-sm text-muted-foreground">{course.programme?.department?.faculty?.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                            <Library className="h-4 w-4 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-medium">Department</p>
                                                <p className="text-sm text-muted-foreground">{course.programme?.department?.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                                            <BookOpen className="h-4 w-4 text-orange-600" />
                                            <div>
                                                <p className="text-sm font-medium">Programme</p>
                                                <p className="text-sm text-muted-foreground">{course.programme?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Modules Tab */}
                    <TabsContent value="modules" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <Library className="h-5 w-5" />
                                        Course Modules ({course.modules?.length || 0})
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowCreateModuleModal(true)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create New
                                        </Button>
                                        <Button size="sm" onClick={() => setShowAddModuleModal(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Existing
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {course.modules && course.modules.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {course.modules.map((module) => (
                                            <Card
                                                key={module.id}
                                                className="hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => handleViewModule(module.id)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold mb-1">{module.name}</h4>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {module.unit_code}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewModule(module.id);
                                                                }}
                                                                title="View module details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setModuleToUnlink(module.id);
                                                                }}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                title="Remove module from course"
                                                            >
                                                                <Unlink className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Library}
                                        title="No modules yet"
                                        description="This course doesn't have any modules assigned yet."
                                        action={
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowCreateModuleModal(true)}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create New Module
                                                </Button>
                                                <Button onClick={() => setShowAddModuleModal(true)}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Existing Module
                                                </Button>
                                            </div>
                                        }
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Exam Papers Tab */}
                    <TabsContent value="exam-papers" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Exam Papers ({course.exam_papers?.length || 0})
                                    </CardTitle>
                                    <Button size="sm" onClick={() => setShowAddExamPaperModal(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Exam Paper
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {course.exam_papers && course.exam_papers.length > 0 ? (
                                    <div className="space-y-4">
                                        {course.exam_papers.map((examPaper) => (
                                            <Card
                                                key={examPaper.id}
                                                className="hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => handleViewExamPaper(examPaper.id)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold mb-1">{examPaper.title?.name || 'Untitled'}</h4>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {examPaper.description?.name || 'No description'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewExamPaper(examPaper.id);
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/dashboard/exam-papers/${examPaper.id}/edit`);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={FileText}
                                        title="No exam papers yet"
                                        description="This course doesn't have any exam papers yet."
                                        action={
                                            <Button onClick={() => setShowAddExamPaperModal(true)}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add First Exam Paper
                                            </Button>
                                        }
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Course Statistics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                            <span className="font-medium">Total Modules</span>
                                            <Badge variant="secondary">{course.modules?.length || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="font-medium">Total Exam Papers</span>
                                            <Badge variant="secondary">{course.exam_papers?.length || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                            <span className="font-medium">Average Exam Duration</span>
                                            <Badge variant="secondary">
                                                {course.exam_papers && course.exam_papers.length > 0
                                                    ? Math.round(course.exam_papers.reduce((acc, paper) => acc + paper.duration, 0) / course.exam_papers.length)
                                                    : 0} min
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Course updated</p>
                                                <p className="text-xs text-muted-foreground">2 hours ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">New exam paper added</p>
                                                <p className="text-xs text-muted-foreground">1 day ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Module created</p>
                                                <p className="text-xs text-muted-foreground">3 days ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Add Existing Modules Modal */}
            <Dialog open={showAddModuleModal} onOpenChange={setShowAddModuleModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Add Existing Modules to Course</DialogTitle>
                        <DialogDescription>
                            Search and select existing modules to add to this course. You can select multiple modules at once.
                        </DialogDescription>
                    </DialogHeader>
                    <AddModulesToCourse
                        courseId={courseId}
                        existingModuleIds={course?.modules?.map(m => m.id) || []}
                        onSuccess={() => {
                            setShowAddModuleModal(false);
                            loadCourse();
                        }}
                        onCancel={() => setShowAddModuleModal(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Create New Module Modal */}
            <Dialog open={showCreateModuleModal} onOpenChange={setShowCreateModuleModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Module</DialogTitle>
                        <DialogDescription>
                            Create a new module and link it to this course
                        </DialogDescription>
                    </DialogHeader>
                    <ModuleForm
                        courseId={courseId}
                        mode="create"
                        onSuccess={() => {
                            setShowCreateModuleModal(false);
                            loadCourse();
                        }}
                        onCancel={() => setShowCreateModuleModal(false)}
                        embedded={true}
                    />
                </DialogContent>
            </Dialog>

            {/* Add Exam Paper Modal (Placeholder) */}
            <Dialog open={showAddExamPaperModal} onOpenChange={setShowAddExamPaperModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Exam Paper</DialogTitle>
                        <DialogDescription>
                            Exam paper creation functionality coming soon!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 text-center text-muted-foreground">
                        <p>Exam paper form will be implemented here.</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setShowAddExamPaperModal(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Course Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the course "{course?.name}".
                            This action cannot be undone. All associated modules and exam papers will be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCourse}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Course
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Unlink Module Confirmation */}
            <AlertDialog open={!!moduleToUnlink} onOpenChange={(open) => !open && setModuleToUnlink(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Module from Course?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will unlink the module from this course. The module itself will not be deleted
                            and can be added back to this course later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnlinkModule}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remove Module
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CourseDetailsPage; 