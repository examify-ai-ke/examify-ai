'use client'

import React, { useState, useEffect } from 'react'
import { Search, ListChecks, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { adminAPI } from '@/lib/api-admin'

interface QuestionSet {
    id: string
    title: string | null
    slug?: string | null
    questions_count?: number | null
    exam_papers_count?: number | null
}

interface QuestionSetSelectorProps {
    selectedQuestionSetIds: string[]
    onSelectionChange: (questionSetIds: string[]) => void
    excludeQuestionSetIds?: string[]
    label?: string
    description?: string
}

export function QuestionSetSelector({
    selectedQuestionSetIds,
    onSelectionChange,
    excludeQuestionSetIds = [],
    label = 'Available Question Sets',
    description = 'Search and select one or more question sets'
}: QuestionSetSelectorProps) {
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadQuestionSets()
    }, [])

    const loadQuestionSets = async () => {
        try {
            setLoading(true)
            console.log('Loading question sets...')
            console.log('API endpoint: /api/v1/question-set')
            
            const response = await adminAPI.questionSets.list({ limit: 100, skip: 0 })
            
            console.log('Question sets response:', response)
            console.log('Response structure:', {
                hasError: !!response.error,
                hasData: !!response.data,
                dataType: typeof response.data,
                dataKeys: response.data ? Object.keys(response.data) : 'no data',
                errorDetails: response.error
            })
            
            let questionSetsList: QuestionSet[] = []
            if (!response.error && response.data) {
                // Try different response structures
                if (response.data.data?.items) {
                    questionSetsList = response.data.data.items
                    console.log('Found items in response.data.data.items')
                } else if (response.data.items) {
                    questionSetsList = response.data.items
                    console.log('Found items in response.data.items')
                } else if (Array.isArray(response.data)) {
                    questionSetsList = response.data
                    console.log('response.data is an array')
                } else {
                    console.log('Unknown response structure:', response.data)
                }
            } else if (response.error) {
                console.error('API returned error:', response.error)
            }
            
            console.log('Extracted question sets:', questionSetsList)
            console.log('Number of question sets:', questionSetsList.length)
            setQuestionSets(questionSetsList)
        } catch (error) {
            console.error('Error loading question sets:', error)
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            })
            setQuestionSets([])
        } finally {
            setLoading(false)
        }
    }

    const handleToggleQuestionSet = (questionSetId: string) => {
        const newSelection = selectedQuestionSetIds.includes(questionSetId)
            ? selectedQuestionSetIds.filter(id => id !== questionSetId)
            : [...selectedQuestionSetIds, questionSetId]
        onSelectionChange(newSelection)
    }

    const filteredQuestionSets = questionSets
        .filter(qs => qs.id && typeof qs.id === 'string' && qs.id.trim() !== '')
        .filter(qs => !excludeQuestionSetIds.includes(qs.id || ''))
        .filter(qs => {
            if (!searchQuery) return true
            const query = searchQuery.toLowerCase()
            return (
                qs.title?.toLowerCase().includes(query) ||
                qs.slug?.toLowerCase().includes(query)
            )
        })

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
                <Label htmlFor="question-set-search">Search Question Sets</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="question-set-search"
                        placeholder="Search by title or slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Question Set List */}
            <div className="space-y-2">
                <Label>
                    {label} ({selectedQuestionSetIds.length} selected)
                </Label>
                {loading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        <LoadingSpinner className="mx-auto mb-2" />
                        Loading question sets...
                    </div>
                ) : filteredQuestionSets.length > 0 ? (
                    <div className="max-h-[300px] border rounded-md p-4 overflow-y-auto">
                        <div className="space-y-3">
                            {filteredQuestionSets.map((qs) => (
                                <div
                                    key={qs.id}
                                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => handleToggleQuestionSet(qs.id || '')}
                                >
                                    <Checkbox
                                        checked={selectedQuestionSetIds.includes(qs.id || '')}
                                        onCheckedChange={() => handleToggleQuestionSet(qs.id || '')}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">{qs.title || 'Untitled Question Set'}</span>
                                            {qs.questions_count !== undefined && qs.questions_count !== null && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {qs.questions_count} question{qs.questions_count !== 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                            {qs.exam_papers_count !== undefined && qs.exam_papers_count !== null && qs.exam_papers_count > 0 && (
                                                <Badge variant="outline" className="text-xs">
                                                    Used in {qs.exam_papers_count} exam{qs.exam_papers_count !== 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                        </div>
                                        {qs.slug && (
                                            <p className="text-sm text-muted-foreground">
                                                {qs.slug}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground border rounded-md">
                        {searchQuery ? (
                            <>
                                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No question sets found matching "{searchQuery}"</p>
                            </>
                        ) : (
                            <>
                                <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No available question sets to add</p>
                            </>
                        )}
                    </div>
                )}
            </div>
            
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    )
}
