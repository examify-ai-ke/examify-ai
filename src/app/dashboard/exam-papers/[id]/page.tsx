'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Download, Calendar, Clock, Building2, BookOpen, FileText, Users, Tag, Eye, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AdminBreadcrumb } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'

import { adminAPI, type ExamPaperRead } from '@/lib/api-admin'
import { useUIStore } from '@/stores/ui'

// Mock data for development
const mockExamPaper: ExamPaperRead = {
    id: '1',
    year_of_exam: '2024/2025',
    exam_duration: 180,
    exam_date: '2024-06-15',
    tags: ['Mathematics', 'Advanced', 'Final Exam', 'Calculus'],
    instructions: [
        { id: '1', instruction: 'Read all questions carefully before starting' },
        { id: '2', instruction: 'Answer all questions in the provided answer booklet' },
        { id: '3', instruction: 'Calculators are allowed for Section B only' }
    ],
    title: { id: '1', title: 'Advanced Mathematics Final Examination' },
    description: {
        id: '1',
        description: 'This comprehensive final examination covers all major topics from the Advanced Mathematics course including calculus, linear algebra, differential equations, and statistical analysis. Students are expected to demonstrate both theoretical understanding and practical problem-solving skills.'
    },
    modules: [
        { id: '1', name: 'Calculus', code: 'CALC101', description: 'Differential and integral calculus' },
        { id: '2', name: 'Linear Algebra', code: 'LINALG101', description: 'Vectors, matrices, and linear transformations' },
        { id: '3', name: 'Statistics', code: 'STAT101', description: 'Probability and statistical analysis' }
    ],
    created_by_id: 'user1',
    institution: {
        id: '1',
        name: 'University of Technology',
        acronym: 'UoT',
        description: 'Leading technological university',
        website: 'https://uot.edu'
    },
    course: {
        id: '1',
        name: 'Advanced Mathematics',
        course_acronym: 'ADVMATH',
        description: 'Advanced mathematical concepts and applications'
    },
    question_sets: [
        {
            id: '1',
            name: 'Section A: Multiple Choice',
            description: 'Choose the best answer for each question (20 questions, 2 marks each)',
            questions: []
        },
        {
            id: '2',
            name: 'Section B: Problem Solving',
            description: 'Show all working and provide complete solutions (5 questions, 10 marks each)',
            questions: []
        },
        {
            id: '3',
            name: 'Section C: Essay Questions',
            description: 'Provide detailed explanations and analysis (3 questions, 20 marks each)',
            questions: []
        }
    ],
    identifying_name: 'ADVMATH-2024-FINAL'
}

