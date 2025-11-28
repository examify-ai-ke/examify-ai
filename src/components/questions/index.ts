/**
 * Question Components
 * 
 * This module exports all question-related components for the exam paper edit page.
 * Components are organized into display components, skeleton loaders, and utilities.
 */

// Display Components
export { QuestionSetList } from './QuestionSetList';
export { QuestionSetCard } from './QuestionSetCard';
export { MainQuestionCard } from './MainQuestionCard';
export { SubQuestionCard } from './SubQuestionCard';
export { QuestionActions } from './QuestionActions';
export { QuestionDialog } from './QuestionDialog';

// Skeleton Components
export { QuestionSetListSkeleton } from './skeletons/QuestionSetListSkeleton';
export { QuestionSetCardSkeleton } from './skeletons/QuestionSetCardSkeleton';
export { MainQuestionCardSkeleton } from './skeletons/MainQuestionCardSkeleton';
export { SubQuestionCardSkeleton } from './skeletons/SubQuestionCardSkeleton';

// Utilities
export {
  calculateQuestionCounts,
  calculateTotalMarks,
  getQuestionDisplayData,
} from './utils/calculations';

// Types
export type {
  QuestionSetDisplayData,
  QuestionCounts,
  QuestionSetWithQuestions,
} from './types';
