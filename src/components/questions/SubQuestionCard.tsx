/**
 * SubQuestionCard Component
 * 
 * Displays a sub-question with its answers.
 * Shows question number, text (EditorJS rendered), marks badge,
 * answer indicator, and action dropdown.
 */

'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EditorJsRenderer from '@/components/ui/editor-js-renderer';
import { QuestionActions } from './QuestionActions';
import type { SubQuestionCardProps } from './types';

export function SubQuestionCard({
  question,
  onEdit,
  onDelete,
}: SubQuestionCardProps) {
  const hasAnswers = question.answers && question.answers.length > 0;
  const answersCount = question.answers?.length ?? 0;

  // Parse question text if it's a string (EditorJS format)
  const questionText = question.text;
  const parsedText = typeof questionText === 'string' 
    ? JSON.parse(questionText) 
    : questionText;

  return (
    <div className="ml-8 border-l-2 border-gray-200 pl-4 py-3 hover:bg-gray-50/50 transition-colors rounded-r-md group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Question header with number and marks */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm text-gray-700">
              {question.question_number}
            </span>
            {question.marks !== null && question.marks !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </Badge>
            )}
          </div>

          {/* Question text */}
          <div className="text-sm text-gray-600 prose prose-sm max-w-none">
            {parsedText ? (
              <EditorJsRenderer data={parsedText} />
            ) : (
              <p className="text-gray-400 italic">No question text</p>
            )}
          </div>
        </div>

        {/* Actions dropdown */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <QuestionActions
            questionId={question.id}
            questionType="sub"
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Answer indicator */}
      <div className="mt-2 flex items-center gap-2">
        {hasAnswers ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-600">
              {answersCount} {answersCount === 1 ? 'answer' : 'answers'}
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-amber-600">No answers yet</span>
          </>
        )}
      </div>
    </div>
  );
}
