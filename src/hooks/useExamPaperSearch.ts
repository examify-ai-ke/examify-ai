/**
 * Custom hook for exam paper search and filtering
 * Provides comprehensive search functionality with URL synchronization
 */

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { publicAPI } from '@/lib/api-public';
import type { ExamPaperRead } from '@/lib/api-public';

/**
 * Search filter interface
 */
export interface SearchFilters {
  // Text search
  query?: string;

  // Entity filters
  institutionIds?: string[];
  courseIds?: string[];
  moduleIds?: string[];
  years?: string[];
  tags?: string[];

  // Range filters
  durationMin?: number;
  durationMax?: number;
  examDateFrom?: string;
  examDateTo?: string;

  // Sorting
  sortBy?: 'relevance' | 'date' | 'duration' | 'title';
  sortOrder?: 'asc' | 'desc';

  // Pagination
  page?: number;
  pageSize?: number;
}

/**
 * Hook return type
 */
export interface UseExamPaperSearchReturn {
  // Data
  papers: ExamPaperRead[];
  total: number;

  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Filter management
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS: SearchFilters = {
  page: 1,
  pageSize: 20,
  sortBy: 'date',
  sortOrder: 'desc',
};

/**
 * Parse URL search params into filters
 */
function parseFiltersFromURL(searchParams: URLSearchParams): SearchFilters {
  const filters: SearchFilters = { ...DEFAULT_FILTERS };

  // Text search
  const query = searchParams.get('q');
  if (query) filters.query = query;

  // Entity filters (comma-separated)
  const institutionIds = searchParams.get('institutions');
  if (institutionIds) filters.institutionIds = institutionIds.split(',');

  const courseIds = searchParams.get('courses');
  if (courseIds) filters.courseIds = courseIds.split(',');

  const moduleIds = searchParams.get('modules');
  if (moduleIds) filters.moduleIds = moduleIds.split(',');

  const years = searchParams.get('years');
  if (years) filters.years = years.split(',');

  const tags = searchParams.get('tags');
  if (tags) filters.tags = tags.split(',');

  // Range filters
  const durationMin = searchParams.get('durationMin');
  if (durationMin) filters.durationMin = parseInt(durationMin, 10);

  const durationMax = searchParams.get('durationMax');
  if (durationMax) filters.durationMax = parseInt(durationMax, 10);

  const examDateFrom = searchParams.get('dateFrom');
  if (examDateFrom) filters.examDateFrom = examDateFrom;

  const examDateTo = searchParams.get('dateTo');
  if (examDateTo) filters.examDateTo = examDateTo;

  // Sorting
  const sortBy = searchParams.get('sortBy');
  if (sortBy && ['relevance', 'date', 'duration', 'title'].includes(sortBy)) {
    filters.sortBy = sortBy as SearchFilters['sortBy'];
  }

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    filters.sortOrder = sortOrder as 'asc' | 'desc';
  }

  // Pagination
  const page = searchParams.get('page');
  if (page) filters.page = parseInt(page, 10);

  const pageSize = searchParams.get('pageSize');
  if (pageSize) filters.pageSize = parseInt(pageSize, 10);

  return filters;
}

/**
 * Convert filters to URL search params
 */
function filtersToURLParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Only add non-default values to keep URL clean
  if (filters.query) params.set('q', filters.query);

  if (filters.institutionIds?.length) {
    params.set('institutions', filters.institutionIds.join(','));
  }

  if (filters.courseIds?.length) {
    params.set('courses', filters.courseIds.join(','));
  }

  if (filters.moduleIds?.length) {
    params.set('modules', filters.moduleIds.join(','));
  }

  if (filters.years?.length) {
    params.set('years', filters.years.join(','));
  }

  if (filters.tags?.length) {
    params.set('tags', filters.tags.join(','));
  }

  if (filters.durationMin !== undefined) {
    params.set('durationMin', filters.durationMin.toString());
  }

  if (filters.durationMax !== undefined) {
    params.set('durationMax', filters.durationMax.toString());
  }

  if (filters.examDateFrom) {
    params.set('dateFrom', filters.examDateFrom);
  }

  if (filters.examDateTo) {
    params.set('dateTo', filters.examDateTo);
  }

  if (filters.sortBy && filters.sortBy !== DEFAULT_FILTERS.sortBy) {
    params.set('sortBy', filters.sortBy);
  }

  if (filters.sortOrder && filters.sortOrder !== DEFAULT_FILTERS.sortOrder) {
    params.set('sortOrder', filters.sortOrder);
  }

  if (filters.page && filters.page !== 1) {
    params.set('page', filters.page.toString());
  }

  if (filters.pageSize && filters.pageSize !== DEFAULT_FILTERS.pageSize) {
    params.set('pageSize', filters.pageSize.toString());
  }

  return params;
}

