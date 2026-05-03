# Implementation Plan

## Overview
This implementation plan breaks down Phase 1 of the public pages into manageable, incremental tasks. Each task is designed to be completed independently while building toward the complete public browsing experience.

## Task List

### 🚨 URGENT: Admin Pages Refactoring

- [ ] 0. Fix and organize existing admin pages according to architecture
  - [x] 0.1 Audit all existing admin pages and components
    - List all pages in `/app/dashboard/` directory
    - Identify TypeScript compilation errors
    - Document current routing structure
    - Identify missing or broken functionality
    - _Requirements: Architecture alignment_

  - [x] 0.2 Fix TypeScript errors in admin API utilities
    - Fix `/lib/api-admin.ts` type errors (139 errors)
    - Update API calls to match openapi-fetch v2 signature
    - Fix missing required parameters in API calls
    - Add proper error handling types
    - Test all API utility functions
    - _Requirements: Type safety, API integration_

  - [x] 0.3 Fix TypeScript errors in hooks
    - Fix `/hooks/useAuth.ts` errors (31 errors)
    - Update authentication hook types
    - Fix API response type handling
    - Add proper error type definitions
    - _Requirements: Authentication, Type safety_

  - [x] 0.4 Fix TypeScript errors in admin pages
    - Fix dashboard pages (admin, users, institutions, etc.)
    - Fix form components type errors
    - Fix layout component errors
    - Update component prop types
    - _Requirements: Admin functionality_

  - [x] 0.5 Reorganize admin routes according to ARCHITECTURE.md
    - Ensure all admin routes are under `/dashboard/`
    - Verify admin layout is properly applied
    - Check permission guards on all admin routes
    - Update navigation to match architecture
    - Test role-based access control
    - _Requirements: Architecture compliance, Security_

  - [ ] 0.6 Fix and test admin dashboard pages
    - Test admin overview dashboard (`/dashboard/admin/page.tsx`)
    - Test user management pages
    - Test institution management pages
    - Test exam paper management pages
    - Test question management pages
    - Verify all CRUD operations work
    - _Requirements: Admin functionality_

  - [ ] 0.7 Update admin navigation and layout
    - Verify sidebar navigation matches architecture
    - Update breadcrumbs for all admin pages
    - Ensure consistent header across admin pages
    - Add proper loading states
    - Add proper error boundaries
    - _Requirements: UX, Navigation_

  - [ ] 0.8 Document admin page structure
    - Create admin pages documentation
    - Document permission requirements per page
    - Document API endpoints used
    - Create troubleshooting guide
    - _Requirements: Documentation_

### Public Pages Implementation

- [x] 1. Set up public components infrastructure
  - Create `/components/public/` directory structure
  - Set up shared types and interfaces for public components
  - Create base component templates (card, filter, search)
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 2. Create public API utilities
  - [x] 2.1 Create `/lib/api-public.ts` for public API calls
    - Implement `fetchRecentQuestions()` function
    - Implement `fetchExamPapers()` with filters
    - Implement `fetchInstitutions()` function
    - Add error handling and retry logic
    - _Requirements: 1.2, 2.2, 4.2_

  - [x] 2.2 Add caching layer for public APIs
    - Implement React Query setup for public pages
    - Configure cache times (5min for questions, 10min for papers)
    - Add stale-while-revalidate strategy
    - _Requirements: 8.1_

