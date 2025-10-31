'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
    ArrowLeft,
    Check,
    FileText,
    Calendar,
    Clock,
    Building2,
    BookOpen,
    Layers,
    ListChecks,
    Plus,
    Save,
    Edit,
    Trash2,
    GripVertical,
    X,
    Search,
    Filter,
    History,
    MapPin,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import { adminAPI, type ExamPaperRead, type ExamPaperUpdate } from '@/lib/api-admin'
import { getAuthToken } from '@/lib/api'
import type { components } from '@/types/generated/api'
import { useUIStore } from '@/stores/ui'
import { QuestionSetSelector } from '@/components/features/question-set-selector'
import { QuestionForm } from '@/components/forms/question-form'
import { QuestionList } from '@/components/features/question-list'
import { parseQuestionSetsResponse, sanitizeQuestionSetData } from '@/lib/api-response-utils'
import { executeAPICall, handleAPIError, apiPerformanceMonitor } from '@/lib/api-error-handler'
import { HierarchicalQuestions } from '@/components/ui/hierarchical-questions'
type QuestionRead = components['schemas']['QuestionRead'] & {
    // Add missing properties for UI compatibility
    question_text?: string
    question_type?: string
    difficulty_level?: string
}
type QuestionSetRead = components['schemas']['QuestionSetRead']
type ExamTitleRead = components['schemas']['ExamTitleRead']
type ExamDescriptionRead = components['schemas']['ExamDescriptionRead']
type InstitutionRead = components['schemas']['InstitutionRead']
type CourseRead = components['schemas']['CourseRead']
type InstructionRead = components['schemas']['InstructionRead']

// Form validation schema
const examPaperEditSchema = z.object({
    title_id: z.string().min(1, 'Title is required'),
    description_id: z.string().min(1, 'Description is required'),
    year_of_exam: z.string().min(1, 'Year is required'),
    exam_duration: z.coerce.number().min(30, 'Duration must be at least 30 minutes').max(480, 'Duration cannot exceed 8 hours'),
    exam_date: z.string().min(1, 'Exam date is required'),
    institution_id: z.string().min(1, 'Institution is required'),
    course_id: z.string().min(1, 'Course is required'),
    tags: z.array(z.string()).optional(),
    instruction_ids: z.array(z.string()).optional(),
})

type ExamPaperEditFormData = z.infer<typeof examPaperEditSchema>

// No mock data - using real API endpoints

interface QuestionItemProps {
    question: QuestionRead
    index: number
    onRemove: (questionId: string) => void
    onMoveUp: (index: number) => void
    onMoveDown: (index: number) => void
    isFirst: boolean
    isLast: boolean
}

