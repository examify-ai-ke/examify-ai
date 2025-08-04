'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Edit, Trash2, Download, Plus, Search, Filter, SortAsc, SortDesc, Calendar, Clock, Building2, BookOpen, FileText, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { AdminBreadcrumb } from '@/components/ui/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'

import { adminAPI, type ExamPaperRead } from '@/lib/api-admin'
import { useUIStore } from '@/stores/ui'

// Interface for table data
interface ExamPaperTableData {
    id: string
    title: string
    description: string
    institution: string
    course: string
    year: string
    duration: number
    examDate: string
    modules: number
    questionSets: number
    tags: string[]
    actions: string
}

// Transform exam paper data for table display
const transformExamPaperForTable = (examPaper: ExamPaperRead): ExamPaperTableData => ({
    id: examPaper.id,
    title: (examPaper.title as any)?.name || (examPaper.title as any)?.title || 'Untitled Exam',
    description: (examPaper.description as any)?.name || (examPaper.description as any)?.description || 'No description available',
    institution: examPaper.institution?.name || 'N/A',
    course: examPaper.course?.name || 'N/A',
    year: examPaper.year_of_exam || 'N/A',
    duration: examPaper.exam_duration || 0,
    examDate: examPaper.exam_date || 'N/A',
    modules: examPaper.modules?.length || 0,
    questionSets: examPaper.question_sets?.length || 0,
    tags: examPaper.tags || [],
    actions: examPaper.id
})

// Mock data for development
const mockExamPapers: ExamPaperRead[] = [
    {
        id: '1',
        year_of_exam: '2024/2025',
        exam_duration: 180,
        exam_date: '2024-06-15',
        tags: ['Mathematics', 'Advanced'],
        instructions: [],
        title: { id: '1', title: 'Advanced Mathematics Final Exam' },
        description: { id: '1', description: 'Comprehensive final examination covering calculus, algebra, and statistics' },
        modules: [
            { id: '1', name: 'Calculus', code: 'CALC101' },
            { id: '2', name: 'Algebra', code: 'ALG101' }
        ],
        created_by_id: 'user1',
        institution: { id: '1', name: 'University of Technology', acronym: 'UoT' },
        course: { id: '1', name: 'Mathematics', course_acronym: 'MATH' },
        question_sets: [
            { id: '1', name: 'Section A', description: 'Multiple choice questions' },
            { id: '2', name: 'Section B', description: 'Essay questions' }
        ],
        identifying_name: 'MATH-2024-FINAL'
    },
    {
        id: '2',
        year_of_exam: '2023/2024',
        exam_duration: 120,
        exam_date: '2024-05-20',
        tags: ['Physics', 'Intermediate'],
        instructions: [],
        title: { id: '2', title: 'Physics Midterm Examination' },
        description: { id: '2', description: 'Midterm exam covering mechanics and thermodynamics' },
        modules: [
            { id: '3', name: 'Mechanics', code: 'PHYS201' }
        ],
        created_by_id: 'user2',
        institution: { id: '1', name: 'University of Technology', acronym: 'UoT' },
        course: { id: '2', name: 'Physics', course_acronym: 'PHYS' },
        question_sets: [
            { id: '3', name: 'Theory', description: 'Theoretical questions' }
        ],
        identifying_name: 'PHYS-2024-MID'
    }
]

