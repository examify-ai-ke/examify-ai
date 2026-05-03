/**
 * Mock data for useAvailableFilters hook
 * Use this when backend is not available
 */

import type { AvailableFilters } from '@/types/search-filters';

export const MOCK_AVAILABLE_FILTERS: AvailableFilters = {
  institutions: [
    { value: 'inst-1', label: 'University of Nairobi', count: 145 },
    { value: 'inst-2', label: 'Kenyatta University', count: 98 },
    { value: 'inst-3', label: 'Moi University', count: 87 },
    { value: 'inst-4', label: 'Egerton University', count: 76 },
    { value: 'inst-5', label: 'Jomo Kenyatta University', count: 65 },
    { value: 'inst-6', label: 'Maseno University', count: 54 },
    { value: 'inst-7', label: 'Technical University of Kenya', count: 43 },
    { value: 'inst-8', label: 'Strathmore University', count: 32 },
  ],
  courses: [
    { value: 'course-1', label: 'Computer Science', count: 89 },
    { value: 'course-2', label: 'Mathematics', count: 76 },
    { value: 'course-3', label: 'Physics', count: 65 },
    { value: 'course-4', label: 'Chemistry', count: 54 },
    { value: 'course-5', label: 'Biology', count: 43 },
    { value: 'course-6', label: 'Engineering', count: 98 },
    { value: 'course-7', label: 'Business Administration', count: 87 },
    { value: 'course-8', label: 'Economics', count: 56 },
    { value: 'course-9', label: 'Law', count: 45 },
    { value: 'course-10', label: 'Medicine', count: 67 },
  ],
  years: [
    { value: '2024', label: '2024', count: 45 },
    { value: '2023', label: '2023', count: 123 },
    { value: '2022', label: '2022', count: 156 },
    { value: '2021', label: '2021', count: 134 },
    { value: '2020', label: '2020', count: 98 },
    { value: '2019', label: '2019', count: 87 },
    { value: '2018', label: '2018', count: 76 },
    { value: '2017', label: '2017', count: 65 },
  ],
  tags: [
    { value: 'calculus', label: 'Calculus', count: 45 },
    { value: 'algebra', label: 'Algebra', count: 38 },
    { value: 'statistics', label: 'Statistics', count: 32 },
    { value: 'programming', label: 'Programming', count: 56 },
    { value: 'data-structures', label: 'Data Structures', count: 43 },
    { value: 'algorithms', label: 'Algorithms', count: 41 },
    { value: 'mechanics', label: 'Mechanics', count: 29 },
    { value: 'thermodynamics', label: 'Thermodynamics', count: 27 },
    { value: 'organic-chemistry', label: 'Organic Chemistry', count: 34 },
    { value: 'genetics', label: 'Genetics', count: 31 },
  ],
  durationRange: {
    min: 60,
    max: 180,
  },
  dateRange: {
    min: '2017-01-01',
    max: '2024-12-31',
  },
};

/**
 * Check if we should use mock data
 * Returns true if API is not accessible
 */
export function shouldUseMockData(): boolean {
  // Check if we're in development and API URL is not set or is localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
  
  // Use mock data if:
  // 1. No API URL is set
  // 2. API URL is localhost (might not be running)
  // 3. Explicitly enabled via env var
  return (
    !apiUrl ||
    isLocalhost ||
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
  );
}
