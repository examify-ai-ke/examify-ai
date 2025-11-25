/**
 * Comprehensive type definitions for search and filter functionality
 */

/**
 * Individual filter option
 */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

/**
 * Available filter options from API
 */
export interface AvailableFilters {
  institutions: FilterOption[];
  courses: FilterOption[];
  years: FilterOption[];
  tags: FilterOption[];
  durationRange: { min: number; max: number };
  dateRange: { min: string; max: string };
}

/**
 * Search filter state
 */
export interface SearchFilters {
  // Text search
  query?: string;
  
  // Entity filters
  institutionIds?: string[];
  courseIds?: string[];
  moduleIds?: string[];
  programmeIds?: string[];
  years?: string[];
  tags?: string[];
  
  // Range filters
  durationMin?: number;
  durationMax?: number;
  examDateFrom?: string;
  examDateTo?: string;
  
  // Sorting
  sortBy?: 'relevance' | 'date' | 'duration' | 'title';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  pageSize?: number;
}

/**
 * Sort option for dropdown
 */
export interface SortOption {
  value: SearchFilters['sortBy'];
  label: string;
}

/**
 * Filter section state
 */
export interface FilterSectionState {
  isExpanded: boolean;
  searchQuery?: string;
}

/**
 * Active filter count by section
 */
export interface ActiveFilterCounts {
  institutions: number;
  courses: number;
  years: number;
  tags: number;
  duration: boolean;
  dateRange: boolean;
  total: number;
}
