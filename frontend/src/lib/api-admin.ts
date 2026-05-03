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
export type ExamPaperReadForInstitution = components['schemas']['ExamPaperReadForInstitution'];
export type ExamPaperReadForModule = components['schemas']['ExamPaperReadForModule'];
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

        async uploadLogo(institutionId: string, formData: FormData) {
            try {
                // Get auth token
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
                
                // Get base URL
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';

                // Use direct fetch for FormData upload (openapi-fetch doesn't handle multipart/form-data correctly)
                const response = await fetch(`${baseUrl}/api/v1/institution/${institutionId}/logo`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Don't set Content-Type - let browser set it with boundary
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    return {
                        data: undefined,
                        error: errorData,
                        response: response as any
                    };
                }

                const data = await response.json();
                return {
                    data,
                    error: undefined,
                    response: response as any
                };
            } catch (error) {
                console.error('Institution logo upload error:', error);
                return {
                    data: undefined,
                    error: error,
                    response: undefined as any
                };
            }
        },

        async removeLogo(institutionId: string) {
            return api.DELETE('/api/v1/institution/{institution_id}/logo', {
                params: {
                    path: { institution_id: institutionId }
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

        async create(titleData: components['schemas']['ExamTitleCreate']) {
            return api.POST('/api/v1/exam-title', {
                body: titleData
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

        async create(descriptionData: components['schemas']['ExamDescriptionCreate']) {
            return api.POST('/api/v1/exam-description', {
                body: descriptionData
            });
        },
    },

    /**
     * Module Management
     * 
     * All GET endpoints now eagerly load related items:
     * - courses (related courses)
     * - exam_papers (related exam papers)
     * - image (module image)
     * - created_by (creator details)
     */
    modules: {
        async list(params?: {
            skip?: number;
            limit?: number;
            course_id?: string;
        }) {
            return api.GET('/api/v1/module', {
                params: {
                    query: params
                }
            });
        },

        async search(params: {
            q?: string;
            course_id?: string;
            unit_code?: string;
            sort_by?: 'name' | 'unit_code' | 'created_at';
            sort_order?: 'asc' | 'desc';
            skip?: number;
            limit?: number;
        }) {
            return api.GET('/api/v1/module/search', {
                params: {
                    query: params
                }
            });
        },

        async getById(moduleId: string) {
            return api.GET('/api/v1/module/get_by_id/{module_id}', {
                params: {
                    path: { module_id: moduleId }
                }
            });
        },

        async getBySlug(moduleSlug: string) {
            return api.GET('/api/v1/module/get_by_slug/{module_slug}', {
                params: {
                    path: { module_slug: moduleSlug }
                }
            });
        },

        async create(moduleData: components['schemas']['ModuleCreate']) {
            return api.POST('/api/v1/module', {
                body: moduleData
            });
        },

        async update(moduleId: string, moduleData: components['schemas']['ModuleUpdate']) {
            return api.PUT('/api/v1/module/{module_id}', {
                params: {
                    path: { module_id: moduleId }
                },
                body: moduleData
            });
        },

        async delete(moduleId: string) {
            return api.DELETE('/api/v1/module/{module_id}', {
                params: {
                    path: { module_id: moduleId }
                }
            });
        },

        async uploadImage(moduleId: string, imageFile: File) {
            // Note: Module image upload endpoint not available in API
            // This is a placeholder for when the endpoint is implemented
            console.warn('Module image upload endpoint not yet implemented in API');
            return Promise.resolve({ 
                data: { success: false, message: 'Endpoint not implemented' },
                error: undefined 
            });
        },

        async getOrderedByCreatedAt(params?: { page?: number; size?: number; order?: 'ascendent' | 'descendent' }) {
            return api.GET('/api/v1/module/get_by_created_at', {
                params: {
                    query: params
                }
            });
        },

        async getStats() {
            try {
                // Use the working list method (max limit: 100)
                const modulesResponse = await this.list({ skip: 0, limit: 100 });

                let totalModules = 0;
                let totalCourses = 0;
                let totalExamPapers = 0;

                if (modulesResponse.data && typeof modulesResponse.data === 'object' && 'data' in modulesResponse.data) {
                    const data = modulesResponse.data.data as any;
                    totalModules = data?.total || 0;

                    // Count unique courses and sum exam papers from all modules
                    if (data?.items && Array.isArray(data.items)) {
                        // Use a Set to track unique course IDs
                        const uniqueCourseIds = new Set<string>();
                        
                        data.items.forEach((mod: any) => {
                            // Add course IDs from the courses array
                            if (mod.courses && Array.isArray(mod.courses)) {
                                mod.courses.forEach((course: any) => {
                                    if (course.id) {
                                        uniqueCourseIds.add(course.id);
                                    }
                                });
                            }
                            
                            // Sum up exam papers
                            totalExamPapers += (mod.exam_papers_count || 0);
                        });
                        
                        totalCourses = uniqueCourseIds.size;
                    }
                }

                const averageModulesPerCourse = totalCourses > 0 ?
                    Number((totalModules / totalCourses).toFixed(1)) : 0;

                return {
                    data: {
                        totalModules,
                        totalCourses,
                        totalExamPapers,
                        averageModulesPerCourse,
                    }
                };
            } catch (error) {
                console.error('Error getting module statistics:', error);
                return {
                    data: {
                        totalModules: 0,
                        totalCourses: 0,
                        totalExamPapers: 0,
                        averageModulesPerCourse: 0,
                    }
                };
            }
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

        async create(instructionData: components['schemas']['InstructionCreate']) {
            return api.POST('/api/v1/instruction', {
                body: instructionData
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

        async search(params: {
            q?: string;
            institution_id?: string;
            sort_by?: string;
            sort_order?: string;
            skip?: number;
            limit?: number;
        }) {
            return api.GET('/api/v1/faculty/search', {
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
            try {
                const formData = new FormData();
                formData.append('faculty_image', imageFile);

                // Get auth token
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
                
                // Get base URL
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';

                // Use direct fetch for FormData upload
                const response = await fetch(`${baseUrl}/api/v1/faculty/${facultyId}/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Don't set Content-Type - let browser set it with boundary
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    return {
                        data: undefined,
                        error: errorData,
                        response: response as any
                    };
                }

                const data = await response.json();
                return {
                    data,
                    error: undefined,
                    response: response as any
                };
            } catch (error) {
                console.error('Faculty image upload error:', error);
                return {
                    data: undefined,
                    error: error,
                    response: undefined as any
                };
            }
        },

        async getOrderedByCreatedAt(params?: { page?: number; size?: number; order?: 'ascendent' | 'descendent' }) {
            return api.GET('/api/v1/faculty/get_by_created_at', {
                params: {
                    query: params
                }
            });
        },

        async getStats() {
            try {
                console.log('Getting faculty statistics from paginated responses...');

                // Get all counts from paginated responses (much more efficient)
                const [facultiesResponse, departmentsResponse, institutionsResponse] = await Promise.all([
                    api.GET('/api/v1/faculty', { params: { query: { limit: 1 } } }), // Only need count, not data
                    api.GET('/api/v1/department', { params: { query: { limit: 1 } } }),
                    api.GET('/api/v1/institution', { params: { query: { limit: 1 } } })
                ]);

                // Extract totals from paginated responses with proper type checking
                const totalFaculties = (facultiesResponse.data && typeof facultiesResponse.data === 'object' && 'data' in facultiesResponse.data) 
                    ? ((facultiesResponse.data.data as any)?.total || 0) : 0;
                const totalDepartments = (departmentsResponse.data && typeof departmentsResponse.data === 'object' && 'data' in departmentsResponse.data)
                    ? ((departmentsResponse.data.data as any)?.total || 0) : 0;
                const totalInstitutions = (institutionsResponse.data && typeof institutionsResponse.data === 'object' && 'data' in institutionsResponse.data)
                    ? ((institutionsResponse.data.data as any)?.total || 0) : 0;
                const averageDepartments = totalFaculties > 0 ?
                    Number((totalDepartments / totalFaculties).toFixed(1)) : 0;

                console.log('Faculty Statistics from API totals:', {
                    totalFaculties,
                    totalDepartments,
                    totalInstitutions,
                    averageDepartments,
                });

                return {
                    data: {
                        totalFaculties,
                        totalDepartments,
                        totalInstitutions,
                        averageDepartments,
                    }
                };
            } catch (error) {
                console.error('Error getting faculty statistics from paginated responses:', error);
                // Return fallback statistics
                return {
                    data: {
                        totalFaculties: 0,
                        totalDepartments: 0,
                        totalInstitutions: 0,
                        averageDepartments: 0,
                    }
                };
            }
        },

        async getPartialStats() {
            try {
                console.log('Getting partial statistics (departments and institutions only)...');

                // Only get departments and institutions count - faculty count comes from main search
                const [departmentsResponse, institutionsResponse] = await Promise.all([
                    api.GET('/api/v1/department', { params: { query: { limit: 1 } } }),
                    api.GET('/api/v1/institution', { params: { query: { limit: 1 } } })
                ]);

                // Extract totals with proper type checking
                const totalDepartments = (departmentsResponse.data && typeof departmentsResponse.data === 'object' && 'data' in departmentsResponse.data)
                    ? ((departmentsResponse.data.data as any)?.total || 0) : 0;
                const totalInstitutions = (institutionsResponse.data && typeof institutionsResponse.data === 'object' && 'data' in institutionsResponse.data)
                    ? ((institutionsResponse.data.data as any)?.total || 0) : 0;

                console.log('Partial statistics loaded:', {
                    totalDepartments,
                    totalInstitutions,
                });

                return {
                    data: {
                        totalDepartments,
                        totalInstitutions,
                    }
                };
            } catch (error) {
                console.error('Error getting partial statistics:', error);
                return {
                    data: {
                        totalDepartments: 0,
                        totalInstitutions: 0,
                    }
                };
            }
        },

        async removeDepartment(facultyId: string, departmentId: string) {
            return api.DELETE('/api/v1/faculty/{faculty_id}/departments/{department_id}', {
                params: {
                    path: {
                        faculty_id: facultyId,
                        department_id: departmentId
                    }
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

        async search(params: {
            q?: string;
            faculty_id?: string;
            institution_id?: string;
            sort_by?: string;
            sort_order?: string;
            skip?: number;
            limit?: number;
        }) {
            return api.GET('/api/v1/department/search', {
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
            try {
                const formData = new FormData();
                formData.append('department_image', imageFile);

                // Get auth token
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
                
                // Get base URL
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';

                // Use direct fetch for FormData upload
                const response = await fetch(`${baseUrl}/api/v1/department/${departmentId}/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Don't set Content-Type - let browser set it with boundary
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    return {
                        data: undefined,
                        error: errorData,
                        response: response as any
                    };
                }

                const data = await response.json();
                return {
                    data,
                    error: undefined,
                    response: response as any
                };
            } catch (error) {
                console.error('Department image upload error:', error);
                return {
                    data: undefined,
                    error: error,
                    response: undefined as any
                };
            }
        },

        async getOrderedByCreatedAt(params?: { page?: number; size?: number; order?: 'ascendent' | 'descendent' }) {
            return api.GET('/api/v1/department/get_by_created_at', {
                params: {
                    query: params
                }
            });
        },

        async getStats() {
            try {
                console.log('Getting department statistics from paginated responses...');

                // Get all counts from paginated responses (much more efficient)
                const [departmentsResponse, programmesResponse, facultiesResponse] = await Promise.all([
                    api.GET('/api/v1/department', { params: { query: { limit: 1 } } }), // Only need count, not data
                    api.GET('/api/v1/programme', { params: { query: { limit: 1 } } }),
                    api.GET('/api/v1/faculty', { params: { query: { limit: 1 } } })
                ]);

                // Extract totals from paginated responses with proper type checking
                const totalDepartments = (departmentsResponse.data && typeof departmentsResponse.data === 'object' && 'data' in departmentsResponse.data)
                    ? ((departmentsResponse.data.data as any)?.total || 0) : 0;
                const totalProgrammes = (programmesResponse.data && typeof programmesResponse.data === 'object' && 'data' in programmesResponse.data)
                    ? ((programmesResponse.data.data as any)?.total || 0) : 0;
                const totalFaculties = (facultiesResponse.data && typeof facultiesResponse.data === 'object' && 'data' in facultiesResponse.data)
                    ? ((facultiesResponse.data.data as any)?.total || 0) : 0;
                const averageProgrammes = totalDepartments > 0 ?
                    Number((totalProgrammes / totalDepartments).toFixed(1)) : 0;

                console.log('Department Statistics from API totals:', {
                    totalDepartments,
                    totalProgrammes,
                    totalFaculties,
                    averageProgrammes,
                });

                return {
                    data: {
                        totalDepartments,
                        totalProgrammes,
                        totalFaculties,
                        averageProgrammes,
                    }
                };
            } catch (error) {
                console.error('Error getting department statistics from paginated responses:', error);
                // Return fallback statistics
                return {
                    data: {
                        totalDepartments: 0,
                        totalProgrammes: 0,
                        totalFaculties: 0,
                        averageProgrammes: 0,
                    }
                };
            }
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

        async removeProgramme(departmentId: string, programmeId: string) {
            return api.DELETE('/api/v1/department/{department_id}/programmes/{programme_id}', {
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
     * Programme Management
     * 
     * All GET endpoints now eagerly load related items:
     * - departments (related departments)
     * - courses (related courses)
     * - image (programme image)
     * - created_by (creator details)
     */
    programmes: {
        async list(params?: {
            skip?: number;
            limit?: number;
            department_id?: string;
        }) {
            return api.GET('/api/v1/programme', {
                params: {
                    query: params
                }
            });
        },

        async search(params: {
            q?: string;
            department_id?: string;
            sort_by?: 'name' | 'created_at';
            sort_order?: 'asc' | 'desc';
            skip?: number;
            limit?: number;
        }) {
            return api.GET('/api/v1/programme/search', {
                params: {
                    query: params
                }
            });
        },

        async getById(programmeId: string) {
            return api.GET('/api/v1/programme/get_by_id/{programme_id}', {
                params: {
                    path: { programme_id: programmeId }
                }
            });
        },

        async getBySlug(programmeSlug: string) {
            return api.GET('/api/v1/programme/get_by_slug/{programme_slug}', {
                params: {
                    path: { programme_slug: programmeSlug }
                }
            });
        },

        async create(programmeData: components['schemas']['ProgrammeCreate']) {
            return api.POST('/api/v1/programme', {
                body: programmeData
            });
        },

        async update(programmeId: string, programmeData: components['schemas']['ProgrammeUpdate']) {
            return api.PUT('/api/v1/programme/{programme_id}', {
                params: {
                    path: { programme_id: programmeId }
                },
                body: programmeData
            });
        },

        async delete(programmeId: string) {
            return api.DELETE('/api/v1/programme/{programme_id}', {
                params: {
                    path: { programme_id: programmeId }
                }
            });
        },

        async uploadImage(programmeId: string, imageFile: File) {
            try {
                const formData = new FormData();
                formData.append('programme_image', imageFile);

                // Get auth token
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
                
                // Get base URL
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';

                // Use direct fetch for FormData upload
                const response = await fetch(`${baseUrl}/api/v1/programme/${programmeId}/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Don't set Content-Type - let browser set it with boundary
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    return {
                        data: undefined,
                        error: errorData,
                        response: response as any
                    };
                }

                const data = await response.json();
                return {
                    data,
                    error: undefined,
                    response: response as any
                };
            } catch (error) {
                console.error('Programme image upload error:', error);
                return {
                    data: undefined,
                    error: error,
                    response: undefined as any
                };
            }
        },

        async getOrderedByCreatedAt(params?: { page?: number; size?: number; order?: 'ascendent' | 'descendent' }) {
            return api.GET('/api/v1/programme/get_by_created_at', {
                params: {
                    query: params
                }
            });
        },

        async getStats() {
            try {
                // Use the working list method (max limit: 100)
                const programmesResponse = await this.list({ skip: 0, limit: 100 });

                let totalProgrammes = 0;
                let totalCourses = 0;
                let totalDepartments = 0;

                if (programmesResponse.data && typeof programmesResponse.data === 'object' && 'data' in programmesResponse.data) {
                    const data = programmesResponse.data.data as any;
                    totalProgrammes = data?.total || 0;

                    // Sum up courses_count and departments_count from all programmes
                    if (data?.items && Array.isArray(data.items)) {
                        totalCourses = data.items.reduce((sum: number, prog: any) => sum + (prog.courses_count || 0), 0);
                        totalDepartments = data.items.reduce((sum: number, prog: any) => sum + (prog.departments_count || 0), 0);
                    }
                }

                const averageCourses = totalProgrammes > 0 ?
                    Number((totalCourses / totalProgrammes).toFixed(1)) : 0;

                return {
                    data: {
                        totalProgrammes,
                        totalCourses,
                        totalDepartments,
                        averageCourses,
                    }
                };
            } catch (error) {
                console.error('Error getting programme statistics:', error);
                return {
                    data: {
                        totalProgrammes: 0,
                        totalCourses: 0,
                        totalDepartments: 0,
                        averageCourses: 0,
                    }
                };
            }
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

        async search(params: {
            q?: string;
            programme_id?: string;
            department_id?: string;
            institution_id?: string;
            course_acronym?: string;
            sort_by?: string;
            sort_order?: string;
            skip?: number;
            limit?: number;
        }) {
            return api.GET('/api/v1/course/search', {
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
            try {
                const formData = new FormData();
                formData.append('course_image', imageFile);

                // Get auth token
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
                
                // Get base URL
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';

                // Use direct fetch for FormData upload
                const response = await fetch(`${baseUrl}/api/v1/course/${courseId}/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Don't set Content-Type - let browser set it with boundary
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    return {
                        data: undefined,
                        error: errorData,
                        response: response as any
                    };
                }

                const data = await response.json();
                return {
                    data,
                    error: undefined,
                    response: response as any
                };
            } catch (error) {
                console.error('Course image upload error:', error);
                return {
                    data: undefined,
                    error: error,
                    response: undefined as any
                };
            }
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

        async removeModule(courseId: string, moduleId: string) {
            return api.DELETE('/api/v1/course/{course_id}/modules/{module_id}', {
                params: {
                    path: {
                        course_id: courseId,
                        module_id: moduleId
                    }
                }
            });
        },

        async getStats() {
            try {
                // Use the working list/search methods instead of direct api.GET calls
                const [coursesResponse, programmesResponse] = await Promise.allSettled([
                    this.list({ skip: 0, limit: 100 }),
                    adminAPI.programmes.list({ skip: 0, limit: 1 })
                ]);

                let totalCourses = 0;
                let totalModules = 0;
                let totalExamPapers = 0;

                if (coursesResponse.status === 'fulfilled' && coursesResponse.value.data?.data) {
                    const data = coursesResponse.value.data.data;
                    totalCourses = data.total || 0;

                    // Sum up modules_count and exam_papers_count from all courses
                    if (data.items && Array.isArray(data.items)) {
                        totalModules = data.items.reduce((sum: number, course: any) => sum + (course.modules_count || 0), 0);
                        totalExamPapers = data.items.reduce((sum: number, course: any) => sum + (course.exam_papers_count || 0), 0);
                    }
                }

                const totalProgrammes = programmesResponse.status === 'fulfilled' ? (programmesResponse.value.data?.data?.total || 0) : 0;

                const averageModules = totalCourses > 0 ?
                    Number((totalModules / totalCourses).toFixed(1)) : 0;

                return {
                    data: {
                        totalCourses,
                        totalProgrammes,
                        totalModules,
                        totalExamPapers,
                        averageModules,
                    }
                };
            } catch (error) {
                console.error('Error getting course statistics:', error);
                return {
                    data: {
                        totalCourses: 0,
                        totalProgrammes: 0,
                        totalModules: 0,
                        totalExamPapers: 0,
                        averageModules: 0,
                    }
                };
            }
        },
    },

    /**
     * Exam Papers Management
     * 
     * Note: Different endpoints return different levels of detail:
     * - getById() returns full ExamPaperRead with all relationships
     * - list() and search() return full ExamPaperRead 
     * - Institution views use simplified ExamPaperReadForInstitution (no instructions, modules, question_sets)
     * 
     * Search endpoint supports flexible filtering:
     * - Only search query: Returns exam papers matching the search term
     * - Only institution_id: Returns all exam papers for that institution  
     * - Both provided: Returns exam papers for that institution that also match the search term
     * - Neither provided: Returns all exam papers (with other filters if specified)
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
                    const searchParams: any = {
                        skip: params.skip,
                        limit: params.limit,
                        institution_id: params.institution_id,
                        course_id: params.course_id,
                        year: params.year,
                        sort_by: params.sort_by,
                        sort_order: params.sort_order
                    };

                    // Only add q parameter if search term is provided
                    if (params.search) {
                        searchParams.q = params.search;
                    }

                    console.log('🔍 Using search endpoint with params:', searchParams);
                    const response = await api.GET('/api/v1/exampaper/search', {
                        params: {
                            query: searchParams
                        }
                    });
                    // Log only the structure, not the full data to avoid console spam
                    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                        const responseData = response.data as any;
                        if (responseData.data?.items) {
                            console.log('🔍 Search response structure:', {
                                message: responseData.message,
                                totalItems: responseData.data.total,
                                itemsCount: responseData.data.items.length,
                                searchQuery: searchParams.q || 'No search term (filter only)',
                                institutionFilter: searchParams.institution_id || 'None',
                                courseFilter: searchParams.course_id || 'None',
                                yearFilter: searchParams.year || 'None'
                            });
                        }
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
                    // if (response.data?.data?.items) {
                    // console.log('📄 List response structure:', {
                    //     message: response.data.message,
                    //     totalItems: response.data.data.total,
                    //     itemsCount: response.data.data.items.length,
                    //     firstItem: response.data.data.items[0] ? {
                    //         id: response.data.data.items[0].id,
                    //         title: (response.data.data.items[0] as any).title?.name,
                    //         questionSetsCount: response.data.data.items[0].question_sets?.length
                    //     } : null
                    // });
                    // } else {
                    //     console.log('📄 List response:', response);
                    // }
                    return response;
                }
            } catch (error) {
                console.error('❌ ExamPapers.list error:', error);
                throw error;
            }
        },

        async search(params: {
            q?: string; // Made optional to support filtering without search term
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

        async getOrderedByCreatedAt(params?: { skip?: number; limit?: number; order?: 'ascendent' | 'descendent' }) {
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

        // Module management for exam papers
        async addModule(examPaperId: string, moduleId: string) {
            const response = await api.POST('/api/v1/exampaper/{exampaper_id}/modules/{module_id}', {
                params: {
                    path: {
                        exampaper_id: examPaperId,
                        module_id: moduleId
                    }
                }
            });
            return response;
        },

        async removeModule(examPaperId: string, moduleId: string) {
            const response = await api.DELETE('/api/v1/exampaper/{exampaper_id}/modules/{module_id}', {
                params: {
                    path: {
                        exampaper_id: examPaperId,
                        module_id: moduleId
                    }
                }
            });
            return response;
        },
    },

    /**
     * Questions Management
     * 
     * Note: Questions cannot be added directly to Exam Papers.
     * Questions must be added to Question Sets, which are then linked to Exam Papers.
     * 
     * Workflow to add questions to an exam paper:
     * 1. Create or get a Question Set
     * 2. Link the Question Set to the Exam Paper (examPapers.addQuestionSet)
     * 3. Create questions with the question_set_id (questions.createMain)
     */
    questions: {
        async list(params?: {
            /** Filter by question type: main, sub, or all */
            question_type?: 'main' | 'sub' | 'all';
            /** Filter by question set ID (for main questions) */
            question_set_id?: string | null;
            /** Filter by parent question ID (for sub-questions) */
            parent_id?: string | null;
            /** Filter by exam paper ID (for main questions) */
            exam_paper_id?: string | null;
            /** Include sub-questions in response (for main questions) */
            include_children?: boolean;
            skip?: number;
            limit?: number;
        }) {
            const response = await api.GET('/api/v1/questions', {
                params: {
                    query: params
                }
            });
            return response;
        },
        
        /**
         * Get questions for a specific exam paper (through its question sets)
         * This is a convenience method that fetches all questions across all question sets
         */
        async getByExamPaper(examPaperId: string, params?: {
            skip?: number;
            limit?: number;
            include_children?: boolean;
        }) {
            const response = await api.GET('/api/v1/questions', {
                params: {
                    query: {
                        exam_paper_id: examPaperId,
                        question_type: 'main',
                        ...params
                    }
                }
            });
            return response;
        },

        async search(params: {
            /** Search query for questions */
            q?: string;
            /** Filter by question type */
            question_type?: 'main' | 'sub' | 'all';
            /** Filter by exam paper ID */
            exam_paper_id?: string | null;
            /** Filter by question set ID */
            question_set_id?: string | null;
            /** Filter by institution ID */
            institution_id?: string | null;
            /** Filter by course ID */
            course_id?: string | null;
            /** Filter by module ID */
            module_id?: string | null;
            /** Filter by programme ID */
            programme_id?: string | null;
            /** Minimum marks */
            marks_min?: number | null;
            /** Maximum marks */
            marks_max?: number | null;
            /** Filter by numbering style */
            numbering_style?: string | null;
            /** Filter questions with/without answers */
            has_answers?: boolean | null;
            /** Include sub-questions in response */
            include_children?: boolean;
            /** Sort by: relevance, marks, created_at */
            sort_by?: string;
            /** Sort order: asc, desc */
            sort_order?: string;
            skip?: number;
            limit?: number;
            /** Enable search term highlighting */
            highlight?: boolean;
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

        async removeSubQuestion(mainQuestionId: string, subQuestionId: string) {
            const response = await api.DELETE('/api/v1/questions/{main_question_id}/sub-questions/{sub_question_id}', {
                params: {
                    path: {
                        main_question_id: mainQuestionId,
                        sub_question_id: subQuestionId
                    }
                }
            });
            return response;
        },

        async unlinkFromQuestionSet(mainQuestionId: string) {
            const response = await api.DELETE('/api/v1/questions/{main_question_id}/question-set', {
                params: {
                    path: { main_question_id: mainQuestionId }
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

        async getSearchSuggestions(q: string, limit?: number, question_type?: 'main' | 'sub' | 'all') {
            const response = await api.GET('/api/v1/questions/search/suggestions', {
                params: {
                    query: { q, limit, question_type }
                }
            });
            return response;
        },

        /**
         * Upload an image file for use in Editor.js question content
         * Returns the image URL that can be embedded in question text JSON
         * 
         * Note: Uses direct fetch instead of API client because FormData uploads
         * need the browser to set Content-Type header automatically (with boundary)
         */
        async uploadImage(imageFile: File) {
            try {
                const formData = new FormData();
                formData.append('image_file', imageFile); // API expects 'image_file' field name

                // Get auth token
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
                
                // Get base URL
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';

                // Use direct fetch for FormData upload
                const response = await fetch(`${baseUrl}/api/v1/questions/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Don't set Content-Type - let browser set it with boundary
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    return {
                        data: undefined,
                        error: errorData,
                        response: response as any
                    };
                }

                const data = await response.json();
                return {
                    data,
                    error: undefined,
                    response: response as any
                };
            } catch (error) {
                console.error('Image upload error:', error);
                return {
                    data: undefined,
                    error: error,
                    response: undefined as any
                };
            }
        },

        /**
         * Upload an image from URL for use in Editor.js question content
         * Fetches the image from the URL and stores it in S3/Minio
         */
        async uploadImageByUrl(imageUrl: string) {
            const response = await api.POST('/api/v1/questions/image/url', {
                body: {
                    url: imageUrl
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

        async getByExamPaper(examPaperId: string) {
            const response = await api.GET('/api/v1/question-set/by-exam-paper/{exam_paper_id}', {
                params: {
                    path: { exam_paper_id: examPaperId }
                }
            });
            return response;
        },
    },

    // Answer Management
    answers: {
        async list(params?: {
            limit?: number;
            skip?: number;
            question_id?: string;
        }) {
            return api.GET('/api/v1/answer', {
                params: {
                    query: params
                }
            });
        },

        async getByQuestion(questionId: string) {
            return api.GET('/api/v1/answer/question/{question_id}', {
                params: {
                    path: { question_id: questionId }
                }
            });
        },

        async getById(answerId: string) {
            return api.GET('/api/v1/answer/{answer_id}', {
                params: {
                    path: { answer_id: answerId }
                }
            });
        },

        async create(answerData: components['schemas']['AnswerCreate']) {
            return api.POST('/api/v1/answer', {
                body: answerData
            });
        },

        async update(answerId: string, answerData: components['schemas']['AnswerUpdate']) {
            return api.PUT('/api/v1/answer/{answer_id}', {
                params: {
                    path: { answer_id: answerId }
                },
                body: answerData
            });
        },

        async delete(answerId: string) {
            return api.DELETE('/api/v1/answer/{answer_id}', {
                params: {
                    path: { answer_id: answerId }
                }
            });
        },

        async createReply(answerId: string, replyData: components['schemas']['AnswerCreate']) {
            return api.POST('/api/v1/answer/{answer_id}/reply', {
                params: {
                    path: { answer_id: answerId }
                },
                body: replyData
            });
        },

        async toggleLike(answerId: string) {
            return api.POST('/api/v1/answer/{answer_id}/like', {
                params: {
                    path: { answer_id: answerId }
                }
            });
        },

        async toggleDislike(answerId: string) {
            return api.POST('/api/v1/answer/{answer_id}/dislike', {
                params: {
                    path: { answer_id: answerId }
                }
            });
        },
    },

};

// Helper functions for backward compatibility
export async function getInstitutions(token?: string) {
    try {
        const response = await adminAPI.institutions.list();
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error fetching institutions:', error);
        return { success: false, error: 'Failed to fetch institutions' };
    }
}

export async function getCourses(token?: string) {
    try {
        const response = await adminAPI.courses.list();
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error fetching courses:', error);
        return { success: false, error: 'Failed to fetch courses' };
    }
}

export async function getQuestions(token?: string) {
    try {
        const response = await adminAPI.questions.list();
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error fetching questions:', error);
        return { success: false, error: 'Failed to fetch questions' };
    }
}

// Helper utilities for admin operations
export const adminHelpers = {
    /**
     * Generate activity summary from users data
     */
    generateActivitySummary(users: any[]) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const todayRegistrations = users.filter(user => {
            if (!user.created_at) return false;
            const createdDate = new Date(user.created_at);
            return createdDate >= today;
        }).length;

        const pendingVerifications = users.filter(user => 
            !user.is_verified && user.is_active
        ).length;

        return {
            todayRegistrations,
            pendingVerifications,
        };
    },

    /**
     * Format health status from API response
     */
    formatHealthStatus(healthData: any): 'healthy' | 'warning' | 'critical' {
        if (!healthData) return 'warning';
        
        // Check database status
        const dbStatus = healthData.database_status || healthData.database;
        if (dbStatus === 'error' || dbStatus === 'disconnected') {
            return 'critical';
        }
        
        // Check if there are any error indicators
        if (healthData.status === 'error' || healthData.healthy === false) {
            return 'critical';
        }
        
        // Check for warnings
        if (dbStatus === 'slow' || healthData.status === 'degraded') {
            return 'warning';
        }
        
        return 'healthy';
    },

    /**
     * Safely extract total from paginated response
     */
    extractTotal(response: any): number {
        if (!response || !response.data) return 0;
        
        if (typeof response.data === 'object' && 'data' in response.data) {
            const data = response.data.data as any;
            return data?.total || 0;
        }
        
        return 0;
    },

    /**
     * Safely extract items from paginated response
     */
    extractItems(response: any): any[] {
        if (!response || !response.data) return [];
        
        if (typeof response.data === 'object' && 'data' in response.data) {
            const data = response.data.data as any;
            return data?.items || [];
        }
        
        return [];
    },
};

export { adminAPI };
export default adminAPI;