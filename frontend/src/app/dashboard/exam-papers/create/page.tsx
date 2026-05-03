'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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
    Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AdminBreadcrumb } from '@/components/ui/breadcrumb'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ModuleSelector } from '@/components/features/module-selector'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import { adminAPI, type ExamPaperCreate } from '@/lib/api-admin'
import { getAuthToken } from '@/lib/api'
import type { components } from '@/types/generated/api'
import { useUIStore } from '@/stores/ui'

type ExamTitleRead = components['schemas']['ExamTitleRead']
type ExamDescriptionRead = components['schemas']['ExamDescriptionRead']
type InstitutionRead = components['schemas']['InstitutionRead']
type CourseRead = components['schemas']['CourseRead']
type ModuleRead = components['schemas']['ModuleRead']
type InstructionRead = components['schemas']['InstructionRead']

const examPaperSchema = z.object({
    title_id: z.string().uuid({ message: 'Select a title' }),
    description_id: z.string().uuid({ message: 'Select a description' }),
    course_id: z.string().uuid({ message: 'Select a course' }),
    institution_id: z.string().uuid({ message: 'Select an institution' }),
    year_of_exam: z.string().min(4, 'Enter a year range e.g. 2024/2025').nullable(),
    exam_date: z.string().nullable(),
    exam_duration: z.coerce.number().int().min(1, 'Duration in minutes'),
    module_ids: z.array(z.string().uuid()).min(1, 'Select at least one module'),
    instruction_ids: z.array(z.string().uuid()).default([]),
    tags_input: z.string().optional(),
})

type ExamPaperFormValues = z.infer<typeof examPaperSchema>

function generateAcademicYears(startYear: number): string[] {
    const currentYear = new Date().getFullYear()
    const lastStart = currentYear - 1
    const years: string[] = []
    for (let y = startYear;y <= lastStart;y++) {
        years.push(`${y}/${y + 1}`)
    }
    return years.reverse()
}

