/**
 * Shared types and interfaces for public components
 */

import { components } from '@/types/generated/api';

// Re-export commonly used API types for convenience
export type ExamPaperRead = components['schemas']['ExamPaperRead'];
export type QuestionRead = components['schemas']['QuestionRead'];
export type InstitutionRead = components['schemas']['InstitutionRead'];
export type CourseRead = components['schemas']['CourseRead'];
export type ModuleRead = components['schemas']['ModuleRead'];

// Minimal types for cards and previews
export type InstitutionMinimal = components['schemas']['InstitutionReadMinimal'];
export type ExamPaperMinimal = components['schemas']['ExamPaperReadMinimal'];
export type CourseMinimal = components['schemas']['CourseReadMinimal'];

// Filter types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface ActiveFilters {
  institutions?: string[];
  years?: string[];
  courses?: string[];
  modules?: string[];
  search?: string;
  sortBy?: string;
}

// Pagination types
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Card component props
export interface QuestionCardProps {
  question: QuestionRead;
  preview?: boolean;
  onView?: () => void;
  className?: string;
}

export interface PaperCardProps {
  paper: ExamPaperRead;
  variant?: 'grid' | 'list';
  showBookmark?: boolean;
  className?: string;
}

export interface InstitutionCardProps {
  institution: InstitutionRead;
  className?: string;
}

// Filter component props
export interface FilterSidebarProps {
  filters: {
    institutions: FilterOption[];
    years: FilterOption[];
    courses: FilterOption[];
  };
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

// Search component props
export interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  showSuggestions?: boolean;
  className?: string;
}

export interface SearchSuggestion {
  id: string;
  type: 'paper' | 'question' | 'institution';
  title: string;
  subtitle?: string;
  url: string;
}

// Stats types
export interface PlatformStats {
  totalPapers: number;
  totalInstitutions: number;
  totalQuestions: number;
  totalCourses?: number;
  totalDepartments?: number;
  totalModules?: number;
  totalFaculties?: number;
  totalUsers?: number;
  totalAnswers?: number;
  totalCampuses?: number;
}

// Sign-up prompt types
export type SignUpPromptType = 
  | 'view-answer' 
  | 'save-paper' 
  | 'track-progress' 
  | 'time-based';

export interface SignUpPromptState {
  shown: boolean;
  type: SignUpPromptType;
  dismissedPrompts: string[];
  viewCount: number;
}

// View mode types
export type ViewMode = 'grid' | 'list';

// Sort options
export type SortOption = 
  | 'newest' 
  | 'oldest' 
  | 'popular' 
  | 'alphabetical'
  | 'most-questions';
