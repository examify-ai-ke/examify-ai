# Requirements Document

## Introduction

This specification outlines the implementation of Phase 1 of the Exampapel public-facing features, focusing on creating a compelling landing page that showcases recent exam questions and a comprehensive browse experience for exam papers. The primary goal is to allow end users (students) to discover and revise past exam papers without requiring authentication, while encouraging sign-up for enhanced features.

## Requirements

### Requirement 1: Public Landing Page with Recent Questions Preview

**User Story:** As a guest visitor, I want to see recent exam questions on the landing page, so that I can quickly assess the value of the platform and start my revision immediately.

#### Acceptance Criteria

1. WHEN a guest user visits the homepage ("/") THEN the system SHALL display a hero section with:
   - Platform title and tagline
   - Search bar for quick paper/question search
   - Call-to-action button "Browse All Papers"
   - Statistics (total papers, institutions, questions)

2. WHEN the landing page loads THEN the system SHALL display a "Recent Questions" section showing:
   - 6-10 most recently added questions
   - Question text preview (first 150 characters)
   - Associated exam paper title
   - Institution name
   - Year of exam
   - Subject/course tags
   - "View Full Question" button

3. WHEN a guest user clicks on a question preview THEN the system SHALL:
   - Display the full question in a modal or expanded view
   - Show question metadata (marks, difficulty, exam paper)
   - Provide a "View Full Exam Paper" link
   - Show a "Sign up to save questions" prompt

4. WHEN a guest user has viewed 3-5 questions THEN the system SHALL:
   - Display a soft prompt encouraging sign-up
   - Highlight benefits (save questions, track progress, personalized recommendations)
   - Allow continued browsing without forcing registration

5. WHEN the landing page loads THEN the system SHALL display a "Featured Institutions" section showing:
   - 6-8 top institutions with most papers
   - Institution logo/image
   - Institution name
   - Number of available papers
   - "View Papers" link

### Requirement 2: Public Browse Papers Page

**User Story:** As a guest user, I want to browse all available exam papers with filters, so that I can find relevant study materials for my revision.

#### Acceptance Criteria

1. WHEN a user navigates to "/browse" THEN the system SHALL display:
   - Grid/list view toggle
   - All exam papers (paginated, 20 per page)
   - Filter sidebar with options for:
     - Institution (multi-select)
     - Year (range slider or multi-select)
     - Course/Subject (multi-select)
     - Difficulty level (if available)
   - Search bar for text search
   - Sort options (newest, oldest, most popular, alphabetical)

2. WHEN a user applies filters THEN the system SHALL:
   - Update results in real-time without page reload
   - Display result count
   - Maintain filter state in URL query parameters
   - Show "Clear all filters" button when filters are active

3. WHEN a user searches for papers THEN the system SHALL:
   - Search across paper titles, descriptions, institutions, courses
   - Highlight matching terms in results
   - Show search suggestions as user types
   - Display "No results found" message with suggestions if no matches

4. WHEN displaying exam papers THEN each paper card SHALL show:
   - Paper title
   - Institution name and logo
   - Course name
   - Year of exam
   - Number of questions
   - Exam duration
   - Tags
   - "View Paper" button
   - Bookmark icon (disabled for guests, with tooltip "Sign in to save")

5. WHEN a user clicks "View Paper" THEN the system SHALL navigate to the paper detail page

### Requirement 3: Exam Paper Detail Page

**User Story:** As a guest user, I want to view complete exam paper details including all questions, so that I can study and practice for my exams.

#### Acceptance Criteria

1. WHEN a user navigates to "/browse/[paper-id]" THEN the system SHALL display:
   - Paper title and metadata (institution, course, year, duration)
   - Exam instructions (if available)
   - All questions organized by sections/question sets
   - Download PDF button
   - Print button
   - Share button (social media, copy link)
   - "Related Papers" section at bottom

