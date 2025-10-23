'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BrowsePageContent } from '@/components/public/browse-page-content';

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Browse Exam Papers
          </h1>
          <p className="text-lg text-gray-600">
            Explore thousands of past exam papers from top institutions
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      }>
        <BrowsePageContent />
      </Suspense>
    </div>
  );
}
