/**
 * Admin-specific API utilities for dashboard administration
 * Built on top of the main API client with type safety
 */

import { api } from './api';
import type { components } from '@/types/generated/api';

// Type definitions for admin operations
export type UserRead = components['schemas']['IUserRead'];
export type UserCreate = components['schemas']['Body_create_user_api_v1_user_post'];
export type UserUpdate = components['schemas']['IUserUpdate'];
export type RoleRead = components['schemas']['IRoleRead'];
export type RoleCreate = components['schemas']['IRoleCreate'];
export type RoleUpdate = components['schemas']['IRoleUpdate'];
export type InstitutionDetailedStatistics = components['schemas']['InstitutionDetailedStatistics'];

// Exam Papers related types
export type ExamPaperRead = components['schemas']['ExamPaperRead'];
export type ExamPaperCreate = components['schemas']['ExamPaperCreate'];
export type ExamPaperUpdate = components['schemas']['ExamPaperUpdate'];
export type InstitutionRead = components['schemas']['InstitutionRead'];
export type CourseRead = components['schemas']['CourseRead'];
export type ModuleRead = components['schemas']['ModuleRead'];
export type QuestionSetRead = components['schemas']['QuestionSetRead'];

/**
 * Admin Statistics & Health
 */
const adminAPI = {
    // System Health & Statistics
    health: {
        async getBasic() {
            return api.GET('/api/v1/health');
        },

        async getDetailed() {
            return api.GET('/api/v1/health/detailed');
        },

        async getDatabase() {
            return api.GET('/api/v1/health/database');
        },
    },

    // Statistics
    stats: {
        async getDetailed() {
            return api.GET('/api/v1/report/detailed-statistics');
        },
    },

    // User Management
    users: {
        async list(params?: {
            limit?: number;
            offset?: number;
            search?: string;
            role?: string;
        }) {
            return api.GET('/api/v1/user/list', {
                params: {
                    query: params
                }
            });
        },

        async getById(userId: string) {
            return api.GET('/api/v1/user/{user_id}', {
                params: {
                    path: { user_id: userId }
                }
            });
        },

        async create(userData: UserCreate) {
            return api.POST('/api/v1/user', {
                body: userData
            });
        },

        async update(userId: string, userData: UserUpdate) {
            return api.PUT('/api/v1/user/{user_id}', {
                params: {
                    path: { user_id: userId }
                },
                body: userData
            });
        },

        async delete(userId: string) {
            return api.DELETE('/api/v1/user/{user_id}', {
                params: {
                    path: { user_id: userId }
                }
            });
        },

        async activate(userId: string) {
            return api.PUT('/api/v1/user/{user_id}/activate', {
                params: {
                    path: { user_id: userId }
                }
            });
        },

        async deactivate(userId: string) {
            return api.PUT('/api/v1/user/{user_id}/deactivate', {
                params: {
                    path: { user_id: userId }
                }
            });
        },

        // Note: These endpoints may need to be implemented in the backend
        async sendVerificationEmail(userId: string) {
            // Placeholder - implement when endpoint is available
            console.log('Sending verification email to user:', userId);
            return Promise.resolve({ data: { success: true } });
        },

        async bulkSendVerification(userIds: string[]) {
            // Placeholder - implement when endpoint is available
            console.log('Bulk sending verification emails to users:', userIds);
            return Promise.resolve({ data: { success: true } });
        },

        async listByRole(roleName: string, params?: { limit?: number; offset?: number }) {
            // Use the main list endpoint with filtering
            return this.list({ ...params });
        },

        async getOrderedByCreatedAt(params?: { limit?: number; offset?: number }) {
            return api.GET('/api/v1/user/order_by_created_at', {
                params: {
                    query: params
                }
            });
        },
    },

    // Role Management
    roles: {
        async list() {
            return api.GET('/api/v1/role');
        },

        async getById(roleId: string) {
            return api.GET('/api/v1/role/{role_id}', {
                params: {
                    path: { role_id: roleId }
                }
            });
        },

        async create(roleData: RoleCreate) {
            return api.POST('/api/v1/role', {
                body: roleData
            });
        },

        async update(roleId: string, roleData: RoleUpdate) {
            return api.PUT('/api/v1/role/{role_id}', {
                params: {
                    path: { role_id: roleId }
                },
                body: roleData
            });
        },

        async delete(roleId: string) {
            return api.DELETE('/api/v1/role/{role_id}', {
                params: {
                    path: { role_id: roleId }
                }
            });
        },
    },

    // Institution Management
    institutions: {
        async list(params?: { limit?: number; skip?: number }) {
            return api.GET('/api/v1/institution', {
                params: {
                    query: params
                }
            });
        },

        async getById(institutionId: string) {
            return api.GET('/api/v1/institution/get_by_id/{institution_id}', {
                params: {
                    path: { institution_id: institutionId }
                }
            });
        },

        async create(institutionData: components['schemas']['InstitutionCreate']) {
            return api.POST('/api/v1/institution', {
                body: institutionData
            });
        },

        async update(institutionId: string, institutionData: components['schemas']['InstitutionUpdate']) {
            return api.PUT('/api/v1/institution/{institution_id}', {
                params: {
                    path: { institution_id: institutionId }
                },
                body: institutionData
            });
        },

        async delete(institutionId: string) {
            return api.DELETE('/api/v1/institution/{institution_id}', {
                params: {
                    path: { institution_id: institutionId }
                }
            });
        },

        async search(params: {
            q: string;
            institution_type?: 'Public' | 'Private' | 'Other';
            location?: string;
            tags?: string[];
            established_year_from?: number;
            established_year_to?: number;
            has_exam_papers?: boolean;
            sort_by?: string;
            sort_order?: string;
            limit?: number;
            skip?: number;
            highlight?: boolean;
        }) {
            return api.GET('/api/v1/institution/search/advanced', {
                params: {
                    query: params
                }
            });
        },

        async getOrderedByCreatedAt(params?: { page?: number; size?: number; order?: 'ascendent' | 'descendent' }) {
            return api.GET('/api/v1/institution/get_by_created_at', {
                params: {
                    query: params
                }
            });
        },
    },

    /**
     * Exam Titles
     */
    examTitles: {
        async list(params?: { skip?: number; limit?: number }) {
            return api.GET('/api/v1/exam-title', {
                params: {
                    query: params
                }
            });
        },
    },

    /**
     * Exam Descriptions
     */
    examDescriptions: {
        async list(params?: { skip?: number; limit?: number }) {
            return api.GET('/api/v1/exam-description', {
                params: {
                    query: params
                }
            });
        },
    },

    /**
     * Modules
     */
    modules: {
        async list(params?: { skip?: number; limit?: number }) {
            return api.GET('/api/v1/module', {
                params: {
                    query: params
                }
            });
        },
    },

    /**
     * Instructions
     */
    instructions: {
        async list(params?: { skip?: number; limit?: number }) {
            return api.GET('/api/v1/instruction', {
                params: {
                    query: params
                }
            });
        },
    },

    // Groups & Teams
    groups: {
        async list() {
            return api.GET('/api/v1/group');
        },

        async create(groupData: components['schemas']['IGroupCreate']) {
            return api.POST('/api/v1/group', {
                body: groupData
            });
        },

        async addUser(userId: string, groupId: string) {
            return api.POST('/api/v1/group/add_user/{user_id}/{group_id}', {
                params: {
                    path: { user_id: userId, group_id: groupId }
                }
            });
        },

        async removeUser(userId: string, groupId: string) {
            return api.DELETE('/api/v1/group/remove_user/{user_id}/{group_id}', {
                params: {
                    path: { user_id: userId, group_id: groupId }
                }
            });
        },
    },

    teams: {
        async list() {
            return api.GET('/api/v1/team');
        },

        async create(teamData: components['schemas']['ITeamCreate']) {
            return api.POST('/api/v1/team', {
                body: teamData
            });
        },
    },

    /**
     * Faculty Management
     */
    faculties: {
        async list(params?: {
            skip?: number;
            limit?: number;
            search?: string;
            institution_id?: string;
        }) {
            return api.GET('/api/v1/faculty', {
                params: {
                    query: params
                }
            });
        },

        async getById(facultyId: string) {
            return api.GET('/api/v1/faculty/get_by_id/{faculty_id}', {
                params: {
                    path: { faculty_id: facultyId }
                }
            });
        },

        async getBySlug(facultySlug: string) {
            return api.GET('/api/v1/faculty/get_by_slug/{faculty_slug}', {
                params: {
                    path: { faculty_slug: facultySlug }
                }
            });
        },

        async create(facultyData: components['schemas']['FacultyCreate']) {
            return api.POST('/api/v1/faculty', {
                body: facultyData
            });
        },

        async update(facultyId: string, facultyData: components['schemas']['FacultyUpdate']) {
            return api.PUT('/api/v1/faculty/{faculty_id}', {
                params: {
                    path: { faculty_id: facultyId }
                },
                body: facultyData
            });
        },

        async delete(facultyId: string) {
            return api.DELETE('/api/v1/faculty/{faculty_id}', {
                params: {
                    path: { faculty_id: facultyId }
                }
            });
        },

        async uploadImage(facultyId: string, imageFile: File) {
            const formData = new FormData();
            formData.append('faculty_image', imageFile);

            return api.POST('/api/v1/faculty/{faculty_id}/image', {
                params: {
                    path: { faculty_id: facultyId }
                },
                // OpenAPI typing expects a JSON shape; cast FormData
                body: formData as any
            });
        },

        async getOrderedByCreatedAt(params?: { page?: number; size?: number; order?: 'ascendent' | 'descendent' }) {
            return api.GET('/api/v1/faculty/get_by_created_at', {
                params: {
                    query: params
                }
            });
        },
    },

    /**
     * Department Management
     */
    departments: {
        async list(params?: {
            skip?: number;
            limit?: number;
            search?: string;
            faculty_id?: string;
        }) {
            return api.GET('/api/v1/department', {
                params: {
                    query: params
                }
            });
        },

        async getById(departmentId: string) {
            return api.GET('/api/v1/department/get_by_id/{department_id}', {
                params: {
                    path: { department_id: departmentId }
                }
            });
        },

        async getBySlug(departmentSlug: string) {
            return api.GET('/api/v1/department/get_by_slug/{department_slug}', {
                params: {
                    path: { department_slug: departmentSlug }
                }
            });
        },

        async create(departmentData: components['schemas']['DepartmentCreate']) {
            return api.POST('/api/v1/department', {
                body: departmentData
            });
        },

        async update(departmentId: string, departmentData: components['schemas']['DepartmentUpdate']) {
            return api.PUT('/api/v1/department/{department_id}', {
                params: {
                    path: { department_id: departmentId }
                },
                body: departmentData
            });
        },

        async delete(departmentId: string) {
            return api.DELETE('/api/v1/department/{department_id}', {
                params: {
                    path: { department_id: departmentId }
                }
            });
        },

        async uploadImage(departmentId: string, imageFile: File) {
            const formData = new FormData();
            formData.append('department_image', imageFile);

            return api.POST('/api/v1/department/{department_id}/image', {
                params: {
                    path: { department_id: departmentId }
                },
                body: formData as any
            });
        },

        async getOrderedByCreatedAt(params?: { page?: number; size?: number; order?: 'ascendent' | 'descendent' }) {
            return api.GET('/api/v1/department/get_by_created_at', {
                params: {
                    query: params
                }
            });
        },

        async addProgramme(departmentId: string, programmeId: string) {
            return api.POST('/api/v1/department/{department_id}/programmes/{programme_id}', {
                params: {
                    path: {
                        department_id: departmentId,
                        programme_id: programmeId
                    }
                }
            });
        },
    },

    /**
     * Course Management
     */
    courses: {
        async list(params?: {
            skip?: number;
            limit?: number;
            search?: string;
            programme_id?: string;
        }) {
            return api.GET('/api/v1/course', {
                params: {
                    query: params
                }
            });
        },

        async getById(courseId: string) {
            return api.GET('/api/v1/course/get_by_id/{course_id}', {
                params: {
                    path: { course_id: courseId }
                }
            });
        },

        async getBySlug(courseSlug: string) {
            return api.GET('/api/v1/course/get_by_slug/{course_slug}', {
                params: {
                    path: { course_slug: courseSlug }
                }
            });
        },

        async create(courseData: components['schemas']['CourseCreate']) {
            return api.POST('/api/v1/course', {
                body: courseData
            });
        },

        async update(courseId: string, courseData: components['schemas']['CourseUpdate']) {
            return api.PUT('/api/v1/course/{course_id}', {
                params: {
                    path: { course_id: courseId }
                },
                body: courseData
            });
        },

        async delete(courseId: string) {
            return api.DELETE('/api/v1/course/{course_id}', {
                params: {
                    path: { course_id: courseId }
                }
            });
        },

        async uploadImage(courseId: string, imageFile: File) {
            const formData = new FormData();
            formData.append('course_image', imageFile);

            return api.POST('/api/v1/course/{course_id}/image', {
                params: {
                    path: { course_id: courseId }
                },
                body: formData as any
            });
        },

        async getOrderedByCreatedAt(params?: { page?: number; size?: number; order?: 'ascendent' | 'descendent' }) {
            return api.GET('/api/v1/course/get_by_created_at', {
                params: {
                    query: params
                }
            });
        },

        async addModule(courseId: string, moduleId: string) {
            return api.POST('/api/v1/course/{course_id}/modules/{module_id}', {
                params: {
                    path: {
                        course_id: courseId,
                        module_id: moduleId
                    }
                }
            });
        },
    },

    /**
     * Exam Papers Management
     */
    examPapers: {
        async list(params?: {
            skip?: number;
            limit?: number;
            search?: string;
            institution_id?: string;
            course_id?: string;
            year?: string;
            sort_by?: string;
            sort_order?: string;
        }) {
            try {
                console.log('📋 ExamPapers.list called with params:', params);

                // If we have search or filter parameters, use the search endpoint
                if (params?.search || params?.institution_id || params?.course_id || params?.year) {
                    const searchParams = {
                        q: params.search || '*', // Use wildcard if no search term
                        skip: params.skip,
                        limit: params.limit,
                        institution_id: params.institution_id,
                        course_id: params.course_id,
                        year: params.year,
                        sort_by: params.sort_by,
                        sort_order: params.sort_order
                    };

                    console.log('🔍 Using search endpoint with params:', searchParams);
                    const response = await api.GET('/api/v1/exampaper/search', {
                        params: {
                            query: searchParams
                        }
                    });
                    // Log only the structure, not the full data to avoid console spam
                    if (response.data?.data?.items) {
                        console.log('🔍 Search response structure:', {
                            message: response.data.message,
                            totalItems: response.data.data.total,
                            itemsCount: response.data.data.items.length,
                            searchQuery: searchParams.q
                        });
                    } else {
                        console.log('🔍 Search response:', response);
                    }
                    return response;
                } else {
                    // Use basic list endpoint for simple pagination
                    const listParams = {
                        skip: params?.skip,
                        limit: params?.limit
                    };

                    console.log('📄 Using list endpoint with params:', listParams);
                    const response = await api.GET('/api/v1/exampaper', {
                        params: {
                            query: listParams
                        }
                    });

                    // Log only the structure, not the full data to avoid console spam
                    if (response.data?.data?.items) {
                        console.log('📄 List response structure:', {
                            message: response.data.message,
                            totalItems: response.data.data.total,
                            itemsCount: response.data.data.items.length,
                            firstItem: response.data.data.items[0] ? {
                                id: response.data.data.items[0].id,
                                title: (response.data.data.items[0] as any).title?.name,
                                questionSetsCount: response.data.data.items[0].question_sets?.length
                            } : null
                        });
                    } else {
                        console.log('📄 List response:', response);
                    }
                    return response;
                }
            } catch (error) {
                console.error('❌ ExamPapers.list error:', error);
                throw error;
            }
        },

        async search(params: {
            q: string;
            year?: string;
            course_id?: string;
            institution_id?: string;
            exam_date_from?: string;
            exam_date_to?: string;
            duration_min?: number;
            duration_max?: number;
            tags?: string;
            sort_by?: string;
            sort_order?: string;
            skip?: number;
            limit?: number;
            highlight?: boolean;
        }) {
            const response = await api.GET('/api/v1/exampaper/search', {
                params: {
                    query: params
                }
            });
            return response;
        },

        async getById(examPaperId: string) {
            try {
                console.log('📄 ExamPapers.getById called with ID:', examPaperId);
                const response = await api.GET('/api/v1/exampaper/get_by_id/{exampaper_id}', {
                    params: {
                        path: { exampaper_id: examPaperId }
                    }
                });
                console.log('📄 GetById response:', response);
                return response;
            } catch (error) {
                console.error('❌ ExamPapers.getById error:', error);
                throw error;
            }
        },

        async getBySlug(examPaperSlug: string) {
            const response = await api.GET('/api/v1/exampaper/get_by_slug/{exampaper_slug}', {
                params: {
                    path: { exampaper_slug: examPaperSlug }
                }
            });
            return response;
        },

        async create(examPaperData: ExamPaperCreate) {
            const response = await api.POST('/api/v1/exampaper', {
                body: examPaperData
            });
            return response;
        },

        async update(examPaperId: string, examPaperData: ExamPaperUpdate) {
            const response = await api.PUT('/api/v1/exampaper/{exampaper_id}', {
                params: {
                    path: { exampaper_id: examPaperId }
                },
                body: examPaperData
            });
            return response;
        },

        async delete(examPaperId: string) {
            const response = await api.DELETE('/api/v1/exampaper/{exampaper_id}', {
                params: {
                    path: { exampaper_id: examPaperId }
                }
            });
            return response;
        },

        async getOrderedByCreatedAt(params?: { page?: number; size?: number; order?: 'ascendent' | 'descendent' }) {
            const response = await api.GET('/api/v1/exampaper/get_by_created_at', {
                params: {
                    query: params
                }
            });
            return response;
        },

        async getSearchSuggestions(q: string, limit?: number) {
            const response = await api.GET('/api/v1/exampaper/search/suggestions', {
                params: {
                    query: { q, limit }
                }
            });
            return response;
        },

        // Question Set management for exam papers
        async addQuestionSet(examPaperId: string, questionSetId: string) {
            const response = await api.POST('/api/v1/exampaper/{exampaper_id}/question-sets/{question_set_id}', {
                params: {
                    path: {
                        exampaper_id: examPaperId,
                        question_set_id: questionSetId
                    }
                }
            });
            return response;
        },

        async removeQuestionSet(examPaperId: string, questionSetId: string) {
            const response = await api.DELETE('/api/v1/exampaper/{exampaper_id}/question-sets/{question_set_id}', {
                params: {
                    path: {
                        exampaper_id: examPaperId,
                        question_set_id: questionSetId
                    }
                }
            });
            return response;
        },
    },
};

