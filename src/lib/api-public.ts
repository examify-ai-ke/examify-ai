/**
 * Public API utilities for guest/unauthenticated users
 * These endpoints don't require authentication and are used for public browsing
 */

import { api } from './api';
import type { components } from '@/types/generated/api';

// Type definitions for public operations
export type ExamPaperRead = components['schemas']['ExamPaperRead'];
export type InstitutionRead = components['schemas']['InstitutionRead'];
export type QuestionRead = components['schemas']['QuestionRead'];
export type CourseRead = components['schemas']['CourseRead'];
export type ModuleRead = components['schemas']['ModuleRead'];

/**
 * Filters for fetching exam papers
 */
export interface ExamPaperFilters {
    institution_id?: string;
    course_id?: string;
    year?: string;
    search?: string;
    tags?: string[];
    limit?: number;
    skip?: number;
    sort_by?: 'created_at' | 'title' | 'year_of_exam';
    sort_order?: 'asc' | 'desc';
}

/**
 * Filters for fetching questions
 */
export interface QuestionFilters {
    exam_paper_id?: string;
    question_set_id?: string;
    search?: string;
    limit?: number;
    skip?: number;
}

/**
 * Filters for fetching institutions
 */
export interface InstitutionFilters {
    search?: string;
    institution_type?: 'Public' | 'Private' | 'Other';
    location?: string;
    limit?: number;
    skip?: number;
}

/**
 * Helper to safely extract items from paginated response
 */
function extractItems<T>(response: any): T[] {
    if (!response || !response.data) return [];
    
    if (typeof response.data === 'object' && 'data' in response.data) {
        const data = response.data.data as any;
        return data?.items || [];
    }
    
    return [];
}

/**
 * Helper to safely extract total from paginated response
 */
function extractTotal(response: any): number {
    if (!response || !response.data) return 0;
    
    if (typeof response.data === 'object' && 'data' in response.data) {
        const data = response.data.data as any;
        return data?.total || 0;
    }
    
    return 0;
}

/**
 * Helper to safely extract pagination info
 */
function extractPagination(response: any) {
    if (!response || !response.data) {
        return { page: 1, size: 10, pages: 0, total: 0 };
    }
    
    if (typeof response.data === 'object' && 'data' in response.data) {
        const data = response.data.data as any;
        return {
            page: data?.page || 1,
            size: data?.size || 10,
            pages: data?.pages || 0,
            total: data?.total || 0,
            previous_page: data?.previous_page,
            next_page: data?.next_page,
        };
    }
    
    return { page: 1, size: 10, pages: 0, total: 0 };
}

/**
 * Public API for browsing exam papers, questions, and institutions
 */