2. WHEN displaying questions THEN each question SHALL show:
   - Question number
   - Question text (with proper formatting)
   - Marks allocated
   - Sub-questions (if any)
   - Images/diagrams (if any)
   - "Show Answer" button (if answers available)

3. WHEN a guest user clicks "Show Answer" THEN the system SHALL:
   - Display a modal prompting sign-up
   - Show message: "Sign up to view answers and solutions"
   - Provide quick registration form
   - Allow closing modal to continue browsing

4. WHEN a user clicks "Download PDF" THEN the system SHALL:
   - Generate PDF of the exam paper
   - Include all questions and formatting
   - Exclude answers (for guests)
   - Trigger browser download

5. WHEN a user clicks "Share" THEN the system SHALL:
   - Display share options (WhatsApp, Twitter, Facebook, Email, Copy Link)
   - Generate shareable link with paper metadata
   - Show success message when link copied

6. WHEN displaying "Related Papers" THEN the system SHALL show:
   - 4-6 papers from same institution or course
   - Same layout as browse page cards
   - "View More" link to browse page with pre-applied filters

### Requirement 4: Public Institutions Directory

**User Story:** As a guest user, I want to browse institutions and see their available exam papers, so that I can find papers specific to my university.

#### Acceptance Criteria

1. WHEN a user navigates to "/institutions" THEN the system SHALL display:
   - Grid of all institutions (paginated)
   - Search bar for institution names
   - Filter by institution type (University, College, etc.)
   - Sort options (alphabetical, most papers)

2. WHEN displaying institutions THEN each institution card SHALL show:
   - Institution logo/image
   - Institution name
   - Institution type
   - Location
   - Number of available papers
   - "View Papers" button

3. WHEN a user clicks on an institution THEN the system SHALL navigate to "/institutions/[slug]"

4. WHEN a user views an institution profile ("/institutions/[slug]") THEN the system SHALL display:
   - Institution header (logo, name, description)
   - Statistics (total papers, faculties, courses)
   - List of available exam papers (filtered to this institution)
   - Faculties/departments list
   - Contact information (if available)

### Requirement 5: Public Questions Browser

**User Story:** As a guest user, I want to browse individual questions across all papers, so that I can practice specific topics or question types.

#### Acceptance Criteria

1. WHEN a user navigates to "/questions" THEN the system SHALL display:
   - List of all questions (paginated, 30 per page)
   - Filter sidebar with options for:
     - Institution
     - Course/Subject
     - Year
     - Question type (essay, multiple choice, etc.)
     - Marks range
   - Search bar for question text
   - Sort options (newest, marks, difficulty)

2. WHEN displaying questions THEN each question card SHALL show:
   - Question text preview (first 200 characters)
   - Associated exam paper title
   - Institution and course
   - Year
   - Marks
   - "View Full Question" button

3. WHEN a user clicks "View Full Question" THEN the system SHALL:
   - Navigate to "/questions/[question-id]"
   - Display full question with all details
   - Show related questions from same paper
   - Provide navigation to full exam paper

### Requirement 6: Search Functionality

**User Story:** As a guest user, I want to search across all content (papers, questions, institutions), so that I can quickly find what I need.

#### Acceptance Criteria

1. WHEN a user types in the global search bar THEN the system SHALL:
   - Show search suggestions dropdown
   - Include suggestions from papers, questions, institutions
   - Highlight matching text
   - Show category labels (Paper, Question, Institution)
   - Limit to 10 suggestions

2. WHEN a user submits a search query THEN the system SHALL:
   - Navigate to "/search?q=[query]"
   - Display tabbed results (All, Papers, Questions, Institutions)
   - Show result count for each category
   - Highlight matching terms in results
   - Provide filters relevant to each category

3. WHEN displaying search results THEN the system SHALL:
   - Show most relevant results first
   - Include pagination
   - Display "No results" message with suggestions if no matches
   - Provide "Clear search" button