export default function CreateExamPaperPage() {
    const router = useRouter()
    const { addNotification } = useUIStore()

    const form = useForm({
        resolver: zodResolver(examPaperSchema),
        defaultValues: {
            title_id: '' as unknown as string,
            description_id: '' as unknown as string,
            course_id: '' as unknown as string,
            institution_id: '' as unknown as string,
            year_of_exam: null,
            exam_date: null,
            exam_duration: 120,
            module_ids: [],
            instruction_ids: [],
            tags_input: '',
        },
    })

    const [step, setStep] = useState<number>(1)
    const [submitting, setSubmitting] = useState<boolean>(false)

    const [titles, setTitles] = useState<ExamTitleRead[]>([])
    const [descriptions, setDescriptions] = useState<ExamDescriptionRead[]>([])
    const [institutions, setInstitutions] = useState<InstitutionRead[]>([])
    const [courses, setCourses] = useState<CourseRead[]>([])
    const [modules, setModules] = useState<ModuleRead[]>([])
    const [instructions, setInstructions] = useState<InstructionRead[]>([])
    const [loadingLookups, setLoadingLookups] = useState<boolean>(true)
    const academicYears = useMemo(() => generateAcademicYears(1990), [])
    const [institutionSearch, setInstitutionSearch] = useState('')
    const [institutionsLoading, setInstitutionsLoading] = useState(false)
    const [showModuleSelector, setShowModuleSelector] = useState(false)
    
    // Dialog states for adding new entities
    const [showAddTitleDialog, setShowAddTitleDialog] = useState(false)
    const [showAddDescriptionDialog, setShowAddDescriptionDialog] = useState(false)
    const [showAddInstructionDialog, setShowAddInstructionDialog] = useState(false)
    const [newTitleName, setNewTitleName] = useState('')
    const [newDescriptionText, setNewDescriptionText] = useState('')
    const [newInstructionName, setNewInstructionName] = useState('')

    useEffect(() => {
        const fetchLookups = async () => {
            try {
                setLoadingLookups(true)
                // Fetch titles/descriptions/courses/modules/instructions concurrently
                const [titlesRes, descRes, courseRes, moduleRes, instrRes] = await Promise.all([
                    adminAPI.examTitles.list({ limit: 50, skip: 0 }),
                    adminAPI.examDescriptions.list({ limit: 50, skip: 0 }),
                    adminAPI.courses.list({ limit: 50, skip: 0 }),
                    adminAPI.modules.list({ limit: 100, skip: 0 }),
                    adminAPI.instructions.list({ limit: 100, skip: 0 }),
                ])

                const titleItems = titlesRes.data?.data?.items ?? []
                const descItems = descRes.data?.data?.items ?? []
                const courseItems = courseRes.data?.data?.items ?? []
                const moduleItems = moduleRes.data?.data?.items ?? []
                const instrItems = instrRes.data?.data?.items ?? []

                setTitles(titleItems as ExamTitleRead[])
                setDescriptions(descItems as ExamDescriptionRead[])
                setCourses(courseItems as CourseRead[])
                setModules(moduleItems as ModuleRead[])
                setInstructions(instrItems as InstructionRead[])

            } catch (error) {
                console.error('Failed to load lookups', error)
                addNotification({ type: 'error', title: 'Failed to load data', message: 'Some dropdowns may be empty.' })
            } finally {
                setLoadingLookups(false)
            }
        }
        fetchLookups()
    }, [addNotification])

    // Server-side institution search with debounce
    useEffect(() => {
        let cancelled = false
        setInstitutionsLoading(true)
        const h = setTimeout(async () => {
            try {
                const q = institutionSearch.trim() || '*'
                const res = await adminAPI.institutions.search({ q, limit: 50, skip: 0, highlight: false })
                if (!cancelled) {
                    const items = (res.data?.data?.items ?? []) as InstitutionRead[]
                    setInstitutions(items)
                }
            } catch (e) {
                if (!cancelled) {
                    setInstitutions([])
                }
            } finally {
                if (!cancelled) setInstitutionsLoading(false)
            }
        }, 300)
        return () => {
            cancelled = true
            clearTimeout(h)
        }
    }, [institutionSearch])

    const onSubmit = async (values: any) => {
        try {
            setSubmitting(true)

            // Ensure authenticated (bypass mode won't have a token)
            const token = getAuthToken()
            if (!token) {
                addNotification({
                    type: 'error',
                    title: 'Authentication required',
                    message: 'Please login to create an exam paper.',
                })
                router.push('/auth/login')
                return
            }

            const payload: ExamPaperCreate = {
                title_id: values.title_id,
                description_id: values.description_id,
                course_id: values.course_id,
                institution_id: values.institution_id,
                year_of_exam: values.year_of_exam ?? null,
                exam_date: values.exam_date ?? null,
                exam_duration: values.exam_duration,
                instruction_ids: values.instruction_ids,
                module_ids: values.module_ids,
                // API schema allows unknown[] for tags; we send string[] derived from input
                tags: values.tags_input
                    ? values.tags_input.split(',').map((t: string) => t.trim()).filter(Boolean)
                    : [],
            }

            const res = await adminAPI.examPapers.create(payload)
            if (res.data?.data?.id) {
                addNotification({ type: 'success', title: 'Exam paper created', message: 'Redirecting to details...' })
                router.replace(`/dashboard/exam-papers/${res.data.data.id}`)
            } else {
                addNotification({ type: 'warning', title: 'Created, but missing ID', message: 'Please refresh to verify.' })
            }
        } catch (error: any) {
            console.error('Create exam paper error', error)
            addNotification({ type: 'error', title: 'Failed to create', message: error?.message || 'Unexpected error' })
        } finally {
            setSubmitting(false)
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
                const newTitle = response.data.data
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
                const newDescription = response.data.data
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
                const newInstruction = response.data.data
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
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to create instruction.',
            })
        }
    }

    const yearOfExam = form.watch('year_of_exam')
    const examDuration = form.watch('exam_duration')
    const institutionId = form.watch('institution_id')
    const courseId = form.watch('course_id')
    const moduleIds = form.watch('module_ids')
    const titleId = form.watch('title_id')
    const descriptionId = form.watch('description_id')

    const nextDisabled = (() => {
        if (step === 1) {
            return !yearOfExam || !examDuration
        }
        if (step === 2) {
            return !institutionId || !courseId || !(Array.isArray(moduleIds) && moduleIds.length > 0)
        }
        if (step === 3) {
            return !titleId || !descriptionId
        }
        return false
    })()

    return (
        <div className="space-y-6">
            <AdminBreadcrumb
                currentPage="Create Exam Paper"
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Exam Papers', href: '/dashboard/exam-papers' },
                ]}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Exam Paper</h1>
                    <p className="text-muted-foreground">Multi-step form to create a new exam paper</p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>

            {/* Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={step === 1 ? 'border-primary' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4" /> Metadata
                        </CardTitle>
                        <CardDescription>Year, duration, date, tags</CardDescription>
                    </CardHeader>
                </Card>
                <Card className={step === 2 ? 'border-primary' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Building2 className="h-4 w-4" /> Links
                        </CardTitle>
                        <CardDescription>Institution, course, modules, instructions</CardDescription>
                    </CardHeader>
                </Card>
                <Card className={step === 3 ? 'border-primary' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BookOpen className="h-4 w-4" /> Title & Description
                        </CardTitle>
                        <CardDescription>Select existing title and description</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Step 1: Metadata */}
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> Basic Details
                                </CardTitle>
                                <CardDescription>Provide exam year, date, duration and optional tags</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="year_of_exam"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Year of Exam</FormLabel>
                                                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select academic year" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {academicYears.map((yr) => (
                                                            <SelectItem key={yr} value={yr}>{yr}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>Academic year range (auto-updates over time)</FormDescription>
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
                                                    <Input type="date" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                                                </FormControl>
                                                <FormDescription>Optional calendar date</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="exam_duration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duration (minutes)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={typeof field.value === 'number' ? field.value : Number(field.value ?? 0)}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormDescription>Total exam duration</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="tags_input"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                                <Input placeholder="comma,separated,tags" {...field} />
                                            </FormControl>
                                            <FormDescription>Optional, comma separated</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Links */}
                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" /> Associations
                                </CardTitle>
                                <CardDescription>Select institutional links and learning units</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {loadingLookups ? (
                                    <div className="py-10 flex items-center justify-center"><LoadingSpinner /></div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                                    institutions.map((i) => (
                                                                        <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
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
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Course</FormLabel>
                                                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select course" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {courses.map((c) => (
                                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Separator />

                                        {/* Modules multi-select */}
                                        <FormField
                                            control={form.control}
                                            name="module_ids"
                                            render={() => {
                                                const selected = form.watch('module_ids') || []
                                                return (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2"><Layers className="h-4 w-4" /> Modules</FormLabel>
                                                        <div className="space-y-2">
                                                            <Button 
                                                                type="button"
                                                                variant="outline" 
                                                                className="justify-between min-w-[16rem] max-w-[20rem]"
                                                                onClick={() => setShowModuleSelector(true)}
                                                            >
                                                                <span>
                                                                    {selected.length > 0
                                                                        ? `${selected.length} module${selected.length > 1 ? 's' : ''} selected`
                                                                        : 'Select modules'}
                                                                </span>
                                                                <Plus className="h-4 w-4 ml-2" />
                                                            </Button>
                                                            {selected.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {modules
                                                                        .filter(m => selected.includes(m.id))
                                                                        .map(m => (
                                                                            <Badge key={m.id} variant="secondary">
                                                                                {m.name}
                                                                            </Badge>
                                                                        ))
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                        <FormDescription>Search and select one or more modules</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )
                                            }}
                                        />

                                        {/* Instructions multi-select */}
                                        <FormField
                                            control={form.control}
                                            name="instruction_ids"
                                            render={() => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <FormLabel className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Instructions</FormLabel>
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
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {instructions.map((ins) => {
                                                            const checked = (form.watch('instruction_ids') || []).includes(ins.id)
                                                            return (
                                                                <label key={ins.id} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer">
                                                                    <Checkbox
                                                                        checked={checked}
                                                                        onCheckedChange={(v) => {
                                                                            const current = new Set(form.getValues('instruction_ids'))
                                                                            if (v) current.add(ins.id)
                                                                            else current.delete(ins.id)
                                                                            form.setValue('instruction_ids', Array.from(current), { shouldValidate: true })
                                                                        }}
                                                                    />
                                                                    <div className="text-sm">
                                                                        <div className="font-medium">{ins.name}</div>
                                                                        {/* Instruction description not guaranteed in schema; omit for safety */}
                                                                    </div>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                    <FormDescription>Select any specific exam instructions if applicable</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Title & Description */}
                    {step === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" /> Title & Description
                                </CardTitle>
                                <CardDescription>Select existing title and description. You can add more later.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {loadingLookups ? (
                                    <div className="py-10 flex items-center justify-center"><LoadingSpinner /></div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="title_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Exam Title</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="flex-1">
                                                                    <SelectValue placeholder="Select title" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {titles.map((t) => (
                                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddTitleDialog(true)}
                                                        >
                                                            <Plus className="h-4 w-4" />
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
                                                    <FormLabel>Exam Description</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="flex-1">
                                                                    <SelectValue placeholder="Select description" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {descriptions.map((d) => (
                                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddDescriptionDialog(true)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Footer actions */}
                    <div className="flex items-center justify-between">
                        <div className="text-muted-foreground text-sm">
                            Step {step} of 3
                        </div>
                        <div className="flex gap-2">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                                    Back
                                </Button>
                            )}
                            {step < 3 && (
                                <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={nextDisabled}>
                                    Next
                                </Button>
                            )}
                            {step === 3 && (
                                <Button type="submit" disabled={submitting || nextDisabled}>
                                    {submitting ? (
                                        <span className="flex items-center gap-2"><LoadingSpinner size="sm" /> Saving...</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Create</span>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </Form>

            {/* Add Title Dialog */}
            <Dialog open={showAddTitleDialog} onOpenChange={setShowAddTitleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Title</DialogTitle>
                        <DialogDescription>
                            Create a new exam title that can be used for exam papers.
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
                        <Button variant="outline" onClick={() => setShowAddTitleDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTitle} disabled={!newTitleName.trim()}>
                            Create Title
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Description Dialog */}
            <Dialog open={showAddDescriptionDialog} onOpenChange={setShowAddDescriptionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Description</DialogTitle>
                        <DialogDescription>
                            Create a new exam description that can be used for exam papers.
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
                        <Button variant="outline" onClick={() => setShowAddDescriptionDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateDescription} disabled={!newDescriptionText.trim()}>
                            Create Description
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Instruction Dialog */}
            <Dialog open={showAddInstructionDialog} onOpenChange={setShowAddInstructionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Instruction</DialogTitle>
                        <DialogDescription>
                            Create a new instruction that can be used for exam papers.
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
                        <Button variant="outline" onClick={() => setShowAddInstructionDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateInstruction} disabled={!newInstructionName.trim()}>
                            Create Instruction
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Module Selector Dialog */}
            <Dialog open={showModuleSelector} onOpenChange={setShowModuleSelector}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Select Modules</DialogTitle>
                        <DialogDescription>
                            Search and select one or more modules for this exam paper.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ModuleSelector
                            selectedModuleIds={form.watch('module_ids') || []}
                            onSelectionChange={(ids) => form.setValue('module_ids', ids, { shouldValidate: true })}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModuleSelector(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setShowModuleSelector(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}


