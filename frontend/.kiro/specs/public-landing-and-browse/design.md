# Design Document

## Overview

This document outlines the technical design for implementing Phase 1 of the Exampapel public-facing features. The design focuses on creating a performant, SEO-friendly, and user-engaging experience that showcases exam papers and questions to guest users while encouraging sign-up for enhanced features.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Public Pages Layer                       │
│  (No Authentication Required - SSR/SSG for SEO)             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────────┐
│   Landing    │ │  Browse   │ │ Institutions  │
│     Page     │ │   Pages   │ │    Pages      │
│              │ │           │ │               │
│ - Hero       │ │ - List    │ │ - Directory   │
│ - Recent Q's │ │ - Detail  │ │ - Profile     │
│ - Features   │ │ - Search  │ │ - Papers      │
│ - CTA        │ │ - Filters │ │               │
└──────┬───────┘ └─────┬─────┘ └───────┬───────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
              ┌────────▼────────┐
              │   API Layer     │
              │  (Public APIs)  │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│  Questions   │ │  Papers  │ │Institutions│
│     API      │ │   API    │ │    API     │
└──────────────┘ └──────────┘ └────────────┘
```

### Route Structure

```
/app/
├── (public)/                    # Public route group (no auth)
│   ├── layout.tsx              # Public layout with header/footer
│   ├── page.tsx                # Landing page (SSR)
│   │
│   ├── browse/                 # Browse exam papers
│   │   ├── page.tsx           # Papers list (SSR with client filters)
│   │   ├── [id]/              # Paper detail
│   │   │   └── page.tsx       # Individual paper (SSG)
│   │   └── loading.tsx        # Loading state
│   │
│   ├── institutions/           # Institutions directory
│   │   ├── page.tsx           # Institutions list (SSR)
│   │   ├── [slug]/            # Institution profile
│   │   │   ├── page.tsx       # Profile page (SSG)
│   │   │   └── papers/        # Institution papers
│   │   │       └── page.tsx   # Filtered papers list
│   │   └── loading.tsx
│   │
│   ├── questions/              # Questions browser
│   │   ├── page.tsx           # Questions list (SSR)
│   │   ├── [id]/              # Question detail
│   │   │   └── page.tsx       # Individual question (SSG)
│   │   └── loading.tsx
│   │
│   ├── search/                 # Global search
│   │   └── page.tsx           # Search results (SSR)
│   │
│   └── auth/                   # Authentication (existing)
│       ├── login/
│       ├── register/
│       └── forgot-password/
```

## Components and Interfaces

### Component Hierarchy

```
PublicLayout
├── PublicHeader
│   ├── Logo
│   ├── Navigation
│   ├── SearchBar
│   └── AuthButtons (Login/Sign Up)
│
├── Page Content (varies by route)
│   │
│   ├── LandingPage
│   │   ├── HeroSection
│   │   │   ├── Headline
│   │   │   ├── SearchBar
│   │   │   └── CTAButton
│   │   ├── StatsSection
│   │   ├── RecentQuestionsSection
│   │   │   └── QuestionCard[] (6-10 items)
│   │   ├── FeaturedInstitutionsSection
│   │   │   └── InstitutionCard[] (6-8 items)
│   │   ├── FeaturesSection
│   │   └── CTASection
│   │
│   ├── BrowsePage
│   │   ├── FilterSidebar
│   │   │   ├── InstitutionFilter
│   │   │   ├── YearFilter
│   │   │   ├── CourseFilter
│   │   │   └── ClearFiltersButton
│   │   ├── SearchAndSort
│   │   │   ├── SearchInput
│   │   │   ├── SortDropdown
│   │   │   └── ViewToggle (Grid/List)
│   │   ├── ResultsHeader (count, filters applied)
│   │   ├── PapersGrid
│   │   │   └── PaperCard[]
│   │   └── Pagination
│   │
│   ├── PaperDetailPage
│   │   ├── PaperHeader
│   │   │   ├── Title
│   │   │   ├── Metadata
│   │   │   └── ActionButtons (Download, Print, Share, Save)
│   │   ├── InstructionsSection
│   │   ├── QuestionsSection
│   │   │   └── QuestionItem[]
│   │   │       ├── QuestionText
│   │   │       ├── SubQuestions[]
│   │   │       └── ShowAnswerButton
│   │   └── RelatedPapersSection
│   │       └── PaperCard[]
│   │
│   ├── InstitutionsPage
│   │   ├── SearchBar
│   │   ├── FilterBar
│   │   ├── InstitutionsGrid
│   │   │   └── InstitutionCard[]
│   │   └── Pagination
│   │
│   └── InstitutionProfilePage
│       ├── InstitutionHeader
│       │   ├── Logo
│       │   ├── Name & Description
│       │   └── Stats
│       ├── FacultiesSection
│       ├── PapersSection
│       │   └── PaperCard[]
│       └── ContactSection
│
└── PublicFooter
    ├── Links (About, Contact, Terms, Privacy)
    ├── SocialMedia
    └── Copyright
