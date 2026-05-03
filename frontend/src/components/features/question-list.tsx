'use client'

import React, { useState, useEffect } from 'react'
import { Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminAPI } from '@/lib/api-admin'
import { useUIStore } from '@/stores/ui'
import { QuestionForm } from '@/components/forms/question-form'

interface QuestionListProps {
    questionSetId: string
    examPaperId: string
    onQuestionsChange?: () => void
}

export function QuestionList({ questionSetId, examPaperId, onQuestionsChange }: QuestionListProps) {
    const { addNotification } = useUIStore()
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<any>(null)
    const [deletingQuestion, setDeletingQuestion] = useState<any>(null)

    // Load questions for the question set
    const loadQuestions = async () => {
        try {
            setLoading(true)
            const response = await adminAPI.questions.list({
                question_set_id: questionSetId,
                include_children: true,
                limit: 100
            })

            if (!response.error && response.data) {
                const questionsData = (response.data as any).data?.items || []
                setQuestions(questionsData)
            } else {
                console.error('Failed to load questions:', response.error)
                setQuestions([])
            }
        } catch (error) {
            console.error('Error loading questions:', error)
            setQuestions([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadQuestions()
    }, [questionSetId])

    // Handle question deletion
    const handleDeleteQuestion = async (question: any) => {
        try {
            const response = await adminAPI.questions.delete(question.id)

            if (!response.error) {
                addNotification({
                    type: 'success',
                    title: 'Question Deleted',
                    message: 'Question has been deleted successfully.'
                })
                setDeletingQuestion(null)
                loadQuestions() // Reload questions
                onQuestionsChange?.()
            } else {
                const errorMessage = (response.error as any)?.message || 'Failed to delete question'
                addNotification({
                    type: 'error',
                    title: 'Delete Failed',
                    message: errorMessage
                })
            }
        } catch (error) {
            console.error('Error deleting question:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while deleting the question.'
            })
        }
    }

    // Get difficulty color
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'hard': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Extract question text
    const getQuestionText = (question: any) => {
        if (question.text?.blocks) {
            return question.text.blocks.map((block: any) => block.data?.text || '').join(' ') || 'Question text'
        }
        return question.text || 'Question text'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner text="Loading questions..." />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
                    <p className="text-sm text-gray-600">Manage questions in this question set</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            </div>

            {/* Questions List */}
            {questions.length > 0 ? (
                <div className="space-y-3">
                    {questions.map((question, index) => (
                        <Card key={question.id} className="relative">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline">Q{question.question_number}</Badge>
                                            <Badge className={getDifficultyColor(question.difficulty_level || 'medium')}>
                                                {question.difficulty_level || 'medium'}
                                            </Badge>
                                            <Badge variant="secondary">{question.marks || 0} marks</Badge>
                                            <Badge variant="outline">{question.numbering_style || 'roman'}</Badge>
                                            {question.is_sub_question && (
                                                <Badge variant="outline">Sub Question</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">
                                            {getQuestionText(question)}
                                        </p>
                                        {question.children && question.children.length > 0 && (
                                            <div className="ml-4 mt-2">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    Sub-questions ({question.children.length}):
                                                </p>
                                                {question.children.map((subQuestion: any, subIndex: number) => (
                                                    <div key={subQuestion.id} className="flex items-center gap-2 text-xs text-gray-600">
                                                        <span>{subQuestion.question_number}.</span>
                                                        <span>{getQuestionText(subQuestion)}</span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {subQuestion.marks || 0} marks
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingQuestion(question)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingQuestion(question)}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="text-gray-500">
                            <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium mb-2">No questions yet</h4>
                            <p className="text-sm mb-4">Start by adding your first question to this question set.</p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add First Question
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Create Question Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Question</DialogTitle>
                        <DialogDescription>
                            Add a new question to this question set.
                        </DialogDescription>
                    </DialogHeader>
                    <QuestionForm
                        questionSetId={questionSetId}
                        examPaperId={examPaperId}
                        onSuccess={() => {
                            setShowCreateDialog(false)
                            loadQuestions()
                            onQuestionsChange?.()
                        }}
                        onCancel={() => setShowCreateDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Question Dialog */}
            <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                        <DialogDescription>
                            Update the question details.
                        </DialogDescription>
                    </DialogHeader>
                    {editingQuestion && (
                        <QuestionForm
                            questionSetId={questionSetId}
                            examPaperId={examPaperId}
                            question={editingQuestion}
                            onSuccess={() => {
                                setEditingQuestion(null)
                                loadQuestions()
                                onQuestionsChange?.()
                            }}
                            onCancel={() => setEditingQuestion(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingQuestion} onOpenChange={() => setDeletingQuestion(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Question</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this question? This action cannot be undone.
                            {deletingQuestion?.children && deletingQuestion.children.length > 0 && (
                                <span className="block mt-2 text-red-600">
                                    Warning: This will also delete {deletingQuestion.children.length} sub-question(s).
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingQuestion(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingQuestion && handleDeleteQuestion(deletingQuestion)}
                        >
                            Delete Question
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}