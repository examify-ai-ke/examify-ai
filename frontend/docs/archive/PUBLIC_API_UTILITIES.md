# Public API Utilities Documentation

## Overview

Created `src/lib/api-public.ts` - A comprehensive API utility module for public/guest users to browse exam papers, questions, and institutions without authentication.

---

## Features

### ✅ Type-Safe API Calls
- All functions use generated TypeScript types from OpenAPI schema
- Proper error handling with typed responses
- Consistent response structure across all endpoints

### ✅ No Authentication Required
- All endpoints are public and don't require login
- Perfect for guest browsing experience
- Enables SEO-friendly public pages

### ✅ Helper Functions
- `extractItems()` - Safely extract items from paginated responses
- `extractTotal()` - Safely extract total count
- `extractPagination()` - Extract full pagination metadata

---

## API Structure

```typescript
export const publicAPI = {
    examPapers: { ... },    // Exam papers browsing
    questions: { ... },      // Questions browsing
    institutions: { ... },   // Institutions directory
    courses: { ... },        // Courses listing
    stats: { ... },          // Platform statistics
};
```

---

## Exam Papers API

### `publicAPI.examPapers.list(filters?)`

Fetch exam papers with optional pagination.

**Parameters:**
```typescript
interface ExamPaperFilters {
    limit?: number;      // Default: 20
    skip?: number;       // Default: 0
}
```

**Returns:**
```typescript
{
    data: ExamPaperRead[];
    total: number;
    pagination: {
        page: number;
        size: number;
        pages: number;
        total: number;
        previous_page?: number;
        next_page?: number;
    };
    error?: any;
}
```

**Example:**
```typescript
const { data, total, pagination } = await publicAPI.examPapers.list({
    limit: 20,
    skip: 0
});
```

---

### `publicAPI.examPapers.search(filters)`

Search exam papers with advanced filters.

**Parameters:**
```typescript
interface ExamPaperFilters {
    search?: string;           // Search query
    institution_id?: string;   // Filter by institution
    course_id?: string;        // Filter by course
    year?: string;             // Filter by year
    tags?: string[];           // Filter by tags
    limit?: number;            // Results per page
    skip?: number;             // Offset
    sort_by?: 'created_at' | 'title' | 'year_of_exam';
    sort_order?: 'asc' | 'desc';
}
```

**Example:**
```typescript
const { data, total } = await publicAPI.examPapers.search({
    search: 'computer science',
    institution_id: 'uuid-here',
    year: '2023',
    sort_by: 'created_at',
    sort_order: 'desc',
    limit: 20
});
```

---

### `publicAPI.examPapers.getById(paperId)`

Get a single exam paper by ID.

**Example:**
```typescript
const { data, error } = await publicAPI.examPapers.getById('paper-uuid');
if (data) {
    console.log(data.title, data.questions);
}
```

---

### `publicAPI.examPapers.getBySlug(slug)`

Get a single exam paper by slug (SEO-friendly).

**Example:**
```typescript
const { data } = await publicAPI.examPapers.getBySlug('cs101-2023-final');
```

---

### `publicAPI.examPapers.getRecent(limit?)`

Get recent exam papers (for landing page).

**Example:**
```typescript
const { data } = await publicAPI.examPapers.getRecent(10);
// Returns 10 most recent papers
```

---

## Questions API

### `publicAPI.questions.getRecent(limit?)`

Fetch recent questions for landing page.

**Example:**
```typescript
const { data, total } = await publicAPI.questions.getRecent(10);
// Perfect for "Recent Questions" section on landing page
```

---

### `publicAPI.questions.search(filters)`

Search questions with filters.

**Parameters:**
```typescript
interface QuestionFilters {
    search?: string;
    exam_paper_id?: string;
    question_set_id?: string;
    limit?: number;
    skip?: number;
}
```

**Example:**
```typescript
const { data, pagination } = await publicAPI.questions.search({
    search: 'algorithm',
    exam_paper_id: 'paper-uuid',
    limit: 20
});
```

