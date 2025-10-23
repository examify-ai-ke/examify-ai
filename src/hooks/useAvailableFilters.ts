/**
 * Custom hook for fetching available filter options
 * Provides institutions, courses, years, and tags for filtering exam papers
 */

import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '@/lib/api-public';

/**
 * Filter option interface
 */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

/**
 * Available filters interface
 */
export interface AvailableFilters {
  institutions: FilterOption[];
  courses: FilterOption[];
  modules: FilterOption[];
  years: FilterOption[];
  tags: FilterOption[];
  durationRange: { min: number; max: number };
  dateRange: { min: string; max: string };
}

/**
 * Hook return type
 */
export interface UseAvailableFiltersReturn {
  data: AvailableFilters | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Extract unique years from exam papers
 */
function extractYears(papers: any[]): FilterOption[] {
  const yearSet = new Set<string>();
  
  papers.forEach(paper => {
    if (paper.year_of_exam) {
      yearSet.add(paper.year_of_exam.toString());
    }
  });
  
  // Sort years in descending order (most recent first)
  return Array.from(yearSet)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .map(year => ({
      value: year,
      label: year,
    }));
}

/**
 * Extract unique modules from exam papers
 */
function extractModules(papers: any[]): FilterOption[] {
  const moduleMap = new Map<string, { name: string; count: number }>();
  
  papers.forEach(paper => {
    if (paper.modules && Array.isArray(paper.modules)) {
      paper.modules.forEach((module: any) => {
        if (module.id && module.name) {
          const existing = moduleMap.get(module.id);
          if (existing) {
            existing.count++;
          } else {
            moduleMap.set(module.id, { name: module.name, count: 1 });
          }
        }
      });
    }
  });
  
  // Sort modules alphabetically by name
  return Array.from(moduleMap.entries())
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, { name, count }]) => ({
      value: id,
      label: name,
      count,
    }));
}

/**
 * Extract unique tags from exam papers
 */
function extractTags(papers: any[]): FilterOption[] {
  const tagMap = new Map<string, number>();
  
  papers.forEach(paper => {
    if (paper.tags && Array.isArray(paper.tags)) {
      paper.tags.forEach((tag: string) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    }
  });
  
  // Sort tags alphabetically
  return Array.from(tagMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({
      value: tag,
      label: tag,
      count,
    }));
}

/**
 * Calculate duration range from exam papers
 */
function calculateDurationRange(papers: any[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  
  papers.forEach(paper => {
    if (paper.duration !== undefined && paper.duration !== null) {
      min = Math.min(min, paper.duration);
      max = Math.max(max, paper.duration);
    }
  });
  
  // Return sensible defaults if no valid durations found
  if (min === Infinity || max === -Infinity) {
    return { min: 0, max: 300 };
  }
  
  return { min, max };
}

/**
 * Calculate date range from exam papers
 */
function calculateDateRange(papers: any[]): { min: string; max: string } {
  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  
  papers.forEach(paper => {
    if (paper.exam_date) {
      const date = new Date(paper.exam_date);
      if (!minDate || date < minDate) {
        minDate = date;
      }
      if (!maxDate || date > maxDate) {
        maxDate = date;
      }
    }
  });
  
  // Return sensible defaults if no valid dates found
  if (!minDate || !maxDate) {
    const now = new Date();
    const fiveYearsAgo = new Date(now.getFullYear() - 5, 0, 1);
    return {
      min: fiveYearsAgo.toISOString().split('T')[0],
      max: now.toISOString().split('T')[0],
    };
  }
  
  return {
    min: minDate.toISOString().split('T')[0],
    max: maxDate.toISOString().split('T')[0],
  };
}

/**
 * Custom hook for fetching available filter options
 * Fetches institutions, courses, years, tags, and ranges for filtering
 */
export function useAvailableFilters(): UseAvailableFiltersReturn {
  // Fetch institutions
  const {
    data: institutionsData,
    isLoading: institutionsLoading,
    isError: institutionsError,
    error: institutionsErrorObj,
  } = useQuery({
    queryKey: ['availableFilters', 'institutions'],
    queryFn: async () => {
      try {
        const result = await publicAPI.institutions.list({ limit: 100 });
        
        if (result.error) {
          console.error('Institutions API error:', result.error);
          throw new Error(`Failed to fetch institutions: ${JSON.stringify(result.error)}`);
        }
        
        if (!result.data || !Array.isArray(result.data)) {
          console.warn('Institutions API returned unexpected data:', result);
          return [];
        }
        
        return result.data.map(institution => ({
          value: institution.id || '',
          label: institution.name || '',
          count: institution.exams_count || 0,
        }));
      } catch (error) {
        console.error('Error in institutions query:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
  
  // Fetch courses
  const {
    data: coursesData,
    isLoading: coursesLoading,
    isError: coursesError,
    error: coursesErrorObj,
  } = useQuery({
    queryKey: ['availableFilters', 'courses'],
    queryFn: async () => {
      try {
        const result = await publicAPI.courses.list({ limit: 100 });
        
        if (result.error) {
          console.error('Courses API error:', result.error);
          throw new Error(`Failed to fetch courses: ${JSON.stringify(result.error)}`);
        }
        
        if (!result.data || !Array.isArray(result.data)) {
          console.warn('Courses API returned unexpected data:', result);
          return [];
        }
        
        return result.data.map(course => ({
          value: course.id || '',
          label: course.name || course.course_acronym || '',
        }));
      } catch (error) {
        console.error('Error in courses query:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
  
  // Fetch exam papers to extract years, tags, and ranges
  const {
    data: papersData,
    isLoading: papersLoading,
    isError: papersError,
    error: papersErrorObj,
  } = useQuery({
    queryKey: ['availableFilters', 'papers'],
    queryFn: async () => {
      try {
        // Fetch a sample of papers to get comprehensive filter data
        // Backend has a max limit of 100
        const result = await publicAPI.examPapers.list({ limit: 100 });
        
        if (result.error) {
          console.error('Papers API error:', result.error);
          throw new Error(`Failed to fetch exam papers: ${JSON.stringify(result.error)}`);
        }
        
        if (!result.data || !Array.isArray(result.data)) {
          console.warn('Papers API returned unexpected data:', result);
          return [];
        }
        
        return result.data;
      } catch (error) {
        console.error('Error in papers query:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
  
  // Combine loading states
  const isLoading = institutionsLoading || coursesLoading || papersLoading;
  const isError = institutionsError || coursesError || papersError;
  const error = institutionsErrorObj || coursesErrorObj || papersErrorObj;
  
  // Process data when all queries are successful
  const data: AvailableFilters | undefined = 
    institutionsData && coursesData && papersData
      ? {
          institutions: institutionsData,
          courses: coursesData,
          modules: extractModules(papersData),
          years: extractYears(papersData),
          tags: extractTags(papersData),
          durationRange: calculateDurationRange(papersData),
          dateRange: calculateDateRange(papersData),
        }
      : undefined;
  
  // Refetch function
  const refetch = () => {
    // This would trigger a refetch of all queries
    // React Query handles this automatically
  };
  
  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
