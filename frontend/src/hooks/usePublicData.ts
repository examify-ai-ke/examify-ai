/**
 * React Query hooks for public data fetching
 * Provides caching, automatic refetching, and loading states
 */

import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '@/lib/api-public';

/**
 * Query keys for consistent cache management
 */
export const publicQueryKeys = {
  stats: ['public', 'stats'] as const,
  recentQuestions: (limit: number) => ['public', 'questions', 'recent', limit] as const,
  listQuestions: (filters?: Record<string, unknown>) => ['public', 'questions', 'list', filters] as const,
  searchQuestions: (filters?: Record<string, unknown>) => ['public', 'questions', 'search', filters] as const,
  questionStats: ['public', 'questions', 'stats'] as const,
  questionSuggestions: (query: string) => ['public', 'questions', 'suggestions', query] as const,
  featuredInstitutions: (limit: number) => ['public', 'institutions', 'featured', limit] as const,
  examPapers: (filters?: Record<string, unknown>) => ['public', 'examPapers', filters] as const,
  examPaper: (id: string) => ['public', 'examPaper', id] as const,
  institution: (id: string) => ['public', 'institution', id] as const,
  question: (id: string) => ['public', 'question', id] as const,
};

/**
 * Fetch platform statistics
 * Cache: 10 minutes (stats don't change often)
 */