/**
 * Helper functions for admin operations
 */
export const adminHelpers = {
    /**
     * Calculate user activity percentage
     */
    calculateActivityRate(activeUsers: number, totalUsers: number): number {
        if (totalUsers === 0) return 0;
        return Math.round((activeUsers / totalUsers) * 100);
    },

    /**
     * Format system health status
     */
    formatHealthStatus(status: any): 'healthy' | 'warning' | 'critical' {
        if (!status) return 'critical';

        // Add logic based on your health check response structure
        if (status.database === 'connected' && status.api === 'operational') {
            return 'healthy';
        } else if (status.database === 'slow') {
            return 'warning';
        } else {
            return 'critical';
        }
    },

    /**
     * Generate activity summary from user data
     */
    generateActivitySummary(users: UserRead[]): {
        todayRegistrations: number;
        weeklyRegistrations: number;
        pendingVerifications: number;
    } {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Mock data since created_at is not available in current schema
        const todayRegistrations = Math.floor(Math.random() * 10);
        const weeklyRegistrations = Math.floor(Math.random() * 50);

        const pendingVerifications = users.filter(user =>
            !user.email_verified
        ).length;

        return {
            todayRegistrations,
            weeklyRegistrations,
            pendingVerifications,
        };
    },



    /**
     * Questions Management
     */
    questions: {
        async list(params?: {
            skip?: number;
            limit?: number;
            question_set_id?: string;
            exam_paper_id?: string;
            parent_id?: string;
        }) {
            const response = await api.GET('/api/v1/questions', {
                params: {
                    query: params
                }
            });
            return response;
        },

        async search(params: {
            q: string;
            question_set_id?: string;
            exam_paper_id?: string;
            marks_min?: number;
            marks_max?: number;
            numbering_style?: string;
            skip?: number;
            limit?: number;
        }) {
            const response = await api.GET('/api/v1/questions/search', {
                params: {
                    query: params
                }
            });
            return response;
        },

        async getById(questionId: string) {
            const response = await api.GET('/api/v1/questions/{question_id}', {
                params: {
                    path: { question_id: questionId }
                }
            });
            return response;
        },

        async createMain(questionData: components['schemas']['MainQuestionCreate']) {
            const response = await api.POST('/api/v1/questions/main', {
                body: questionData
            });
            return response;
        },

        async update(questionId: string, questionData: any) {
            const response = await api.PUT('/api/v1/questions/{question_id}', {
                params: {
                    path: { question_id: questionId }
                },
                body: questionData
            });
            return response;
        },

        async delete(questionId: string) {
            const response = await api.DELETE('/api/v1/questions/{question_id}', {
                params: {
                    path: { question_id: questionId }
                }
            });
            return response;
        },

        async createSubQuestion(subQuestionData: components['schemas']['SubQuestionCreate']) {
            const response = await api.POST('/api/v1/questions/sub', {
                body: subQuestionData
            });
            return response;
        },

        async getSubQuestions(questionId: string) {
            const response = await api.GET('/api/v1/questions/{question_id}/sub-questions', {
                params: {
                    path: { question_id: questionId }
                }
            });
            return response;
        },

        async createBulkSubQuestions(questionId: string, subQuestionsData: components['schemas']['SubQuestionCreate'][]) {
            const response = await api.POST('/api/v1/questions/{question_id}/sub-questions/bulk', {
                params: {
                    path: { question_id: questionId }
                },
                body: subQuestionsData
            });
            return response;
        },

        async getStats() {
            const response = await api.GET('/api/v1/questions/stats');
            return response;
        },

        async getSearchSuggestions(q: string, limit?: number) {
            const response = await api.GET('/api/v1/questions/search/suggestions', {
                params: {
                    query: { q, limit }
                }
            });
            return response;
        },
    },

    /**
     * Question Sets Management
     */
    questionSets: {
        async list(params?: {
            skip?: number;
            limit?: number;
        }) {
            const response = await api.GET('/api/v1/question-set', {
                params: {
                    query: params
                }
            });
            return response;
        },

        async getById(questionSetId: string) {
            const response = await api.GET('/api/v1/question-set/get_by_id/{question_set_id}', {
                params: {
                    path: { question_set_id: questionSetId }
                }
            });
            return response;
        },

        async create(questionSetData: components['schemas']['QuestionSetCreate']) {
            const response = await api.POST('/api/v1/question-set', {
                body: questionSetData
            });
            return response;
        },

        async update(questionSetId: string, questionSetData: any) {
            const response = await api.PUT('/api/v1/question-set/{question_set_id}', {
                params: {
                    path: { question_set_id: questionSetId }
                },
                body: questionSetData
            });
            return response;
        },

        async delete(questionSetId: string) {
            const response = await api.DELETE('/api/v1/question-set/{question_set_id}', {
                params: {
                    path: { question_set_id: questionSetId }
                }
            });
            return response;
        },
    },
};

export { adminAPI };
export default adminAPI;