```

### Key Component Interfaces

```typescript
// Question Card Component
interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    marks: number;
    examPaper: {
      id: string;
      title: string;
      institution: string;
      year: string;
      course: string;
    };
  };
  preview?: boolean; // Show preview or full question
  onView?: () => void;
}

// Paper Card Component
interface PaperCardProps {
  paper: {
    id: string;
    title: string;
    institution: {
      name: string;
      logo?: string;
    };
    course: string;
    year: string;
    questionCount: number;
    duration?: number;
    tags: string[];
  };
  variant?: 'grid' | 'list';
  showBookmark?: boolean;
}

// Institution Card Component
interface InstitutionCardProps {
  institution: {
    id: string;
    slug: string;
    name: string;
    logo?: string;
    type: string;
    location?: string;
    paperCount: number;
  };
}

// Filter Sidebar Component
interface FilterSidebarProps {
  filters: {
    institutions: FilterOption[];
    years: FilterOption[];
    courses: FilterOption[];
  };
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
  onClearFilters: () => void;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ActiveFilters {
  institutions?: string[];
  years?: string[];
  courses?: string[];
  search?: string;
  sortBy?: string;
}
```

## Data Models

### API Response Types

```typescript
// Question Response
interface QuestionRead {
  id: string;
  question_text: string; // JSON blocks
  marks: number;
  question_number: string;
  numbering_style: string;
  slug: string;
  created_at: string;
  exam_paper?: ExamPaperBasic;
  question_set?: QuestionSetBasic;
  sub_questions?: SubQuestionRead[];
}

// Exam Paper Response
interface ExamPaperRead {
  id: string;
  title: ExamTitleRead;
  description?: ExamDescriptionRead;
  exam_date?: string;
  exam_duration?: number;
  year_of_exam?: string;
  tags?: string[];
  slug?: string;
  created_at: string;
  updated_at: string;
  institution?: InstitutionRead;
  course?: CourseRead;
  modules?: ModuleRead[];
  question_sets?: QuestionSetRead[];
  instructions?: InstructionRead[];
}

// Institution Response
interface InstitutionRead {
  id: string;
  name: string;
  acronym?: string;
  slug: string;
  description?: string;
  institution_type: string;
  location?: string;
  logo_url?: string;
  exam_papers_count?: number;
}

// Paginated Response
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
```

### Client-Side State Management

```typescript
// Browse Page State
interface BrowsePageState {
  papers: ExamPaperRead[];
  loading: boolean;
  filters: ActiveFilters;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  viewMode: 'grid' | 'list';
}

// Landing Page State
interface LandingPageState {
  recentQuestions: QuestionRead[];
  featuredInstitutions: InstitutionRead[];
  stats: {
    totalPapers: number;
    totalInstitutions: number;
    totalQuestions: number;
  };
  loading: boolean;
}

// Sign-up Prompt State
interface SignUpPromptState {
  shown: boolean;
  type: 'view-answer' | 'save-paper' | 'track-progress' | 'time-based';
  dismissedPrompts: string[]; // Store in localStorage
  viewCount: number; // Track question views
}
```

## Error Handling

### Error Scenarios and Handling

```typescript
// API Error Handler
class PublicAPIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Error Handling Strategy
const handleAPIError = (error: unknown): ErrorState => {
  if (error instanceof PublicAPIError) {
    switch (error.statusCode) {
      case 404:
        return {
          type: 'not-found',
          message: 'Content not found',
          action: 'redirect-to-browse'
        };
      case 500:
        return {
          type: 'server-error',
          message: 'Something went wrong. Please try again.',
          action: 'show-error-page'
        };
      default:
        return {
          type: 'unknown',
          message: 'An error occurred',
          action: 'show-toast'
        };
    }
  }
  
  return {
    type: 'network-error',
    message: 'Network error. Please check your connection.',
    action: 'show-retry-button'
  };
};

// Error Boundaries
// - Page-level error boundary for catastrophic failures
// - Component-level error boundaries for isolated failures
// - Graceful degradation (show cached data if available)
```

### Error UI Components

```typescript
// Empty State Component
interface EmptyStateProps {
  icon: React.ComponentType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Error State Component
interface ErrorStateProps {
  error: ErrorState;
  onRetry?: () => void;
  onGoBack?: () => void;
}
```

## Testing Strategy

### Unit Tests

```typescript
// Component Tests
describe('QuestionCard', () => {
  it('should render question preview correctly', () => {});
  it('should truncate long question text', () => {});
  it('should show sign-up prompt when clicking show answer', () => {});
});

describe('FilterSidebar', () => {
  it('should apply filters correctly', () => {});
  it('should clear all filters', () => {});
  it('should update URL with filter params', () => {});
});

// API Tests
describe('Public API', () => {
  it('should fetch recent questions', () => {});
  it('should fetch papers with filters', () => {});
  it('should handle pagination correctly', () => {});
});
```

### Integration Tests

```typescript
// Page Tests
describe('Landing Page', () => {
  it('should load and display recent questions', () => {});
  it('should navigate to browse page on CTA click', () => {});
  it('should show sign-up modal after viewing questions', () => {});
});

describe('Browse Page', () => {
  it('should filter papers by institution', () => {});
  it('should search papers by text', () => {});
  it('should paginate results correctly', () => {});
});
```

### E2E Tests

```typescript
// User Journey Tests
describe('Guest User Journey', () => {
  it('should complete full browse and view flow', () => {
    // Visit landing page
    // Click browse
    // Apply filters
    // View paper details
    // See sign-up prompt
  });
  
  it('should search and find papers', () => {
    // Enter search query
    // View results
    // Click paper
    // View questions
  });
});
```

## Performance Optimization

### Rendering Strategy

```typescript
// Page Rendering Modes
const renderingStrategy = {
  '/': 'SSR', // Landing page - fresh data on each request
  '/browse': 'SSR + Client Hydration', // Initial SSR, client-side filtering
  '/browse/[id]': 'SSG + ISR', // Static generation with revalidation
  '/institutions': 'SSR',
  '/institutions/[slug]': 'SSG + ISR',
  '/questions': 'SSR + Client Hydration',
  '/questions/[id]': 'SSG + ISR',
  '/search': 'SSR', // Dynamic search results
};

// ISR Configuration
export const revalidate = 3600; // Revalidate every hour

// Static Paths Generation
export async function generateStaticParams() {
  // Generate paths for top 100 papers
  // Generate paths for all institutions
  // On-demand generation for others
}
```

### Caching Strategy

```typescript
// API Response Caching
const cacheConfig = {
  recentQuestions: {
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
  },
  papers: {
    ttl: 600, // 10 minutes
    staleWhileRevalidate: 1800, // 30 minutes
  },
  institutions: {
    ttl: 3600, // 1 hour
    staleWhileRevalidate: 7200, // 2 hours
  },
};

// Client-Side Caching
// - Use React Query for API caching
// - Cache filter options in memory
// - Store user preferences in localStorage
```

### Image Optimization

```typescript
// Next.js Image Component
import Image from 'next/image';

// Optimized image loading
<Image
  src={institution.logo}
  alt={institution.name}
  width={200}
  height={200}
  loading="lazy"
  placeholder="blur"
  blurDataURL={generateBlurDataURL(institution.logo)}
/>

// Image CDN Configuration
// - Serve images from CDN
// - Use WebP format with fallback
// - Implement responsive images
// - Lazy load below-fold images
```

### Code Splitting

```typescript
// Dynamic Imports
const FilterSidebar = dynamic(() => import('@/components/public/filter-sidebar'), {
  loading: () => <FilterSidebarSkeleton />,
  ssr: false, // Client-side only
});

const QuestionModal = dynamic(() => import('@/components/public/question-modal'), {
  loading: () => <LoadingSpinner />,
});

// Route-based code splitting (automatic with Next.js)
// Component-level code splitting for heavy components
```

## SEO Implementation

### Meta Tags

```typescript
// Dynamic Metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const paper = await fetchPaper(params.id);
  
