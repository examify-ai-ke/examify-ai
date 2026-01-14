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
    search_term?: string;
    institution_type?: 'Public' | 'Private' | 'Other';
    category?: string;
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
                            skip: filters?.skip || 0,
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
                            skip: skip,
                            limit: limit,
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

                console.log('✅ Extracted data:', { 
                    totalItems: allItems.length,
                    totalFromAPI,
                    skip,
                    limit,
                    sampleQuestion: allItems[0],
                    hasChildren: (allItems[0]?.children?.length || 0) > 0
                });

                return {
                    data: allItems,
                    total: totalFromAPI,
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

                // Text search
                if (filters.search) searchParams.q = filters.search;
                if ((filters as any).q) searchParams.q = (filters as any).q;
                
                // Entity filters
                if (filters.exam_paper_id) searchParams.exam_paper_id = filters.exam_paper_id;
                if (filters.question_set_id) searchParams.question_set_id = filters.question_set_id;
                if ((filters as any).institution_id) searchParams.institution_id = (filters as any).institution_id;
                if ((filters as any).course_id) searchParams.course_id = (filters as any).course_id;
                if ((filters as any).module_id) searchParams.module_id = (filters as any).module_id;
                if ((filters as any).programme_id) searchParams.programme_id = (filters as any).programme_id;
                
                // Other filters
                if ((filters as any).has_answers !== undefined) searchParams.has_answers = (filters as any).has_answers;
                if ((filters as any).include_children !== undefined) searchParams.include_children = (filters as any).include_children;
                if ((filters as any).highlight !== undefined) searchParams.highlight = (filters as any).highlight;
                
                // Sorting
                if ((filters as any).sort_by) searchParams.sort_by = (filters as any).sort_by;
                if ((filters as any).sort_order) searchParams.sort_order = (filters as any).sort_order;

                console.log('🔍 Questions Search API Call:', {
                    endpoint: '/api/v1/questions/search',
                    searchParams,
                    filters
                });

                const response = await api.GET('/api/v1/questions/search', {
                    params: {
                        query: searchParams
                    }
                });

                console.log('📦 Questions Search Response:', {
                    dataCount: extractItems<QuestionRead>(response).length,
                    total: extractTotal(response),
                    hasError: !!response.error
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

        /**
         * Get question statistics
         */
        async getStats() {
            try {
                console.log('📊 Fetching question statistics...');
                const response = await api.GET('/api/v1/questions/stats');

                console.log('📦 Raw stats response:', {
                    hasData: !!response.data,
                    hasError: !!response.error,
                    dataType: typeof response.data,
                    dataKeys: response.data ? Object.keys(response.data) : [],
                    fullResponse: response
                });

                // Check for API errors first
                if (response.error) {
                    console.error('❌ API returned error:', response.error);
                    return {
                        data: null,
                        error: response.error,
                    };
                }

                // Validate response has data
                if (!response.data) {
                    console.warn('⚠️ Stats response has no data');
                    return {
                        data: null,
                        error: { message: 'No data returned from stats endpoint' } as any,
                    };
                }

                // Extract data from nested response structure
                // Backend returns: { message, meta, data: dict }
                // openapi-fetch wraps it: { data: { message, meta, data: dict } }
                let extractedData: any = null;
                
                if (typeof response.data === 'object' && 'data' in response.data) {
                    // Nested structure - extract inner data
                    extractedData = (response.data as any).data;
                } else {
                    // Direct structure (fallback)
                    extractedData = response.data;
                }

                console.log('✅ Extracted stats data:', extractedData);

                return {
                    data: extractedData || {},
                    error: null,
                };
            } catch (error) {
                console.error('❌ Exception fetching question stats:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Get search suggestions for questions
         */
        async getSuggestions(query: string, limit: number = 10) {
            try {
                console.log('💡 Fetching question search suggestions for:', query);
                const response = await api.GET('/api/v1/questions/search/suggestions', {
                    params: {
                        query: {
                            q: query,
                            limit: limit,
                        }
                    }
                });

                // Extract data from nested response structure
                const data = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                return {
                    data: data || [],
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching question suggestions:', error);
                return {
                    data: [],
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
         * Uses the main endpoint with support for institution_type filtering
         */
        async list(filters?: InstitutionFilters) {
            try {
                console.log('🏛️ Fetching institutions from:', process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost');
                
                const queryParams: any = {
                    skip: filters?.skip || 0,
                    limit: filters?.limit || 20,
                };

                // Add optional filters
                if (filters?.search_term) queryParams.search_term = filters.search_term;
                if (filters?.search) queryParams.search_term = filters.search;
                if (filters?.institution_type) queryParams.institution_type = filters.institution_type;
                if (filters?.category) queryParams.category = filters.category;
                if (filters?.location) queryParams.location = filters.location;

                const response = await api.GET('/api/v1/institution', {
                    params: {
                        query: queryParams
                    }
                });

                if (response.error) {
                    console.error('❌ Institutions API Error:', response.error);
                    throw new Error(`API Error: ${JSON.stringify(response.error)}`);
                }

                const items = extractItems<InstitutionRead>(response);
                console.log('📦 Institutions response:', {
                    count: items.length,
                    filters: queryParams,
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
         * Alias for list() - uses the same endpoint with filters
         */
        async search(filters: InstitutionFilters) {
            // Use the same list endpoint with filters
            return this.list(filters);
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
         * Uses the advanced search endpoint with exam_count sorting
         * Useful for landing page
         */
        async getFeatured(limit: number = 8) {
            try {
                console.log('🏛️ Fetching featured institutions sorted by exam count');
                
                // Use the advanced search endpoint with exam_count sorting
                const response = await api.GET('/api/v1/institution/search/advanced', {
                    params: {
                        query: {
                            skip: 0,
                            limit: limit,
                            sort_by: 'exam_count',
                            sort_order: 'desc',
                        }
                    }
                });

                if (response.error) {
                    console.error('❌ Featured institutions API Error:', response.error);
                    throw new Error(`API Error: ${JSON.stringify(response.error)}`);
                }

                const institutions = extractItems<InstitutionRead>(response);
                
                console.log('📦 Featured institutions response:', {
                    count: institutions.length,
                    sortedBy: 'exam_count',
                    topInstitution: institutions[0]?.name,
                    topExamCount: institutions[0] && 'exams_count' in institutions[0] ? (institutions[0] as any).exams_count : 0,
                });

                return {
                    data: institutions,
                    total: institutions.length,
                    error: response.error,
                };
            } catch (error) {
                console.error('❌ Error fetching featured institutions:', error);
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
         * Search courses
         */
        async search(filters: { q?: string; skip?: number; limit?: number }) {
            try {
                const response = await api.GET('/api/v1/course/search', {
                    params: {
                        query: {
                            q: filters.q,
                            skip: filters.skip || 0,
                            limit: filters.limit || 20,
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
                console.error('Error searching courses:', error);
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
     * Question Sets
     */
    questionSets: {
        /**
         * Get question sets by exam paper ID
         * Returns question sets with main questions and sub-questions
         */
        async getByExamPaperId(examPaperId: string) {
            try {
                const response = await api.GET('/api/v1/question-set/by-exam-paper/{exam_paper_id}', {
                    params: {
                        path: { exam_paper_id: examPaperId }
                    }
                });

                // Handle API errors
                if (response.error) {
                    console.error('[API] Error fetching question sets:', response.error);
                    return {
                        data: [],
                        error: response.error,
                    };
                }

                // Validate response has data
                if (!response.data) {
                    console.warn('[API] Question sets response has no data');
                    return {
                        data: [],
                        error: null,
                    };
                }

                // Extract data from nested response structure
                // Backend returns: { message, meta, data: QuestionSetReadWithQuestions[] }
                // openapi-fetch wraps it: { data: { message, meta, data: QuestionSetReadWithQuestions[] } }
                let extractedData: any = null;
                
                if (typeof response.data === 'object' && 'data' in response.data) {
                    // Nested structure - extract inner data
                    extractedData = (response.data as any).data;
                } else {
                    // Direct structure (fallback for edge cases)
                    extractedData = response.data;
                }

                // Handle null or undefined data
                if (extractedData === null || extractedData === undefined) {
                    return {
                        data: [],
                        error: null,
                    };
                }

                // Validate data is an array
                if (!Array.isArray(extractedData)) {
                    console.error('[API] Invalid question sets response format: expected array, got', typeof extractedData);
                    return {
                        data: [],
                        error: { message: 'Invalid response format: expected array' } as any,
                    };
                }

                // Validate and normalize each question set
                const validatedData = extractedData.map((set: any, index: number) => {
                    // Ensure questions is an array (handle null/undefined)
                    if (!set.questions || !Array.isArray(set.questions)) {
                        set.questions = [];
                    }

                    // Validate each question has required fields
                    set.questions = set.questions.map((question: any) => {
                        // Ensure children is an array
                        if (!question.children || !Array.isArray(question.children)) {
                            question.children = [];
                        }

                        // Ensure answers is an array
                        if (!question.answers || !Array.isArray(question.answers)) {
                            question.answers = [];
                        }

                        return question;
                    });

                    return set;
                });

                return {
                    data: validatedData,
                    error: null,
                };
            } catch (error) {
                console.error('[API] Exception fetching question sets:', error);
                return {
                    data: [],
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
         * Get platform statistics using dedicated statistics endpoint
         */
        async getPlatformStats() {
            try {
                console.log('📊 Fetching platform statistics from dedicated endpoint...');
                const response = await api.GET('/api/v1/report/detailed-statistics');

                console.log('📦 Statistics response:', {
                    hasData: !!response.data,
                    hasError: !!response.error,
                    dataType: typeof response.data,
                });

                // Check for API errors
                if (response.error) {
                    console.error('❌ Statistics API error:', response.error);
                    return {
                        data: {
                            totalPapers: 0,
                            totalInstitutions: 0,
                            totalQuestions: 0,
                            totalCourses: 0,
                            totalDepartments: 0,
                            totalModules: 0,
                            totalFaculties: 0,
                            totalUsers: 0,
                            totalAnswers: 0,
                            totalCampuses: 0,
                        },
                        error: response.error,
                    };
                }

                // Extract data from nested response structure
                let extractedData: any = null;
                
                if (typeof response.data === 'object' && 'data' in response.data) {
                    extractedData = (response.data as any).data;
                } else {
                    extractedData = response.data;
                }

                console.log('✅ Extracted statistics:', extractedData);

                // Map the statistics response to our expected format
                return {
                    data: {
                        totalPapers: extractedData?.total_exam_papers || 0,
                        totalInstitutions: extractedData?.total_institutions || 0,
                        totalQuestions: extractedData?.total_main_questions || 0,
                        totalCourses: extractedData?.total_courses || 0,
                        totalDepartments: extractedData?.total_departments || 0,
                        totalModules: extractedData?.total_modules || 0,
                        totalFaculties: extractedData?.total_faculties || 0,
                        totalUsers: extractedData?.total_users || 0,
                        totalAnswers: extractedData?.total_answers || 0,
                        totalCampuses: extractedData?.total_campuses || 0,
                    },
                    error: null,
                };
            } catch (error) {
                console.error('❌ Error fetching platform stats:', error);
                return {
                    data: {
                        totalPapers: 0,
                        totalInstitutions: 0,
                        totalQuestions: 0,
                        totalCourses: 0,
                        totalDepartments: 0,
                        totalModules: 0,
                        totalFaculties: 0,
                        totalUsers: 0,
                        totalAnswers: 0,
                        totalCampuses: 0,
                    },
                    error: error as any,
                };
            }
        },
    },

    /**
     * Modules
     */
    modules: {
        /**
         * Fetch modules
         */
        async list(filters?: { skip?: number; limit?: number; course_id?: string }) {
            try {
                const response = await api.GET('/api/v1/module', {
                    params: {
                        query: {
                            skip: filters?.skip,
                            limit: filters?.limit || 100,
                            course_id: filters?.course_id,
                        }
                    }
                });

                return {
                    data: extractItems<ModuleRead>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching modules:', error);
                return {
                    data: [],
                    total: 0,
                    pagination: { page: 1, size: 10, pages: 0, total: 0 },
                    error: error as any,
                };
            }
        },

        /**
         * Search modules
         */
        async search(filters: { q?: string; skip?: number; limit?: number }) {
            try {
                const response = await api.GET('/api/v1/module/search', {
                    params: {
                        query: {
                            q: filters.q,
                            skip: filters.skip || 0,
                            limit: filters.limit || 20,
                        }
                    }
                });

                return {
                    data: extractItems<ModuleRead>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error searching modules:', error);
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
     * Programmes
     */
    programmes: {
        /**
         * Fetch programmes
         */
        async list(filters?: { skip?: number; limit?: number; department_id?: string }) {
            try {
                const response = await api.GET('/api/v1/programme', {
                    params: {
                        query: {
                            skip: filters?.skip,
                            limit: filters?.limit || 100,
                            department_id: filters?.department_id,
                        }
                    }
                });

                return {
                    data: extractItems<any>(response),
                    total: extractTotal(response),
                    pagination: extractPagination(response),
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching programmes:', error);
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
     * Answers
     */
    answers: {
        /**
         * Toggle answer like (add/remove like, or switch from dislike)
         */
        async toggleLike(answerId: string) {
            try {
                const response = await api.POST('/api/v1/answer/{answer_id}/like', {
                    params: {
                        path: { answer_id: answerId }
                    }
                });

                return {
                    data: response.data,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error toggling answer like:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Toggle answer dislike (add/remove dislike, or switch from like)
         */
        async toggleDislike(answerId: string) {
            try {
                const response = await api.POST('/api/v1/answer/{answer_id}/dislike', {
                    params: {
                        path: { answer_id: answerId }
                    }
                });

                return {
                    data: response.data,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error toggling answer dislike:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Create a reply to an answer
         * Requires authentication
         */
        async addReply(answerId: string, replyData: { text: any; question_id: string }) {
            try {
                const response = await api.POST('/api/v1/answer/{answer_id}/reply', {
                    params: {
                        path: { answer_id: answerId }
                    },
                    body: replyData
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
                console.error('Error adding reply:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Mark answer as reviewed (admin/manager only)
         * Can be used to "accept" an answer by marking it as verified
         */
        async markAsReviewed(answerId: string, reviewed: boolean = true) {
            try {
                const response = await api.PUT('/api/v1/answer/{answer_id}/review', {
                    params: {
                        path: { answer_id: answerId },
                        query: { reviewed }
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
                console.error('Error marking answer as reviewed:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },
    },

    /**
     * Comments
     */
    comments: {
        /**
         * Get comments for a specific answer
         */
        async getByAnswerId(answerId: string, params?: { skip?: number; limit?: number }) {
            try {
                const response = await api.GET('/api/v1/comment/by_answer/{answer_id}', {
                    params: {
                        path: { answer_id: answerId },
                        query: {
                            skip: params?.skip || 0,
                            limit: params?.limit || 50,
                        }
                    }
                });

                // Extract data from nested response structure
                let extractedData = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                // If extractedData is an object with 'items' property (paginated response), extract items
                if (extractedData && typeof extractedData === 'object' && 'items' in extractedData) {
                    extractedData = extractedData.items;
                }

                return {
                    data: Array.isArray(extractedData) ? extractedData : [],
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching comments:', error);
                return {
                    data: [],
                    error: error as any,
                };
            }
        },

        /**
         * Get replies for a specific comment
         */
        async getReplies(parentId: string, params?: { skip?: number; limit?: number }) {
            try {
                const response = await api.GET('/api/v1/comment/reply/{parent_id}', {
                    params: {
                        path: { parent_id: parentId },
                        query: {
                            skip: params?.skip || 0,
                            limit: params?.limit || 50,
                        }
                    }
                });

                // Extract data from nested response structure
                let extractedData = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                // If extractedData is an object with 'items' property (paginated response), extract items
                if (extractedData && typeof extractedData === 'object' && 'items' in extractedData) {
                    extractedData = extractedData.items;
                }

                return {
                    data: Array.isArray(extractedData) ? extractedData : [],
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching replies:', error);
                return {
                    data: [],
                    error: error as any,
                };
            }
        },

        /**
         * Create a comment on an answer
         * Requires authentication
         */
        async create(commentData: { text: any; answer_id: string; parent_id?: string | null }) {
            try {
                const response = await api.POST('/api/v1/comment', {
                    body: commentData
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
                console.error('Error creating comment:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Create a reply to a comment
         * Requires authentication
         */
        async createReply(replyData: { text: any; parent_id: string; answer_id: string }) {
            try {
                // The endpoint is /api/v1/comment/reply/{parent_id}
                const response = await api.POST('/api/v1/comment/reply/{parent_id}', {
                    params: {
                        path: { parent_id: replyData.parent_id }
                    },
                    body: {
                        text: replyData.text,
                        answer_id: replyData.answer_id,
                        parent_id: replyData.parent_id
                    }
                });

                return {
                    data: response.data,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error creating reply:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Create a reply to a comment
         * Requires authentication
         */
        async createReply(parentId: string, replyData: { text: any; answer_id: string }) {
            try {
                const response = await api.POST('/api/v1/comment/reply/{parent_id}', {
                    params: {
                        path: { parent_id: parentId }
                    },
                    body: replyData
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
                console.error('Error creating comment reply:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Toggle comment like
         */
        async toggleLike(commentId: string) {
            try {
                const response = await api.POST('/api/v1/comment/{comment_id}/like', {
                    params: {
                        path: { comment_id: commentId }
                    }
                });

                return {
                    data: response.data,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error toggling comment like:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Toggle comment dislike
         */
        async toggleDislike(commentId: string) {
            try {
                const response = await api.POST('/api/v1/comment/{comment_id}/dislike', {
                    params: {
                        path: { comment_id: commentId }
                    }
                });

                return {
                    data: response.data,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error toggling comment dislike:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Get comment count for an answer
         */
        async getCountByAnswerId(answerId: string) {
            try {
                const response = await api.GET('/api/v1/comment/count/{answer_id}', {
                    params: {
                        path: { answer_id: answerId }
                    }
                });

                // Extract data from nested response structure
                let extractedData = response.data && typeof response.data === 'object' && 'data' in response.data
                    ? (response.data as any).data
                    : response.data;

                // If extractedData is an object with 'count' property, extract it
                if (extractedData && typeof extractedData === 'object' && 'count' in extractedData) {
                    extractedData = extractedData.count;
                }

                return {
                    data: typeof extractedData === 'number' ? extractedData : 0,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error fetching comment count:', error);
                return {
                    data: 0,
                    error: error as any,
                };
            }
        },

        /**
         * Update a comment
         * Requires authentication and ownership
         */
        async update(commentId: string, commentData: { text: any }) {
            try {
                const response = await api.PUT('/api/v1/comment/{comment_id}', {
                    params: {
                        path: { comment_id: commentId }
                    },
                    body: commentData
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
                console.error('Error updating comment:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },

        /**
         * Delete a comment
         * Requires authentication and ownership or admin role
         */
        async delete(commentId: string) {
            try {
                const response = await api.DELETE('/api/v1/comment/{comment_id}', {
                    params: {
                        path: { comment_id: commentId }
                    }
                });

                return {
                    data: response.data,
                    error: response.error,
                };
            } catch (error) {
                console.error('Error deleting comment:', error);
                return {
                    data: null,
                    error: error as any,
                };
            }
        },
    },
};

export default publicAPI;
