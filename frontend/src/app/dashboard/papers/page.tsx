'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { SearchBar } from '@/components/ui/search-bar';
import { PapersBreadcrumb } from '@/components/ui/breadcrumb';
import { EmptyPapers } from '@/components/ui/empty-state';
import {
    FileText,
    Calculator,
    FlaskConical,
    Gavel,
    BookOpen,
    Plus,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

// Mock data for demonstration
const mockPapers = [
    {
        id: 1,
        course: 'Advanced Database Systems',
        code: 'CS401',
        institution: 'University of Example',
        examYear: '2023',
        dateAdded: '2024-05-20',
        difficulty: 'Hard',
        questions: 45,
        icon: FileText,
        iconColor: 'text-blue-600',
    },
    {
        id: 2,
        course: 'Calculus II',
        code: 'MATH202',
        institution: 'Tech Institute',
        examYear: '2022',
        dateAdded: '2024-05-18',
        difficulty: 'Medium',
        questions: 30,
        icon: Calculator,
        iconColor: 'text-green-600',
    },
    {
        id: 3,
        course: 'Organic Chemistry',
        code: 'CHEM301',
        institution: 'State College',
        examYear: '2023',
        dateAdded: '2024-05-15',
        difficulty: 'Hard',
        questions: 50,
        icon: FlaskConical,
        iconColor: 'text-yellow-600',
    },
    {
        id: 4,
        course: 'Introduction to Law',
        code: 'LAW101',
        institution: 'University of Example',
        examYear: '2021',
        dateAdded: '2024-05-12',
        difficulty: 'Easy',
        questions: 25,
        icon: Gavel,
        iconColor: 'text-red-600',
    },
    {
        id: 5,
        course: 'Data Structures',
        code: 'CS201',
        institution: 'Tech Institute',
        examYear: '2023',
        dateAdded: '2024-05-10',
        difficulty: 'Medium',
        questions: 35,
        icon: FileText,
        iconColor: 'text-blue-600',
    },
    {
        id: 6,
        course: 'Physics Mechanics',
        code: 'PHY101',
        institution: 'State College',
        examYear: '2022',
        dateAdded: '2024-05-08',
        difficulty: 'Hard',
        questions: 40,
        icon: BookOpen,
        iconColor: 'text-purple-600',
    },
];

interface ExamPaper {
    id: number;
    course: string;
    code: string;
    institution: string;
    examYear: string;
    dateAdded: string;
    difficulty: string;
    questions: number;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
}

export default function PapersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPapers, setFilteredPapers] = useState<ExamPaper[]>(mockPapers);
    const [selectedPapers, setSelectedPapers] = useState<ExamPaper[]>([]);

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            const filtered = mockPapers.filter(paper =>
                paper.course.toLowerCase().includes(query.toLowerCase()) ||
                paper.code.toLowerCase().includes(query.toLowerCase()) ||
                paper.institution.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredPapers(filtered);
        } else {
            setFilteredPapers(mockPapers);
        }
    };

    // Handle bulk actions
    const handleBulkDelete = (papers: ExamPaper[]) => {
        console.log('Deleting papers:', papers);
        // Implement delete logic
    };

    const handleBulkDownload = (papers: ExamPaper[]) => {
        console.log('Downloading papers:', papers);
        // Implement download logic
    };

    // Data table columns
    const columns = [
        {
            key: 'course' as keyof ExamPaper,
            header: 'COURSE',
            cell: (paper: ExamPaper) => (
                <div className="flex items-center space-x-3">
                    <div className={cn('p-2 rounded-lg', paper.iconColor.replace('text-', 'bg-').replace('-600', '-100'))}>
                        <paper.icon className={cn('h-4 w-4', paper.iconColor)} />
                    </div>
                    <div>
                        <div className="font-medium">{paper.course}</div>
                        <div className="text-sm text-muted-foreground">{paper.code}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'institution' as keyof ExamPaper,
            header: 'INSTITUTION',
            cell: (paper: ExamPaper) => (
                <div className="font-medium">{paper.institution}</div>
            ),
        },
        {
            key: 'examYear' as keyof ExamPaper,
            header: 'YEAR',
            cell: (paper: ExamPaper) => (
                <Badge variant="secondary">{paper.examYear}</Badge>
            ),
        },
        {
            key: 'difficulty' as keyof ExamPaper,
            header: 'DIFFICULTY',
            cell: (paper: ExamPaper) => {
                const difficultyColors = {
                    Easy: 'bg-green-100 text-green-800',
                    Medium: 'bg-yellow-100 text-yellow-800',
                    Hard: 'bg-red-100 text-red-800',
                };
                return (
                    <Badge className={difficultyColors[paper.difficulty as keyof typeof difficultyColors]}>
                        {paper.difficulty}
                    </Badge>
                );
            },
        },
        {
            key: 'questions' as keyof ExamPaper,
            header: 'QUESTIONS',
            cell: (paper: ExamPaper) => (
                <div className="text-sm font-medium">{paper.questions}</div>
            ),
        },
        {
            key: 'dateAdded' as keyof ExamPaper,
            header: 'DATE ADDED',
            cell: (paper: ExamPaper) => (
                <div className="text-sm text-muted-foreground">{formatDate(paper.dateAdded)}</div>
            ),
        },
        {
            key: 'actions' as keyof ExamPaper,
            header: '',
            cell: (paper: ExamPaper) => (
                <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <PapersBreadcrumb currentPage="All Papers" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exam Papers</h1>
                    <p className="text-muted-foreground">
                        Manage and browse all available exam papers
                    </p>
                </div>
                <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Paper</span>
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md">
                    <SearchBar
                        placeholder="Search papers..."
                        onSearch={handleSearch}
                        defaultValue={searchQuery}
                    />
                </div>
                <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Papers</p>
                                <p className="text-2xl font-bold">{mockPapers.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <BookOpen className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                                <p className="text-2xl font-bold">{mockPapers.reduce((sum, paper) => sum + paper.questions, 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Calculator className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                                <p className="text-2xl font-bold">+12</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Download className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                                <p className="text-2xl font-bold">1,234</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Papers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Exam Papers</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={filteredPapers}
                        columns={columns}
                        searchable={false}
                        pagination={true}
                        pageSize={10}
                        actions={[
                            {
                                label: 'Delete Selected',
                                onClick: handleBulkDelete,
                                icon: Trash2,
                                variant: 'destructive',
                            },
                            {
                                label: 'Download Selected',
                                onClick: handleBulkDownload,
                                icon: Download,
                                variant: 'outline',
                            },
                        ]}
                        emptyMessage="No exam papers found"
                        className="border-0 shadow-none"
                    />
                </CardContent>
            </Card>
        </div>
    );
} 