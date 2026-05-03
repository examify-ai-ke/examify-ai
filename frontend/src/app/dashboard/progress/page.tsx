'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardBreadcrumb } from '@/components/ui/breadcrumb';
import {
    BookOpen,
    Clock,
    Target,
    TrendingUp,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockProgress = {
    totalPapers: 24,
    completedPapers: 18,
    inProgressPapers: 4,
    notStartedPapers: 2,
    totalQuestions: 450,
    answeredQuestions: 320,
    correctAnswers: 280,
    studyTime: 45, // hours
    weeklyGoal: 10, // hours
    currentWeek: 8, // hours
    streak: 7, // days
    accuracy: 87.5, // percentage
};

const mockRecentActivity = [
    {
        id: 1,
        type: 'completed',
        paper: 'Advanced Database Systems',
        date: '2024-05-20',
        score: 85,
        timeSpent: '2h 30m',
    },
    {
        id: 2,
        type: 'started',
        paper: 'Calculus II',
        date: '2024-05-19',
        progress: 30,
    },
    {
        id: 3,
        type: 'completed',
        paper: 'Organic Chemistry',
        date: '2024-05-18',
        score: 92,
        timeSpent: '3h 15m',
    },
    {
        id: 4,
        type: 'missed',
        paper: 'Physics Mechanics',
        date: '2024-05-17',
        reason: 'Skipped study session',
    },
];

const mockGoals = [
    {
        id: 1,
        title: 'Complete 5 papers this week',
        progress: 80,
        target: 5,
        current: 4,
        deadline: '2024-05-26',
    },
    {
        id: 2,
        title: 'Study 10 hours this week',
        progress: 80,
        target: 10,
        current: 8,
        deadline: '2024-05-26',
    },
    {
        id: 3,
        title: 'Maintain 90% accuracy',
        progress: 87.5,
        target: 90,
        current: 87.5,
        deadline: 'Ongoing',
    },
];

export default function ProgressPage() {
    const progressPercentage = (mockProgress.completedPapers / mockProgress.totalPapers) * 100;
    const questionProgressPercentage = (mockProgress.answeredQuestions / mockProgress.totalQuestions) * 100;
    const weeklyProgressPercentage = (mockProgress.currentWeek / mockProgress.weeklyGoal) * 100;

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <DashboardBreadcrumb currentPage="My Progress" />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
                <p className="text-muted-foreground">
                    Track your study progress and performance
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Papers Completed</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockProgress.completedPapers}/{mockProgress.totalPapers}</div>
                        <Progress value={progressPercentage} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {progressPercentage.toFixed(1)}% complete
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockProgress.answeredQuestions}/{mockProgress.totalQuestions}</div>
                        <Progress value={questionProgressPercentage} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {questionProgressPercentage.toFixed(1)}% complete
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockProgress.accuracy}%</div>
                        <p className="text-xs text-muted-foreground">
                            {mockProgress.correctAnswers} correct out of {mockProgress.answeredQuestions}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockProgress.streak} days</div>
                        <p className="text-xs text-muted-foreground">
                            Keep it up! 🔥
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Study Goal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium">Study Time</p>
                            <p className="text-2xl font-bold">{mockProgress.currentWeek}h / {mockProgress.weeklyGoal}h</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Goal</p>
                            <p className="text-lg font-semibold">{mockProgress.weeklyGoal}h</p>
                        </div>
                    </div>
                    <Progress value={weeklyProgressPercentage} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {weeklyProgressPercentage}% of weekly goal completed
                    </p>
                </CardContent>
            </Card>

            {/* Goals and Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Goals */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockGoals.map((goal) => (
                                <div key={goal.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">{goal.title}</h4>
                                        <Badge variant="outline">{goal.progress}%</Badge>
                                    </div>
                                    <Progress value={goal.progress} className="h-2" />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{goal.current}/{goal.target}</span>
                                        <span>Due: {goal.deadline}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockRecentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center space-x-3">
                                    <div className={cn(
                                        'p-2 rounded-full',
                                        activity.type === 'completed' && 'bg-green-100',
                                        activity.type === 'started' && 'bg-blue-100',
                                        activity.type === 'missed' && 'bg-red-100'
                                    )}>
                                        {activity.type === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                        {activity.type === 'started' && <Clock className="h-4 w-4 text-blue-600" />}
                                        {activity.type === 'missed' && <XCircle className="h-4 w-4 text-red-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.paper}</p>
                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                            <span>{activity.date}</span>
                                            {activity.type === 'completed' && (
                                                <>
                                                    <span>•</span>
                                                    <span>Score: {activity.score}%</span>
                                                    <span>•</span>
                                                    <span>{activity.timeSpent}</span>
                                                </>
                                            )}
                                            {activity.type === 'started' && (
                                                <>
                                                    <span>•</span>
                                                    <span>{activity.progress}% complete</span>
                                                </>
                                            )}
                                            {activity.type === 'missed' && (
                                                <>
                                                    <span>•</span>
                                                    <span>{activity.reason}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Insights */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{mockProgress.accuracy}%</div>
                            <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{mockProgress.studyTime}h</div>
                            <p className="text-sm text-muted-foreground">Total Study Time</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{mockProgress.streak}</div>
                            <p className="text-sm text-muted-foreground">Day Streak</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 