export default function ExamPapersPage() {
    const router = useRouter()
    const { addNotification } = useUIStore()

    // State management
    const [examPapers, setExamPapers] = useState<ExamPaperRead[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedInstitution, setSelectedInstitution] = useState('')
    const [selectedCourse, setSelectedCourse] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [sortBy, setSortBy] = useState('title')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    // Statistics state
    const [stats, setStats] = useState({
        totalPapers: 0,
        totalQuestions: 0,
        monthlyAdditions: 0,
        totalDownloads: 0
    })

    // Filter options
    const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([])
    const [courses, setCourses] = useState<{ id: string; name: string }[]>([])
    const [years, setYears] = useState<string[]>([])

    // Load exam papers from API
    const loadExamPapers = async () => {
        try {
            setLoading(true)

            const params = {
                skip: (currentPage - 1) * itemsPerPage,
                limit: itemsPerPage,
                search: searchTerm || undefined,
                institution_id: selectedInstitution || undefined,
                course_id: selectedCourse || undefined,
                year: selectedYear || undefined,
                sort_by: sortBy,
                sort_order: sortOrder
            }

            console.log('🔄 Loading exam papers with params:', params)

            const response = await adminAPI.examPapers.list(params)

            // Log only essential info to avoid console spam with large responses
            console.log('📋 API response received:', {
                hasData: !!response.data,
                status: response.response?.status,
                error: response.error
            })

            if (response.data) {
                const responseData = response.data
                console.log('📋 Response structure:', {
                    message: responseData.message,
                    hasData: !!responseData.data,
                    hasPaginatedItems: !!responseData.data?.items,
                    itemsCount: responseData.data?.items?.length,
                    total: responseData.data?.total
                })

                if (responseData.data && Array.isArray(responseData.data.items)) {
                    console.log('✅ Found paginated data with items:', responseData.data.items.length)
                    setExamPapers(responseData.data.items)
                    setTotalItems(responseData.data.total || 0)
                    // Extract filter options from the loaded data
                    extractFilterOptionsFromData(responseData.data.items)
                } else if (Array.isArray(responseData)) {
                    console.log('✅ Found direct array data:', responseData.length)
                    setExamPapers(responseData)
                    setTotalItems(responseData.length)
                    // Extract filter options from the loaded data
                    extractFilterOptionsFromData(responseData)
                } else {
                    console.warn('⚠️ Unexpected API response structure:', responseData)
                    console.warn('Using mock data as fallback')
                    setExamPapers(mockExamPapers)
                    setTotalItems(mockExamPapers.length)
                    // Extract filter options from mock data
                    extractFilterOptionsFromData(mockExamPapers)
                }
            } else {
                console.warn('⚠️ No data in API response:', response)
                console.warn('Using mock data as fallback')
                setExamPapers(mockExamPapers)
                setTotalItems(mockExamPapers.length)
                // Extract filter options from mock data
                extractFilterOptionsFromData(mockExamPapers)
            }
        } catch (error) {
            console.error('Error loading exam papers:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to load exam papers. Using offline data.'
            })
            setExamPapers(mockExamPapers)
            setTotalItems(mockExamPapers.length)
            // Extract filter options from mock data
            extractFilterOptionsFromData(mockExamPapers)
        } finally {
            setLoading(false)
        }
    }

    // Extract filter options from exam papers data (no additional API calls needed)
    const extractFilterOptionsFromData = (papers: ExamPaperRead[]) => {
        // Extract unique institutions
        const uniqueInstitutions = Array.from(
            new Map(
                papers
                    .filter(paper => paper.institution)
                    .map(paper => [paper.institution!.id, { id: paper.institution!.id, name: paper.institution!.name }])
            ).values()
        )
        setInstitutions(uniqueInstitutions)

        // Extract unique courses
        const uniqueCourses = Array.from(
            new Map(
                papers
                    .filter(paper => paper.course)
                    .map(paper => [paper.course!.id, { id: paper.course!.id, name: paper.course!.name }])
            ).values()
        )
        setCourses(uniqueCourses)

        // Extract unique years from exam papers
        const uniqueYears = Array.from(
            new Set(
                papers
                    .filter(paper => paper.year_of_exam)
                    .map(paper => paper.year_of_exam!)
            )
        ).sort((a, b) => b.localeCompare(a)) // Sort descending
        setYears(uniqueYears)

        console.log('📊 Extracted filter options:', {
            institutions: uniqueInstitutions.length,
            courses: uniqueCourses.length,
            years: uniqueYears.length
        })
    }

    // Load statistics
    const loadStatistics = async () => {
        try {
            // This would be a real API call in production
            setStats({
                totalPapers: totalItems,
                totalQuestions: examPapers.reduce((sum, paper) => sum + (paper.question_sets?.length || 0), 0),
                monthlyAdditions: Math.floor(totalItems * 0.1), // Mock calculation
                totalDownloads: Math.floor(totalItems * 50) // Mock calculation
            })
        } catch (error) {
            console.error('Error loading statistics:', error)
        }
    }

    // Effects
    useEffect(() => {
        loadExamPapers()
    }, [currentPage, searchTerm, selectedInstitution, selectedCourse, selectedYear, sortBy, sortOrder])

    useEffect(() => {
        loadStatistics()
    }, [examPapers, totalItems])

    // Event handlers
    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    const handleInstitutionFilter = (value: string) => {
        setSelectedInstitution(value === 'all' ? '' : value)
        setCurrentPage(1)
    }

    const handleCourseFilter = (value: string) => {
        setSelectedCourse(value === 'all' ? '' : value)
        setCurrentPage(1)
    }

    const handleYearFilter = (value: string) => {
        setSelectedYear(value === 'all' ? '' : value)
        setCurrentPage(1)
    }

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
        setCurrentPage(1)
    }

    const handleViewExamPaper = (examPaperId: string) => {
        router.push(`/dashboard/exam-papers/${examPaperId}`)
    }

    const handleEditExamPaper = (examPaperId: string) => {
        router.push(`/dashboard/exam-papers/${examPaperId}/edit`)
    }

    const handleDeleteExamPaper = async (examPaperId: string) => {
        if (!confirm('Are you sure you want to delete this exam paper?')) return

        try {
            await adminAPI.examPapers.delete(examPaperId)
            addNotification({
                type: 'success',
                title: 'Success',
                message: 'Exam paper deleted successfully'
            })
            loadExamPapers()
        } catch (error) {
            console.error('Error deleting exam paper:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to delete exam paper'
            })
        }
    }

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) return
        if (!confirm(`Are you sure you want to delete ${selectedItems.length} exam papers?`)) return

        try {
            await Promise.all(selectedItems.map(id => adminAPI.examPapers.delete(id)))
            addNotification({
                type: 'success',
                title: 'Success',
                message: `${selectedItems.length} exam papers deleted successfully`
            })
            setSelectedItems([])
            loadExamPapers()
        } catch (error) {
            console.error('Error deleting exam papers:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to delete some exam papers'
            })
        }
    }

    const handleBulkExport = () => {
        if (selectedItems.length === 0) return

        addNotification({
            type: 'info',
            title: 'Export Started',
            message: `Exporting ${selectedItems.length} exam papers...`
        })

        // Mock export functionality
        setTimeout(() => {
            addNotification({
                type: 'success',
                title: 'Export Complete',
                message: 'Exam papers exported successfully'
            })
        }, 2000)
    }

    // Column definitions for DataTable
    const columns = [
        {
            key: 'select' as keyof ExamPaperTableData,
            header: (
                <Checkbox
                    checked={selectedItems.length === examPapers.length && examPapers.length > 0}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedItems(examPapers.map(paper => paper.id))
                        } else {
                            setSelectedItems([])
                        }
                    }}
                />
            ),
            cell: (item: ExamPaperTableData) => (
                <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedItems([...selectedItems, item.id])
                        } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id))
                        }
                    }}
                />
            ),
            width: '50px'
        },
        {
            key: 'title' as keyof ExamPaperTableData,
            header: 'Exam Paper',
            cell: (item: ExamPaperTableData) => (
                <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-xs">
                        {item.description}
                    </span>
                    <div className="flex gap-1 mt-1">
                        {item.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {item.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{item.tags.length - 2}
                            </Badge>
                        )}
                    </div>
                </div>
            ),
            sortable: true,
            width: '30%'
        },
        {
            key: 'institution' as keyof ExamPaperTableData,
            header: 'Institution',
            cell: (item: ExamPaperTableData) => (
                <div className="flex flex-col">
                    <span className="font-medium">{item.institution}</span>
                    <span className="text-sm text-muted-foreground">{item.course}</span>
                </div>
            ),
            sortable: true,
            width: '20%'
        },
        {
            key: 'year' as keyof ExamPaperTableData,
            header: 'Academic Year',
            cell: (item: ExamPaperTableData) => (
                <div className="flex flex-col">
                    <span className="font-medium">{item.year}</span>
                    <span className="text-sm text-muted-foreground">{item.examDate}</span>
                </div>
            ),
            sortable: true,
            width: '15%'
        },
        {
            key: 'duration' as keyof ExamPaperTableData,
            header: 'Duration',
            cell: (item: ExamPaperTableData) => (
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{item.duration} min</span>
                </div>
            ),
            sortable: true,
            width: '10%'
        },
        {
            key: 'modules' as keyof ExamPaperTableData,
            header: 'Content',
            cell: (item: ExamPaperTableData) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.modules} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.questionSets} question sets</span>
                    </div>
                </div>
            ),
            width: '15%'
        },
        {
            key: 'actions' as keyof ExamPaperTableData,
            header: 'Actions',
            cell: (item: ExamPaperTableData) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            Actions
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewExamPaper(item.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditExamPaper(item.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkExport()}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDeleteExamPaper(item.id)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            width: '10%'
        }
    ]

    const transformedData = Array.isArray(examPapers) ? examPapers.map(transformExamPaperForTable) : []

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <AdminBreadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Exam Papers', href: '/dashboard/exam-papers' }
                ]}
            />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exam Papers</h1>
                    <p className="text-muted-foreground">
                        Manage and organize examination papers from all institutions
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/exam-papers/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam Paper
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPapers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all institutions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Question sets available
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.monthlyAdditions}</div>
                        <p className="text-xs text-muted-foreground">
                            New papers added
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Total downloads
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                    <CardDescription>
                        Find specific exam papers using various filters
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search exam papers by title, description, or tags..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Select value={selectedInstitution || 'all'} onValueChange={handleInstitutionFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by institution" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Institutions</SelectItem>
                                {institutions.map((institution) => (
                                    <SelectItem key={institution.id} value={institution.id}>
                                        {institution.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedCourse || 'all'} onValueChange={handleCourseFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by course" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedYear || 'all'} onValueChange={handleYearFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                            const [field, order] = value.split('-')
                            setSortBy(field)
                            setSortOrder(order as 'asc' | 'desc')
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="title-asc">Title A-Z</SelectItem>
                                <SelectItem value="title-desc">Title Z-A</SelectItem>
                                <SelectItem value="year-desc">Year (Newest)</SelectItem>
                                <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                                <SelectItem value="duration-asc">Duration (Short)</SelectItem>
                                <SelectItem value="duration-desc">Duration (Long)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedItems.length > 0 && (
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <span className="text-sm font-medium">
                                {selectedItems.length} exam papers selected
                            </span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={handleBulkExport}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Selected
                                </Button>
                                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Exam Papers ({totalItems.toLocaleString()})</CardTitle>
                    <CardDescription>
                        Comprehensive list of all examination papers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : transformedData.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No exam papers found"
                            description="No exam papers match your current filters. Try adjusting your search criteria."
                        />
                    ) : (
                        <DataTable
                            data={transformedData}
                            columns={columns}
                            pagination={{
                                page: currentPage,
                                pageSize: itemsPerPage,
                                total: totalItems,
                                onPageChange: setCurrentPage
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}