---

### `publicAPI.questions.getById(questionId)`

Get a single question by ID.

**Example:**
```typescript
const { data } = await publicAPI.questions.getById('question-uuid');
```

---

## Institutions API

### `publicAPI.institutions.list(filters?)`

Fetch institutions with pagination.

**Parameters:**
```typescript
interface InstitutionFilters {
    search?: string;
    institution_type?: 'Public' | 'Private' | 'Other';
    location?: string;
    limit?: number;
    skip?: number;
}
```

**Example:**
```typescript
const { data, total } = await publicAPI.institutions.list({
    limit: 20,
    skip: 0
});
```

---

### `publicAPI.institutions.search(filters)`

Search institutions with advanced filters.

**Example:**
```typescript
const { data } = await publicAPI.institutions.search({
    search: 'university',
    institution_type: 'Public',
    location: 'Lagos',
    limit: 20
});
```

---

### `publicAPI.institutions.getById(institutionId)`

Get a single institution by ID.

**Example:**
```typescript
const { data } = await publicAPI.institutions.getById('institution-uuid');
```

---

### `publicAPI.institutions.getBySlug(slug)`

Get a single institution by slug.

**Example:**
```typescript
const { data } = await publicAPI.institutions.getBySlug('university-of-lagos');
```

---

### `publicAPI.institutions.getFeatured(limit?)`

Get featured institutions (sorted by paper count).

**Example:**
```typescript
const { data } = await publicAPI.institutions.getFeatured(8);
// Perfect for landing page "Featured Institutions" section
```

---

## Courses API

### `publicAPI.courses.list(filters?)`

Fetch courses with pagination.

**Example:**
```typescript
const { data, total } = await publicAPI.courses.list({
    limit: 20,
    skip: 0
});
```

---

### `publicAPI.courses.getById(courseId)`

Get a single course by ID.

**Example:**
```typescript
const { data } = await publicAPI.courses.getById('course-uuid');
```

---

## Statistics API

### `publicAPI.stats.getPlatformStats()`

Get platform-wide statistics for landing page.

**Returns:**
```typescript
{
    data: {
        totalPapers: number;
        totalInstitutions: number;
        totalQuestions: number;
    };
    error?: any;
}
```

**Example:**
```typescript
const { data } = await publicAPI.stats.getPlatformStats();
console.log(`${data.totalPapers} papers from ${data.totalInstitutions} institutions`);
```

---

## Error Handling

All functions follow a consistent error handling pattern:

```typescript
const { data, error } = await publicAPI.examPapers.getById('invalid-id');

if (error) {
    console.error('Failed to fetch paper:', error);
    // Handle error (show toast, redirect, etc.)
} else {
    // Use data
    console.log(data);
}
```

**Error Response Structure:**
```typescript
{
    data: null | [],
    total: 0,
    error: {
        status: number;
        message: string;
        // ... other error details
    }
}
```

---

## Usage Examples

### Landing Page - Recent Questions Section

```typescript
import { publicAPI } from '@/lib/api-public';

export default async function LandingPage() {
    const { data: recentQuestions } = await publicAPI.questions.getRecent(10);
    const { data: stats } = await publicAPI.stats.getPlatformStats();
    
    return (
        <div>
            <h1>Browse {stats.totalPapers} Exam Papers</h1>
            <RecentQuestionsSection questions={recentQuestions} />
        </div>
    );
}
```

---

### Browse Papers Page

```typescript
'use client';

import { useState, useEffect } from 'react';
import { publicAPI } from '@/lib/api-public';

export default function BrowsePage() {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        institution_id: '',
        year: '',
        limit: 20,
        skip: 0
    });

    useEffect(() => {
        async function loadPapers() {
            setLoading(true);
            const { data, total, pagination } = await publicAPI.examPapers.search(filters);
            setPapers(data);
            setLoading(false);
        }
        loadPapers();
    }, [filters]);

    return (
        <div>
            <FilterSidebar onFilterChange={setFilters} />
            <PaperGrid papers={papers} loading={loading} />
        </div>
    );
}
```

