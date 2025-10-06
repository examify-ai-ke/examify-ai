/**
 * Public components exports
 * Central export point for all public-facing components
 */

// Types
export * from './types';

// Base components
export { BaseCard } from './base-card';
export { BaseFilter, ActiveFiltersDisplay } from './base-filter';
export { BaseSearch, QuickSearch } from './base-search';

// Landing page components
export { HeroSection } from './hero-section';
export { RecentQuestionsSection } from './recent-questions-section';
export { FeaturedInstitutionsSection } from './featured-institutions-section';
export { StatsSection } from './stats-section';

// Card components
export { QuestionCard } from './question-card';
export { InstitutionCard } from './institution-card';

// Modal components
export { QuestionModal } from './question-modal';
export { SignUpPrompt } from './sign-up-prompt';
export type { SignUpPromptType } from './sign-up-prompt';

// Browse page components
export { FilterSidebar } from './filter-sidebar';
export { SearchAndSort } from './search-and-sort';
export { ExamPaperCard } from './exam-paper-card';
export { Pagination } from './pagination';
