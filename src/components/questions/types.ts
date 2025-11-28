/**
 * Type definitions for question components
 */

import { components } from '@/types/generated/api';

// Re-export API types for convenience
export type QuestionRead = components['schemas']['QuestionRead'];
export type QuestionSetRead = components['schemas']['QuestionSetRead'];
export type QuestionSetReadWithQuestions = components['schemas']['QuestionSetReadWithQuestions'];
export type AnswerReadForQuestion = components['schemas']['AnswerReadForQuestion'];

/**
 * Extended type for question sets with nested questions
 * Used throughout the question display components
 */
export interface QuestionSetWithQuestions {
  id: string;
  title?: string | null;
  slug?: string | null;
  questions?: QuestionRead[];
  questions_count?: number | null;
}

/**
 * Question count breakdown
 */
export interface QuestionCounts {
  mainQuestions: number;
  totalQuestions: number;
}

/**
 * Computed display data for a question set
 */
export interface QuestionSetDisplayData {
  mainQuestionsCount: number;
  totalQuestionsCount: number;
  totalMarks: number;
  hasUnansweredQuestions: boolean;
}

/**
 * Props for QuestionSetList component
 */
export interface QuestionSetListProps {
  questionSets: QuestionSetWithQuestions[];
  isLoading: boolean;
  onEditQuestion: (question: QuestionRead) => void;
  onDeleteQuestion: (questionId: string) => void;
  onAddSubQuestion: (parentId: string) => void;
  onEditQuestionSet: (questionSet: QuestionSetWithQuestions) => void;
  onDeleteQuestionSet: (questionSetId: string) => void;
  onAddQuestion: (questionSetId: string) => void;
  defaultExpanded?: boolean;
  onAnswersChange?: () => void;
}

/**
 * Props for QuestionSetCard component
 */
export interface QuestionSetCardProps {
  questionSet: QuestionSetWithQuestions;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditQuestion: (question: QuestionRead) => void;
  onDeleteQuestion: (questionId: string) => void;
  onAddSubQuestion: (parentId: string) => void;
  onEditQuestionSet: () => void;
  onDeleteQuestionSet: () => void;
  onAddQuestion: () => void;
  onAnswersChange?: () => void;
}

/**
 * Props for MainQuestionCard component
 */
export interface MainQuestionCardProps {
  question: QuestionRead;
  subQuestions: QuestionRead[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubQuestion: () => void;
  onAnswersChange?: () => void;
}

/**
 * Props for SubQuestionCard component
 */
export interface SubQuestionCardProps {
  question: QuestionRead;
  onEdit: () => void;
  onDelete: () => void;
  onAnswersChange?: () => void;
}

/**
 * Props for QuestionActions component
 */
export interface QuestionActionsProps {
  questionId: string;
  questionType: 'main' | 'sub';
  onView?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubQuestion?: () => void;
  isLoading?: boolean;
}

/**
 * Props for QuestionDialog component
 */
export interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add-main' | 'add-sub' | 'edit';
  question?: QuestionRead;
  questionSets: QuestionSetWithQuestions[];
  selectedQuestionSetId?: string;
  parentQuestionId?: string;
  examPaperId: string;
  onSuccess: () => void;
}

/**
 * Props for skeleton components
 */
export interface QuestionSetListSkeletonProps {
  count?: number;
}

export interface QuestionSetCardSkeletonProps {
  questionCount?: number;
}

export interface MainQuestionCardSkeletonProps {
  subQuestionCount?: number;
}

export interface SubQuestionCardSkeletonProps {}
