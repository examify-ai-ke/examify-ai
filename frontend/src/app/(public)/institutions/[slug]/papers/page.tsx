'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '@/lib/api-public';
import {
  FilterSidebar,
  SearchAndSort,
  ExamPaperCard,
  Pagination,
} from '@/components/public';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ActiveFilters, SortOption, ViewMode, FilterOption } from '@/components/public/types';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function InstitutionPapersPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    search: undefined,
    sortBy: 'newest',
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch institution
  const { data: institution, isLoading: institutionLoading } = useQuery({
    queryKey: ['institution', slug],
    queryFn: async () => {
      const result = await publicAPI.institutions.getBySlug(slug);
      if (result.error) {
        throw new Error('Failed to fetch institution');
      }
      return result.data;
    },
    enabled: !!slug,
  });

  // Fetch exam papers for this institution
  const { data: papersData, isLoading: papersLoading } = useQuery({
    queryKey: ['institutionPapers', institution?.id, searchQuery, sortBy, currentPage, pageSize, activeFilters],
    queryFn: async () => {
      if (!institution?.id) return { data: [], total: 0 };
      
      const result = await publicAPI.examPapers.list({
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      });
      
      if (result.error) {
        throw new Error('Failed to fetch papers');
      }
      
      // Filter papers by institution on client side
      let filteredPapers = (result.data || []).filter(
        (paper: any) => paper.institution?.id === institution.id
      );
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredPapers = filteredPapers.filter((paper: any) =>
          paper.title?.title?.toLowerCase().includes(query) ||
          paper.description?.toLowerCase().includes(query) ||
          paper.course?.name?.toLowerCase().includes(query)
        );
      }
      
      // Apply year filter
      if (activeFilters.years?.length) {
        filteredPapers = filteredPapers.filter((paper: any) =>
          activeFilters.years?.includes(paper.year_of_exam)
        );
      }
      
      // Apply course filter
      if (activeFilters.courses?.length) {
        filteredPapers = filteredPapers.filter((paper: any) =>
          activeFilters.courses?.includes(paper.course?.id)
        );
      }
      
      // Sort papers
      if (sortBy === 'newest') {
        filteredPapers.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortBy === 'oldest') {
        filteredPapers.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } else if (sortBy === 'alphabetical') {
        filteredPapers.sort((a: any, b: any) => 
          (a.title?.title || '').localeCompare(b.title?.title || '')
        );
      }
      
      // Paginate
      const start = (currentPage - 1) * pageSize;
      const paginatedPapers = filteredPapers.slice(start, start + pageSize);
      
      return {
        data: paginatedPapers,
        total: filteredPapers.length,
      };
    },
    enabled: !!institution?.id,
  });

  // Extract unique years and courses for filters
  const filterOptions = {
    years: [] as FilterOption[],
    courses: [] as FilterOption[],
    institutions: [], // Not needed since we're filtering by institution
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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
    setCurrentPage(1);
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

  const isLoading = institutionLoading || papersLoading;
  const papers = papersData?.data || [];
  const totalResults = papersData?.total || 0;
  const totalPages = Math.ceil(totalResults / pageSize);

  if (institutionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Institution Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The institution you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/institutions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/institutions/${slug}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {institution.name}
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-teal-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {institution.name}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Browse all exam papers from this institution
          </p>
          <Badge variant="secondary" className="mt-2">
            {totalResults} {totalResults === 1 ? 'Paper' : 'Papers'}
          </Badge>
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
            {papersLoading && (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            )}

            {/* No Results */}
            {!papersLoading && papers.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg text-gray-600 mb-4">
                  No exam papers found for this institution
                </p>
                {(searchQuery || activeFilters.years?.length || activeFilters.courses?.length) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Results Grid/List */}
            {!papersLoading && papers.length > 0 && (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {papers.map((paper: any) => (
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
                      onPageSizeChange={() => {}} // Fixed page size
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
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
              <Button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-teal-500 hover:bg-teal-600"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