- [x] 3. Build landing page components
  - [x] 3.1 Create HeroSection component
    - Hero headline and tagline
    - Search bar with autocomplete
    - CTA button "Browse All Papers"
    - Platform statistics display
    - _Requirements: 1.1_

  - [x] 3.2 Create RecentQuestionsSection component
    - Fetch 6-10 most recent questions
    - Display QuestionCard components in grid
    - Show question preview (150 chars)
    - Add "View Full Question" button
    - Include exam paper metadata
    - _Requirements: 1.2_

  - [x] 3.3 Create QuestionCard component
    - Question text preview with truncation
    - Exam paper title and metadata
    - Institution name and year
    - Course/subject tags
    - Click handler for modal/expansion
    - _Requirements: 1.2_

  - [x] 3.4 Create QuestionModal component
    - Full question display
    - Question metadata (marks, difficulty)
    - "View Full Exam Paper" link
    - "Sign up to save" prompt
    - Close button
    - _Requirements: 1.3_

  - [x] 3.5 Create FeaturedInstitutionsSection component
    - Fetch top 6-8 institutions by paper count
    - Display InstitutionCard components
    - Show institution logo, name, paper count
    - "View Papers" link
    - _Requirements: 1.5_

  - [x] 3.6 Create StatsSection component
    - Display total papers count
    - Display total institutions count
    - Display total questions count
    - Animated counters on scroll
    - _Requirements: 1.1_

  - [x] 3.7 Integrate all sections into landing page
    - Compose all sections in proper order
    - Add spacing and layout
    - Implement scroll animations
    - Test responsive design
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 4. Implement sign-up prompt system
  - [x] 4.1 Create SignUpPrompt component
    - Modal/banner design
    - Multiple prompt types (view-answer, save-paper, time-based)
    - "Maybe later" dismiss button
    - Quick registration form
    - Social login options
    - _Requirements: 9.1, 9.2_

  - [x] 4.2 Create prompt tracking logic
    - Track question view count in localStorage
    - Track dismissed prompts
    - Implement trigger conditions (after 3-5 views)
    - Prevent repeated prompts
    - _Requirements: 1.4, 9.1_

  - [x] 4.3 Integrate prompts into question viewing
    - Show prompt after viewing threshold
    - Show prompt on "Show Answer" click
    - Show prompt on bookmark attempt
    - Track conversion events
    - _Requirements: 1.3, 1.4, 9.1_

- [x] 5. Build browse papers page
  - [x] 5.1 Create FilterSidebar component
    - Institution multi-select filter
    - Year range/multi-select filter
    - Course/subject multi-select filter
    - "Clear all filters" button
    - Active filter count badge
    - _Requirements: 2.1, 2.2_

  - [x] 5.2 Create SearchAndSort component
    - Search input with debounce
    - Sort dropdown (newest, oldest, popular, alphabetical)
    - View toggle (grid/list)
    - Results count display
    - _Requirements: 2.1, 2.3_

  - [x] 5.3 Create PaperCard component
    - Paper title and description
    - Institution logo and name
    - Course name and year
    - Question count and duration
    - Tags display
    - "View Paper" button
    - Bookmark icon (disabled for guests)
    - _Requirements: 2.4_

  - [x] 5.4 Implement browse page logic
    - Fetch papers with pagination
    - Apply filters and update URL params
    - Handle search queries
    - Implement sorting
    - Manage loading states
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 5.5 Add pagination component
    - Page numbers with ellipsis
    - Previous/Next buttons
    - Page size selector
    - Total items display
    - URL param sync
    - _Requirements: 2.1_

  - [x] 5.6 Implement mobile filter drawer
    - Slide-out drawer for filters
    - "Filters" button with badge
    - Touch-friendly controls
    - Apply/Clear buttons
    - _Requirements: 7.2_


- [-] 6. Build paper detail page
  - [x] 6.1 Create PaperHeader component
    - Paper title and full metadata
    - Institution and course info
    - Exam date and duration
    - Action buttons (Download, Print, Share, Save)
    - _Requirements: 3.1_

  - [x] 6.2 Create InstructionsSection component
    - Display exam instructions if available
    - Proper formatting and styling
    - Collapsible section
    - _Requirements: 3.1_

  - [x] 6.3 Create QuestionItem component
    - Question number and text
    - Marks allocated
    - Sub-questions display
    - Images/diagrams support
    - "Show Answer" button
    - _Requirements: 3.2_

  - [x] 6.4 Create QuestionsSection component
    - Organize questions by question sets
    - Section headers
    - Question numbering
    - Expandable/collapsible sections
    - _Requirements: 3.1, 3.2_

  <!-- - [ ] 6.5 Implement download PDF functionality
    - Generate PDF from paper data
    - Include all questions and formatting
    - Exclude answers for guests
    - Trigger browser download
    - _Requirements: 3.4_

  - [ ] 6.6 Implement share functionality
    - Share modal with options
    - Social media links (WhatsApp, Twitter, Facebook)
    - Copy link button
    - Email share option
    - Success feedback
    - _Requirements: 3.5_ -->

  <!-- - [ ] 6.7 Create RelatedPapersSection component
    - Fetch 4-6 related papers
    - Same institution or course
    - Display as PaperCard grid
    - "View More" link to filtered browse
    - _Requirements: 3.6_ -->

  - [x] 6.8 Integrate paper detail page
    - Fetch paper data by ID
    - Compose all sections
    - Handle loading states
    - Handle not found errors
    - Implement SSG with ISR
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 7. Build institutions directory
  - [x] 7.1 Create InstitutionCard component
    - Institution logo/image
    - Institution name and type
    - Location display
    - Paper count
    - "View Papers" button
    - _Requirements: 4.2_

  - [x] 7.2 Create institutions list page
    - Grid of institution cards
    - Search bar for institutions
    - Filter by type
    - Sort options (alphabetical, most papers)
    - Pagination
    - _Requirements: 4.1_

  - [x] 7.3 Create institution profile page
    - Institution header (logo, name, description)
    - Statistics section
    - Faculties/departments list
    - Papers section with filters
    - Contact information
    - _Requirements: 4.4_

  - [x] 7.4 Implement institution papers view
    - Filtered papers list for institution
    - Reuse browse page components
    - Pre-applied institution filter
    - Additional filters available
    - _Requirements: 4.4_

