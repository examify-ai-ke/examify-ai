/**
 * QuestionSetCardSkeleton Component
 * 
 * Skeleton loading state for a question set card.
 * Renders placeholder with title, question count badges, and expand toggle.
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { MainQuestionCardSkeleton } from './MainQuestionCardSkeleton';
import type { QuestionSetCardSkeletonProps } from '../types';

export function QuestionSetCardSkeleton({ questionCount = 2 }: QuestionSetCardSkeletonProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Title placeholder */}
            <Skeleton className="h-7 w-36" />
            {/* Question count badges */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Total marks badge */}
            <Skeleton className="h-6 w-20 rounded-md" />
            {/* Expand toggle */}
            <Skeleton className="h-8 w-8 rounded-md" />
            {/* Actions dropdown */}
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main question skeletons */}
        {Array.from({ length: questionCount }).map((_, index) => (
          <MainQuestionCardSkeleton key={index} subQuestionCount={1} />
        ))}
      </CardContent>
    </Card>
  );
}
