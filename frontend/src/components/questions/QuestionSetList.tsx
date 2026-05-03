/**
 * QuestionSetList Component
 * 
 * Main container component that renders all question sets with loading states.
 * Handles empty state and delegates to QuestionSetCard for each set.
 */

'use client';

import { useState } from 'react';
import { FileQuestion } from 'lucide-react';
import { QuestionSetCard } from './QuestionSetCard';
import { QuestionSetListSkeleton } from './skeletons/QuestionSetListSkeleton';
import type { QuestionSetListProps } from './types';

export function QuestionSetList({
  questionSets,
  isLoading,
  onEditQuestion,
  onDeleteQuestion,
  onAddSubQuestion,
  onEditQuestionSet,
  onDeleteQuestionSet,
  onAddQuestion,
  defaultExpanded = true,
  onAnswersChange,
}: QuestionSetListProps) {
  // Track expanded state for each question set
  const [expandedSets, setExpandedSets] = useState<Set<string>>(() => {
    if (defaultExpanded) {
      return new Set(questionSets.map(qs => qs.id));
    }
    return new Set();
  });

  const handleToggleExpand = (questionSetId: string) => {
    setExpandedSets(prev => {
      const next = new Set(prev);
      if (next.has(questionSetId)) {
        next.delete(questionSetId);
      } else {
        next.add(questionSetId);
      }
      return next;
    });
  };

  // Show skeleton while loading
  if (isLoading) {
    return <QuestionSetListSkeleton count={3} />;
  }

  // Show empty state
  if (questionSets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileQuestion className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Question Sets
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          This exam paper doesn&apos;t have any question sets yet. 
          Add a question set to start organizing your questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questionSets.map((questionSet) => (
        <QuestionSetCard
          key={questionSet.id}
          questionSet={questionSet}
          isExpanded={expandedSets.has(questionSet.id)}
          onToggleExpand={() => handleToggleExpand(questionSet.id)}
          onEditQuestion={onEditQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onAddSubQuestion={onAddSubQuestion}
          onEditQuestionSet={() => onEditQuestionSet(questionSet)}
          onDeleteQuestionSet={() => onDeleteQuestionSet(questionSet.id)}
          onAddQuestion={() => onAddQuestion(questionSet.id)}
          onAnswersChange={onAnswersChange}
        />
      ))}
    </div>
  );
}