- [ ] 8. Build questions browser
  - [ ] 8.1 Create questions list page
    - List of all questions (paginated)
    - Filter sidebar (institution, course, year, type, marks)
    - Search bar for question text
    - Sort options
    - _Requirements: 5.1_

  - [ ] 8.2 Create question detail page
    - Full question display
    - All metadata
    - Related questions from same paper
    - Navigation to full exam paper
    - _Requirements: 5.3_

  - [ ] 8.3 Implement question filtering
    - Apply filters to question list
    - Update URL params
    - Handle search queries
    - Manage loading states
    - _Requirements: 5.1, 5.2_

- [ ] 9. Implement global search
  - [ ] 9.1 Create SearchBar component with suggestions
    - Search input with autocomplete
    - Dropdown suggestions
    - Category labels (Paper, Question, Institution)
    - Highlight matching text
    - Limit to 10 suggestions
    - _Requirements: 6.1_

  - [ ] 9.2 Create search results page
    - Tabbed results (All, Papers, Questions, Institutions)
    - Result count per category
    - Highlight matching terms
    - Pagination per tab
    - Filters relevant to each category
    - _Requirements: 6.2, 6.3_

  - [ ] 9.3 Implement search API integration
    - Fetch search suggestions
    - Fetch full search results
    - Handle empty results
    - Provide search suggestions
    - _Requirements: 6.1, 6.2_

- [ ] 10. Implement SEO optimization
  - [ ] 10.1 Add dynamic metadata generation
    - Page titles with keywords
    - Meta descriptions
    - Keywords meta tags
    - Canonical URLs
    - _Requirements: 8.2_

  - [ ] 10.2 Add Open Graph tags
    - og:title, og:description, og:image
    - og:type for different page types
    - Twitter Card metadata
    - Social sharing previews
    - _Requirements: 8.3_

  - [ ] 10.3 Implement structured data
    - Schema.org JSON-LD for papers
    - EducationalResource schema
    - Organization schema for institutions
    - BreadcrumbList schema
    - _Requirements: 8.2_

  - [ ] 10.4 Generate sitemap
    - Dynamic sitemap.xml generation
    - Include all public pages
    - Set priorities and change frequencies
    - Update on content changes
    - _Requirements: 8.2_

  - [ ] 10.5 Add robots.txt
    - Allow crawling of public pages
    - Disallow admin/student areas
    - Link to sitemap
    - _Requirements: 8.2_

- [ ] 11. Implement performance optimizations
  - [ ] 11.1 Set up image optimization
    - Use Next.js Image component
    - Lazy loading for below-fold images
    - WebP format with fallback
    - Blur placeholders
    - _Requirements: 8.1_

  - [ ] 11.2 Implement code splitting
    - Dynamic imports for heavy components
    - Route-based splitting
    - Component-level splitting
    - Loading states for dynamic imports
    - _Requirements: 8.1_

  - [ ] 11.3 Add skeleton loaders
    - Loading skeletons for all major components
    - Match component layout
    - Smooth transitions
    - _Requirements: 8.1_

  - [ ] 11.4 Configure caching strategy
    - API response caching
    - Static asset caching
    - Service worker (optional)
    - Cache invalidation strategy
    - _Requirements: 8.1_

