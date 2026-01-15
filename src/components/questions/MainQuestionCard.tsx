/**
 * MainQuestionCard Component
 * 
 * Displays a main question with its sub-questions.
 * Shows question number, text, marks, expand/collapse toggle,
 * answer indicator, sub-question count, and action dropdown.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, ListTree, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EditorJsRenderer from '@/components/ui/editor-js-renderer';
import { QuestionActions } from './QuestionActions';
import { SubQuestionCard } from './SubQuestionCard';
import { AnswerList } from './AnswerList';
import { AnswerForm } from '@/components/forms/answer-form';
import { useUIStore } from '@/stores/ui';
import type { MainQuestionCardProps, QuestionRead } from './types';

export function MainQuestionCard({
  question,
  subQuestions,
  isExpanded: controlledExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddSubQuestion,
  onAnswersChange,
  onEditQuestion,
  onDeleteQuestion,
}: MainQuestionCardProps) {
  // Use internal state if not controlled
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;
  
  // State for answer form visibility
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  
  const { addNotification } = useUIStore();
  
  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const handleAddAnswer = () => {
    if (!question?.id) {
      console.error('Cannot add answer: question ID is missing');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Cannot add answer: question data is invalid'
      });
      return;
    }
    setShowAnswerForm(true);
  };

  const hasAnswers = question.answers && question.answers.length > 0;
  const answersCount = question.answers?.length ?? 0;
  const subQuestionsCount = subQuestions.length;

  // Parse question text if it's a string (EditorJS format)
  const questionText = question.text;
  const parsedText = typeof questionText === 'string' 
    ? JSON.parse(questionText) 
    : questionText;



  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      {/* Question header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Question number, marks, and expand toggle */}
          <div className="flex items-center gap-3 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleToggle}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse question' : 'Expand question'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <span className="font-semibold text-gray-800">
              {question.question_number}
            </span>
            {question.marks !== null && question.marks !== undefined && (
              <Badge variant="default" className="text-xs">
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </Badge>
            )}
          </div>

          {/* Question text */}
          <div className="ml-9 text-sm text-gray-700 prose prose-sm max-w-none">
            {parsedText ? (
              <EditorJsRenderer data={parsedText} />
            ) : (
              <p className="text-gray-400 italic">No question text</p>
            )}
          </div>
        </div>

        {/* Actions dropdown */}
        <QuestionActions
          questionId={question.id}
          questionType="main"
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubQuestion={onAddSubQuestion}
        />
      </div>

      {/* Indicators row */}
      <div className="mt-3 ml-9 flex items-center gap-4 flex-wrap">
        {/* Answer indicator */}
        <div className="flex items-center gap-1.5">
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
              <span className="text-xs text-amber-600">No answers</span>
            </>
          )}
        </div>

        {/* Sub-questions count */}
        {subQuestionsCount > 0 && (
          <div className="flex items-center gap-1.5">
            <ListTree className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-blue-600">
              {subQuestionsCount} sub-{subQuestionsCount === 1 ? 'question' : 'questions'}
            </span>
          </div>
        )}
      </div>

      {/* Answers (when expanded) */}
      {isExpanded && (
        <div className="ml-9 space-y-3">
          <AnswerList answers={question.answers} onAnswersChange={onAnswersChange} />
          
          {/* Add Answer Button */}
          {!showAnswerForm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAnswer}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Answer
            </Button>
          )}
          
          {/* Answer Form */}
          {showAnswerForm && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <AnswerForm
                questionId={question.id}
                onSuccess={() => {
                  setShowAnswerForm(false);
                  onAnswersChange?.();
                }}
                onCancel={() => setShowAnswerForm(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Sub-questions (when expanded) */}
      {isExpanded && subQuestionsCount > 0 && (
        <div className="mt-4 space-y-2">
          {subQuestions.map((subQuestion) => (
            <SubQuestionCard
              key={subQuestion.id}
              question={subQuestion}
              onEdit={() => {
                console.log('📝 Sub-question edit clicked:', subQuestion.id)
                if (onEditQuestion) {
                  onEditQuestion(subQuestion)
                }
              }}
              onDelete={() => {
                console.log('🗑️ Sub-question delete clicked:', subQuestion.id)
                if (onDeleteQuestion) {
                  onDeleteQuestion(subQuestion.id)
                }
              }}
              onAnswersChange={onAnswersChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
