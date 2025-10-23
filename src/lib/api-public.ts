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
    // Text search
    q?: string;
    search?: string;
    
    // Entity filters
    institution_id?: string;
    course_id?: string;
    year?: string;
    tags?: string | string[];
    
    // Range filters
    duration_min?: number;
    duration_max?: number;
    exam_date_from?: string;
    exam_date_to?: string;
    
    // Sorting
    sort_by?: 'created_at' | 'title' | 'year_of_exam' | 'duration';
    sort_order?: 'asc' | 'desc';
    
    // Pagination
    limit?: number;
    skip?: number;
    
    // AbortController signal for request cancellation
    signal?: AbortSignal;
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
         * Supports comprehensive filtering, sorting, and request cancellation
         */
        async search(filters: ExamPaperFilters) {
            try {
                const searchParams: any = {
                    skip: filters.skip || 0,
                    limit: filters.limit || 20,
                };

                // Text search
                if (filters.q) searchParams.q = filters.q;
                if (filters.search) searchParams.q = filters.search;
                
                // Entity filters
                if (filters.institution_id) searchParams.institution_id = filters.institution_id;
                if (filters.course_id) searchParams.course_id = filters.course_id;
                if (filters.year) searchParams.year = filters.year;
                
                // Tags - handle both string and array
                if (filters.tags) {
                    searchParams.tags = Array.isArray(filters.tags) 
                        ? filters.tags.join(',') 
                        : filters.tags;
                }
                
                // Range filters
                if (filters.duration_min !== undefined) {
                    searchParams.duration_min = filters.duration_min;
                }
                if (filters.duration_max !== undefined) {
                    searchParams.duration_max = filters.duration_max;
                }
                if (filters.exam_date_from) {
                    searchParams.exam_date_from = filters.exam_date_from;
                }
                if (filters.exam_date_to) {
                    searchParams.exam_date_to = filters.exam_date_to;
                }
                
                // Sorting
                if (filters.sort_by) searchParams.sort_by = filters.sort_by;
                if (filters.sort_order) searchParams.sort_order = filters.sort_order;

                const response = await api.GET('/api/v1/exampaper/search', {
                    params: {
                        query: searchParams
                    },
                    signal: filters.signal,
                });

                return {
                    data: extractItems<ExamPaperRead>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error: any) {
                // Handle abort errors gracefully
                if (error.name === 'AbortError') {
                    console.log('Search request cancelled');
                    return {
                        data: [],
                        total: 0,
                        pagination: { page: 1, size: 10, pages: 0, total: 0 },
                        error: null,
                    };
                }
                
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
                            skip: 0,
                            limit: limit,
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
        async getRecent(limit: number = 10, skip: number = 0) {
            try {
                console.log('🌐 Calling API: GET /api/v1/questions', { limit, skip });
                const response = await api.GET('/api/v1/questions', {
                    params: {
                        query: {
                            question_type: 'all',
                            include_children: true,
                            skip,
                            limit: 100, // Fetch more to ensure we get enough main questions after filtering
                        }
                    }
                });

                console.log('📡 Raw API Response:', {
                    hasData: !!response.data,
                    hasError: !!response.error,
                    responseType: typeof response.data,
                    responseKeys: response.data ? Object.keys(response.data) : []
                });

                const allItems = extractItems<QuestionRead>(response);
                const totalFromAPI = extractTotal(response);
                
                // Filter to get only main questions (with children included)
                const mainQuestions = allItems.filter((q: any) => 
                    q.is_main_question === true
                );

                // Calculate total main questions (approximate based on ratio)
                const mainQuestionsRatio = mainQuestions.length / allItems.length;
                const estimatedTotalMainQuestions = Math.ceil(totalFromAPI * mainQuestionsRatio);

                console.log('✅ Extracted data:', { 
                    totalItems: allItems.length,
                    totalFromAPI,
                    mainQuestions: mainQuestions.length,
                    estimatedTotal: estimatedTotalMainQuestions,
                    sampleQuestion: mainQuestions[0],
                    hasChildren: mainQuestions[0]?.children?.length > 0
                });

                return {
                    data: mainQuestions.slice(0, limit),
                    total: estimatedTotalMainQuestions,
                    error: response.error,
                };
            } catch (error) {
                console.error('❌ Error fetching recent questions:', error);
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
                console.log('🏛️ Fetching institutions from:', process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost');
                const response = await api.GET('/api/v1/institution', {
                    params: {
                        query: {
                            skip: filters?.skip,
                            limit: filters?.limit || 20,
                        }
                    }
                });

                if (response.error) {
                    console.error('❌ Institutions API Error:', response.error);
                    throw new Error(`API Error: ${JSON.stringify(response.error)}`);
                }

                const items = extractItems<InstitutionRead>(response);
                console.log('📦 Institutions response:', {
                    count: items.length,
                    sampleData: items[0],
                    hasExamsCount: items[0] && 'exams_count' in items[0],
                    hasFacultiesCount: items[0] && 'faculties_count' in items[0],
                    hasCampusesCount: items[0] && 'campuses_count' in items[0],
                });

                return {
                    data: items,
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('❌ Error fetching institutions:', error);
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
                    skip: filters.skip || 0,
                    limit: filters.limit || 20,
                };

                if (filters.search) searchParams.q = filters.search;
                if (filters.institution_type) searchParams.institution_type = filters.institution_type;
                if (filters.location) searchParams.location = filters.location;

                console.log('🔍 Searching institutions:', searchParams);

                const response = await api.GET('/api/v1/institution/search/advanced', {
                    params: {
                        query: searchParams
                    }
                });

                const items = extractItems<InstitutionRead>(response);
                console.log('📦 Search results:', {
                    count: items.length,
                    filters: searchParams,
                    sampleData: items[0],
                });

                return {
                    data: items,
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
                
                // Sort by exams_count and take top N
                const featured = institutions
                    .sort((a: any, b: any) => (b.exams_count || 0) - (a.exams_count || 0))
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

        /**
         * Get exam papers for a specific institution
         */
        async getExamPapers(institutionId: string, filters?: { skip?: number; limit?: number }) {
            try {
                const response = await api.GET('/api/v1/institution/{institution_id}/exam-papers', {
                    params: {
                        path: { institution_id: institutionId },
                        query: {
                            skip: filters?.skip || 0,
                            limit: filters?.limit || 50,
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
                console.error('Error fetching institution exam papers:', error);
                return {
                    data: [],
                    total: 0,
                    pagination: { page: 1, size: 10, pages: 0, total: 0 },
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
                console.log('📚 Fetching courses from:', process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost');
                const response = await api.GET('/api/v1/course', {
                    params: {
                        query: {
                            skip: filters?.skip,
                            limit: filters?.limit || 20,
                        }
                    }
                });

                if (response.error) {
                    console.error('❌ Courses API Error:', response.error);
                    throw new Error(`API Error: ${JSON.stringify(response.error)}`);
                }

                const items = extractItems<CourseRead>(response);
                console.log('📦 Courses response:', {
                    count: items.length,
                    sampleData: items[0],
                });

                return {
                    data: items,
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('❌ Error fetching courses:', error);
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
