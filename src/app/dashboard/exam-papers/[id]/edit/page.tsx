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

type ExamTitleRead = components['schemas']['ExamTitleRead']
type ExamDescriptionRead = components['schemas']['ExamDescriptionRead']
type InstitutionRead = components['schemas']['InstitutionRead']
type CourseRead = components['schemas']['CourseRead']
type InstructionRead = components['schemas']['InstructionRead']
type QuestionRead = components['schemas']['QuestionRead'] & {
    // Add missing properties for UI compatibility
    question_text?: string
    question_type?: string
    difficulty_level?: string
}
type QuestionSetRead = components['schemas']['QuestionSetRead']

// Form validation schema
const examPaperEditSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    description: z.string().optional(),
    year_of_exam: z.string().min(1, 'Year is required'),
    exam_duration: z.coerce.number().min(30, 'Duration must be at least 30 minutes').max(480, 'Duration cannot exceed 8 hours'),
    exam_date: z.string().min(1, 'Exam date is required'),
    institution_id: z.string().min(1, 'Institution is required'),
    course_id: z.string().min(1, 'Course is required'),
    tags: z.array(z.string()).optional(),
    instruction_ids: z.array(z.string()).optional(), // Changed from instructions to instruction_ids
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

interface QuestionSetItemProps {
    questionSet: QuestionSetRead
    index: number
    onRemove: (questionSetId: string) => void
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

function QuestionSetItem({ questionSet, index, onRemove }: QuestionSetItemProps) {
    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">Set {index + 1}</Badge>
                                <Badge variant="default">{questionSet.title || 'Question Set'}</Badge>
                                <Badge variant="secondary">
                                    {questionSet.questions_count || questionSet.questions?.length || 0} questions
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                                Question Set ID: {questionSet.slug || questionSet.id}
                            </p>
                            {questionSet.questions && questionSet.questions.length > 0 && (
                                <div className="text-xs text-gray-500">
                                    Questions: {questionSet.questions.slice(0, 3).map((q, i) => {
                                        const questionText = q.question_text ||
                                            (q.text && typeof q.text === 'object' ?
                                                q.text.blocks?.map((block: any) => block.data?.text || '').join(' ') || 'Question' :
                                                q.text || 'Question')
                                        return questionText.substring(0, 30) + (questionText.length > 30 ? '...' : '')
                                    }).join(', ')}
                                    {questionSet.questions.length > 3 && ` and ${questionSet.questions.length - 3} more`}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(questionSet.id)}
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
    onAddQuestion: (question: QuestionRead) => void
}

interface AddQuestionSetDialogProps {
    availableQuestionSets: QuestionSetRead[]
    currentQuestionSets: QuestionSetRead[]
    onAddQuestionSet: (questionSet: QuestionSetRead) => void
}

function AddQuestionDialog({ availableQuestions, onAddQuestion }: AddQuestionDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
    const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')

    const filteredQuestions = useMemo(() => {
        return availableQuestions.filter(question => {
            // Extract question text for search
            const questionText = question.question_text ||
                (question.text && typeof question.text === 'object' ?
                    question.text.blocks?.map((block: any) => block.data?.text || '').join(' ') || '' :
                    question.text || '')

            const matchesSearch = !searchQuery ||
                questionText.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesDifficulty = !selectedDifficulty ||
                (question.difficulty_level || 'medium') === selectedDifficulty
            const matchesType = !selectedQuestionType ||
                (question.question_type || question.numbering_style || 'Question') === selectedQuestionType

            return matchesSearch && matchesDifficulty && matchesType
        })
    }, [availableQuestions, searchQuery, selectedDifficulty, selectedQuestionType])

    const handleAddSelected = () => {
        selectedQuestions.forEach(questionId => {
            const question = availableQuestions.find(q => q.id === questionId)
            if (question) {
                onAddQuestion(question)
            }
        })
        setSelectedQuestions([])
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
                    <DialogTitle>Add Questions from Question Bank</DialogTitle>
                    <DialogDescription>
                        Select questions to add to this exam paper. Use filters to find specific questions.
                    </DialogDescription>
                </DialogHeader>

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
                                <SelectItem value="">All</SelectItem>
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
                                <SelectItem value="">All Types</SelectItem>
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
                    <Button onClick={handleAddSelected} disabled={selectedQuestions.length === 0}>
                        Add Selected Questions ({selectedQuestions.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AddQuestionSetDialog({ availableQuestionSets, currentQuestionSets, onAddQuestionSet }: AddQuestionSetDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedQuestionSet, setSelectedQuestionSet] = useState<string>('')

    // Filter out question sets that are already added
    const currentQuestionSetIds = currentQuestionSets.map(qs => qs.id)
    const filteredQuestionSets = availableQuestionSets.filter(qs => !currentQuestionSetIds.includes(qs.id))

    const handleAddQuestionSet = () => {
        const questionSet = availableQuestionSets.find(qs => qs.id === selectedQuestionSet)
        if (questionSet) {
            onAddQuestionSet(questionSet)
            setSelectedQuestionSet('')
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question Set
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Add Question Set to Exam Paper</DialogTitle>
                    <DialogDescription>
                        Select a question set to add to this exam paper. All questions in the set will be included.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0 py-4">
                    {filteredQuestionSets.length > 0 ? (
                        <div className="space-y-3 pr-2">
                            {filteredQuestionSets.map((questionSet) => (
                                <Card
                                    key={questionSet.id}
                                    className={`cursor-pointer transition-colors hover:shadow-md ${selectedQuestionSet === questionSet.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => setSelectedQuestionSet(questionSet.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                checked={selectedQuestionSet === questionSet.id}
                                                onChange={() => { }} // Handled by card click
                                                className="mt-1"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {questionSet.title || 'Question Set'}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {questionSet.questions_count || questionSet.questions?.length || 0} questions
                                                    </Badge>
                                                </div>
                                                <h4 className="font-medium text-sm text-gray-900 mb-1 truncate">
                                                    Question Set ID: {questionSet.slug || questionSet.id}
                                                </h4>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    Created: {questionSet.created_at ? new Date(questionSet.created_at).toLocaleDateString() : 'Unknown date'}
                                                </p>
                                                {questionSet.questions && questionSet.questions.length > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        <p className="mb-1 font-medium">Sample questions:</p>
                                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                                            {questionSet.questions.slice(0, 2).map((question, idx) => (
                                                                <li key={idx} className="truncate">
                                                                    Q{question.question_number}: {
                                                                        question.text?.blocks?.[0]?.data?.text?.substring?.(0, 60) ||
                                                                        'Question content...'
                                                                    }...
                                                                </li>
                                                            ))}
                                                            {questionSet.questions.length > 2 && (
                                                                <li className="text-gray-400">
                                                                    +{questionSet.questions.length - 2} more questions
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium mb-2">No available question sets</h4>
                            <p className="text-sm">All available question sets have been added to this exam paper.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-shrink-0 border-t pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddQuestionSet}
                        disabled={!selectedQuestionSet}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Add Question Set
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
    const [institutions, setInstitutions] = useState<InstitutionRead[]>([])
    const [courses, setCourses] = useState<CourseRead[]>([])
    const [instructions, setInstructions] = useState<InstructionRead[]>([])
    const [questions, setQuestions] = useState<QuestionRead[]>([])
    const [availableQuestions, setAvailableQuestions] = useState<QuestionRead[]>([])
    const [questionSets, setQuestionSets] = useState<QuestionSetRead[]>([])
    const [availableQuestionSets, setAvailableQuestionSets] = useState<QuestionSetRead[]>([])
    const [newTag, setNewTag] = useState('')
    const [newInstruction, setNewInstruction] = useState('')
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
    const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')

    const form = useForm<ExamPaperEditFormData>({
        resolver: zodResolver(examPaperEditSchema),
        defaultValues: {
            title: '',
            description: '',
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
                title_id: examPaper.title?.id || null,
                description_id: examPaper.description?.id || null,
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
                setLastSaved(new Date())
                setHasUnsavedChanges(false)
            }
        } catch (error) {
            console.error('Auto-save failed:', error)
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

                // Load exam paper, institutions, courses, instructions, and questions from real API
                const [paperResponse, institutionsResponse, coursesResponse, instructionsResponse, questionsResponse] = await Promise.all([
                    adminAPI.examPapers.getById(params.id as string),
                    adminAPI.institutions.list(),
                    adminAPI.courses.list(),
                    adminAPI.instructions.list(),
                    adminAPI.questionSets.list()
                ])

                if (!paperResponse.error && paperResponse.data) {
                    console.log('Exam paper response:', paperResponse.data)
                    const paperData = paperResponse.data.data || paperResponse.data
                    setExamPaper(paperData)

                    // Handle question sets
                    const questionSetsData = (paperData as any).question_sets || []
                    setQuestionSets(questionSetsData)

                    // Handle questions - they might be in question_sets
                    const questions = (paperData as any).questions ||
                        questionSetsData.flatMap((qs: any) => qs.questions || []) || []
                    setQuestions(questions)

                    // Set form values based on API response structure
                    form.reset({
                        title: paperData.title?.name || '',
                        description: paperData.description?.description || '',
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
                } else {
                    const errorMessage = paperResponse.error?.message ||
                        (typeof paperResponse.error === 'string' ? paperResponse.error : 'Failed to load exam paper')
                    throw new Error(errorMessage)
                }

                if (!institutionsResponse.error && institutionsResponse.data) {
                    console.log('Institutions response:', institutionsResponse.data)
                    const institutionsData = institutionsResponse.data.data?.items || []
                    console.log('Institutions data to set:', institutionsData)
                    setInstitutions(Array.isArray(institutionsData) ? institutionsData : [])
                } else {
                    console.warn('Failed to load institutions:', institutionsResponse.error)
                    setInstitutions([])
                }

                if (!coursesResponse.error && coursesResponse.data) {
                    console.log('Courses response:', coursesResponse.data)
                    const coursesData = coursesResponse.data.data?.items || []
                    console.log('Courses data to set:', coursesData)
                    setCourses(Array.isArray(coursesData) ? coursesData : [])
                } else {
                    console.warn('Failed to load courses:', coursesResponse.error)
                    setCourses([])
                }

                if (!instructionsResponse.error && instructionsResponse.data) {
                    console.log('Instructions response:', instructionsResponse.data)
                    const instructionsData = instructionsResponse.data.data?.items || []
                    console.log('Instructions data to set:', instructionsData)
                    setInstructions(Array.isArray(instructionsData) ? instructionsData : [])
                } else {
                    console.warn('Failed to load instructions:', instructionsResponse.error)
                    setInstructions([])
                }

                if (!questionsResponse.error && questionsResponse.data) {
                    console.log('Question sets response:', questionsResponse.data)
                    const questionSetsData = questionsResponse.data.data?.items || []
                    console.log('Available question sets:', questionSetsData)
                    setAvailableQuestionSets(Array.isArray(questionSetsData) ? questionSetsData : [])

                    // Extract individual questions from available question sets for the question dialog
                    const allQuestions = questionSetsData.flatMap((qs: any) => qs.questions || [])
                    setAvailableQuestions(allQuestions)
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

    const onSubmit = async (data: ExamPaperEditFormData) => {
        try {
            setIsSaving(true)

            // Create/update title if needed
            let titleId = examPaper?.title?.id || null
            if (data.title && data.title !== examPaper?.title?.name) {
                // For now, we'll use the existing title_id or null
                // In a full implementation, you'd create a new title record
                titleId = examPaper?.title?.id || null
            }

            // Create/update description if needed  
            let descriptionId = examPaper?.description?.id || null
            if (data.description && data.description !== examPaper?.description?.description) {
                // For now, we'll use the existing description_id or null
                // In a full implementation, you'd create a new description record
                descriptionId = examPaper?.description?.id || null
            }

            const updateData: ExamPaperUpdate = {
                title_id: titleId,
                description_id: descriptionId,
                course_id: data.course_id || null,
                institution_id: data.institution_id || null,
                exam_date: data.exam_date || null,
                exam_duration: data.exam_duration || null,
                tags: data.tags || null,
                instruction_ids: data.instruction_ids || [], // Updated to use instruction_ids
                module_ids: [], // Modules would need separate handling
            }

            console.log('Updating exam paper with data:', updateData)

            const response = await adminAPI.examPapers.update(params.id as string, updateData)

            if (!response.error && response.data) {
                setLastSaved(new Date())
                setHasUnsavedChanges(false)
                addNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Exam paper updated successfully!',
                })
                // Refresh the data
                const updatedResponse = await adminAPI.examPapers.getById(params.id as string)
                if (!updatedResponse.error && updatedResponse.data) {
                    const paperData = updatedResponse.data.data || updatedResponse.data
                    setExamPaper(paperData)
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
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to update exam paper.',
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

    const handleAddQuestion = (question: QuestionRead) => {
        // Check if question is already added
        if (!questions.find(q => q.id === question.id)) {
            setQuestions(prev => [...prev, { ...question, order_index: prev.length + 1 }])
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

    const handleAddQuestionSet = async (questionSet: QuestionSetRead) => {
        try {
            console.log('Adding question set to exam paper:', {
                examPaperId: params.id,
                questionSetId: questionSet.id
            });

            const response = await adminAPI.examPapers.addQuestionSet(params.id as string, questionSet.id)

            console.log('API Response:', response);

            if (response.error) {
                throw new Error(response.error?.message || 'Failed to add question set')
            }

            // Only add the question set to the list - do NOT add individual questions
            setQuestionSets(prev => [...prev, questionSet])

            addNotification({
                type: 'success',
                title: 'Success',
                message: `Question set "${questionSet.title || 'Question Set'}" added successfully!`,
            })

            // Mark as having unsaved changes since we modified the exam paper
            setHasUnsavedChanges(true)
        } catch (error) {
            console.error('Error adding question set:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to add question set.',
            })
        }
    }

    const handleRemoveQuestionSet = async (questionSetId: string) => {
        try {
            console.log('Removing question set from exam paper:', {
                examPaperId: params.id,
                questionSetId: questionSetId
            });

            const response = await adminAPI.examPapers.removeQuestionSet(params.id as string, questionSetId)

            console.log('API Response:', response);

            if (response.error) {
                throw new Error(response.error?.message || 'Failed to remove question set')
            }

            // Only remove the question set from the list - do NOT remove individual questions
            const removedQuestionSet = questionSets.find(qs => qs.id === questionSetId)
            setQuestionSets(prev => prev.filter(qs => qs.id !== questionSetId))

            addNotification({
                type: 'success',
                title: 'Success',
                message: `Question set "${removedQuestionSet?.title || 'Question Set'}" removed successfully!`,
            })

            // Mark as having unsaved changes since we modified the exam paper
            setHasUnsavedChanges(true)
        } catch (error) {
            console.error('Error removing question set:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to remove question set.',
            })
        }
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
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter exam paper title" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter exam description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

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
                                            render={({ field }) => {
                                                const selectedInstitution = institutions?.find(inst => inst.id === field.value)
                                                return (
                                                    <FormItem>
                                                        <FormLabel>Institution</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select institution">
                                                                        {selectedInstitution && (
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <span className="font-medium">{selectedInstitution.name}</span>
                                                                                {selectedInstitution.key && (
                                                                                    <Badge variant="secondary" className="ml-2 text-xs">
                                                                                        {selectedInstitution.key}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </SelectValue>
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="max-h-[300px]">
                                                                {(institutions || []).map((institution) => (
                                                                    <SelectItem key={institution.id} value={institution.id}>
                                                                        <div className="flex flex-col w-full">
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <span className="font-medium">{institution.name}</span>
                                                                                {institution.key && (
                                                                                    <Badge variant="secondary" className="ml-2 text-xs">
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
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )
                                            }}
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
                                                                {(courses || []).map((course) => (
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
                                        Manage question sets for this exam paper. Each set contains multiple questions.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {questionSets.length > 0 ? (
                                        <div className="space-y-2">
                                            {questionSets.map((questionSet, index) => (
                                                <QuestionSetItem
                                                    key={questionSet.id}
                                                    questionSet={questionSet}
                                                    index={index}
                                                    onRemove={handleRemoveQuestionSet}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h4 className="text-lg font-medium mb-2">No question sets added</h4>
                                            <p className="text-sm">Add question sets to organize questions for this exam paper.</p>
                                        </div>
                                    )}

                                    <AddQuestionSetDialog
                                        availableQuestionSets={availableQuestionSets}
                                        currentQuestionSets={questionSets}
                                        onAddQuestionSet={handleAddQuestionSet}
                                    />
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
                                        Individual questions from question sets. Questions are automatically added when you add question sets.
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
                                            <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h4 className="text-lg font-medium mb-2">No questions added</h4>
                                            <p className="text-sm">Add questions from the question bank to get started.</p>
                                        </div>
                                    )}

                                    <AddQuestionDialog
                                        availableQuestions={availableQuestions.filter(q => !questions.find(eq => eq.id === q.id))}
                                        onAddQuestion={handleAddQuestion}
                                    />
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
                                    <CardTitle className="text-sm font-medium">Instructions</CardTitle>
                                    <CardDescription>
                                        Select exam instructions from available options
                                    </CardDescription>
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
                                            {instructions.map((instruction) => {
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
        </div>
    )
}