/**
 * Map frontend filters to API parameters
 */
function mapFiltersToAPIParams(filters: SearchFilters) {
  return {
    q: filters.query,
    institution_id: filters.institutionIds?.join(','),
    course_id: filters.courseIds?.join(','),
    year: filters.years?.join(','),
    tags: filters.tags?.join(','),
    duration_min: filters.durationMin,
    duration_max: filters.durationMax,
    exam_date_from: filters.examDateFrom,
    exam_date_to: filters.examDateTo,
    sort_by: filters.sortBy === 'date' ? 'year_of_exam' :
      filters.sortBy === 'title' ? 'title' :
        filters.sortBy === 'duration' ? 'duration' : undefined,
    sort_order: filters.sortOrder,
    skip: ((filters.page || 1) - 1) * (filters.pageSize || 20),
    limit: filters.pageSize || 20,
  };
}

/**
 * Custom hook for exam paper search with URL synchronization
 */
export function useExamPaperSearch(): UseExamPaperSearchReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL
  const [filters, setFiltersState] = useState<SearchFilters>(() =>
    parseFiltersFromURL(searchParams)
  );

  // Debounced query for search input
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.query]);

  // Create debounced filters for API call
  const debouncedFilters = useMemo(() => ({
    ...filters,
    query: debouncedQuery,
  }), [filters, debouncedQuery]);

  // Sync filters to URL
  useEffect(() => {
    const params = filtersToURLParams(debouncedFilters);
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    // Only update if URL actually changed
    const currentURL = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    if (newURL !== currentURL) {
      router.replace(newURL, { scroll: false });
    }
  }, [debouncedFilters, pathname, router, searchParams]);

  // Fetch exam papers with React Query
  const apiParams = useMemo(() => mapFiltersToAPIParams(debouncedFilters), [debouncedFilters]);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['examPapers', 'search', apiParams],
    queryFn: async ({ signal }) => {
      // Use search endpoint if there are filters, otherwise use list
      const hasFilters = apiParams.q ||
        apiParams.institution_id ||
        apiParams.course_id ||
        apiParams.year ||
        apiParams.tags ||
        apiParams.duration_min !== undefined ||
        apiParams.duration_max !== undefined ||
        apiParams.exam_date_from ||
        apiParams.exam_date_to;

      const result = hasFilters
        ? await publicAPI.examPapers.search(apiParams)
        : await publicAPI.examPapers.list(apiParams);

      if (result.error) {
        throw new Error('Failed to fetch exam papers');
      }

      return {
        data: result.data,
        total: result.total,
        pagination: result.pagination,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update filters and reset to page 1 (except when only page changes)
  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState(prev => {
      // If only page is changing, don't reset it
      const isOnlyPageChange = Object.keys(newFilters).length === 1 && 'page' in newFilters;

      return {
        ...prev,
        ...newFilters,
        // Reset to page 1 when filters change (except pagination)
        page: isOnlyPageChange ? newFilters.page : (newFilters.page ?? 1),
      };
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    setFilters({ page });
  }, [setFilters]);

  // Apply client-side module filtering (backend doesn't support it)
  const filteredPapers = useMemo(() => {
    let papers = data?.data || [];

    // Filter by modules if module IDs are selected
    if (filters.moduleIds && filters.moduleIds.length > 0) {
      papers = papers.filter(paper => {
        if (!paper.modules || !Array.isArray(paper.modules)) return false;
        return paper.modules.some((module: any) =>
          filters.moduleIds?.includes(module.id)
        );
      });
    }

    return papers;
  }, [data?.data, filters.moduleIds]);

  // Calculate pagination
  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const total = filteredPapers.length; // Use filtered count
  const totalPages = Math.ceil(total / pageSize);

  // Apply pagination to filtered results
  const paginatedPapers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPapers.slice(startIndex, endIndex);
  }, [filteredPapers, currentPage, pageSize]);

  return {
    // Data
    papers: paginatedPapers,
    total,

    // Loading states
    isLoading,
    isError,
    error: error as Error | null,

    // Filter management
    filters,
    setFilters,
    clearFilters,

    // Pagination
    currentPage,
    totalPages,
    setPage,
  };
}
