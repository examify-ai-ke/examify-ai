/**
 * SubQuestionCardSkeleton Component
 * 
 * Skeleton loading state for a sub-question card.
 * Renders placeholder with question text and action button areas.
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SubQuestionCardSkeleton() {
  return (
    <div className="ml-8 border-l-2 border-gray-200 pl-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Question number and text placeholder */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-8" /> {/* Question number */}
            <Skeleton className="h-5 w-12" /> {/* Marks badge */}
          </div>
          {/* Question text lines */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Action button placeholder */}
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      {/* Answer indicator placeholder */}
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
