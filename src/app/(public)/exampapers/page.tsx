'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FilterSidebar,
  SearchAndSort,
  ExamPaperCard,
  Pagination,
} from '@/components/public';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useExamPapers } from '@/hooks/usePublicData';
import type { ActiveFilters, SortOption, ViewMode, FilterOption } from '@/components/public/types';

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest');
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get('view') as ViewMode) || 'grid');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('size')) || 20);
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    institutions: searchParams.get('institutions')?.split(',').filter(Boolean),
    years: searchParams.get('years')?.split(',').filter(Boolean),
    courses: searchParams.get('courses')?.split(',').filter(Boolean),
    search: searchParams.get('q') || undefined,
    sortBy: (searchParams.get('sort') as SortOption) || 'newest',
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch exam papers with filters
  const { data, isLoading } = useExamPapers({
    skip: (currentPage - 1) * pageSize,
    limit: pageSize,
    search: searchQuery || undefined,
    ...activeFilters,
  });

  // Mock filter options (in real app, fetch from API)
  const filterOptions = {
    institutions: [
      { value: 'inst1', label: 'University of Example', count: 45 },
      { value: 'inst2', label: 'Example College', count: 32 },
      { value: 'inst3', label: 'Tech Institute', count: 28 },
    ] as FilterOption[],
    years: [
      { value: '2024', label: '2024', count: 15 },
      { value: '2023', label: '2023', count: 42 },
      { value: '2022', label: '2022', count: 38 },
      { value: '2021', label: '2021', count: 35 },
      { value: '2020', label: '2020', count: 30 },
    ] as FilterOption[],
    courses: [
      { value: 'cs101', label: 'Computer Science', count: 25 },
      { value: 'math201', label: 'Mathematics', count: 20 },
      { value: 'phys101', label: 'Physics', count: 18 },
      { value: 'chem101', label: 'Chemistry', count: 15 },
    ] as FilterOption[],
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (pageSize !== 20) params.set('size', pageSize.toString());
    if (activeFilters.institutions?.length) params.set('institutions', activeFilters.institutions.join(','));
    if (activeFilters.years?.length) params.set('years', activeFilters.years.join(','));
    if (activeFilters.courses?.length) params.set('courses', activeFilters.courses.join(','));

    const newUrl = params.toString() ? `/browse?${params.toString()}` : '/browse';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, sortBy, viewMode, currentPage, pageSize, activeFilters, router]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setActiveFilters({ ...activeFilters, sortBy: sort });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleFilterChange = (filters: ActiveFilters) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setActiveFilters({
      search: searchQuery || undefined,
      sortBy,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const examPapers = data?.data || [];
  const totalResults = data?.total || 0;
  const totalPages = Math.ceil(totalResults / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Browse Exam Papers
          </h1>
          <p className="text-lg text-gray-600">
            Explore thousands of past exam papers from top institutions
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8">
              <FilterSidebar
                filters={filterOptions}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Search and Sort */}
            <SearchAndSort
              searchQuery={searchQuery}
              sortBy={sortBy}
              viewMode={viewMode}
              totalResults={totalResults}
              onSearchChange={handleSearchChange}
              onSortChange={handleSortChange}
              onViewModeChange={handleViewModeChange}
              onFilterClick={() => setIsMobileFilterOpen(true)}
              showFilterButton={true}
              className="mb-6"
            />

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            )}

            {/* No Results */}
            {!isLoading && examPapers.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg text-gray-600 mb-4">
                  No exam papers found matching your criteria
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Results Grid/List */}
            {!isLoading && examPapers.length > 0 && (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {examPapers.map((paper) => (
                    <ExamPaperCard
                      key={paper.id}
                      paper={paper}
                      variant={viewMode}
                      showBookmark={true}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={totalResults}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer - TODO: Implement in Task 5.6 */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <FilterSidebar
              filters={filterOptions}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
            <div className="mt-6">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-md font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