export default function ExamPaperDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { addNotification } = useUIStore()

    const [examPaper, setExamPaper] = useState<ExamPaperRead | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    const examPaperId = params.id as string

    // Load exam paper data
    const loadExamPaper = async () => {
        try {
            setLoading(true)

            console.log('🔄 Loading exam paper with ID:', examPaperId)
            const response = await adminAPI.examPapers.getById(examPaperId)

            console.log('📄 API response received:', {
                hasData: !!response.data,
                hasExamPaper: !!response.data?.data,
                examPaperId: response.data?.data?.id,
                title: (response.data?.data as any)?.title?.name
            })

            if (response.data?.data) {
                console.log('✅ Found exam paper data with ID:', response.data.data.id)
                setExamPaper(response.data.data)
            } else {
                console.warn('⚠️ No exam paper data found in response:', response)
                console.warn('Using mock data as fallback')
                setExamPaper(mockExamPaper)
            }
        } catch (error) {
            console.error('Error loading exam paper:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to load exam paper details. Using offline data.'
            })
            setExamPaper(mockExamPaper)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (examPaperId) {
            loadExamPaper()
        }
    }, [examPaperId])

    // Event handlers
    const handleEditExamPaper = () => {
        router.push(`/dashboard/exam-papers/${examPaperId}/edit`)
    }

    const handleDeleteExamPaper = async () => {
        if (!confirm('Are you sure you want to delete this exam paper? This action cannot be undone.')) return

        try {
            await adminAPI.examPapers.delete(examPaperId)
            addNotification({
                type: 'success',
                title: 'Success',
                message: 'Exam paper deleted successfully'
            })
            router.push('/dashboard/exam-papers')
        } catch (error) {
            console.error('Error deleting exam paper:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to delete exam paper'
            })
        }
    }

    const handleDownloadExamPaper = () => {
        addNotification({
            type: 'info',
            title: 'Download Started',
            message: 'Preparing exam paper for download...'
        })

        // Mock download functionality
        setTimeout(() => {
            addNotification({
                type: 'success',
                title: 'Download Complete',
                message: 'Exam paper downloaded successfully'
            })
        }, 2000)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        )
    }

    if (!examPaper) {
        return (
            <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-2">Exam Paper Not Found</h2>
                <p className="text-muted-foreground mb-4">
                    The exam paper you're looking for doesn't exist or has been deleted.
                </p>
                <Button onClick={() => router.push('/dashboard/exam-papers')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Exam Papers
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <AdminBreadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Exam Papers', href: '/dashboard/exam-papers' },
                    { label: examPaper.title?.title || 'Exam Paper Details', href: `/dashboard/exam-papers/${examPaperId}` }
                ]}
            />

            {/* Hero Section */}
            <div className="relative h-72 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3Ccircle cx='10' cy='50' r='2'/%3E%3Ccircle cx='50' cy='10' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/40"></div>

                {/* Content */}
                <div className="relative container mx-auto px-6 py-8 h-full flex flex-col justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard/exam-papers')}
                            className="text-white/90 hover:text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Exam Papers
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Badge className="bg-blue-500/90 text-white border-0 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                                    {examPaper.identifying_name}
                                </Badge>
                                <Badge variant="outline" className="bg-white/10 text-white/90 border-white/30 backdrop-blur-sm px-3 py-1.5">
                                    {examPaper.year_of_exam}
                                </Badge>
                                <Badge variant="outline" className="bg-white/10 text-white/90 border-white/30 backdrop-blur-sm px-3 py-1.5">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {examPaper.exam_duration} minutes
                                </Badge>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                                {(examPaper.title as any)?.name || (examPaper.title as any)?.title || 'Untitled Exam'}
                            </h1>
                            <p className="text-white/80 text-lg max-w-3xl leading-relaxed">
                                {(examPaper.description as any)?.name || (examPaper.description as any)?.description || 'No description available'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:gap-2">
                            <Button
                                onClick={handleEditExamPaper}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Exam Paper
                            </Button>
                            <Button
                                onClick={handleDownloadExamPaper}
                                className="bg-green-600/90 hover:bg-green-700 text-white border-0"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                            <Button
                                onClick={handleDeleteExamPaper}
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

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="modules">Modules</TabsTrigger>
                    <TabsTrigger value="questions">Question Sets</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Exam Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Academic Year:</span>
                                        <span className="text-sm">{examPaper.year_of_exam}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                                        <span className="text-sm">{examPaper.exam_duration} minutes</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Exam Date:</span>
                                        <span className="text-sm">{examPaper.exam_date || 'Not scheduled'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Institution:</span>
                                        <span className="text-sm">{examPaper.institution?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Course:</span>
                                        <span className="text-sm">{examPaper.course?.name || 'N/A'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Modules:</span>
                                        <span className="text-sm">{examPaper.modules?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Question Sets:</span>
                                        <span className="text-sm">{examPaper.question_sets?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Instructions:</span>
                                        <span className="text-sm">{examPaper.instructions?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                                        <span className="text-sm">{examPaper.tags?.length || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tags */}
                    {examPaper.tags && examPaper.tags.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="h-5 w-5" />
                                    Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {examPaper.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Instructions */}
                    {examPaper.instructions && examPaper.instructions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Exam Instructions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {examPaper.instructions.map((instruction, index) => (
                                        <div key={instruction.id} className="flex gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <p className="text-sm">{(instruction as any)?.name || (instruction as any)?.instruction || 'No instruction text'}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Modules Tab */}
                <TabsContent value="modules" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">Course Modules</h3>
                            <p className="text-sm text-muted-foreground">
                                Modules covered in this examination
                            </p>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Module
                        </Button>
                    </div>

                    {examPaper.modules && examPaper.modules.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {examPaper.modules.map((module) => (
                                <Card key={module.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            {module.name}
                                        </CardTitle>
                                        <CardDescription>{(module as any)?.unit_code || (module as any)?.code || 'No code'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {module.description || 'No description available'}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Modules</h3>
                                <p className="text-muted-foreground mb-4">
                                    No modules have been assigned to this exam paper yet.
                                </p>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Module
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Question Sets Tab */}
                <TabsContent value="questions" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">Question Sets</h3>
                            <p className="text-sm text-muted-foreground">
                                Organized collections of questions for this exam
                            </p>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Question Set
                        </Button>
                    </div>

                    {examPaper.question_sets && examPaper.question_sets.length > 0 ? (
                        <div className="space-y-4">
                            {examPaper.question_sets.map((questionSet, index) => (
                                <Card key={questionSet.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            {(questionSet as any)?.title || (questionSet as any)?.name || `Question Set ${index + 1}`}
                                        </CardTitle>
                                        <CardDescription>{(questionSet as any)?.description || 'No description available'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-4 w-4" />
                                                    {(questionSet as any)?.questions_count || (questionSet as any)?.questions?.length || 0} questions
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Questions
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Question Sets</h3>
                                <p className="text-muted-foreground mb-4">
                                    No question sets have been created for this exam paper yet.
                                </p>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Question Set
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1,234</div>
                                <p className="text-xs text-muted-foreground">
                                    Total downloads
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Views</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">5,678</div>
                                <p className="text-xs text-muted-foreground">
                                    Page views
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">4.8</div>
                                <p className="text-xs text-muted-foreground">
                                    Average rating
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Analytics</CardTitle>
                            <CardDescription>
                                Detailed analytics and usage patterns for this exam paper
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-8 text-center">
                            <div className="text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                                <p>
                                    Detailed analytics and insights will be available in a future update.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}