---

### Paper Detail Page (SSG with ISR)

```typescript
import { publicAPI } from '@/lib/api-public';

export async function generateStaticParams() {
    // Generate static pages for top papers
    const { data: papers } = await publicAPI.examPapers.getRecent(100);
    return papers.map(paper => ({ id: paper.id }));
}

export default async function PaperPage({ params }: { params: { id: string } }) {
    const { data: paper, error } = await publicAPI.examPapers.getById(params.id);
    
    if (error || !paper) {
        return <NotFound />;
    }
    
    return (
        <div>
            <h1>{paper.title}</h1>
            <QuestionsSection questions={paper.questions} />
        </div>
    );
}

// Revalidate every 1 hour
export const revalidate = 3600;
```

---

### Institutions Directory

```typescript
import { publicAPI } from '@/lib/api-public';

export default async function InstitutionsPage() {
    const { data: institutions, total } = await publicAPI.institutions.list({
        limit: 50
    });
    
    return (
        <div>
            <h1>{total} Institutions</h1>
            <InstitutionGrid institutions={institutions} />
        </div>
    );
}
```

---

## Type Definitions

All types are imported from the generated API schema:

```typescript
import type { components } from '@/types/generated/api';

export type ExamPaperRead = components['schemas']['ExamPaperRead'];
export type InstitutionRead = components['schemas']['InstitutionRead'];
export type QuestionRead = components['schemas']['QuestionRead'];
export type CourseRead = components['schemas']['CourseRead'];
export type ModuleRead = components['schemas']['ModuleRead'];
```

---

## Performance Considerations

### Caching Strategy

For optimal performance, implement caching:

```typescript
// Next.js App Router - Server Component
export const revalidate = 3600; // Revalidate every hour

// React Query - Client Component
const { data } = useQuery({
    queryKey: ['papers', filters],
    queryFn: () => publicAPI.examPapers.search(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Pagination

Always use pagination for large datasets:

```typescript
// Good ✅
const { data } = await publicAPI.examPapers.list({ limit: 20, skip: 0 });

// Bad ❌ - Don't fetch all at once
const { data } = await publicAPI.examPapers.list({ limit: 10000 });
```

---

## Next Steps

With the public API utilities in place, you can now:

1. ✅ **Task 3.1-3.7**: Build landing page components
2. ✅ **Task 5.1-5.6**: Build browse papers page
3. ✅ **Task 6.1-6.8**: Build paper detail page
4. ✅ **Task 7.1-7.4**: Build institutions directory
5. ✅ **Task 8.1-8.3**: Build questions browser

---

## Testing

### Manual Testing

```bash
# Start the development server
npm run dev

# Test in browser console
import { publicAPI } from '@/lib/api-public';

// Test fetching papers
const papers = await publicAPI.examPapers.list({ limit: 5 });
console.log(papers);

// Test search
const results = await publicAPI.examPapers.search({ search: 'math' });
console.log(results);

// Test stats
const stats = await publicAPI.stats.getPlatformStats();
console.log(stats);
```

### Unit Tests (Future)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { publicAPI } from '@/lib/api-public';

describe('publicAPI.examPapers', () => {
    it('should fetch papers list', async () => {
        const { data, total } = await publicAPI.examPapers.list({ limit: 10 });
        expect(Array.isArray(data)).toBe(true);
        expect(typeof total).toBe('number');
    });
});
```

---

## Files Created

- **src/lib/api-public.ts** - Public API utilities (new)
- **PUBLIC_API_UTILITIES.md** - This documentation (new)

---

## Status

✅ **COMPLETE** - Public API utilities are ready for use!

The foundation is now in place for building all public-facing pages:
- Landing page
- Browse papers page
- Paper detail pages
- Institutions directory
- Questions browser
- Search functionality

---

**Created**: 2025-10-06
**Status**: ✅ READY FOR USE
