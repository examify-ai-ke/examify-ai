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
  programmes: FilterOption[];
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
 * Custom hook for fetching available filter options
 * Fetches institutions, courses, modules for filtering
 * Note: Years, tags, and ranges are derived from the main exam papers query
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
  
  // Fetch modules
  const {
    data: modulesData,
    isLoading: modulesLoading,
    isError: modulesError,
    error: modulesErrorObj,
  } = useQuery({
    queryKey: ['availableFilters', 'modules'],
    queryFn: async () => {
      try {
        const result = await publicAPI.modules.list({ limit: 100 });
        
        if (result.error) {
          console.error('Modules API error:', result.error);
          throw new Error(`Failed to fetch modules: ${JSON.stringify(result.error)}`);
        }
        
        if (!result.data || !Array.isArray(result.data)) {
          console.warn('Modules API returned unexpected data:', result);
          return [];
        }
        
        return result.data.map(module => ({
          value: module.id || '',
          label: module.name || '',
        }));
      } catch (error) {
        console.error('Error in modules query:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
  
  // Fetch programmes
  const {
    data: programmesData,
    isLoading: programmesLoading,
    isError: programmesError,
    error: programmesErrorObj,
  } = useQuery({
    queryKey: ['availableFilters', 'programmes'],
    queryFn: async () => {
      try {
        const result = await publicAPI.programmes.list({ limit: 100 });
        
        if (result.error) {
          console.error('Programmes API error:', result.error);
          throw new Error(`Failed to fetch programmes: ${JSON.stringify(result.error)}`);
        }
        
        if (!result.data || !Array.isArray(result.data)) {
          console.warn('Programmes API returned unexpected data:', result);
          return [];
        }
        
        return result.data.map(programme => ({
          value: programme.id || '',
          label: programme.name || '',
        }));
      } catch (error) {
        console.error('Error in programmes query:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
  
  // Combine loading states
  const isLoading = institutionsLoading || coursesLoading || modulesLoading || programmesLoading;
  const isError = institutionsError || coursesError || modulesError || programmesError;
  const error = institutionsErrorObj || coursesErrorObj || modulesErrorObj || programmesErrorObj;
  
  // Process data when all queries are successful
  // Note: Years, tags, duration/date ranges should be provided by backend or derived from search results
  const data: AvailableFilters | undefined = 
    institutionsData && coursesData && modulesData && programmesData
      ? {
          institutions: institutionsData,
          courses: coursesData,
          modules: modulesData,
          programmes: programmesData,
          years: [], // TODO: Backend should provide available years endpoint
          tags: [], // TODO: Backend should provide available tags endpoint
          durationRange: { min: 0, max: 300 }, // Default range
          dateRange: { 
            min: new Date(new Date().getFullYear() - 10, 0, 1).toISOString().split('T')[0],
            max: new Date().toISOString().split('T')[0]
          }, // Default 10 year range
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
