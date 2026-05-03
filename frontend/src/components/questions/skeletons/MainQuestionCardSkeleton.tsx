/**
 * MainQuestionCardSkeleton Component
 * 
 * Skeleton loading state for a main question card.
 * Renders placeholder with question header, marks badge, and expandable area.
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { SubQuestionCardSkeleton } from './SubQuestionCardSkeleton';
import type { MainQuestionCardSkeletonProps } from '../types';

export function MainQuestionCardSkeleton({ subQuestionCount = 1 }: MainQuestionCardSkeletonProps) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* Question header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Question number, marks, and expand toggle */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24" /> {/* Question number */}
            <Skeleton className="h-5 w-16" /> {/* Marks badge */}
            <Skeleton className="h-5 w-5" /> {/* Expand toggle */}
          </div>
          {/* Question text lines */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        {/* Action button placeholder */}
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Answer and sub-question indicators */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Sub-questions skeleton */}
      {subQuestionCount > 0 && (
        <div className="mt-4 space-y-2">
          {Array.from({ length: subQuestionCount }).map((_, index) => (
            <SubQuestionCardSkeleton key={index} />
          ))}
        </div>
      )}
    </div>
  );
}
