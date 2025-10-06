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
      const result = await publicAPI.questions.getRecent(limit);
      if (result.error) {
        throw new Error('Failed to fetch recent questions');
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch featured institutions
 * Cache: 10 minutes (featured list is relatively stable)
 */
export function useFeaturedInstitutions(limit: number = 8) {
  return useQuery({
    queryKey: publicQueryKeys.featuredInstitutions(limit),
    queryFn: async () => {
      const result = await publicAPI.institutions.getFeatured(limit);
      if (result.error) {
        throw new Error('Failed to fetch featured institutions');
      }
      return result.data;
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