function QuestionItem({ question, index, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: QuestionItemProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'hard': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Extract question text from the API structure
    const questionText = question.question_text ||
        (question.text && typeof question.text === 'object' ?
            question.text.blocks?.map((block: any) => block.data?.text || '').join(' ') || 'Question text' :
            question.text || 'Question text')

    const difficulty = question.difficulty_level || 'medium'
    const marks = question.marks || 0
    const questionType = question.question_type || question.numbering_style || 'Question'

    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                        <div className="flex flex-col space-y-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMoveUp(index)}
                                disabled={isFirst}
                                className="p-1 h-6 w-6"
                            >
                                <GripVertical className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">Q{index + 1}</Badge>
                                <Badge className={getDifficultyColor(difficulty)}>
                                    {difficulty}
                                </Badge>
                                <Badge variant="secondary">{marks} marks</Badge>
                                <Badge variant="outline">{questionType}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{questionText}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex flex-col space-y-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMoveUp(index)}
                                disabled={isFirst}
                                className="p-1 h-6 w-6"
                            >
                                ↑
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMoveDown(index)}
                                disabled={isLast}
                                className="p-1 h-6 w-6"
                            >
                                ↓
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(question.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

interface AddQuestionDialogProps {
    availableQuestions: QuestionRead[]
    questionSets: QuestionSetRead[]
    onAddQuestion: (question: QuestionRead, questionSetId: string) => void
}



function AddQuestionDialog({ availableQuestions, questionSets, onAddQuestion }: AddQuestionDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
    const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')
    const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<string>('')

    const filteredQuestions = useMemo(() => {
        return availableQuestions.filter(question => {
            // Extract question text for search
            const questionText = question.question_text ||
                (question.text && typeof question.text === 'object' ?
                    question.text.blocks?.map((block: any) => block.data?.text || '').join(' ') || '' :
                    question.text || '')

            const matchesSearch = !searchQuery ||
                questionText.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' ||
                (question.difficulty_level || 'medium') === selectedDifficulty
            const matchesType = !selectedQuestionType || selectedQuestionType === 'all' ||
                (question.question_type || question.numbering_style || 'Question') === selectedQuestionType

            return matchesSearch && matchesDifficulty && matchesType
        })
    }, [availableQuestions, searchQuery, selectedDifficulty, selectedQuestionType])

    const handleAddSelected = () => {
        if (!selectedQuestionSetId) {
            // Show error - need to select a question set
            return
        }

        selectedQuestions.forEach(questionId => {
            const question = availableQuestions.find(q => q.id === questionId)
            if (question) {
                onAddQuestion(question, selectedQuestionSetId)
            }
        })
        setSelectedQuestions([])
        setSelectedQuestionSetId('')
        setOpen(false)
    }

    const resetFilters = () => {
        setSearchQuery('')
        setSelectedDifficulty('')
        setSelectedQuestionType('')
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Questions from Question Bank
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Questions to Question Set</DialogTitle>
                    <DialogDescription>
                        Select a question set and questions to add to this exam paper. Use filters to find specific questions.
                    </DialogDescription>
                </DialogHeader>

                {/* Question Set Selection */}
                <div className="space-y-4 border-b pb-4">
                    <div className="space-y-2">
                        <Label htmlFor="question-set-select">Select Question Set</Label>
                        <Select value={selectedQuestionSetId} onValueChange={setSelectedQuestionSetId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a question set to add questions to" />
                            </SelectTrigger>
                            <SelectContent>
                                {questionSets.filter(qs => qs.id && typeof qs.id === 'string' && qs.id.trim() !== '').map((qs) => (
                                    <SelectItem key={qs.id} value={qs.id}>
                                        {qs.title || 'Untitled Question Set'} ({qs.questions_count || 0} questions)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!selectedQuestionSetId && (
                            <p className="text-sm text-red-600">Please select a question set first</p>
                        )}
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="space-y-4 border-b pb-4">
                    <div className="flex space-x-2">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search questions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                            Clear Filters
                        </Button>
                    </div>

                    <div className="flex space-x-2">
                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedQuestionType} onValueChange={setSelectedQuestionType}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="multiple_choice">MCQ</SelectItem>
                                <SelectItem value="essay">Essay</SelectItem>
                                <SelectItem value="short_answer">Short Answer</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-sm text-gray-600">
                        Showing {filteredQuestions.length} of {availableQuestions.length} questions
                    </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredQuestions.length > 0 ? filteredQuestions.map((question) => (
                        <Card key={question.id} className={`cursor-pointer transition-colors ${selectedQuestions.includes(question.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                            }`} onClick={() => {
                                setSelectedQuestions(prev =>
                                    prev.includes(question.id)
                                        ? prev.filter(id => id !== question.id)
                                        : [...prev, question.id]
                                )
                            }}>
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        checked={selectedQuestions.includes(question.id)}
                                        onChange={() => { }} // Handled by card click
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Badge className={getDifficultyColor(question.difficulty_level || 'medium')}>
                                                {question.difficulty_level || 'medium'}
                                            </Badge>
                                            <Badge variant="secondary">{question.marks || 0} marks</Badge>
                                            <Badge variant="outline">{question.question_type || question.numbering_style || 'Question'}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {question.question_text ||
                                                (question.text && typeof question.text === 'object' ?
                                                    question.text.blocks?.map((block: any) => block.data?.text || '').join(' ') || 'Question text' :
                                                    question.text || 'Question text')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="text-center py-8 text-gray-500">
                            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium mb-2">No questions found</h4>
                            <p className="text-sm">Try adjusting your search criteria or filters.</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddSelected}
                        disabled={selectedQuestions.length === 0 || !selectedQuestionSetId}
                    >
                        Add Selected Questions ({selectedQuestions.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}



function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
        case 'easy': return 'bg-green-100 text-green-800'
        case 'medium': return 'bg-yellow-100 text-yellow-800'
        case 'hard': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

export default function EditExamPaperPage() {
    const params = useParams()
    const router = useRouter()
    const { addNotification } = useUIStore()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [examPaper, setExamPaper] = useState<ExamPaperRead | null>(null)
    const [titles, setTitles] = useState<ExamTitleRead[]>([])
    const [descriptions, setDescriptions] = useState<ExamDescriptionRead[]>([])
    const [institutions, setInstitutions] = useState<InstitutionRead[]>([])
    const [courses, setCourses] = useState<CourseRead[]>([])
    const [instructions, setInstructions] = useState<InstructionRead[]>([])
    const [questions, setQuestions] = useState<QuestionRead[]>([])
    const [availableQuestions, setAvailableQuestions] = useState<QuestionRead[]>([])
    const [questionSets, setQuestionSets] = useState<QuestionSetRead[]>([])
    const [availableQuestionSets, setAvailableQuestionSets] = useState<QuestionSetRead[]>([])
    const [questionSetQuestions, setQuestionSetQuestions] = useState<QuestionRead[]>([])
    const [loadingQuestions, setLoadingQuestions] = useState(false)
    const lastLoadedQuestionSetIds = React.useRef<string>('')
    const [newTag, setNewTag] = useState('')
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
    const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')
    const [institutionSearch, setInstitutionSearch] = useState('')
    const [institutionsLoading, setInstitutionsLoading] = useState(false)
    const [questionSetsLoading, setQuestionSetsLoading] = useState(false)

    // Dialog states for adding new entities
    const [showAddTitleDialog, setShowAddTitleDialog] = useState(false)
    const [showAddDescriptionDialog, setShowAddDescriptionDialog] = useState(false)
    const [showAddInstructionDialog, setShowAddInstructionDialog] = useState(false)
    const [newTitleName, setNewTitleName] = useState('')
    const [newDescriptionText, setNewDescriptionText] = useState('')
    const [newInstructionName, setNewInstructionName] = useState('')
    const [showAddQuestionSetDialog, setShowAddQuestionSetDialog] = useState(false)
    const [selectedQuestionSetIds, setSelectedQuestionSetIds] = useState<string[]>([])
    const [addingQuestionSets, setAddingQuestionSets] = useState(false)
    const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false)
    const [newQuestionText, setNewQuestionText] = useState('')
    const [newQuestionMarks, setNewQuestionMarks] = useState(1)
    const [newQuestionSetId, setNewQuestionSetId] = useState('')
    const [isSubQuestion, setIsSubQuestion] = useState(false)
    const [parentQuestionId, setParentQuestionId] = useState('')
    const [mainQuestions, setMainQuestions] = useState<any[]>([])
    const [editingQuestion, setEditingQuestion] = useState<QuestionRead | null>(null)

    const form = useForm<ExamPaperEditFormData>({
        resolver: zodResolver(examPaperEditSchema),
        defaultValues: {
            title_id: '',
            description_id: '',
            year_of_exam: '',
            exam_duration: 180,
            exam_date: '',
            institution_id: '',
            course_id: '',
            tags: [],
            instruction_ids: [],
        },
        mode: 'onChange',
    })

    // Auto-save functionality
    const autoSave = useCallback(async (data: ExamPaperEditFormData) => {
        if (!hasUnsavedChanges || !examPaper) return

        try {
            const updateData: ExamPaperUpdate = {
                title_id: data.title_id || null,
                description_id: data.description_id || null,
                course_id: data.course_id || null,
                institution_id: data.institution_id || null,
                exam_date: data.exam_date || null,
                exam_duration: data.exam_duration || null,
                tags: data.tags || null,
                instruction_ids: data.instruction_ids || [],
                module_ids: [],
            }

            const response = await adminAPI.examPapers.update(params.id as string, updateData)
            if (!response.error) {
                const saveTime = new Date()
                setLastSaved(saveTime)
                setHasUnsavedChanges(false)

                // Show subtle auto-save notification
                addNotification({
                    type: 'info',
                    title: 'Auto-saved',
                    message: `Changes automatically saved at ${saveTime.toLocaleTimeString()}`,
                })
            }
        } catch (error) {
            console.error('Auto-save failed:', error)
            // Don't show error notification for auto-save failures to avoid spam
        }
    }, [hasUnsavedChanges, params.id, examPaper])

    // Auto-save every 30 seconds if there are unsaved changes
    useEffect(() => {
        if (!hasUnsavedChanges) return

        const interval = setInterval(() => {
            const formData = form.getValues()
            autoSave(formData)
        }, 30000) // 30 seconds

        return () => clearInterval(interval)
    }, [hasUnsavedChanges, autoSave, form])

    // Track form changes
    useEffect(() => {
        const subscription = form.watch(() => {
            setHasUnsavedChanges(true)
        })
        return () => subscription.unsubscribe()
    }, [form])

    // Load exam paper data from real API
    useEffect(() => {
        const loadExamPaper = async () => {
            try {
                setIsLoading(true)

                const token = getAuthToken()
                if (!token) {
                    addNotification({
                        type: 'error',
                        title: 'Authentication Error',
                        message: 'Please log in to continue.',
                    })
                    router.push('/auth/login')
                    return
                }

                // Load exam paper, titles, descriptions, courses, instructions, and questions from real API
                // Note: institutions are loaded via the search useEffect
                const [paperResponse, titlesResponse, descriptionsResponse, coursesResponse, instructionsResponse, questionsResponse] = await Promise.all([
                    adminAPI.examPapers.getById(params.id as string),
                    adminAPI.examTitles.list({ limit: 100, skip: 0 }),
                    adminAPI.examDescriptions.list({ limit: 100, skip: 0 }),
                    adminAPI.courses.list({ limit: 100, skip: 0 }),
                    adminAPI.instructions.list({ limit: 100, skip: 0 }),
                    adminAPI.questionSets.list({ limit: 100, skip: 0 })
                ])

                let paperData: any = null

                if (!paperResponse.error && paperResponse.data) {
                    console.log('Exam paper response:', paperResponse.data)
                    paperData = (paperResponse.data as any).data || paperResponse.data
                    console.log('📋 [EDIT PAGE] Exam paper data:', {
                        id: paperData.id,
                        hasQuestionSets: !!paperData.question_sets,
                        questionSetsCount: paperData.question_sets?.length || 0,
                        questionSets: paperData.question_sets
                    })
                    setExamPaper(paperData as ExamPaperRead)

                    // Load question sets - prioritize exam paper data since it's already loaded
                    console.log('📋 [EDIT PAGE] Loading question sets for exam paper:', params.id)

                    // Load question sets with nested questions using the dedicated endpoint
                    const questionSetsResponse = await adminAPI.questionSets.getByExamPaper(params.id as string)
                    
                    if (!questionSetsResponse.error && questionSetsResponse.data) {
                        const questionSetsData = (questionSetsResponse.data as any).data || []
                        setQuestionSets(questionSetsData as QuestionSetRead[])
                        
                        // Extract all questions (main and sub) from the nested structure
                        const allQuestions: QuestionRead[] = []
                        questionSetsData.forEach((qs: any) => {
                            if (qs.questions && Array.isArray(qs.questions)) {
                                qs.questions.forEach((q: any) => {
                                    allQuestions.push(q)
                                    // Also add children if they exist
                                    if (q.children && Array.isArray(q.children)) {
                                        allQuestions.push(...q.children)
                                    }
                                })
                            }
                        })
                        
                        setQuestionSetQuestions(allQuestions)
                    } else {
                        setQuestionSets([])
                        setQuestionSetQuestions([])
                    }

                    // If there's a selected institution, add it to the institutions list
                    // so it displays properly before the search loads
                    if (paperData.institution) {
                        setInstitutions([paperData.institution])
                    }
                } else {
                    const errorMessage = paperResponse.error?.message ||
                        (typeof paperResponse.error === 'string' ? paperResponse.error : 'Failed to load exam paper')
                    throw new Error(errorMessage)
                }

                // Load titles and match current title
                if (!titlesResponse.error && titlesResponse.data) {
                    const titlesData = (titlesResponse.data as any).data?.items || []
                    setTitles(Array.isArray(titlesData) ? titlesData : [])

                    console.log('Loaded titles:', titlesData)
                    console.log('Current exam paper title:', paperData?.title)

                    // Try to find matching title
                    let matchedTitleId = ''
                    if (paperData?.title) {
                        // Try matching by slug first
                        if (paperData.title.slug) {
                            const match = titlesData.find((t: any) => t.slug === paperData.title.slug)
                            if (match) matchedTitleId = match.id
                        }
                        // Try matching by name if slug didn't work
                        if (!matchedTitleId && paperData.title.name) {
                            const match = titlesData.find((t: any) => t.name === paperData.title.name)
                            if (match) matchedTitleId = match.id
                        }
                    }
                    console.log('Matched title ID:', matchedTitleId)

                    // Set the form value
                    if (matchedTitleId) {
                        form.setValue('title_id', matchedTitleId)
                    }
                } else {
                    console.warn('Failed to load titles:', titlesResponse.error)
                    setTitles([])
                }

                // Load descriptions and match current description
                if (!descriptionsResponse.error && descriptionsResponse.data) {
                    const descriptionsData = (descriptionsResponse.data as any).data?.items || []
                    setDescriptions(Array.isArray(descriptionsData) ? descriptionsData : [])

                    console.log('Loaded descriptions:', descriptionsData)
                    console.log('Current exam paper description:', paperData?.description)

                    // Try to find matching description
                    let matchedDescId = ''
                    if (paperData?.description) {
                        // Try matching by name
                        if (paperData.description.name) {
                            const match = descriptionsData.find((d: any) => d.name === paperData.description.name)
                            if (match) matchedDescId = match.id
                        }
                        // Try matching by description text (the actual description content)
                        if (!matchedDescId && paperData.description.description) {
                            const match = descriptionsData.find((d: any) =>
                                d.name === paperData.description.description
                            )
                            if (match) matchedDescId = match.id
                        }
                    }
                    console.log('Matched description ID:', matchedDescId)

                    // Set the form value
                    if (matchedDescId) {
                        form.setValue('description_id', matchedDescId)
                    }
                } else {
                    console.warn('Failed to load descriptions:', descriptionsResponse.error)
                    setDescriptions([])
                }

                // Now set all form values including the matched IDs
                if (paperData) {
                    form.reset({
                        title_id: form.getValues('title_id') || '',
                        description_id: form.getValues('description_id') || '',
                        year_of_exam: paperData.year_of_exam || '',
                        exam_duration: paperData.exam_duration || 180,
                        exam_date: paperData.exam_date || '',
                        institution_id: paperData.institution?.id || '',
                        course_id: paperData.course?.id || '',
                        tags: paperData.tags || [],
                        instruction_ids: paperData.instructions?.map((i: any) => i.id) || [],
                    })

                    // Mark as initially saved
                    setLastSaved(new Date())
                    setHasUnsavedChanges(false)
                }

                if (!coursesResponse.error && coursesResponse.data) {
                    console.log('Courses response:', coursesResponse.data)
                    const coursesData = (coursesResponse.data as any).data?.items || []
                    console.log('Courses data to set:', coursesData)
                    setCourses(Array.isArray(coursesData) ? coursesData : [])
                } else {
                    console.warn('Failed to load courses:', coursesResponse.error)
                    setCourses([])
                }

                if (!instructionsResponse.error && instructionsResponse.data) {
                    console.log('Instructions response:', instructionsResponse.data)
                    const instructionsData = (instructionsResponse.data as any).data?.items || []
                    console.log('Instructions data to set:', instructionsData)
                    setInstructions(Array.isArray(instructionsData) ? instructionsData : [])
                } else {
                    console.warn('Failed to load instructions:', instructionsResponse.error)
                    setInstructions([])
                }

                // Load available question sets using the helper function
                if (!questionsResponse.error && questionsResponse.data) {
                    console.log('Question sets response:', questionsResponse.data)
                    // Use the utility function to parse the response consistently
                    const rawQuestionSets = parseQuestionSetsResponse(questionsResponse as any)

                    console.log('Available question sets:', rawQuestionSets)
                    setAvailableQuestionSets(rawQuestionSets as QuestionSetRead[])

                    // Note: QuestionSetRead doesn't include questions array, so we can't extract individual questions
                    // The AddQuestionDialog should use the questions API directly if needed
                    setAvailableQuestions([])
                } else {
                    console.warn('Failed to load question sets:', questionsResponse.error)
                    setAvailableQuestionSets([])
                    setAvailableQuestions([])
                }
            } catch (error) {
                console.error('Error loading exam paper:', error)
                addNotification({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to load exam paper data.',
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadExamPaper()
    }, [params.id, form, addNotification, router])



    // Note: Questions are now loaded with question sets in the nested structure
    // No need for separate loading since getByExamPaper returns questions with children

    // Load main questions when dialog opens for sub-questions
    useEffect(() => {
        if (showAddQuestionDialog && isSubQuestion) {
            const loadMainQuestions = async () => {
                try {
                    const response = await adminAPI.questions.list({
                        question_type: 'main',
                        exam_paper_id: params.id as string,
                        limit: 100
                    })
                    if (!response.error && response.data) {
                        const data = (response.data as any).data
                        setMainQuestions(data?.items || [])
                    }
                } catch (error) {
                    console.error('Error loading main questions:', error)
                }
            }
            loadMainQuestions()
        }
    }, [showAddQuestionDialog, isSubQuestion, params.id])

    // Server-side institution search with debounce
    useEffect(() => {
        let cancelled = false
        setInstitutionsLoading(true)
        const h = setTimeout(async () => {
            try {
                const q = institutionSearch.trim() || '*'
                const res = await adminAPI.institutions.search({ q, limit: 50, skip: 0, highlight: false })
                if (!cancelled) {
                    let items = (res.data?.data?.items ?? []) as InstitutionRead[]

                    // If there's a currently selected institution that's not in the results, add it
                    const selectedInstitutionId = form.getValues('institution_id')
                    if (selectedInstitutionId && examPaper?.institution) {
                        const isInResults = items.some(i => i.id === selectedInstitutionId)
                        if (!isInResults) {
                            items = [examPaper.institution, ...items]
                        }
                    }

                    setInstitutions(items)
                }
            } catch (e) {
                if (!cancelled) {
                    // If search fails, at least keep the selected institution if available
                    if (examPaper?.institution) {
                        setInstitutions([examPaper.institution])
                    } else {
                        setInstitutions([])
                    }
                }
            } finally {
                if (!cancelled) setInstitutionsLoading(false)
            }
        }, 300)
        return () => {
            cancelled = true
            clearTimeout(h)
        }
    }, [institutionSearch, examPaper, form])

    const onSubmit = async (data: ExamPaperEditFormData) => {
        try {
            setIsSaving(true)

            const updateData: ExamPaperUpdate = {
                title_id: data.title_id || null,
                description_id: data.description_id || null,
                course_id: data.course_id || null,
                institution_id: data.institution_id || null,
                exam_date: data.exam_date || null,
                exam_duration: data.exam_duration || null,
                tags: data.tags || null,
                instruction_ids: data.instruction_ids || [],
                module_ids: [],
            }

            console.log('Updating exam paper with data:', updateData)

            const response = await adminAPI.examPapers.update(params.id as string, updateData)

            if (!response.error && response.data) {
                const saveTime = new Date()
                setLastSaved(saveTime)
                setHasUnsavedChanges(false)
                addNotification({
                    type: 'success',
                    title: 'Exam Paper Saved Successfully',
                    message: `All changes have been saved at ${saveTime.toLocaleTimeString()}. Your exam paper is up to date.`,
                })
                // Refresh the data
                const updatedResponse = await adminAPI.examPapers.getById(params.id as string)
                if (!updatedResponse.error && updatedResponse.data) {
                    const paperData = (updatedResponse.data as any).data || updatedResponse.data
                    setExamPaper(paperData as ExamPaperRead)
                }
            } else {
                const errorMessage = response.error?.message ||
                    (typeof response.error === 'string' ? response.error : 'Failed to update exam paper')
                throw new Error(errorMessage)
            }
        } catch (error) {
            console.error('Error updating exam paper:', error)
            addNotification({
                type: 'error',
                title: 'Save Failed',
                message: error instanceof Error ?
                    `Failed to save exam paper: ${error.message}. Please check your connection and try again.` :
                    'Failed to update exam paper. Please check your connection and try again.',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddTag = () => {
        if (newTag.trim() && !form.getValues('tags')?.includes(newTag.trim())) {
            const currentTags = form.getValues('tags') || []
            form.setValue('tags', [...currentTags, newTag.trim()])
            setNewTag('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const currentTags = form.getValues('tags') || []
        form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
    }

    const handleAddInstruction = (instructionId: string) => {
        const currentInstructionIds = form.getValues('instruction_ids') || []
        if (!currentInstructionIds.includes(instructionId)) {
            form.setValue('instruction_ids', [...currentInstructionIds, instructionId])
        }
    }

    const handleRemoveInstruction = (instructionId: string) => {
        const currentInstructionIds = form.getValues('instruction_ids') || []
        form.setValue('instruction_ids', currentInstructionIds.filter(id => id !== instructionId))
    }

    const handleToggleInstruction = (instructionId: string) => {
        const currentInstructionIds = form.getValues('instruction_ids') || []
        if (currentInstructionIds.includes(instructionId)) {
            handleRemoveInstruction(instructionId)
        } else {
            handleAddInstruction(instructionId)
        }
    }

    const handleCreateTitle = async () => {
        if (!newTitleName.trim()) return

        try {
            const response = await adminAPI.examTitles.create({
                name: newTitleName.trim(),
                description: null,
            })

            if (!response.error && response.data) {
                const newTitle = (response.data as any).data
                if (newTitle) {
                    setTitles(prev => [...prev, newTitle as ExamTitleRead])
                    form.setValue('title_id', newTitle.id)
                    setNewTitleName('')
                    setShowAddTitleDialog(false)
                    addNotification({
                        type: 'success',
                        title: 'Success',
                        message: 'Title created successfully!',
                    })
                }
            }
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to create title.',
            })
        }
    }

    const handleCreateDescription = async () => {
        if (!newDescriptionText.trim()) return

        try {
            const response = await adminAPI.examDescriptions.create({
                name: newDescriptionText.trim(),
                description: null,
            })

            if (!response.error && response.data) {
                const newDescription = (response.data as any).data
                if (newDescription) {
                    setDescriptions(prev => [...prev, newDescription as ExamDescriptionRead])
                    form.setValue('description_id', newDescription.id)
                    setNewDescriptionText('')
                    setShowAddDescriptionDialog(false)
                    addNotification({
                        type: 'success',
                        title: 'Success',
                        message: 'Description created successfully!',
                    })
                }
            }
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to create description.',
            })
        }
    }

    const handleCreateInstruction = async () => {
        if (!newInstructionName.trim()) return

        try {
            const response = await adminAPI.instructions.create({
                name: newInstructionName.trim(),
                slug: null,
            })

            if (!response.error && response.data) {
                const newInstruction = (response.data as any).data
                if (newInstruction) {
                    setInstructions(prev => [...prev, newInstruction as InstructionRead])
                    const currentInstructionIds = form.getValues('instruction_ids') || []
                    form.setValue('instruction_ids', [...currentInstructionIds, newInstruction.id])
                    setNewInstructionName('')
                    setShowAddInstructionDialog(false)
                    addNotification({
                        type: 'success',
                        title: 'Success',
                        message: 'Instruction created successfully!',
                    })
                }
            }
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to create instruction.',
            })
        }
    }

    const handleAddQuestion = async (question: QuestionRead, questionSetId: string) => {
        try {
            // Create the question in the question set
            // Convert text to EditorJS format if it's a string
            const textContent = question.text || question.question_text || ''
            const textData = typeof textContent === 'string' ? {
                time: Date.now(),
                blocks: [{
                    id: 'question-block',
                    type: 'paragraph',
                    data: { text: textContent }
                }]
            } : textContent

            const questionData = {
                question_set_id: questionSetId,
                exam_paper_id: params.id as string,
                text: textData,
                marks: question.marks || 1,
                numbering_style: question.numbering_style || 'a',
                question_number: '1', // Will be set by backend
            }

            const response = await adminAPI.questions.createMain(questionData)

            if (!response.error && response.data) {
                addNotification({
                    type: 'success',
                    title: 'Question Added Successfully',
                    message: 'Question has been added to the question set.'
                })

                // Reload question sets to show the updated count
                await reloadQuestionSets()
            } else {
                const errorMessage = (response.error as any)?.message || 'Failed to add question'
                addNotification({
                    type: 'error',
                    title: 'Failed to Add Question',
                    message: errorMessage
                })
            }
        } catch (error) {
            console.error('Error adding question:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while adding the question.'
            })
        }
    }

    const handleRemoveQuestion = (questionId: string) => {
        setQuestions(prev => prev.filter(q => q.id !== questionId))
    }

    const handleMoveQuestionUp = (index: number) => {
        if (index > 0) {
            const newQuestions = [...questions]
            const temp = newQuestions[index]
            newQuestions[index] = newQuestions[index - 1]
            newQuestions[index - 1] = temp
            setQuestions(newQuestions)
        }
    }

    const handleMoveQuestionDown = (index: number) => {
        if (index < questions.length - 1) {
            const newQuestions = [...questions]
            const temp = newQuestions[index]
            newQuestions[index] = newQuestions[index + 1]
            newQuestions[index + 1] = temp
            setQuestions(newQuestions)
        }
    }

    const handleOpenAddQuestionSetDialog = () => {
        // Check if there are available question sets to add
        const availableToAdd = availableQuestionSets.filter(qs => !questionSets.find(existing => existing.id === qs.id))

        if (availableToAdd.length === 0) {
            addNotification({
                type: 'info',
                title: 'No Question Sets Available',
                message: 'All available question sets have already been added to this exam paper, or no question sets exist in the system yet.',
            })
            return
        }

        setSelectedQuestionSetIds([])
        setShowAddQuestionSetDialog(true)
    }

    const handleAddQuestionSets = async () => {
        if (selectedQuestionSetIds.length === 0 || !examPaper || addingQuestionSets) return

        setAddingQuestionSets(true)

        try {
            console.log('🔄 Adding question sets to exam paper:', {
                examPaperId: params.id,
                questionSetIds: selectedQuestionSetIds,
                count: selectedQuestionSetIds.length
            })

            // Add all selected question sets using standardized error handling
            const promises = selectedQuestionSetIds.map(async (questionSetId) => {
                const { result, errorResult } = await executeAPICall(
                    () => adminAPI.examPapers.addQuestionSet(params.id as string, questionSetId),
                    {
                        operation: `Add Question Set ${questionSetId}`,
                        logParams: { examPaperId: params.id, questionSetId }
                    }
                )
                return { result, errorResult, questionSetId }
            })

            const results = await Promise.all(promises)
            const failedResults = results.filter(r => r.result.error)
            const failedCount = failedResults.length

            if (failedCount === 0) {
                // All question sets added successfully
                const questionSetNames = selectedQuestionSetIds
                    .map(id => availableQuestionSets.find(qs => qs.id === id)?.title || `Question Set ${id}`)
                    .join(', ')

                addNotification({
                    type: 'success',
                    title: 'Question Sets Added Successfully',
                    message: `Successfully added ${selectedQuestionSetIds.length} question set${selectedQuestionSetIds.length > 1 ? 's' : ''}: ${questionSetNames}`
                })
                setShowAddQuestionSetDialog(false)
                setSelectedQuestionSetIds([])

                // Reload question sets to show the newly added ones
                await reloadQuestionSets()
            } else if (failedCount < selectedQuestionSetIds.length) {
                // Partial success
                const successCount = selectedQuestionSetIds.length - failedCount
                const successfulIds = results
                    .filter(r => !r.result.error)
                    .map(r => r.questionSetId)
                const successfulNames = successfulIds
                    .map(id => availableQuestionSets.find(qs => qs.id === id)?.title || `Question Set ${id}`)
                    .join(', ')

                console.warn('⚠️ Partial success adding question sets:', {
                    successCount,
                    failedCount,
                    failedResults: failedResults.map(r => ({ id: r.questionSetId, error: r.errorResult }))
                })

                addNotification({
                    type: 'warning',
                    title: 'Partially Successful',
                    message: `Successfully added ${successCount} question set${successCount !== 1 ? 's' : ''} (${successfulNames}), but ${failedCount} failed to add. Please try again for the failed items.`
                })
                setShowAddQuestionSetDialog(false)
                setSelectedQuestionSetIds([])

                // Reload question sets to show what was actually added
                await reloadQuestionSets()
            } else {
                // All failed - handle specific error cases like the details page
                const firstError = failedResults[0]?.errorResult
                const firstResult = failedResults[0]?.result

                // Check if it's a 409 conflict (already associated)
                if (firstResult?.error && typeof firstResult.error === 'object' &&
                    (firstResult.error as any).detail?.includes('already associated')) {

                    addNotification({
                        type: 'warning',
                        title: 'Already Associated',
                        message: 'The selected question set is already associated with this exam paper.'
                    })

                    // Still reload question sets to show current state
                    await reloadQuestionSets()
                } else if (firstError) {
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

                setShowAddQuestionSetDialog(false)
                setSelectedQuestionSetIds([])
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

    // Helper function to reload exam paper data (like details page)
    const loadExamPaperData = async () => {
        try {
            console.log('🔄 Reloading exam paper data for edit page')
            const response = await adminAPI.examPapers.getById(params.id as string)
            if (!response.error && response.data) {
                const paperData = (response.data as any).data || response.data
                console.log('✅ Reloaded exam paper data:', {
                    id: paperData.id,
                    questionSetsCount: paperData.question_sets?.length || 0
                })
                setExamPaper(paperData as ExamPaperRead)

                // If the exam paper has question sets, use them to update the display
                if (paperData?.question_sets && paperData.question_sets.length > 0) {
                    console.log('📋 [EDIT PAGE] Found question sets in exam paper data:', paperData.question_sets.length)
                    setQuestionSets(paperData.question_sets as QuestionSetRead[])
                }
            }
        } catch (error) {
            console.error('Error reloading exam paper data:', error)
        }
    }

    // Helper function to load questions for all question sets
    const loadQuestionSetQuestions = async (questionSetIds: string[]) => {
        if (questionSetIds.length === 0) {
            setQuestionSetQuestions([])
            return
        }

        setLoadingQuestions(true)
        try {
            console.log('🔄 Loading questions for question sets:', questionSetIds)

            // Load questions for each question set
            const promises = questionSetIds.map(async (questionSetId) => {
                const response = await adminAPI.questions.list({
                    question_set_id: questionSetId,
                    exam_paper_id: params.id as string,
                    limit: 100,
                    skip: 0
                })

                if (!response.error && response.data) {
                    const data = (response.data as any).data
                    return data?.items || []
                }
                return []
            })

            const results = await Promise.all(promises)
            const allQuestions = results.flat()

            // Deduplicate questions by ID to avoid React key conflicts
            const uniqueQuestions = Array.from(
                new Map(allQuestions.map(q => [q.id, q])).values()
            )

            setQuestionSetQuestions(uniqueQuestions as QuestionRead[])
        } catch (error) {
            console.error('❌ Error loading question set questions:', error)
            setQuestionSetQuestions([])
        } finally {
            setLoadingQuestions(false)
        }
    }

    // Helper function to reload question sets with nested questions
    const reloadQuestionSets = async () => {
        setQuestionSetsLoading(true)

        try {
            // Load question sets with nested questions using the dedicated endpoint
            const questionSetsResponse = await adminAPI.questionSets.getByExamPaper(params.id as string)
            
            if (!questionSetsResponse.error && questionSetsResponse.data) {
                const questionSetsData = (questionSetsResponse.data as any).data || []
                setQuestionSets(questionSetsData as QuestionSetRead[])
                
                // Extract all questions (main and sub) from the nested structure
                const allQuestions: QuestionRead[] = []
                questionSetsData.forEach((qs: any) => {
                    if (qs.questions && Array.isArray(qs.questions)) {
                        qs.questions.forEach((q: any) => {
                            allQuestions.push(q)
                            // Also add children if they exist
                            if (q.children && Array.isArray(q.children)) {
                                allQuestions.push(...q.children)
                            }
                        })
                    }
                })
                
                setQuestionSetQuestions(allQuestions)
            }

            // Also reload available question sets to ensure the QuestionSetSelector has updated data
            await reloadAvailableQuestionSets()
        } catch (error) {
            console.error('Error reloading question sets:', error)
        } finally {
            setQuestionSetsLoading(false)
        }
    }

    // Helper function to reload available question sets for the selector
    const reloadAvailableQuestionSets = async () => {
        const { result, errorResult } = await executeAPICall(
            () => adminAPI.questionSets.list({ limit: 100, skip: 0 }),
            {
                operation: 'Reload Available Question Sets',
                logParams: { limit: 100, skip: 0 }
            }
        )

        if (!result.error && result.data) {
            // The list endpoint returns IGetResponsePaginated_QuestionSetRead_
            const questionSetsData = parseQuestionSetsResponse(result as any)

            console.log('✅ Successfully reloaded available question sets:', {
                count: questionSetsData.length
            })

            setAvailableQuestionSets(questionSetsData as QuestionSetRead[])

            // Note: QuestionSetRead doesn't include questions array, so we can't extract individual questions
            // The AddQuestionDialog should use the question sets API or questions API directly
            setAvailableQuestions([])
        } else {
            // Don't show error notification here as this is a background reload
            console.warn('⚠️ Failed to reload available question sets:', errorResult?.message || 'Unknown error')
        }
    }

    const handleRemoveQuestionSet = async (questionSetId: string) => {
        const removedQuestionSet = questionSets.find(qs => qs.id === questionSetId)

        const { result, errorResult } = await executeAPICall(
            () => adminAPI.examPapers.removeQuestionSet(params.id as string, questionSetId),
            {
                operation: 'Remove Question Set',
                logParams: {
                    examPaperId: params.id,
                    questionSetId,
                    questionSetTitle: removedQuestionSet?.title
                }
            }
        )

        if (!result.error) {
            const questionSetName = removedQuestionSet?.title || `Question Set ${questionSetId}`
            addNotification({
                type: 'success',
                title: 'Question Set Removed Successfully',
                message: `Successfully removed "${questionSetName}" from the exam paper. All associated questions have been removed.`,
            })

            // Reload question sets to show the updated list
            await reloadQuestionSets()
        } else if (errorResult) {
            addNotification({
                type: errorResult.type,
                title: errorResult.title,
                message: `${errorResult.message} Please try again or contact support if the problem persists.`
            })
        }
    }

    // Handler for editing a question
    const handleEditQuestion = (question: QuestionRead) => {
        // Open the edit dialog with the question data
        setEditingQuestion(question)
        setIsSubQuestion(question.is_sub_question || false)
        setParentQuestionId(question.parent_id || '')
        setShowAddQuestionDialog(true)
    }

    // Handler for deleting a question
    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            return
        }

        try {
            const response = await adminAPI.questions.delete(questionId)

            if (!response.error) {
                addNotification({
                    type: 'success',
                    title: 'Question Deleted',
                    message: 'The question has been successfully deleted.'
                })

                // Reload questions
                await reloadQuestionSets()
            } else {
                throw new Error(response.error?.message || 'Failed to delete question')
            }
        } catch (error) {
            console.error('Error deleting question:', error)
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: error instanceof Error ? error.message : 'Failed to delete question'
            })
        }
    }

    // Handler for viewing a question
    const handleViewQuestion = (questionId: string) => {
        router.push(`/dashboard/questions/${questionId}`)
    }

    // Handler for adding a sub-question
    const handleAddSubQuestion = (parentId: string) => {
        // Set the parent ID and open the add question dialog
        setParentQuestionId(parentId)
        setIsSubQuestion(true)
        setShowAddQuestionDialog(true)
    }

    const breadcrumbItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Exam Papers', href: '/dashboard/exam-papers' },
        { label: examPaper?.title?.name || examPaper?.identifying_name || 'Loading...', href: `/dashboard/exam-papers/${params.id}` },
        { label: 'Edit', href: `/dashboard/exam-papers/${params.id}/edit` },
    ]

    const totalMarks = questions.reduce((sum, question) => sum + (question.marks || 0), 0)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Loading exam paper..." />
            </div>
        )
    }

    if (!examPaper) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Exam Paper Not Found</h3>
                    <p className="text-gray-600 mb-4">The requested exam paper could not be found.</p>
                    <Button onClick={() => router.push('/dashboard/exam-papers')}>
                        Back to Exam Papers
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="hover:bg-gray-100"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold text-gray-900">Edit Exam Paper</h1>
                            {hasUnsavedChanges && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    Unsaved changes
                                </Badge>
                            )}
                            {lastSaved && !hasUnsavedChanges && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    <Check className="mr-1 h-3 w-3" />
                                    Saved
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Modify exam paper details and manage questions</span>
                            {lastSaved && (
                                <span className="flex items-center">
                                    <History className="mr-1 h-3 w-3" />
                                    Last saved: {lastSaved.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {isSaving ? (
                        <>
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            <Breadcrumb items={breadcrumbItems} />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Edit the basic details of the exam paper
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="title_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select title" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {titles.filter(title => title.id && title.id.trim() !== '').map((title) => (
                                                                    <SelectItem key={title.id} value={title.id}>
                                                                        {title.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => setShowAddTitleDialog(true)}
                                                            className="shrink-0"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select description" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {descriptions.filter(desc => desc.id && desc.id.trim() !== '').map((desc) => (
                                                                    <SelectItem key={desc.id} value={desc.id}>
                                                                        {desc.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => setShowAddDescriptionDialog(true)}
                                                            className="shrink-0"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="year_of_exam"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Academic Year</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 2024/2025" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="exam_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Exam Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="exam_duration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duration (minutes)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="180"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Duration in minutes (30-480 minutes allowed)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Institution and Course */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Building2 className="mr-2 h-5 w-5" />
                                        Institution & Course
                                    </CardTitle>
                                    <CardDescription>
                                        Select the institution and course for this exam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="institution_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Institution</FormLabel>
                                                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select institution" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="w-[24rem] max-h-72 overflow-auto">
                                                            <div className="p-2 sticky top-0 bg-background">
                                                                <Input
                                                                    placeholder="Search institutions..."
                                                                    value={institutionSearch}
                                                                    onChange={(e) => setInstitutionSearch(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onKeyDown={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                            {institutionsLoading ? (
                                                                <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
                                                            ) : institutions.length > 0 ? (
                                                                institutions.filter(institution => institution.id && institution.id.trim() !== '').map((institution) => (
                                                                    <SelectItem key={institution.id} value={institution.id}>
                                                                        <div className="flex flex-col w-full">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium">{institution.name}</span>
                                                                                {institution.key && (
                                                                                    <Badge variant="secondary" className="text-xs">
                                                                                        {institution.key}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                                {institution.location && (
                                                                                    <div className="flex items-center gap-1">
                                                                                        <MapPin className="h-3 w-3" />
                                                                                        <span>{institution.location}</span>
                                                                                    </div>
                                                                                )}
                                                                                {institution.category && (
                                                                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                                                                        {institution.category}
                                                                                    </Badge>
                                                                                )}
                                                                                {institution.institution_type && (
                                                                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                                                                        {institution.institution_type}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="course_id"
                                            render={({ field }) => {
                                                const selectedCourse = courses?.find(course => course.id === field.value)
                                                return (
                                                    <FormItem>
                                                        <FormLabel>Course</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select course">
                                                                        {selectedCourse && (
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <span className="font-medium">{selectedCourse.name}</span>
                                                                                {selectedCourse.course_acronym && (
                                                                                    <Badge variant="secondary" className="ml-2 text-xs">
                                                                                        {selectedCourse.course_acronym}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </SelectValue>
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="max-h-[300px]">
                                                                {(courses || []).filter(course => course.id && course.id.trim() !== '').map((course) => (
                                                                    <SelectItem key={course.id} value={course.id}>
                                                                        <div className="flex flex-col w-full">
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <span className="font-medium">{course.name}</span>
                                                                                {course.course_acronym && (
                                                                                    <Badge variant="secondary" className="ml-2 text-xs">
                                                                                        {course.course_acronym}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            {course.description && (
                                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                                    {course.description}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Question Sets Management */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Layers className="mr-2 h-5 w-5" />
                                            Question Sets ({questionSets.length})
                                        </div>
                                    </CardTitle>
                                    <CardDescription>
                                        Manage question sets for this exam paper. Each set contains multiple questions organized by topic or difficulty. Question sets can be reused across different exam papers for consistency.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">


                                    {questionSetsLoading || loadingQuestions ? (
                                        <div className="text-center py-8">
                                            <LoadingSpinner className="mx-auto mb-4" />
                                            <h4 className="text-lg font-medium mb-2">
                                                {questionSetsLoading ? 'Loading question sets...' : 'Loading questions...'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {questionSetsLoading
                                                    ? 'Please wait while we load the question sets for this exam paper.'
                                                    : 'Please wait while we load the questions for each question set.'}
                                            </p>
                                        </div>
                                    ) : questionSets.length > 0 ? (
                                        <HierarchicalQuestions
                                            questionSets={questionSets}
                                            questions={questionSetQuestions}
                                            onEditQuestion={handleEditQuestion}
                                            onDeleteQuestion={handleDeleteQuestion}
                                            onViewQuestion={handleViewQuestion}
                                            onAddSubQuestion={handleAddSubQuestion}
                                            onDeleteQuestionSet={handleRemoveQuestionSet}
                                            showActions={true}
                                            defaultExpanded={false}
                                            emptyMessage="No question sets found for this exam paper."
                                        />
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h4 className="text-lg font-medium mb-2">No question sets added yet</h4>
                                            <p className="text-sm mb-4">Question sets help organize your exam questions into logical groups. Each set can contain multiple questions with different difficulty levels.</p>
                                            <div className="text-xs text-gray-400 space-y-1">
                                                <p>💡 <strong>Tip:</strong> Start by adding a question set, then questions will be automatically included</p>
                                                <p>📚 Question sets can be reused across multiple exam papers</p>
                                                <p>🎯 Each set can have its own theme or topic focus</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Button type="button" variant="outline" className="w-full" onClick={handleOpenAddQuestionSetDialog}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Question Set
                                        </Button>


                                    </div>
                                </CardContent>
                            </Card>

                            {/* Questions Management */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <ListChecks className="mr-2 h-5 w-5" />
                                            Questions ({questions.length})
                                        </div>
                                        <Badge variant="secondary" className="ml-2">
                                            Total: {totalMarks} marks
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Individual questions from question sets and question bank. Questions from sets are automatically included here. You can also add individual questions or reorder them as needed.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {questions.length > 0 ? (
                                        <div className="space-y-2">
                                            {questions.map((question, index) => (
                                                <QuestionItem
                                                    key={question.id}
                                                    question={question}
                                                    index={index}
                                                    onRemove={handleRemoveQuestion}
                                                    onMoveUp={handleMoveQuestionUp}
                                                    onMoveDown={handleMoveQuestionDown}
                                                    isFirst={index === 0}
                                                    isLast={index === questions.length - 1}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm">No Questions added yet</p>
                                        </div>
                                    )}

                                    <Button type="button" variant="outline" className="w-full" onClick={() => {
                                        setIsSubQuestion(false)
                                        setShowAddQuestionDialog(true)
                                    }}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Question
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Tags */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Tags</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {(form.watch('tags') || []).map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {tag}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-1 h-4 w-4 p-0 hover:bg-gray-300"
                                                    onClick={() => handleRemoveTag(tag)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="Add tag"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            className="text-sm"
                                        />
                                        <Button type="button" size="sm" onClick={handleAddTag}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Instructions */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-sm font-medium">Instructions</CardTitle>
                                            <CardDescription>
                                                Select exam instructions from available options
                                            </CardDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAddInstructionDialog(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Selected Instructions Display */}
                                    <div className="space-y-2">
                                        {(form.watch('instruction_ids') || []).map((instructionId, index) => {
                                            const instruction = instructions.find(i => i.id === instructionId)
                                            return instruction ? (
                                                <div key={instructionId} className="flex items-start space-x-2 p-2 bg-gray-50 rounded text-sm">
                                                    <span className="flex-1">{index + 1}. {instruction.name}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 text-gray-400 hover:text-red-600"
                                                        onClick={() => handleRemoveInstruction(instructionId)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : null
                                        })}
                                        {(form.watch('instruction_ids') || []).length === 0 && (
                                            <div className="text-sm text-muted-foreground p-2 text-center">
                                                No instructions selected
                                            </div>
                                        )}
                                    </div>

                                    {/* Available Instructions Multi-Select */}
                                    <div className="border rounded-md p-3">
                                        <Label className="text-sm font-medium mb-2 block">Available Instructions</Label>
                                        <div className="max-h-[200px] overflow-y-auto space-y-2">
                                            {instructions.filter(instruction => instruction.id && instruction.id.trim() !== '').map((instruction) => {
                                                const isSelected = (form.watch('instruction_ids') || []).includes(instruction.id)
                                                return (
                                                    <div key={instruction.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`instruction-${instruction.id}`}
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleToggleInstruction(instruction.id)}
                                                        />
                                                        <Label
                                                            htmlFor={`instruction-${instruction.id}`}
                                                            className="text-sm cursor-pointer flex-1"
                                                        >
                                                            {instruction.name}
                                                        </Label>
                                                    </div>
                                                )
                                            })}
                                            {instructions.length === 0 && (
                                                <div className="text-sm text-muted-foreground text-center py-2">
                                                    No instructions available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Questions:</span>
                                        <span className="font-medium">{questions.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Marks:</span>
                                        <span className="font-medium">{totalMarks}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{form.watch('exam_duration')} min</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tags:</span>
                                        <span className="font-medium">{(form.watch('tags') || []).length}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>

            {/* Add Title Dialog */}
            <Dialog open={showAddTitleDialog} onOpenChange={setShowAddTitleDialog}>
                <DialogContent className="max-w-[95vw] sm:max-w-[400px] lg:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Add New Title</DialogTitle>
                        <DialogDescription>
                            Create a new exam title.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-title">Title Name</Label>
                            <Input
                                id="new-title"
                                placeholder="e.g., UNIVERSITY EXAMINATIONS"
                                value={newTitleName}
                                onChange={(e) => setNewTitleName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateTitle()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddTitleDialog(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateTitle} disabled={!newTitleName.trim()}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Description Dialog */}
            <Dialog open={showAddDescriptionDialog} onOpenChange={setShowAddDescriptionDialog}>
                <DialogContent className="max-w-[95vw] sm:max-w-[400px] lg:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Add New Description</DialogTitle>
                        <DialogDescription>
                            Create a new exam description.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-description">Description Text</Label>
                            <Input
                                id="new-description"
                                placeholder="e.g., End of Semester Examination"
                                value={newDescriptionText}
                                onChange={(e) => setNewDescriptionText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateDescription()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddDescriptionDialog(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateDescription} disabled={!newDescriptionText.trim()}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Instruction Dialog */}
            <Dialog open={showAddInstructionDialog} onOpenChange={setShowAddInstructionDialog}>
                <DialogContent className="max-w-[95vw] sm:max-w-[400px] lg:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Add New Instruction</DialogTitle>
                        <DialogDescription>
                            Create a new instruction.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-instruction">Instruction Text</Label>
                            <Input
                                id="new-instruction"
                                placeholder="e.g., Answer all questions"
                                value={newInstructionName}
                                onChange={(e) => setNewInstructionName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateInstruction()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddInstructionDialog(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateInstruction} disabled={!newInstructionName.trim()}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Question Dialog */}
            <Dialog open={showAddQuestionDialog} onOpenChange={(open) => {
                if (!open) {
                    // Immediately reset to trigger unmount
                    setEditingQuestion(null)
                    setIsSubQuestion(false)
                    setParentQuestionId('')
                }
                setShowAddQuestionDialog(open)
            }}>
                <DialogContent className="
                    w-[90vw]                 /* Base: almost full width on small screens */
                    sm:max-w-[450px]         /* Small screens (≥640px): up to 450px */
                    md:max-w-[650px]         /* Medium screens (≥768px): up to 650px */
                    lg:max-w-[800px]         /* Large screens (≥1024px): up to 800px */
                    xl:max-w-[1000px]        /* Extra large: up to 1000px */
                    max-h-[90vh]             /* Limit height */
                    overflow-y-auto          /* Scroll if content too tall */
                    ">
                    {showAddQuestionDialog && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl">
                                    {editingQuestion 
                                        ? 'Edit Question' 
                                        : isSubQuestion 
                                            ? 'Add Sub-question' 
                                            : 'Add New Question'}
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                    {editingQuestion
                                        ? 'Update the question details below.'
                                        : isSubQuestion
                                            ? 'Fill in the details to create a sub-question for the selected main question.'
                                            : 'Fill in the details to create a new question and add it to a question set.'}
                                </DialogDescription>
                            </DialogHeader>
                            {questionSetsLoading || loadingQuestions ? (
                                <div className="py-8 text-center">
                                    <LoadingSpinner className="mx-auto mb-4" />
                                    <p className="text-sm text-gray-500">Loading question data...</p>
                                </div>
                            ) : questionSets.length > 0 ? (
                                <QuestionForm
                                    key={editingQuestion?.id || 'new'}
                                    question={editingQuestion || undefined}
                                    questionSetId={editingQuestion?.question_set_id || questionSets[0]?.id}
                                    examPaperId={params.id as string}
                                    availableQuestionSets={questionSets || []}
                                    availableMainQuestions={(questionSetQuestions || []).filter(q => !q.parent_id && !q.is_sub_question)}
                                    parentQuestionId={isSubQuestion ? parentQuestionId : undefined}
                                    isSubQuestion={isSubQuestion}
                                    onSuccess={() => {
                                        setShowAddQuestionDialog(false)
                                        setEditingQuestion(null)
                                        setIsSubQuestion(false)
                                        setParentQuestionId('')
                                        reloadQuestionSets()
                                    }}
                                    onCancel={() => {
                                        setShowAddQuestionDialog(false)
                                        setEditingQuestion(null)
                                        setIsSubQuestion(false)
                                        setParentQuestionId('')
                                    }}
                                />
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-red-600">Please add a question set to the exam paper before adding questions.</p>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Question Set Dialog */}
            <Dialog open={showAddQuestionSetDialog} onOpenChange={setShowAddQuestionSetDialog}>
                <DialogContent className="max-w-[95vw] sm:max-w-[450px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Question Sets</DialogTitle>
                        <DialogDescription>
                            Select question sets to add to this exam paper.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <QuestionSetSelector
                            selectedQuestionSetIds={selectedQuestionSetIds}
                            onSelectionChange={setSelectedQuestionSetIds}
                            excludeQuestionSetIds={questionSets.map(qs => qs.id)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddQuestionSetDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddQuestionSets}
                            disabled={selectedQuestionSetIds.length === 0 || addingQuestionSets}
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
        </div>
    )
}
