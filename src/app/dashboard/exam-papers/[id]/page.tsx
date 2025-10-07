'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Download, Calendar, Clock, Building2, BookOpen, FileText, Users, Tag, Eye, Plus, ChevronDown, ChevronUp, MessageSquare, MapPin, GraduationCap, Hash, ListChecks, Unlink, AlertCircle, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AdminBreadcrumb } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

import { adminAPI, type ExamPaperRead } from '@/lib/api-admin'
import { useUIStore } from '@/stores/ui'
import { ModuleSelector } from '@/components/features/module-selector'
import { QuestionSetSelector } from '@/components/features/question-set-selector'
import { parseQuestionSetsResponse, logResponseStructure, sanitizeQuestionSetData } from '@/lib/api-response-utils'
import { executeAPICall, handleAPIError, apiPerformanceMonitor } from '@/lib/api-error-handler'

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
    const [showAddModuleDialog, setShowAddModuleDialog] = useState(false)
    const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([])
    const [showUnlinkConfirmDialog, setShowUnlinkConfirmDialog] = useState(false)
    const [moduleToUnlink, setModuleToUnlink] = useState<{ id: string; name: string } | null>(null)
    const [addingModules, setAddingModules] = useState(false)
    const [showAddQuestionSetDialog, setShowAddQuestionSetDialog] = useState(false)
    const [selectedQuestionSetIds, setSelectedQuestionSetIds] = useState<string[]>([])
    const [showUnlinkQuestionSetDialog, setShowUnlinkQuestionSetDialog] = useState(false)
    const [questionSetToUnlink, setQuestionSetToUnlink] = useState<{ id: string; name: string } | null>(null)
    const [addingQuestionSets, setAddingQuestionSets] = useState(false)
    const [questionSetsWithCounts, setQuestionSetsWithCounts] = useState<any[]>([])
    const [loadingQuestionSets, setLoadingQuestionSets] = useState(false)

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

            const response = await adminAPI.examPapers.getById(examPaperId)

            console.log('📄 API response received:', {
                hasData: !!response.data,
                hasExamPaper: !!response.data?.data,
                examPaperId: response.data?.data?.id,
                title: (response.data?.data as any)?.title?.name,
                error: response.error
            })

            if (response.error) {
                console.error('🚨 API Error Details:', response.error)
                throw new Error(`API Error: ${JSON.stringify(response.error)}`)
            }

            if (response.data?.data) {
                // console.log('✅ Found exam paper data with ID:', response.data.data.id)
                setExamPaper(response.data.data)
            } else {
                console.warn('⚠️ No exam paper data found in response:', response)
                // console.warn('Using mock data as fallback')
                // setExamPaper(mockExamPaper)
            }
        } catch (error) {
            console.error('❌ loadExamPaper error:', error)

            // Enhanced error reporting
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('🌐 Network Error Details:', {
                    message: 'Failed to fetch - possible causes:',
                    causes: [
                        '1. Backend server not running on http://localhost:8000',
                        '2. Network connectivity issue',
                        '3. CORS configuration problem',
                        '4. Firewall blocking the request'
                    ],
                    suggestion: 'Check if backend server is running and accessible'
                })

                addNotification({
                    type: 'error',
                    title: 'Connection Error',
                    message: 'Unable to connect to the server. Please check if the backend is running.',
                })
            } else {
                addNotification({
                    type: 'error',
                    title: 'Failed to load exam paper',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                })
            }

            // Fallback to mock data for development
            console.warn('📋 Using mock data as fallback due to error')
            setExamPaper(mockExamPaper)
        } finally {
            setLoading(false)
        }
    }

    const loadQuestionSetsWithCounts = async () => {
        setLoadingQuestionSets(true)
        
        const { result, errorResult } = await executeAPICall(
            () => adminAPI.questionSets.getByExamPaper(examPaperId),
            {
                operation: 'Load Question Sets',
                enableRetry: true,
                maxRetries: 2,
                logParams: { examPaperId }
            }
        )

        try {
            if (!result.error && result.data) {
                // Use the utility function to parse the response consistently
                const rawQuestionSets = parseQuestionSetsResponse(result as any)
                
                // Sanitize and validate the data
                const questionSets = rawQuestionSets
                    .map(sanitizeQuestionSetData)
                    .filter(Boolean) // Remove any null/invalid items
                
                console.log('✅ Successfully loaded and sanitized question sets:', {
                    count: questionSets.length,
                    items: questionSets.map(qs => ({ id: qs.id, title: qs.title, questions_count: qs.questions_count }))
                })
                
                setQuestionSetsWithCounts(questionSets)
            } else {
                // Handle API errors using standardized error handling
                if (errorResult) {
                    // Special handling for 404 - not an error, just no question sets
                    if (result.error && typeof result.error === 'object' && (result.error as any).status === 404) {
                        console.log('📝 No question sets found for this exam paper - this is normal')
                        setQuestionSetsWithCounts([])
                        return // Don't show error notification for 404
                    }
                    
                    // Show error notification for other errors
                    addNotification({
                        type: errorResult.type,
                        title: errorResult.title,
                        message: errorResult.message
                    })
                }
                
                // Attempt fallback to examPaper.question_sets
                if (examPaper?.question_sets && examPaper.question_sets.length > 0) {
                    console.log('🔄 Using fallback: examPaper.question_sets', examPaper.question_sets.length, 'items')
                    const fallbackQuestionSets = examPaper.question_sets
                        .map(sanitizeQuestionSetData)
                        .filter(Boolean)
                    setQuestionSetsWithCounts(fallbackQuestionSets)
                    
                    addNotification({
                        type: 'warning',
                        title: 'Using Cached Data',
                        message: 'Showing question sets from cached exam paper data.'
                    })
                } else {
                    console.log('📭 No fallback data available, setting empty array')
                    setQuestionSetsWithCounts([])
                }
            }
        } finally {
            setLoadingQuestionSets(false)
        }
    }

    useEffect(() => {
        if (examPaperId) {
            loadExamPaper()
            loadQuestionSetsWithCounts()
        }
    }, [examPaperId])

    // Debug function to show API performance metrics (development only)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const timer = setTimeout(() => {
                apiPerformanceMonitor.logSummary()
            }, 5000) // Log summary after 5 seconds
            
            return () => clearTimeout(timer)
        }
    }, [])

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

    const handleOpenAddModuleDialog = () => {
        setSelectedModuleIds([])
        setShowAddModuleDialog(true)
    }

    const handleAddModules = async () => {
        if (selectedModuleIds.length === 0 || !examPaper || addingModules) return

        try {
            setAddingModules(true)
            // Add all selected modules
            const promises = selectedModuleIds.map(moduleId =>
                adminAPI.examPapers.addModule(examPaperId, moduleId)
            )

            const results = await Promise.all(promises)
            const failedCount = results.filter(r => r.error).length

            if (failedCount === 0) {
                addNotification({
                    type: 'success',
                    title: 'Success',
                    message: `${selectedModuleIds.length} module${selectedModuleIds.length > 1 ? 's' : ''} added successfully`
                })
                setShowAddModuleDialog(false)
                setSelectedModuleIds([])
                loadExamPaper() // Reload to get updated data
            } else if (failedCount < selectedModuleIds.length) {
                addNotification({
                    type: 'warning',
                    title: 'Partially Successful',
                    message: `${selectedModuleIds.length - failedCount} module(s) added, ${failedCount} failed`
                })
                setShowAddModuleDialog(false)
                setSelectedModuleIds([])
                loadExamPaper()
            } else {
                throw new Error('Failed to add modules')
            }
        } catch (error) {
            console.error('Error adding module:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to add module'
            })
        } finally {
            setAddingModules(false)
        }
    }

    const handleOpenUnlinkDialog = (moduleId: string, moduleName: string) => {
        setModuleToUnlink({ id: moduleId, name: moduleName })
        setShowUnlinkConfirmDialog(true)
    }

    const handleConfirmUnlink = async () => {
        if (!moduleToUnlink || !examPaper) return

        try {
            const response = await adminAPI.examPapers.removeModule(examPaperId, moduleToUnlink.id)

            if (!response.error) {
                addNotification({
                    type: 'success',
                    title: 'Module Unlinked',
                    message: `${moduleToUnlink.name} has been unlinked from this exam paper`
                })
                setShowUnlinkConfirmDialog(false)
                setModuleToUnlink(null)
                loadExamPaper() // Reload to get updated data
            } else {
                throw new Error('Failed to unlink module')
            }
        } catch (error) {
            console.error('Error unlinking module:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to unlink module from exam paper'
            })
        }
    }

    const handleCancelUnlink = () => {
        setShowUnlinkConfirmDialog(false)
        setModuleToUnlink(null)
    }

    // Question Set Management Handlers
    const handleOpenAddQuestionSetDialog = () => {
        setSelectedQuestionSetIds([])
        setShowAddQuestionSetDialog(true)
    }

    const handleAddQuestionSets = async () => {
        if (selectedQuestionSetIds.length === 0 || !examPaper || addingQuestionSets) return

        setAddingQuestionSets(true)
        
        try {
            console.log('🔄 Adding question sets to exam paper:', {
                examPaperId,
                questionSetIds: selectedQuestionSetIds,
                count: selectedQuestionSetIds.length
            })
            
            // Add all selected question sets using standardized error handling
            const promises = selectedQuestionSetIds.map(async (questionSetId) => {
                const { result, errorResult } = await executeAPICall(
                    () => adminAPI.examPapers.addQuestionSet(examPaperId, questionSetId),
                    {
                        operation: `Add Question Set ${questionSetId}`,
                        logParams: { examPaperId, questionSetId }
                    }
                )
                return { result, errorResult, questionSetId }
            })

            const results = await Promise.all(promises)
            const failedResults = results.filter(r => r.result.error)
            const failedCount = failedResults.length

            if (failedCount === 0) {
                // All question sets added successfully
                addNotification({
                    type: 'success',
                    title: 'Question Sets Added',
                    message: `Successfully added ${selectedQuestionSetIds.length} question set${selectedQuestionSetIds.length > 1 ? 's' : ''} to the exam paper`
                })
                setShowAddQuestionSetDialog(false)
                setSelectedQuestionSetIds([])
                loadExamPaper() // Reload to get updated data
                loadQuestionSetsWithCounts() // Reload question sets with counts
            } else if (failedCount < selectedQuestionSetIds.length) {
                // Partial success
                const successCount = selectedQuestionSetIds.length - failedCount
                console.warn('⚠️ Partial success adding question sets:', {
                    successCount,
                    failedCount,
                    failedResults: failedResults.map(r => ({ id: r.questionSetId, error: r.errorResult }))
                })
                
                addNotification({
                    type: 'warning',
                    title: 'Partially Successful',
                    message: `Added ${successCount} question set${successCount !== 1 ? 's' : ''}, but ${failedCount} failed to add`
                })
                setShowAddQuestionSetDialog(false)
                setSelectedQuestionSetIds([])
                loadExamPaper()
                loadQuestionSetsWithCounts()
            } else {
                // All failed - show the first error
                const firstError = failedResults[0]?.errorResult
                if (firstError) {
                    addNotification({
                        type: firstError.type,
                        title: firstError.title,
                        message: firstError.message
                    })
                } else {
                    addNotification({
                        type: 'error',
                        title: 'Addition Failed',
                        message: 'Failed to add question sets to exam paper'
                    })
                }
            }
        } catch (error) {
            console.error('❌ Exception adding question sets:', error)
            const errorResult = handleAPIError(error, { operation: 'Add Question Sets' })
            addNotification({
                type: errorResult.type,
                title: errorResult.title,
                message: errorResult.message
            })
        } finally {
            setAddingQuestionSets(false)
        }
    }

    const handleOpenUnlinkQuestionSetDialog = (questionSetId: string, questionSetName: string) => {
        setQuestionSetToUnlink({ id: questionSetId, name: questionSetName })
        setShowUnlinkQuestionSetDialog(true)
    }

    const handleConfirmUnlinkQuestionSet = async () => {
        if (!questionSetToUnlink || !examPaper) return

        const { result, errorResult } = await executeAPICall(
            () => adminAPI.examPapers.removeQuestionSet(examPaperId, questionSetToUnlink.id),
            {
                operation: 'Remove Question Set',
                logParams: { examPaperId, questionSetId: questionSetToUnlink.id, questionSetName: questionSetToUnlink.name }
            }
        )

        if (!result.error) {
            addNotification({
                type: 'success',
                title: 'Question Set Removed',
                message: `Successfully removed "${questionSetToUnlink.name}" from the exam paper`
            })
            setShowUnlinkQuestionSetDialog(false)
            setQuestionSetToUnlink(null)
            loadExamPaper() // Reload to get updated data
            loadQuestionSetsWithCounts() // Reload question sets with counts
        } else if (errorResult) {
            addNotification({
                type: errorResult.type,
                title: errorResult.title,
                message: errorResult.message
            })
        }
    }

    const handleCancelUnlinkQuestionSet = () => {
        setShowUnlinkQuestionSetDialog(false)
        setQuestionSetToUnlink(null)
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
                    <div className="flex items-center gap-4 mb-8">
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
                                    {(examPaper.title as any)?.name || (examPaper.title as any)?.title || 'Untitled Exam'}
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
                                {examPaper.identifying_name}
                            </h1>
                            <p className="text-white/80 text-base lg:text-lg max-w-4xl mx-auto lg:mx-0 leading-relaxed mb-6">
                                {(examPaper.description as any)?.name || (examPaper.description as any)?.description || 'No description available'} | {examPaper.year_of_exam}
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
                        <Button onClick={handleOpenAddModuleDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Module
                        </Button>
                    </div>

                    {examPaper.modules && examPaper.modules.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {examPaper.modules.map((module) => (
                                <Card key={module.id} className="relative">
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/modules/${module.id}`)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            title="View module details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenUnlinkDialog(module.id, module.name)}
                                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                            title="Unlink module from exam paper"
                                        >
                                            <Unlink className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 pr-16">
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
                        <Button onClick={handleOpenAddQuestionSetDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Question Set
                        </Button>
                    </div>

                    {loadingQuestionSets ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner className="mr-2" />
                            <span className="text-muted-foreground">Loading question sets...</span>
                        </div>
                    ) : (() => {
                        // Enhanced display logic: prioritize questionSetsWithCounts over examPaper.question_sets
                        const displayQuestionSets = questionSetsWithCounts.length > 0 
                            ? questionSetsWithCounts 
                            : (examPaper?.question_sets || [])
                        
                        const hasQuestionSets = displayQuestionSets.length > 0
                        const isUsingFallback = questionSetsWithCounts.length === 0 && (examPaper?.question_sets?.length || 0) > 0
                        
                        console.log('🎯 Question sets display logic:', {
                            questionSetsWithCountsLength: questionSetsWithCounts.length,
                            examPaperQuestionSetsLength: examPaper?.question_sets?.length || 0,
                            displayQuestionSetsLength: displayQuestionSets.length,
                            hasQuestionSets,
                            isUsingFallback
                        })

                        if (!hasQuestionSets) {
                            // Enhanced empty state
                            return (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                                <ListChecks className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold">No Question Sets Found</h3>
                                                <p className="text-muted-foreground max-w-md">
                                                    This exam paper doesn't have any question sets associated with it yet. 
                                                    Question sets help organize questions into logical groups.
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button onClick={handleOpenAddQuestionSetDialog}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Question Set
                                                </Button>
                                                <Button variant="outline" onClick={() => loadQuestionSetsWithCounts()}>
                                                    <Search className="mr-2 h-4 w-4" />
                                                    Refresh
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        }

                        return (
                            <div className="space-y-4">
                                {/* Show data source indicator if using fallback */}
                                {isUsingFallback && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Showing cached question sets data. Some information may be outdated.</span>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => loadQuestionSetsWithCounts()}
                                            className="ml-auto text-amber-700 hover:text-amber-900"
                                        >
                                            Refresh
                                        </Button>
                                    </div>
                                )}
                                
                                {/* Question sets grid */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {displayQuestionSets.map((questionSet, index) => {
                                        // Ensure consistent data structure for rendering
                                        const safeQuestionSet = {
                                            id: questionSet.id,
                                            title: questionSet.title || null,
                                            slug: questionSet.slug || null,
                                            questions_count: questionSet.questions_count || 0,
                                            exam_papers_count: questionSet.exam_papers_count || 0,
                                            // Handle legacy name field as fallback for title
                                            displayTitle: questionSet.title || (questionSet as any).name || `Question Set ${index + 1}`,
                                            // Handle legacy description field
                                            displayDescription: questionSet.slug || (questionSet as any).description || 'No description available'
                                        }

                                        return (
                                            <Card key={safeQuestionSet.id} className="relative">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenUnlinkQuestionSetDialog(
                                                        safeQuestionSet.id,
                                                        safeQuestionSet.displayTitle
                                                    )}
                                                    className="absolute top-2 right-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                    title="Unlink question set from exam paper"
                                                >
                                                    <Unlink className="h-4 w-4" />
                                                </Button>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 pr-12">
                                                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                                                            {index + 1}
                                                        </div>
                                                        <span className="truncate">{safeQuestionSet.displayTitle}</span>
                                                    </CardTitle>
                                                    <CardDescription className="truncate">
                                                        {safeQuestionSet.displayDescription}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <FileText className="h-4 w-4" />
                                                                <span>
                                                                    {safeQuestionSet.questions_count} question{safeQuestionSet.questions_count !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                            {safeQuestionSet.exam_papers_count > 0 && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Users className="h-3 w-3" />
                                                                    <span>{safeQuestionSet.exam_papers_count} exam{safeQuestionSet.exam_papers_count !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" className="flex-1" title="View question set">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="flex-1" title="Edit question set">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })()}
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

            {/* Add Module Dialog */}
            <Dialog open={showAddModuleDialog} onOpenChange={setShowAddModuleDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add Modules to Exam Paper</DialogTitle>
                        <DialogDescription>
                            Search and select one or more modules to add to this exam paper.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ModuleSelector
                            selectedModuleIds={selectedModuleIds}
                            onSelectionChange={setSelectedModuleIds}
                            excludeModuleIds={examPaper?.modules?.map(m => m.id) || []}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModuleDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddModules}
                            disabled={selectedModuleIds.length === 0 || addingModules}
                            className="cursor-pointer"
                        >
                            {addingModules ? (
                                <>
                                    <LoadingSpinner className="mr-2 h-4 w-4" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add {selectedModuleIds.length > 0 ? `${selectedModuleIds.length} ` : ''}Module{selectedModuleIds.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unlink Module Confirmation Dialog */}
            <Dialog open={showUnlinkConfirmDialog} onOpenChange={setShowUnlinkConfirmDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <DialogTitle>Unlink Module</DialogTitle>
                                <DialogDescription>
                                    This action will remove the module from this exam paper
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to unlink <span className="font-semibold text-orange-900">{moduleToUnlink?.name}</span> from this exam paper?
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                                The module itself will not be deleted, only the association with this exam paper will be removed.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={handleCancelUnlink}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmUnlink}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            <Unlink className="mr-2 h-4 w-4" />
                            Unlink Module
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Question Set Dialog */}
            <Dialog open={showAddQuestionSetDialog} onOpenChange={setShowAddQuestionSetDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add Question Sets to Exam Paper</DialogTitle>
                        <DialogDescription>
                            Search and select one or more question sets to add to this exam paper.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <QuestionSetSelector
                            selectedQuestionSetIds={selectedQuestionSetIds}
                            onSelectionChange={setSelectedQuestionSetIds}
                            excludeQuestionSetIds={examPaper?.question_sets?.map(qs => qs.id) || []}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddQuestionSetDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddQuestionSets}
                            disabled={selectedQuestionSetIds.length === 0 || addingQuestionSets}
                            className="cursor-pointer"
                        >
                            {addingQuestionSets ? (
                                <>
                                    <LoadingSpinner className="mr-2 h-4 w-4" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add {selectedQuestionSetIds.length > 0 ? `${selectedQuestionSetIds.length} ` : ''}Question Set{selectedQuestionSetIds.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unlink Question Set Confirmation Dialog */}
            <Dialog open={showUnlinkQuestionSetDialog} onOpenChange={setShowUnlinkQuestionSetDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <DialogTitle>Unlink Question Set</DialogTitle>
                                <DialogDescription>
                                    This action will remove the question set from this exam paper
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to unlink <span className="font-semibold text-orange-900">{questionSetToUnlink?.name}</span> from this exam paper?
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                                The question set itself will not be deleted, only the association with this exam paper will be removed.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={handleCancelUnlinkQuestionSet}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmUnlinkQuestionSet}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            <Unlink className="mr-2 h-4 w-4" />
                            Unlink Question Set
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}