'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { SearchBar } from '@/components/ui/search-bar';
import { DashboardBreadcrumb } from '@/components/ui/breadcrumb';
import {
  BookOpen,
  Building,
  GraduationCap,
  Users,
  FileText,
  Calculator,
  FlaskConical,
  Gavel,
  Eye,
  Plus,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatNumber } from '@/lib/utils';

// Mock data for demonstration
const mockStats = [
  {
    title: 'Total Exams',
    value: '1,204',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    change: '+12%',
    changeType: 'positive' as const,
  },
  {
    title: 'Institutions',
    value: '25',
    icon: Building,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    change: '+3',
    changeType: 'positive' as const,
  },
  {
    title: 'Faculties',
    value: '150+',
    icon: GraduationCap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    change: '+8',
    changeType: 'positive' as const,
  },
  {
    title: 'Departments',
    value: '500+',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    change: '+15',
    changeType: 'positive' as const,
  },
];

const mockRecentPapers = [
  {
    id: 1,
    course: 'Advanced Database Systems',
    code: 'CS401',
    institution: 'University of Example',
    examYear: '2023',
    dateAdded: '2024-05-20',
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
    icon: Gavel,
    iconColor: 'text-red-600',
  },
];

interface ExamPaper {
  id: number;
  course: string;
  code: string;
  institution: string;
  examYear: string;
  dateAdded: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPapers, setFilteredPapers] = useState<ExamPaper[]>(mockRecentPapers);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = mockRecentPapers.filter(paper =>
        paper.course.toLowerCase().includes(query.toLowerCase()) ||
        paper.code.toLowerCase().includes(query.toLowerCase()) ||
        paper.institution.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPapers(filtered);
    } else {
      setFilteredPapers(mockRecentPapers);
    }
  };

  // Get user display name safely
  const getUserDisplayName = () => {
    if (!user) return 'User';

    // Handle different user object structures
    if (typeof user === 'object' && user !== null) {
      if ('first_name' in user && typeof user.first_name === 'string') {
        return user.first_name;
      }
      if ('name' in user && typeof user.name === 'string') {
        return user.name;
      }
      if ('email' in user && typeof user.email === 'string') {
        return user.email.split('@')[0];
      }
    }

    return 'User';
  };

  // Data table columns
  const columns = [
    {
      key: 'course' as keyof ExamPaper,
      header: 'COURSE',
      cell: (paper: ExamPaper) => {
        const IconComponent = paper.icon;
        return (
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg', paper.iconColor.replace('text-', 'bg-').replace('-600', '-100'))}>
              <IconComponent className={cn('h-4 w-4', paper.iconColor)} />
            </div>
            <div>
              <div className="font-medium">{paper.course}</div>
              <div className="text-sm text-muted-foreground">{paper.code}</div>
            </div>
          </div>
        );
      },
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
      header: 'EXAM YEAR',
      cell: (paper: ExamPaper) => (
        <Badge variant="secondary">{paper.examYear}</Badge>
      ),
    },
    {
      key: 'dateAdded' as keyof ExamPaper,
      header: 'DATE ADDED',
      cell: (paper: ExamPaper) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(paper.dateAdded)}</span>
        </div>
      ),
    },
    {
      key: 'actions' as keyof ExamPaper,
      header: '',
      cell: (paper: ExamPaper) => (
        <Button size="sm" variant="outline" className="flex items-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>View</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <DashboardBreadcrumb currentPage="Dashboard" />

      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {String(getUserDisplayName())}!
        </h1>
        <p className="text-muted-foreground">
          Here's a summary of available exam papers.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBar
          placeholder="Search exams, courses..."
          onSearch={handleSearch}
          defaultValue={searchQuery}
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('h-4 w-4', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recently Added Exam Papers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recently Added Exam Papers</CardTitle>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Paper</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredPapers}
            columns={columns}
            searchable={false}
            pagination={false}
            emptyMessage="No exam papers found"
            className="border-0 shadow-none"
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Browse All Papers</h3>
                <p className="text-sm text-muted-foreground">Explore our complete collection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Add New Paper</h3>
                <p className="text-sm text-muted-foreground">Contribute to the collection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Institutions</h3>
                <p className="text-sm text-muted-foreground">Update institution data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
