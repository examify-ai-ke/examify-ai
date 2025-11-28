/**
 * QuestionSetCard Component
 * 
 * Displays a single question set with its questions.
 * Shows title, question counts (main/total), total marks,
 * expand/collapse toggle, and actions dropdown.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MainQuestionCard } from './MainQuestionCard';
import { getQuestionDisplayData } from './utils/calculations';
import type { QuestionSetCardProps, QuestionRead } from './types';

export function QuestionSetCard({
  questionSet,
  isExpanded: controlledExpanded,
  onToggleExpand,
  onEditQuestion,
  onDeleteQuestion,
  onAddSubQuestion,
  onEditQuestionSet,
  onDeleteQuestionSet,
  onAddQuestion,
  onAnswersChange,
}: QuestionSetCardProps) {
  // Use internal state if not controlled
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = controlledExpanded ?? internalExpanded;
  
  // Track expanded state for each main question
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const handleQuestionToggle = (questionId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Get display data
  const displayData = getQuestionDisplayData(questionSet);
  const questions = questionSet.questions ?? [];
  
  // Separate main questions and build sub-questions map
  const mainQuestions = questions.filter(q => !q.parent_id);
  const subQuestionsMap = new Map<string, QuestionRead[]>();
  
  questions.forEach(q => {
    if (q.parent_id) {
      const existing = subQuestionsMap.get(q.parent_id) ?? [];
      subQuestionsMap.set(q.parent_id, [...existing, q]);
    }
    // Also check children array
    if (q.children && q.children.length > 0) {
      subQuestionsMap.set(q.id, q.children);
    }
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left side: Title and badges */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Expand toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleToggle}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse question set' : 'Expand question set'}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900">
              {questionSet.title ?? 'Untitled Question Set'}
            </h3>

            {/* Question count badges */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {displayData.mainQuestionsCount} main
              </Badge>
              <Badge variant="outline" className="text-xs">
                {displayData.totalQuestionsCount} total
              </Badge>
            </div>
          </div>

          {/* Right side: Marks and actions */}
          <div className="flex items-center gap-2">
            {/* Total marks */}
            <Badge variant="default" className="text-sm">
              {displayData.totalMarks} marks
            </Badge>

            {/* Add question button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddQuestion}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Question set actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEditQuestionSet}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Question Set
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDeleteQuestionSet}
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Question Set
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Collapsed summary */}
        {!isExpanded && (
          <div className="mt-2 text-sm text-gray-500">
            {displayData.mainQuestionsCount} questions • {displayData.totalMarks} marks total
            {displayData.hasUnansweredQuestions && (
              <span className="ml-2 text-amber-600">• Some questions need answers</span>
            )}
          </div>
        )}
      </CardHeader>

      {/* Questions content */}
      {isExpanded && (
        <CardContent className="space-y-4">
          {mainQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No questions in this set yet.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddQuestion}
                className="mt-2 gap-1"
              >
                <Plus className="h-4 w-4" />
                Add First Question
              </Button>
            </div>
          ) : (
            mainQuestions.map((question) => (
              <MainQuestionCard
                key={question.id}
                question={question}
                subQuestions={subQuestionsMap.get(question.id) ?? []}
                isExpanded={expandedQuestions.has(question.id)}
                onToggleExpand={() => handleQuestionToggle(question.id)}
                onEdit={() => onEditQuestion(question)}
                onDelete={() => onDeleteQuestion(question.id)}
                onAddSubQuestion={() => onAddSubQuestion(question.id)}
                onAnswersChange={onAnswersChange}
              />
            ))
          )}
        </CardContent>
      )}
    </Card>
  );
}