export function usePlatformStats() {
  return useQuery({
    queryKey: publicQueryKeys.stats,
    queryFn: async () => {
      const result = await publicAPI.stats.getPlatformStats();
      if (result.error) {
        throw new Error('Failed to fetch platform stats');
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Fetch recent questions
 * Cache: 5 minutes (questions update frequently)
 */
export function useRecentQuestions(limit: number = 9) {
  return useQuery({
    queryKey: publicQueryKeys.recentQuestions(limit),
    queryFn: async () => {
      console.log('🔍 Fetching recent questions from API...');
      const result = await publicAPI.questions.getRecent(limit);
      console.log('📦 API Response:', {
        dataCount: result.data?.length,
        total: result.total,
        error: result.error,
        sampleData: result.data?.[0]
      });
      if (result.error) {
        console.error('❌ Error fetching questions:', result.error);
        throw new Error('Failed to fetch recent questions');
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch list of questions with pagination and filters
 * Cache: 5 minutes
 */
export function useListQuestions(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: publicQueryKeys.listQuestions(filters),
    queryFn: async () => {
      console.log('🔍 Fetching list of questions from API with filters:', filters);
      // Use the search method instead of the non-existent list method
      const result = await publicAPI.questions.search(filters as any);
      console.log('📦 API Response:', {
        dataCount: result.data?.length,
        total: result.total,
        error: result.error,
        sampleData: result.data?.[0]
      });
      if (result.error) {
        console.error('❌ Error fetching questions list:', result.error);
        throw new Error('Failed to fetch questions list');
      }
      return {
        data: result.data,
        total: result.total,
        pagination: result.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch featured institutions
 * Cache: 10 minutes (featured list is relatively stable)
 * Uses advanced search endpoint sorted by exam_count to feature institutions with content first
 */
export function useFeaturedInstitutions(limit: number = 8) {
  return useQuery({
    queryKey: publicQueryKeys.featuredInstitutions(limit),
    queryFn: async () => {
      const result = await publicAPI.institutions.getFeatured(limit);
      if (result.error) {
        throw new Error('Failed to fetch featured institutions');
      }
      
      // API already sorts by exam_count, so just return the data
      return result.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Fetch exam papers with filters
 * Cache: 5 minutes
 */
export function useExamPapers(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: publicQueryKeys.examPapers(filters),
    queryFn: async () => {
      const result = await publicAPI.examPapers.list(filters);
      if (result.error) {
        throw new Error('Failed to fetch exam papers');
      }
      return {
        data: result.data,
        total: result.total,
        pagination: result.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch a single exam paper by ID
 * Cache: 10 minutes (individual papers don't change often)
 */
export function useExamPaper(paperId: string) {
  return useQuery({
    queryKey: publicQueryKeys.examPaper(paperId),
    queryFn: async () => {
      const result = await publicAPI.examPapers.getById(paperId);
      if (result.error) {
        throw new Error('Failed to fetch exam paper');
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!paperId, // Only fetch if paperId is provided
  });
}

/**
 * Fetch a single institution by ID
 * Cache: 10 minutes
 */
export function useInstitution(institutionId: string) {
  return useQuery({
    queryKey: publicQueryKeys.institution(institutionId),
    queryFn: async () => {
      const result = await publicAPI.institutions.getById(institutionId);
      if (result.error) {
        throw new Error('Failed to fetch institution');
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!institutionId,
  });
}

/**
 * Fetch a single question by ID
 * Cache: 10 minutes
 */
export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: publicQueryKeys.question(questionId),
    queryFn: async () => {
      const result = await publicAPI.questions.getById(questionId);
      if (result.error) {
        throw new Error('Failed to fetch question');
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!questionId,
  });
}

/**
 * Check if any filters are active (excluding pagination)
 */
function hasActiveFilters(filters?: Record<string, unknown>): boolean {
  if (!filters) return false;
  
  const filterKeys = Object.keys(filters).filter(
    key => !['skip', 'limit'].includes(key)
  );
  
  return filterKeys.some(key => {
    const value = filters[key];
    return value !== undefined && value !== null && value !== '';
  });
}

/**
 * Advanced search for questions with smart endpoint selection
 * - Uses /api/v1/questions for initial browse (no filters)
 * - Uses /api/v1/questions/search for filtered results
 * Cache: 3 minutes (search results change frequently)
 * Priority: High (main content)
 */
export function useAdvancedQuestionSearch(filters?: Record<string, unknown>) {
  const isFiltered = hasActiveFilters(filters);
  
  return useQuery({
    queryKey: isFiltered 
      ? publicQueryKeys.searchQuestions(filters)
      : publicQueryKeys.listQuestions(filters),
    queryFn: async () => {
      if (isFiltered) {
        console.log('🔍 Fetching questions with search endpoint (filters active):', filters);
        const result = await publicAPI.questions.search(filters as any);
        console.log('📦 Search Response:', {
          dataCount: result.data?.length,
          total: result.total,
          error: result.error,
        });
        if (result.error) {
          console.error('❌ Error in question search:', result.error);
          throw new Error('Failed to search questions');
        }
        return {
          data: result.data,
          total: result.total,
          pagination: result.pagination,
        };
      } else {
        console.log('📋 Fetching questions with list endpoint (no filters):', filters);
        const result = await publicAPI.questions.getRecent(
          filters?.limit as number || 20,
          filters?.skip as number || 0
        );
        console.log('📦 List Response:', {
          dataCount: result.data?.length,
          total: result.total,
          error: result.error,
        });
        if (result.error) {
          console.error('❌ Error fetching questions:', result.error);
          throw new Error('Failed to fetch questions');
        }
        return {
          data: result.data,
          total: result.total,
          pagination: {
            page: Math.floor((filters?.skip as number || 0) / (filters?.limit as number || 20)) + 1,
            size: filters?.limit as number || 20,
            pages: Math.ceil((result.total || 0) / (filters?.limit as number || 20)),
            total: result.total || 0,
          },
        };
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    networkMode: 'online', // Ensure it runs immediately when online
  });
}

/**
 * Fetch question statistics
 * Cache: 10 minutes (stats don't change often)
 */
export function useQuestionStats() {
  return useQuery({
    queryKey: publicQueryKeys.questionStats,
    queryFn: async () => {
      console.log('📊 Fetching question statistics...');
      const result = await publicAPI.questions.getStats();
      console.log('📦 Question Stats Response:', result);
      
      // Check for errors
      if (result.error) {
        console.error('❌ Error fetching question stats:', result.error);
        throw new Error('Failed to fetch question statistics');
      }
      
      // Return data (even if empty object, let the component handle it)
      return result.data || {};
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Fetch search suggestions for questions
 * Cache: 5 minutes
 */
export function useQuestionSearchSuggestions(query: string) {
  return useQuery({
    queryKey: publicQueryKeys.questionSuggestions(query),
    queryFn: async () => {
      console.log('💡 Fetching question search suggestions for:', query);
      const result = await publicAPI.questions.getSuggestions(query);
      console.log('📦 Suggestions Response:', result);
      if (result.error) {
        console.error('❌ Error fetching suggestions:', result.error);
        throw new Error('Failed to fetch search suggestions');
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!query && query.length > 0, // Only fetch if query is not empty
  });
}

/**
 * Fetch institutions for filter options with optional search
 * Cache: 15 minutes (relatively stable data)
 * Lower priority: Filter options can load after main content
 */
export function useInstitutionsList(searchQuery?: string) {
  return useQuery({
    queryKey: ['public', 'institutions', 'list', searchQuery],
    queryFn: async () => {
      if (searchQuery && searchQuery.length > 0) {
        // Use list endpoint with search_term parameter
        const result = await publicAPI.institutions.list({ 
          search_term: searchQuery,
          limit: 20 
        });
        if (result.error) {
          throw new Error('Failed to search institutions');
        }
        return result.data;
      } else {
        // Default: fetch top institutions sorted by exam count
        const result = await publicAPI.institutions.list({ limit: 10 });
        if (result.error) {
          throw new Error('Failed to fetch institutions');
        }
        // Sort by exams_count descending
        return result.data.sort((a: any, b: any) => (b.exams_count || 0) - (a.exams_count || 0));
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false, // Don't refetch on every mount
  });
}

/**
 * Fetch courses for filter options with optional search
 * Cache: 15 minutes (relatively stable data)
 * Lower priority: Filter options can load after main content
 */
export function useCoursesList(searchQuery?: string) {
  return useQuery({
    queryKey: ['public', 'courses', 'list', searchQuery],
    queryFn: async () => {
      if (searchQuery && searchQuery.length > 0) {
        // Use search endpoint when query is provided
        const result = await publicAPI.courses.search({ 
          q: searchQuery,
          limit: 20 
        });
        if (result.error) {
          throw new Error('Failed to search courses');
        }
        return result.data;
      } else {
        // Default: fetch top courses
        const result = await publicAPI.courses.list({ limit: 10 });
        if (result.error) {
          throw new Error('Failed to fetch courses');
        }
        return result.data;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false, // Don't refetch on every mount
  });
}

/**
 * Fetch modules for filter options with optional search
 * Cache: 15 minutes (relatively stable data)
 * Lower priority: Filter options can load after main content
 */
export function useModulesList(searchQuery?: string) {
  return useQuery({
    queryKey: ['public', 'modules', 'list', searchQuery],
    queryFn: async () => {
      if (searchQuery && searchQuery.length > 0) {
        // Use search endpoint when query is provided
        const result = await publicAPI.modules.search({ 
          q: searchQuery,
          limit: 20 
        });
        if (result.error) {
          throw new Error('Failed to search modules');
        }
        return result.data;
      } else {
        // Default: fetch top modules
        const result = await publicAPI.modules.list({ limit: 10 });
        if (result.error) {
          throw new Error('Failed to fetch modules');
        }
        return result.data;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false, // Don't refetch on every mount
  });
}

/**
 * Fetch all programmes for filter options
 * Cache: 15 minutes (relatively stable data)
 * Lower priority: Filter options can load after main content
 */
export function useProgrammesList() {
  return useQuery({
    queryKey: ['public', 'programmes', 'list'],
    queryFn: async () => {
      const result = await publicAPI.programmes.list({ limit: 100 });
      if (result.error) {
        throw new Error('Failed to fetch programmes');
      }
      return result.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false, // Don't refetch on every mount
  });
}
