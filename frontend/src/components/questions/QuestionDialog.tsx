/**
 * QuestionDialog Component
 * 
 * Unified dialog for adding/editing questions.
 * Supports three modes: 'add-main', 'add-sub', and 'edit'.
 * Wraps the QuestionForm component with appropriate dialog styling.
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuestionForm } from '@/components/forms/question-form';
import type { QuestionDialogProps, QuestionRead } from './types';

export function QuestionDialog({
  open,
  onOpenChange,
  mode,
  question,
  questionSets,
  selectedQuestionSetId,
  parentQuestionId,
  examPaperId,
  onSuccess,
}: QuestionDialogProps) {
  // Track form key to force reset on mode/question change
  const [formKey, setFormKey] = useState(0);

  // Reset form when dialog opens or mode changes
  useEffect(() => {
    if (open) {
      setFormKey(prev => prev + 1);
    }
  }, [open, mode, question?.id]);

  // Get dialog title based on mode
  const getDialogTitle = () => {
    switch (mode) {
      case 'add-main':
        return 'Add Main Question';
      case 'add-sub':
        return 'Add Sub-Question';
      case 'edit':
        return 'Edit Question';
      default:
        return 'Question';
    }
  };

  // Get dialog description based on mode
  const getDialogDescription = () => {
    switch (mode) {
      case 'add-main':
        return 'Create a new main question for this exam paper.';
      case 'add-sub':
        return 'Create a sub-question under the selected main question.';
      case 'edit':
        return 'Update the question details.';
      default:
        return '';
    }
  };

  // Get available main questions for sub-question mode
  const getAvailableMainQuestions = (): QuestionRead[] => {
    if (mode !== 'add-sub') return [];
    
    const mainQuestions: QuestionRead[] = [];
    questionSets.forEach(qs => {
      if (qs.questions) {
        qs.questions.forEach(q => {
          if (!q.parent_id) {
            mainQuestions.push(q);
          }
        });
      }
    });
    return mainQuestions;
  };

  // Handle successful form submission
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Convert questionSets to the format expected by QuestionForm
  const availableQuestionSets = questionSets.map(qs => ({
    id: qs.id,
    title: qs.title ?? null,
    slug: qs.slug ?? null,
    questions_count: qs.questions_count ?? qs.questions?.length ?? 0,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <QuestionForm
          key={formKey}
          examPaperId={examPaperId}
          questionSetId={selectedQuestionSetId}
          question={mode === 'edit' ? question : undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          availableQuestionSets={availableQuestionSets}
          availableMainQuestions={getAvailableMainQuestions()}
          parentQuestionId={mode === 'add-sub' ? parentQuestionId : undefined}
          isSubQuestion={mode === 'add-sub'}
        />
      </DialogContent>
    </Dialog>
  );
}