  return {
    title: `${paper.title} - ${paper.institution.name} | Exampapel`,
    description: `${paper.description} - Past exam paper from ${paper.year}`,
    keywords: [paper.course, paper.institution.name, paper.year, 'exam paper', 'past papers'],
    openGraph: {
      title: paper.title,
      description: paper.description,
      images: [paper.institution.logo],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: paper.title,
      description: paper.description,
      images: [paper.institution.logo],
    },
  };
}
```

### Structured Data

```typescript
// Schema.org JSON-LD
const examPaperSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalResource',
  name: paper.title,
  description: paper.description,
  educationalLevel: 'University',
  about: {
    '@type': 'Course',
    name: paper.course,
  },
  provider: {
    '@type': 'EducationalOrganization',
    name: paper.institution.name,
  },
  datePublished: paper.exam_date,
};

// Inject in page head
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(examPaperSchema) }}
/>
```

### Sitemap Generation

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const papers = await fetchAllPapers();
  const institutions = await fetchAllInstitutions();
  
  return [
    {
      url: 'https://exampapel.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://exampapel.com/browse',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...papers.map(paper => ({
      url: `https://exampapel.com/browse/${paper.id}`,
      lastModified: paper.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...institutions.map(inst => ({
      url: `https://exampapel.com/institutions/${inst.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];
}
```

## Security Considerations

### Rate Limiting

```typescript
// API Rate Limiting
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
};

// Apply to public API routes
// More lenient than authenticated routes
// Track by IP address
```

### Content Security

```typescript
// Sanitize User-Generated Content
import DOMPurify from 'isomorphic-dompurify';

const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: [],
  });
};

// XSS Protection
// - Sanitize all user inputs
// - Use Content Security Policy headers
// - Escape special characters in search queries
```

### Privacy

```typescript
// Guest User Tracking
// - No PII collection without consent
// - Anonymous analytics only
// - Clear cookie policy
// - GDPR compliance
// - Opt-out mechanism

const trackEvent = (event: string, properties?: object) => {
  if (hasUserConsent()) {
    analytics.track(event, {
      ...properties,
      timestamp: new Date(),
      // No user identifiers
    });
  }
};
```

## Deployment Strategy

### Build Configuration

```typescript
// next.config.js
module.exports = {
  output: 'standalone',
  images: {
    domains: ['cdn.exampapel.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
};
```

### Environment Variables

```bash
# Public Environment Variables
NEXT_PUBLIC_API_URL=https://api.exampapel.com
NEXT_PUBLIC_CDN_URL=https://cdn.exampapel.com
NEXT_PUBLIC_SITE_URL=https://exampapel.com
NEXT_PUBLIC_ANALYTICS_ID=UA-XXXXXXXXX-X

# Server-Side Only
API_SECRET_KEY=xxxxx
DATABASE_URL=xxxxx
```

### Monitoring

```typescript
// Performance Monitoring
// - Core Web Vitals tracking
// - API response time monitoring
// - Error rate tracking
// - User session recording (with consent)

// Alerts
// - High error rate
// - Slow page load times
// - API failures
// - High bounce rate
```

## Migration Plan

### Phase 1: Foundation (Week 1)
1. Set up public route group structure
2. Create public layout with header/footer
3. Implement basic landing page
4. Set up API integration for public endpoints

### Phase 2: Core Features (Week 2-3)
1. Implement browse page with filters
2. Create paper detail page
3. Build institutions directory
4. Implement search functionality

### Phase 3: Enhancement (Week 4)
1. Add questions browser
2. Implement sign-up prompts
3. Add analytics tracking
4. Optimize performance

### Phase 4: Polish (Week 5)
1. SEO optimization
2. Mobile responsiveness
3. Accessibility improvements
4. Testing and bug fixes

## Success Metrics

### Key Performance Indicators

```typescript
const successMetrics = {
  performance: {
    pageLoadTime: '< 2 seconds',
    lighthouseScore: '> 90',
    timeToInteractive: '< 3 seconds',
  },
  engagement: {
    bounceRate: '< 40%',
    avgSessionDuration: '> 5 minutes',
    pagesPerSession: '> 3',
  },
  conversion: {
    signUpRate: '> 5%',
    paperViews: '> 1000/day',
    searchUsage: '> 30%',
  },
  seo: {
    organicTraffic: '+50% in 3 months',
    searchRanking: 'Top 10 for target keywords',
    backlinks: '> 100 quality backlinks',
  },
};
```
