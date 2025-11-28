/**
 * Calculation utility functions for question components
 * 
 * These functions compute display data for question sets including
 * question counts, marks totals, and answer status.
 */

import type { QuestionRead, QuestionSetWithQuestions, QuestionCounts, QuestionSetDisplayData } from '../types';

/**
 * Calculates the count of main questions and total questions (including sub-questions)
 * 
 * @param questions - Array of questions (can include nested children)
 * @returns Object with mainQuestions and totalQuestions counts
 * 
 * **Feature: exam-edit-questions-refactor, Property 1: Question count calculation accuracy**
 */
export function calculateQuestionCounts(questions: QuestionRead[] | null | undefined): QuestionCounts {
  if (!questions || questions.length === 0) {
    return { mainQuestions: 0, totalQuestions: 0 };
  }

  // Main questions are those with parent_id === null
  const mainQuestions = questions.filter(q => q.parent_id === null || q.parent_id === undefined);
  const mainCount = mainQuestions.length;

  // Total count includes main questions plus all their children (sub-questions)
  let totalCount = mainCount;
  
  for (const question of mainQuestions) {
    if (question.children && question.children.length > 0) {
      totalCount += question.children.length;
    }
  }

  return {
    mainQuestions: mainCount,
    totalQuestions: totalCount,
  };
}

/**
 * Calculates the total marks for a set of questions
 * 
 * @param questions - Array of questions (can include nested children)
 * @returns Total marks sum across all questions and sub-questions
 * 
 * **Feature: exam-edit-questions-refactor, Property 2: Marks calculation accuracy**
 */
export function calculateTotalMarks(questions: QuestionRead[] | null | undefined): number {
  if (!questions || questions.length === 0) {
    return 0;
  }

  let totalMarks = 0;

  for (const question of questions) {
    // Add marks from main question
    totalMarks += question.marks ?? 0;

    // Add marks from sub-questions (children)
    if (question.children && question.children.length > 0) {
      for (const child of question.children) {
        totalMarks += child.marks ?? 0;
      }
    }
  }

  return totalMarks;
}

/**
 * Checks if any question in the set has no answers
 * 
 * @param questions - Array of questions to check
 * @returns true if any question (main or sub) has no answers
 */
function hasUnansweredQuestions(questions: QuestionRead[] | null | undefined): boolean {
  if (!questions || questions.length === 0) {
    return false;
  }

  for (const question of questions) {
    // Check main question
    if (!question.answers || question.answers.length === 0) {
      return true;
    }

    // Check sub-questions
    if (question.children && question.children.length > 0) {
      for (const child of question.children) {
        if (!child.answers || child.answers.length === 0) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Combines all calculations into a single display data object for a question set
 * 
 * @param questionSet - The question set to compute display data for
 * @returns Complete display data including counts, marks, and answer status
 */
export function getQuestionDisplayData(questionSet: QuestionSetWithQuestions): QuestionSetDisplayData {
  const questions = questionSet.questions ?? [];
  const counts = calculateQuestionCounts(questions);
  const totalMarks = calculateTotalMarks(questions);
  const hasUnanswered = hasUnansweredQuestions(questions);

  return {
    mainQuestionsCount: counts.mainQuestions,
    totalQuestionsCount: counts.totalQuestions,
    totalMarks,
    hasUnansweredQuestions: hasUnanswered,
  };
}