- [ ] 12. Implement responsive design
  - [ ] 12.1 Mobile layout for landing page
    - Single column layout
    - Touch-friendly buttons
    - Optimized images
    - Hamburger menu
    - _Requirements: 7.1_

  - [ ] 12.2 Mobile layout for browse page
    - Filter drawer
    - Single column grid
    - Touch-friendly filters
    - Optimized pagination
    - _Requirements: 7.2_

  - [ ] 12.3 Mobile layout for paper detail
    - Single column questions
    - Readable font sizes
    - Optimized images
    - Sticky action buttons
    - _Requirements: 7.3_

  - [ ] 12.4 Test across devices
    - Test on mobile (iOS, Android)
    - Test on tablet
    - Test on desktop
    - Test different screen sizes
    - _Requirements: 7.1_

- [ ] 13. Add analytics and tracking
  - [ ] 13.1 Set up analytics integration
    - Google Analytics or privacy-friendly alternative
    - Event tracking setup
    - Respect Do Not Track
    - GDPR compliance
    - _Requirements: 10.1, 10.2_

  - [ ] 13.2 Track key events
    - Page views
    - Search queries
    - Filter usage
    - Question views
    - Sign-up prompt displays
    - Conversion events
    - _Requirements: 10.1_

  - [ ] 13.3 Create analytics dashboard
    - Most viewed papers
    - Most searched terms
    - Popular institutions
    - Conversion funnel
    - User journey visualization
    - _Requirements: 10.3_

- [ ] 14. Testing and quality assurance
  - [ ] 14.1 Write unit tests
    - Component tests (QuestionCard, PaperCard, etc.)
    - API utility tests
    - Filter logic tests
    - Search logic tests
    - _Requirements: All_

  - [ ] 14.2 Write integration tests
    - Landing page flow
    - Browse and filter flow
    - Paper detail view flow
    - Search flow
    - _Requirements: All_

  - [ ] 14.3 Write E2E tests
    - Complete guest user journey
    - Browse to paper detail
    - Search and find papers
    - Sign-up prompt flow
    - _Requirements: All_

  - [ ] 14.4 Accessibility testing
    - Keyboard navigation
    - Screen reader compatibility
    - ARIA labels
    - Color contrast
    - _Requirements: 7.1_

  - [ ] 14.5 Performance testing
    - Lighthouse audits
    - Core Web Vitals
    - Load time testing
    - Mobile performance
    - _Requirements: 8.1_

- [ ] 15. Documentation and deployment
  - [ ] 15.1 Write component documentation
    - Document all public components
    - Usage examples
    - Props documentation
    - Storybook stories (optional)
    - _Requirements: All_

  - [ ] 15.2 Update README
    - Project overview
    - Setup instructions
    - Development guide
    - Deployment guide
    - _Requirements: All_

  - [ ] 15.3 Create deployment checklist
    - Environment variables
    - Build configuration
    - CDN setup
    - Monitoring setup
    - _Requirements: All_

  - [ ] 15.4 Deploy to staging
    - Build and deploy
    - Smoke testing
    - Performance check
    - SEO validation
    - _Requirements: All_

  - [ ] 15.5 Deploy to production
    - Final build
    - Deploy with zero downtime
    - Monitor for errors
    - Verify analytics
    - _Requirements: All_

## Notes

- Each task should be completed and tested before moving to the next
- Tasks can be worked on in parallel where there are no dependencies
- All components should be mobile-responsive from the start
- SEO considerations should be built in, not added later
- Performance optimization should be ongoing, not just at the end
- User feedback should be gathered after each major milestone

## Success Criteria

- ✅ Landing page loads in < 2 seconds
- ✅ Lighthouse score > 90
- ✅ All pages are mobile-responsive
- ✅ SEO meta tags on all pages
- ✅ Guest users can browse without login
- ✅ Sign-up prompts are non-intrusive
- ✅ All major browsers supported
- ✅ Accessibility score > 90