### Requirement 7: Responsive Design and Mobile Experience

**User Story:** As a mobile user, I want the public pages to work seamlessly on my phone, so that I can study on the go.

#### Acceptance Criteria

1. WHEN a user accesses any public page on mobile THEN the system SHALL:
   - Display mobile-optimized layout
   - Use responsive grid (1 column on mobile, 2-3 on tablet, 3-4 on desktop)
   - Show hamburger menu for navigation
   - Ensure touch-friendly buttons (min 44x44px)
   - Optimize images for mobile bandwidth

2. WHEN a user views filters on mobile THEN the system SHALL:
   - Display filters in a slide-out drawer
   - Show "Filters" button with active filter count badge
   - Allow easy filter selection with large touch targets
   - Provide "Apply" and "Clear" buttons

3. WHEN a user views questions on mobile THEN the system SHALL:
   - Display questions in single column
   - Ensure readable font sizes (min 16px)
   - Optimize images to fit screen width
   - Provide easy scrolling and navigation

### Requirement 8: Performance and SEO

**User Story:** As a platform owner, I want public pages to load quickly and rank well in search engines, so that we attract more users.

#### Acceptance Criteria

1. WHEN a public page loads THEN the system SHALL:
   - Achieve Lighthouse performance score > 90
   - Display initial content within 2 seconds
   - Use lazy loading for images below fold
   - Implement skeleton loaders for async content
   - Cache static content aggressively

2. WHEN search engines crawl public pages THEN the system SHALL:
   - Provide proper meta tags (title, description, keywords)
   - Include Open Graph tags for social sharing
   - Generate dynamic sitemap.xml
   - Use semantic HTML structure
   - Provide alt text for all images
   - Implement structured data (Schema.org)

3. WHEN sharing links on social media THEN the system SHALL:
   - Display rich previews with image, title, description
   - Use appropriate og:image for each page type
   - Include Twitter Card metadata

### Requirement 9: Guest User Engagement and Conversion

**User Story:** As a platform owner, I want to encourage guest users to sign up, so that we can build an engaged user base.

#### Acceptance Criteria

1. WHEN a guest user performs certain actions THEN the system SHALL display sign-up prompts:
   - After viewing 5 questions: "Sign up to track your progress"
   - When clicking "Save" or "Bookmark": "Sign up to save papers"
   - When clicking "Show Answer": "Sign up to view answers"
   - After 10 minutes on site: "Sign up to get personalized recommendations"

2. WHEN displaying sign-up prompts THEN the system SHALL:
   - Use non-intrusive modals or banners
   - Provide "Maybe later" or "Continue browsing" option
   - Highlight key benefits (save papers, track progress, answers)
   - Include social login options (Google, Facebook)
   - Remember dismissed prompts (don't show same prompt repeatedly)

3. WHEN a guest user signs up THEN the system SHALL:
   - Redirect to student dashboard
   - Show welcome message
   - Offer quick tour of features
   - Pre-populate saved papers if they bookmarked any as guest (using session)

### Requirement 10: Analytics and Tracking

**User Story:** As a platform owner, I want to track user behavior on public pages, so that I can optimize the experience and improve conversion.

#### Acceptance Criteria

1. WHEN users interact with public pages THEN the system SHALL track:
   - Page views (landing, browse, paper details)
   - Search queries and result clicks
   - Filter usage
   - Question views
   - Sign-up prompt displays and conversions
   - Time spent on pages
   - Bounce rate

2. WHEN tracking events THEN the system SHALL:
   - Use privacy-friendly analytics (no PII)
   - Respect Do Not Track headers
   - Provide opt-out mechanism
   - Comply with GDPR/privacy regulations
   - Store analytics data securely

3. WHEN generating reports THEN the system SHALL provide:
   - Most viewed papers
   - Most searched terms
   - Popular institutions
   - Conversion funnel metrics
   - User journey visualization
