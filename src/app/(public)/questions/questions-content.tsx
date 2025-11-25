'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  useAdvancedQuestionSearch, 
  usePlatformStats,
  useInstitutionsList,
  useCoursesList,
  useModulesList,
  useProgrammesList
} from '@/hooks/usePublicData';
import { RecentQuestionsSection } from '@/components/public/recent-questions-section';
import { StatsSection } from '@/components/public/stats-section';
import { SearchAndSort } from '@/components/public/search-and-sort';
import { FilterSidebar } from '@/components/public/filter-sidebar';
import { MobileFilterDrawer } from '@/components/public/mobile-filter-drawer';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { QuestionsListSkeleton } from '@/components/ui/skeleton-loaders';
import { X } from 'lucide-react';
import type { FilterOption } from '@/types/search-filters';

export default function PublicQuestionsContent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'marks' | 'created_at'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Filter states
  const [selectedInstitution, setSelectedInstitution] = useState<string | undefined>();
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>();
  const [selectedModule, setSelectedModule] = useState<string | undefined>();
  const [selectedProgramme, setSelectedProgramme] = useState<string | undefined>();
  const [hasAnswersFilter, setHasAnswersFilter] = useState<boolean | undefined>();

  // Search states for filters
  const [institutionSearchQuery, setInstitutionSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Prepare advanced search filters for the API
  const searchFilters = {
    q: debouncedSearchQuery || undefined,
    institution_id: selectedInstitution,
    course_id: selectedCourse,
    module_id: selectedModule,
    programme_id: selectedProgramme,
    has_answers: hasAnswersFilter,
    sort_by: sortBy,
    sort_order: sortOrder,
    highlight: true,
    include_children: true,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  };

  // Fetch questions with advanced filters
  const {
    data: questionsData,
    isLoading,
    isError,
    isFetching,
    refetch
  } = useAdvancedQuestionSearch(searchFilters);

  // Fetch platform statistics (not question-specific stats)
  const { data: platformStats, isLoading: isStatsLoading } = usePlatformStats();

  // Fetch filter options with search
  const { data: institutions = [] } = useInstitutionsList(institutionSearchQuery);
  const { data: courses = [] } = useCoursesList(courseSearchQuery);
  const { data: modules = [] } = useModulesList(moduleSearchQuery);
  const { data: programmes = [] } = useProgrammesList();

  // Transform data into filter options
  const filterOptions = useMemo(() => {
    const institutionOptions: FilterOption[] = institutions.map((inst: any) => ({
      value: inst.id,
      label: inst.name,
      count: inst.exams_count || 0,
    }));

    const courseOptions: FilterOption[] = courses.map((course: any) => ({
      value: course.id,
      label: course.name,
      count: course.modules_count || 0,
    }));

    const moduleOptions: FilterOption[] = modules.map((module: any) => ({
      value: module.id,
      label: module.name,
    }));

    const programmeOptions: FilterOption[] = programmes.map((prog: any) => ({
      value: prog.id,
      label: prog.name,
    }));

    return {
      institutions: institutionOptions,
      courses: courseOptions,
      modules: moduleOptions,
      programmes: programmeOptions,
      years: [], // TODO: Extract years from exam papers
      tags: [], // TODO: Extract tags from exam papers
      durationRange: { min: 0, max: 300 },
      dateRange: { min: '2020-01-01', max: new Date().toISOString().split('T')[0] },
    };
  }, [institutions, courses, modules, programmes]);

  // Extract questions, total, and pagination from the data
  const questions = questionsData?.data || [];
  const totalItems = questionsData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: 'relevance' | 'marks' | 'created_at', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filters: any) => {
    // Handle array format from FilterSidebar - properly handle empty arrays as undefined
    if (filters.institutionIds !== undefined) {
      const ids = filters.institutionIds;
      const newValue = ids && ids.length > 0 ? ids[0] : undefined;
      setSelectedInstitution(newValue);
    }
    if (filters.courseIds !== undefined) {
      const ids = filters.courseIds;
      const newValue = ids && ids.length > 0 ? ids[0] : undefined;
      setSelectedCourse(newValue);
    }
    if (filters.moduleIds !== undefined) {
      const ids = filters.moduleIds;
      const newValue = ids && ids.length > 0 ? ids[0] : undefined;
      setSelectedModule(newValue);
    }
    if (filters.programmeIds !== undefined) {
      const ids = filters.programmeIds;
      const newValue = ids && ids.length > 0 ? ids[0] : undefined;
      setSelectedProgramme(newValue);
    }
    if (filters.hasAnswers !== undefined) {
      setHasAnswersFilter(filters.hasAnswers);
    }
    setPage(1);
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSelectedInstitution(undefined);
    setSelectedCourse(undefined);
    setSelectedModule(undefined);
    setSelectedProgramme(undefined);
    setHasAnswersFilter(undefined);
    setSearchQuery('');
    setPage(1);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = selectedInstitution || selectedCourse || selectedModule || selectedProgramme || hasAnswersFilter !== undefined;

  // Helper functions to get names from IDs
  const getInstitutionName = (id: string) => {
    const institution = institutions.find((inst: any) => inst.id === id);
    return institution?.name || id;
  };

  const getCourseName = (id: string) => {
    const course = courses.find((c: any) => c.id === id);
    return course?.name || id;
  };

  const getModuleName = (id: string) => {
    const module = modules.find((m: any) => m.id === id);
    return module?.name || id;
  };

  const getProgrammeName = (id: string) => {
    const programme = programmes.find((p: any) => p.id === id);
    return programme?.name || id;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Statistics Section */}
      {platformStats && !isStatsLoading && (
        <div className="mb-6">
          <StatsSection stats={platformStats} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with Filters - Desktop */}
        <aside className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            filters={filterOptions}
            activeFilters={{
              institutionIds: selectedInstitution ? [selectedInstitution] : [],
              courseIds: selectedCourse ? [selectedCourse] : [],
              moduleIds: selectedModule ? [selectedModule] : [],
            }}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onInstitutionSearch={setInstitutionSearchQuery}
            onCourseSearch={setCourseSearchQuery}
            onModuleSearch={setModuleSearchQuery}
            isLoading={isLoading}
          />
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Search and Sort Bar */}
          <SearchAndSort
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            pageSize={pageSize}
            totalResults={totalItems}
            isLoading={isLoading}
            onSearchChange={handleSearch}
            onSortChange={handleSortChange}
            onPageSizeChange={handlePageSizeChange}
            onViewModeChange={() => {}} // View mode toggle not implemented yet
            onFilterClick={() => setIsMobileFilterOpen(true)}
            showFilterButton={true}
          />

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-6 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Active Filters</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedInstitution && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-blue-200">
                    <span className="text-sm">Institution: {getInstitutionName(selectedInstitution)}</span>
                    <button onClick={() => setSelectedInstitution(undefined)} className="text-blue-600 hover:text-blue-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {selectedCourse && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-blue-200">
                    <span className="text-sm">Course: {getCourseName(selectedCourse)}</span>
                    <button onClick={() => setSelectedCourse(undefined)} className="text-blue-600 hover:text-blue-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {selectedModule && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-blue-200">
                    <span className="text-sm">Module: {getModuleName(selectedModule)}</span>
                    <button onClick={() => setSelectedModule(undefined)} className="text-blue-600 hover:text-blue-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {selectedProgramme && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-blue-200">
                    <span className="text-sm">Programme: {getProgrammeName(selectedProgramme)}</span>
                    <button onClick={() => setSelectedProgramme(undefined)} className="text-blue-600 hover:text-blue-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {hasAnswersFilter !== undefined && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-blue-200">
                    <span className="text-sm">Has Answers: {hasAnswersFilter ? 'Yes' : 'No'}</span>
                    <button onClick={() => setHasAnswersFilter(undefined)} className="text-blue-600 hover:text-blue-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="mt-6 bg-white shadow-lg rounded-lg p-0 relative min-h-[400px]">
            {/* Initial Loading State - Skeleton */}
            {isLoading && (
              <QuestionsListSkeleton count={5} />
            )}
            
            {/* Loading Overlay for Refetch */}
            {!isLoading && isFetching && (
              <LoadingOverlay
                isVisible={true}
                message="Updating questions..."
                variant="overlay"
              />
            )}
            
            {/* Error State */}
            {isError && !isLoading && (
              <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Error loading questions.</p>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </div>
            )}
            
            {/* Empty State */}
            {!isError && !isLoading && questions.length === 0 && (
              <div className="p-8 text-center">
                {searchQuery || hasActiveFilters ? (
                  <>
                    <p className="text-gray-600 mb-4">No questions found matching your criteria</p>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-600">No questions available at the moment.</p>
                )}
              </div>
            )}
            
            {/* Questions List with Fade Transition */}
            {!isError && !isLoading && questions.length > 0 && (
              <div className={`transition-opacity duration-300 ${isFetching ? 'opacity-70' : 'opacity-100'}`}>
                <RecentQuestionsSection
                  questions={questions}
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  isLoading={false}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        onApplyFilters={handleFilterChange}
        onClearFilters={handleClearFilters}
        filters={filterOptions}
        activeFilters={{
          institutionIds: selectedInstitution ? [selectedInstitution] : [],
          courseIds: selectedCourse ? [selectedCourse] : [],
          moduleIds: selectedModule ? [selectedModule] : [],
        }}
        onInstitutionSearch={setInstitutionSearchQuery}
        onCourseSearch={setCourseSearchQuery}
        onModuleSearch={setModuleSearchQuery}
      />
    </div>
  );
}
