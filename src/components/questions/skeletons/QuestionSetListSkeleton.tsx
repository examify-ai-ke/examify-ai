/**
 * QuestionSetListSkeleton Component
 * 
 * Skeleton loading state for the question set list.
 * Renders multiple QuestionSetCardSkeletons with animated pulse effect.
 */

'use client';

import { QuestionSetCardSkeleton } from './QuestionSetCardSkeleton';
import type { QuestionSetListSkeletonProps } from '../types';

export function QuestionSetListSkeleton({ count = 3 }: QuestionSetListSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <QuestionSetCardSkeleton key={index} questionCount={2} />
      ))}
    </div>
  );
}
