'use client';

import { useState } from 'react';
import { useExamPaperSearch } from '@/hooks/useExamPaperSearch';
import { useAvailableFilters } from '@/hooks/useAvailableFilters';
import { FilterSidebar } from './filter-sidebar';
import { SearchAndSort } from './search-and-sort';
import { MobileFilterDrawer } from './mobile-filter-drawer';
import { ExamPaperCard } from './exam-paper-card';
import { Pagination } from './pagination';
import { ExamPapersGridSkeleton, ExamPapersListSkeleton } from '@/components/ui/skeleton-loaders';
import { useLoginGate } from '@/hooks/useLoginGate';
import { LoginGateDialog } from '@/components/ui/login-gate-dialog';

type ViewMode = 'grid' | 'list';

export function BrowsePageContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Fetch available filter options
  const { 
    data: availableFilters, 
    isLoading: filtersLoading,
    isError: filtersError,
    error: filtersErrorObj,
  } = useAvailableFilters();

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('🔍 Filter Debug Info:', {
      availableFilters,
      filtersLoading,
      filtersError,
      filtersErrorObj,
      hasInstitutions: availableFilters?.institutions?.length || 0,
      hasCourses: availableFilters?.courses?.length || 0,
      hasYears: availableFilters?.years?.length || 0,
      hasTags: availableFilters?.tags?.length || 0,
    });
  }
  
  // Search and filter state
  const {
    papers,
    total,
    isLoading: papersLoading,
    isError,
    error,
    filters,
    setFilters,
    clearFilters,
    currentPage,
    totalPages,
    setPage,
  } = useExamPaperSearch();

  // Login gate for non-authenticated users
  const { showLoginPrompt, closePrompt } = useLoginGate({ 
    currentPage, 
    enabled: true 
  });

  const isLoading = papersLoading || filtersLoading;

  const handleSearchChange = (query: string) => {
    setFilters({ query });
  };

  const handleSortChange = (
    sortBy: typeof filters.sortBy,
    sortOrder: typeof filters.sortOrder
  ) => {
    setFilters({ sortBy, sortOrder });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Login Gate Dialog */}
      <LoginGateDialog
        isOpen={showLoginPrompt}
        onClose={closePrompt}
        redirectUrl="/exampapers"
        message="Please sign in to continue exploring more exam papers."
      />

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24">
            {filtersLoading ? (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Loading Filters...</h2>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            ) : filtersError ? (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Filters</h2>
                <p className="text-sm text-red-600 mb-4">
                  {filtersErrorObj?.message || 'Failed to load filter options'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Retry
                </button>
              </div>
            ) : availableFilters ? (
              <FilterSidebar
                filters={availableFilters}
                activeFilters={filters}
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
                isLoading={papersLoading}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Filters Available</h2>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Filter options will appear here once data is loaded.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Search and Sort Bar */}
          <div className="mb-6">
            <div className="flex gap-3 items-start">
              {/* Mobile Filter Button - Trigger only */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-300"
              >
                Filters
              </button>
              
              {/* Search and Sort */}
              <div className="flex-1">
                <SearchAndSort
                  searchQuery={filters.query}
                  sortBy={filters.sortBy}
                  sortOrder={filters.sortOrder}
                  viewMode={viewMode}
                  totalResults={total}
                  isLoading={papersLoading}
                  placeholder="Search for exam papers..."
                  onSearchChange={handleSearchChange}
                  onSortChange={handleSortChange}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
          </div>

          {/* Error State */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Error Loading Exam Papers
              </h3>
              <p className="text-red-700 mb-4">
                {error?.message || 'Something went wrong. Please try again.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State - Show skeleton based on view mode */}
          {isLoading && !papers.length && (
            <>
              {viewMode === 'grid' ? (
                <ExamPapersGridSkeleton count={12} />
              ) : (
                <ExamPapersListSkeleton count={6} />
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && !isError && papers.length === 0 && (
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Exam Papers Found
              </h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Results Grid/List */}
          {!isError && papers.length > 0 && (
            <>
              {/* Top Pagination */}
              {papers.length > 0 && (
                <div className="mb-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={filters.pageSize || 20}
                    totalItems={total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => setFilters({ pageSize: size })}
                  />
                </div>
              )}

              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {papers.map((paper) => (
                  <ExamPaperCard
                    key={paper.id}
                    paper={paper}
                    variant={viewMode}
                  />
                ))}
              </div>

              {/* Bottom Pagination - Show when there are items to demonstrate functionality */}
              {papers.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={filters.pageSize || 20}
                    totalItems={total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => setFilters({ pageSize: size })}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {availableFilters && (
        <MobileFilterDrawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          onApplyFilters={setFilters}
          onClearFilters={clearFilters}
          filters={availableFilters}
          activeFilters={filters}
          isLoading={papersLoading}
        />
      )}
    </div>
  );
}