export const publicAPI = {
    /**
     * Exam Papers
     */
    examPapers: {
        /**
         * Fetch exam papers with optional filters
         * No authentication required
         */
        async list(filters?: ExamPaperFilters) {
            try {
                const response = await api.GET('/api/v1/exampaper', {
                    params: {
                        query: {
                            skip: filters?.skip,
                            limit: filters?.limit || 20,
                        }
                    }
                });

                return {
                    data: extractItems<ExamPaperRead>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching exam papers:', error);
                return {
                    data: [],
                    total: 0,
                    pagination: { page: 1, size: 10, pages: 0, total: 0 },
                    error: error as any,
                };
            }
        },

        /**
         * Search exam papers with advanced filters
         */
        async search(filters: ExamPaperFilters) {
            try {
                const searchParams: any = {
                    skip: filters.skip || 0,
                    limit: filters.limit || 20,
                };

                if (filters.search) searchParams.q = filters.search;
                if (filters.institution_id) searchParams.institution_id = filters.institution_id;
                if (filters.course_id) searchParams.course_id = filters.course_id;
                if (filters.year) searchParams.year = filters.year;
                if (filters.sort_by) searchParams.sort_by = filters.sort_by;
                if (filters.sort_order) searchParams.sort_order = filters.sort_order;

                const response = await api.GET('/api/v1/exampaper/search', {
                    params: {
                        query: searchParams
                    }
                });

                return {
                    data: extractItems<ExamPaperRead>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error searching exam papers:', error);
                return {
                    data: [],
                    total: 0,
                    pagination: { page: 1, size: 10, pages: 0, total: 0 },
                    error: error as any,
                };
            }
        },

        /**
         * Get a single exam paper by ID
         */
        async getById(paperId: string) {
            try {
                const response = await api.GET('/api/v1/exampaper/get_by_id/{exampaper_id}', {
                    params: {
                        path: { exampaper_id: paperId }
                    }
                });

                // Extract data from nested response structure
                const data = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                return {
                    data: data || null,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching exam paper:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Get a single exam paper by slug
         */
        async getBySlug(slug: string) {
            try {
                const response = await api.GET('/api/v1/exampaper/get_by_slug/{exampaper_slug}', {
                    params: {
                        path: { exampaper_slug: slug }
                    }
                });

                // Extract data from nested response structure
                const data = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                return {
                    data: data || null,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching exam paper by slug:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Get recent exam papers
         */
        async getRecent(limit: number = 10) {
            try {
                const response = await api.GET('/api/v1/exampaper/get_by_created_at', {
                    params: {
                        query: {
                            page: 1,
                            size: limit,
                            order: 'descendent'
                        }
                    }
                });

                return {
                    data: extractItems<ExamPaperRead>(response),
                    total: extractTotal(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching recent exam papers:', error);
                return {
                    data: [],
                    total: 0,
                    error: error as any,
                };
            }
        },
    },

    /**
     * Questions
     */
    questions: {
        /**
         * Fetch recent questions
         * Useful for landing page "Recent Questions" section
         */
        async getRecent(limit: number = 10) {
            try {
                const response = await api.GET('/api/v1/questions', {
                    params: {
                        query: {
                            skip: 0,
                            limit,
                        }
                    }
                });

                return {
                    data: extractItems<QuestionRead>(response),
                    total: extractTotal(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching recent questions:', error);
                return {
                    data: [],
                    total: 0,
                    error: error as any,
                };
            }
        },

        /**
         * Search questions
         */
        async search(filters: QuestionFilters) {
            try {
                const searchParams: any = {
                    skip: filters.skip || 0,
                    limit: filters.limit || 20,
                };

                if (filters.search) searchParams.q = filters.search;
                if (filters.exam_paper_id) searchParams.exam_paper_id = filters.exam_paper_id;
                if (filters.question_set_id) searchParams.question_set_id = filters.question_set_id;

                const response = await api.GET('/api/v1/questions/search', {
                    params: {
                        query: searchParams
                    }
                });

                return {
                    data: extractItems<QuestionRead>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error searching questions:', error);
                return {
                    data: [],
                    total: 0,
                    pagination: { page: 1, size: 10, pages: 0, total: 0 },
                    error: error as any,
                };
            }
        },

        /**
         * Get a single question by ID
         */
        async getById(questionId: string) {
            try {
                const response = await api.GET('/api/v1/questions/{question_id}', {
                    params: {
                        path: { question_id: questionId }
                    }
                });

                // Extract data from nested response structure
                const data = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                return {
                    data: data || null,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching question:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },
    },

    /**
     * Institutions
     */
    institutions: {
        /**
         * Fetch institutions with optional filters
         */
        async list(filters?: InstitutionFilters) {
            try {
                const response = await api.GET('/api/v1/institution', {
                    params: {
                        query: {
                            skip: filters?.skip,
                            limit: filters?.limit || 20,
                        }
                    }
                });

                return {
                    data: extractItems<InstitutionRead>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching institutions:', error);
                return {
                    data: [],
                    total: 0,
                    pagination: { page: 1, size: 10, pages: 0, total: 0 },
                    error: error as any,
                };
            }
        },

        /**
         * Search institutions with advanced filters
         */
        async search(filters: InstitutionFilters) {
            try {
                const searchParams: any = {
                    q: filters.search || '',
                    skip: filters.skip || 0,
                    limit: filters.limit || 20,
                };

                if (filters.institution_type) searchParams.institution_type = filters.institution_type;
                if (filters.location) searchParams.location = filters.location;

                const response = await api.GET('/api/v1/institution/search/advanced', {
                    params: {
                        query: searchParams
                    }
                });

                return {
                    data: extractItems<InstitutionRead>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error searching institutions:', error);
                return {
                    data: [],
                    total: 0,
                    pagination: { page: 1, size: 10, pages: 0, total: 0 },
                    error: error as any,
                };
            }
        },

        /**
         * Get a single institution by ID
         */
        async getById(institutionId: string) {
            try {
                const response = await api.GET('/api/v1/institution/get_by_id/{institution_id}', {
                    params: {
                        path: { institution_id: institutionId }
                    }
                });

                // Extract data from nested response structure
                const data = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                return {
                    data: data || null,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching institution:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Get a single institution by slug
         */
        async getBySlug(slug: string) {
            try {
                const response = await api.GET('/api/v1/institution/get_by_slug/{institution_slug}', {
                    params: {
                        path: { institution_slug: slug }
                    }
                });

                // Extract data from nested response structure
                const data = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                return {
                    data: data || null,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching institution by slug:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Get featured institutions (by paper count)
         * Useful for landing page
         */
        async getFeatured(limit: number = 8) {
            try {
                // Get institutions and sort by paper count on client side
                const response = await api.GET('/api/v1/institution', {
                    params: {
                        query: {
                            skip: 0,
                            limit: 50, // Get more to filter
                        }
                    }
                });

                const institutions = extractItems<InstitutionRead>(response);
                
                // Sort by exam_papers_count and take top N
                const featured = institutions
                    .sort((a: any, b: any) => (b.exam_papers_count || 0) - (a.exam_papers_count || 0))
                    .slice(0, limit);

                return {
                    data: featured,
                    total: featured.length,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching featured institutions:', error);
                return {
                    data: [],
                    total: 0,
                    error: error as any,
                };
            }
        },
    },

    /**
     * Courses
     */
    courses: {
        /**
         * Fetch courses
         */
        async list(filters?: { skip?: number; limit?: number }) {
            try {
                const response = await api.GET('/api/v1/course', {
                    params: {
                        query: {
                            skip: filters?.skip,
                            limit: filters?.limit || 20,
                        }
                    }
                });

                return {
                    data: extractItems<CourseRead>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching courses:', error);
                return {
                    data: [],
                    total: 0,
                    pagination: { page: 1, size: 10, pages: 0, total: 0 },
                    error: error as any,
                };
            }
        },

        /**
         * Get a single course by ID
         */
        async getById(courseId: string) {
            try {
                const response = await api.GET('/api/v1/course/get_by_id/{course_id}', {
                    params: {
                        path: { course_id: courseId }
                    }
                });

                // Extract data from nested response structure
                const data = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                return {
                    data: data || null,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching course:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },
    },

    /**
     * Statistics for landing page
     */
    stats: {
        /**
         * Get platform statistics
         */
        async getPlatformStats() {
            try {
                // Fetch counts from multiple endpoints
                // Using limit: 10 to avoid potential backend issues with limit: 1
                const [papersResponse, institutionsResponse, questionsResponse] = await Promise.allSettled([
                    api.GET('/api/v1/exampaper', { params: { query: { limit: 10 } } }),
                    api.GET('/api/v1/institution', { params: { query: { limit: 10 } } }),
                    api.GET('/api/v1/questions', { params: { query: { limit: 10 } } }),
                ]);

                const totalPapers = papersResponse.status === 'fulfilled' 
                    ? extractTotal(papersResponse.value) 
                    : 0;
                
                const totalInstitutions = institutionsResponse.status === 'fulfilled'
                    ? extractTotal(institutionsResponse.value)
                    : 0;
                
                const totalQuestions = questionsResponse.status === 'fulfilled'
                    ? extractTotal(questionsResponse.value)
                    : 0;

                return {
                    data: {
                        totalPapers,
                        totalInstitutions,
                        totalQuestions,
                    },
                    error: null,
                };
            } catch (error) {
                console.error('Error fetching platform stats:', error);
                return {
                    data: {
                        totalPapers: 0,
                        totalInstitutions: 0,
                        totalQuestions: 0,
                    },
                    error: error as any,
                };
            }
        },
    },
};

export default publicAPI;
