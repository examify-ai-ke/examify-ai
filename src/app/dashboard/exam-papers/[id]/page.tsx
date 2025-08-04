'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Download, Calendar, Clock, Building2, BookOpen, FileText, Users, Tag, Eye, Plus, ChevronDown, ChevronUp, MessageSquare, MapPin, GraduationCap, Hash, ListChecks } from 'lucide-react'

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
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

    const examPaperId = params.id as string

    // Helper functions for question expansion
    const toggleQuestionExpansion = (questionId: string) => {
        setExpandedQuestions(prev => {
            const newSet = new Set(prev)
            if (newSet.has(questionId)) {
                newSet.delete(questionId)
            } else {
                newSet.add(questionId)
            }
            return newSet
        })
    }

    const isQuestionExpanded = (questionId: string) => expandedQuestions.has(questionId)

    // Helper function to render question text from Editor.js format
    const renderQuestionText = (textData: any) => {
        if (!textData || !textData.blocks) return 'No question text available'

        return textData.blocks.map((block: any, index: number) => {
            if (block.type === 'paragraph') {
                return <p key={index} className="mb-2">{block.data.text}</p>
            }
            return <div key={index}>{block.data.text || ''}</div>
        })
    }

    // Helper function to truncate long text
    const truncateText = (text: string, maxLength: number = 150) => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

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
            <div className="relative min-h-96 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3Ccircle cx='10' cy='50' r='2'/%3E%3Ccircle cx='50' cy='10' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/40"></div>

                {/* Content */}
                <div className="relative container mx-auto px-6 py-10 min-h-full flex flex-col justify-between">
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

                    <div className="space-y-6">
                        {/* Title and Description */}
                        <div className="text-center lg:text-left">
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 mb-4">
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
                            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 leading-tight">
                                {(examPaper.title as any)?.name || (examPaper.title as any)?.title || 'Untitled Exam'}
                            </h1>
                            <p className="text-white/80 text-base lg:text-lg max-w-4xl mx-auto lg:mx-0 leading-relaxed mb-6">
                                {(examPaper.description as any)?.name || (examPaper.description as any)?.description || 'No description available'}
                            </p>
                        </div>

                        {/* Exam Information and Statistics Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Exam Information Card */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-blue-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Exam Information</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-white/60" />
                                        <div className="flex-1">
                                            <span className="text-white/70 text-sm block">Exam Date</span>
                                            <span className="text-white font-medium">{examPaper.exam_date || 'Not scheduled'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-white/60" />
                                        <div className="flex-1">
                                            <span className="text-white/70 text-sm block">Institution</span>
                                            <span className="text-white font-medium">{examPaper.institution?.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="h-4 w-4 text-white/60" />
                                        <div className="flex-1">
                                            <span className="text-white/70 text-sm block">Course</span>
                                            <span className="text-white font-medium">{examPaper.course?.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-white/60" />
                                        <div className="flex-1">
                                            <span className="text-white/70 text-sm block">Duration</span>
                                            <span className="text-white font-medium">{examPaper.exam_duration} minutes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Card */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <Eye className="h-5 w-5 text-green-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Statistics</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <BookOpen className="h-4 w-4 text-white/60" />
                                        </div>
                                        <div className="text-2xl font-bold text-white">{examPaper.modules?.length || 0}</div>
                                        <div className="text-white/70 text-xs">Modules</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <ListChecks className="h-4 w-4 text-white/60" />
                                        </div>
                                        <div className="text-2xl font-bold text-white">{examPaper.question_sets?.length || 0}</div>
                                        <div className="text-white/70 text-xs">Question Sets</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <FileText className="h-4 w-4 text-white/60" />
                                        </div>
                                        <div className="text-2xl font-bold text-white">{examPaper.instructions?.length || 0}</div>
                                        <div className="text-white/70 text-xs">Instructions</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <Hash className="h-4 w-4 text-white/60" />
                                        </div>
                                        <div className="text-2xl font-bold text-white">{examPaper.tags?.length || 0}</div>
                                        <div className="text-white/70 text-xs">Tags</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
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

                    {/* Questions Display */}
                    {examPaper.question_sets && examPaper.question_sets.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Questions
                                </CardTitle>
                                <CardDescription>
                                    All questions organized by sections
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {examPaper.question_sets.map((questionSet, setIndex) => (
                                        <div key={questionSet.id} className="space-y-4">
                                            {/* Question Set Header */}
                                            <div className="flex items-center gap-3 pb-3 border-b">
                                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                                                    {setIndex + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {(questionSet as any)?.title || `Question Set ${setIndex + 1}`}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(questionSet as any)?.questions_count || (questionSet as any)?.questions?.length || 0} questions
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Questions */}
                                            {(questionSet as any)?.questions && (questionSet as any).questions.length > 0 && (
                                                <div className="space-y-6 ml-4">
                                                    {(questionSet as any).questions.map((question: any, questionIndex: number) => {
                                                        const questionText = renderQuestionText(question.text)
                                                        const questionTextString = question.text?.blocks?.map((b: any) => b.data.text).join(' ') || ''
                                                        const isLongQuestion = questionTextString.length > 150
                                                        const isExpanded = isQuestionExpanded(question.id)

                                                        return (
                                                            <div key={question.id} className="space-y-4 p-4 border rounded-lg bg-slate-50/50">
                                                                {/* Question Header */}
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-start gap-3 flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {question.question_number || `Q${questionIndex + 1}`}
                                                                            </Badge>
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {question.marks} marks
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                    {isLongQuestion && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => toggleQuestionExpansion(question.id)}
                                                                            className="ml-2"
                                                                        >
                                                                            {isExpanded ? (
                                                                                <>
                                                                                    <ChevronUp className="h-4 w-4 mr-1" />
                                                                                    Collapse
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <ChevronDown className="h-4 w-4 mr-1" />
                                                                                    Expand
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                </div>

                                                                {/* Question Text */}
                                                                <div className="prose prose-sm max-w-none">
                                                                    {isLongQuestion && !isExpanded ? (
                                                                        <div>
                                                                            <p>{truncateText(questionTextString)}</p>
                                                                        </div>
                                                                    ) : (
                                                                        questionText
                                                                    )}
                                                                </div>

                                                                {/* Sub-questions */}
                                                                {question.children && question.children.length > 0 && (
                                                                    <div className="ml-6 space-y-3 border-l-2 border-muted pl-4">
                                                                        {question.children.map((subQuestion: any, subIndex: number) => {
                                                                            const subQuestionText = renderQuestionText(subQuestion.text)
                                                                            const subQuestionTextString = subQuestion.text?.blocks?.map((b: any) => b.data.text).join(' ') || ''
                                                                            const isSubLongQuestion = subQuestionTextString.length > 150
                                                                            const isSubExpanded = isQuestionExpanded(subQuestion.id)

                                                                            return (
                                                                                <div key={subQuestion.id} className="space-y-2 p-3 bg-white rounded border">
                                                                                    <div className="flex items-start justify-between">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Badge variant="outline" className="text-xs">
                                                                                                {subQuestion.question_number || `${question.question_number || questionIndex + 1}.${subIndex + 1}`}
                                                                                            </Badge>
                                                                                            <Badge variant="secondary" className="text-xs">
                                                                                                {subQuestion.marks} marks
                                                                                            </Badge>
                                                                                        </div>
                                                                                        {isSubLongQuestion && (
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                onClick={() => toggleQuestionExpansion(subQuestion.id)}
                                                                                                className="ml-2"
                                                                                            >
                                                                                                {isSubExpanded ? (
                                                                                                    <>
                                                                                                        <ChevronUp className="h-4 w-4 mr-1" />
                                                                                                        Collapse
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <ChevronDown className="h-4 w-4 mr-1" />
                                                                                                        Expand
                                                                                                    </>
                                                                                                )}
                                                                                            </Button>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="prose prose-sm max-w-none">
                                                                                        {isSubLongQuestion && !isSubExpanded ? (
                                                                                            <div>
                                                                                                <p>{truncateText(subQuestionTextString)}</p>
                                                                                            </div>
                                                                                        ) : (
                                                                                            subQuestionText
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Sub-question Answers */}
                                                                                    {subQuestion.answers && subQuestion.answers.length > 0 && (
                                                                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                                <MessageSquare className="h-4 w-4 text-green-600" />
                                                                                                <span className="text-sm font-medium text-green-800">Answer:</span>
                                                                                            </div>
                                                                                            {subQuestion.answers.map((answer: any, answerIndex: number) => (
                                                                                                <div key={answerIndex} className="text-sm text-green-700">
                                                                                                    {renderQuestionText(answer.text)}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {/* Main Question Answers */}
                                                                {question.answers && question.answers.length > 0 && (
                                                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <MessageSquare className="h-4 w-4 text-green-600" />
                                                                            <span className="text-sm font-medium text-green-800">Answer:</span>
                                                                        </div>
                                                                        {question.answers.map((answer: any, answerIndex: number) => (
                                                                            <div key={answerIndex} className="text-sm text-green-700">
                                                                                {renderQuestionText(answer.text)}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
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