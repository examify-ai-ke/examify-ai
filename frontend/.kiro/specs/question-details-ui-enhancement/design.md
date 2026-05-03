# Design Document: Question Details UI Enhancement

## Overview

This design document outlines the UI/UX improvements for the question details page (`/questions/[id]`). The enhancement focuses on creating a lighter, more balanced visual design while improving content layout and maintaining all existing functionality. The changes will transform the current dark hero section into a lighter, more inviting interface and optimize content width utilization for better readability.

## Architecture

### Component Structure

The question details page consists of the following component hierarchy:

```
QuestionDetailsPage (src/app/(public)/questions/[id]/page.tsx)
└── QuestionDetailsContent (src/components/public/question-details-content.tsx)
    ├── Hero Section
    │   ├── Breadcrumb Navigation
    │   ├── Question Metadata (badges, institution, marks)
    │   ├── Question Number Badge
    │   ├── Question Text Display
    │   └── Action Buttons (Share, Bookmark)
    ├── Answers Section
    │   └── EnhancedAnswerDisplay (multiple instances)
    │       ├── Answer Header (author, verification badge)
    │       ├── Answer Content (EditorRenderer)
    │       ├── Interaction Buttons (like, dislike, comment)
    │       └── Comments Section (conditional)
    └── Navigation Section (Previous/Next Questions)
```

### Design Approach

The design follows a **progressive enhancement** strategy:
1. Maintain existing component structure and functionality
2. Update styling through Tailwind CSS class modifications
3. Preserve responsive behavior across all breakpoints
4. Ensure accessibility standards remain intact

## Components and Interfaces

### 1. Hero Section Redesign

**Current State:**
- Background: `bg-slate-900` (very dark)
- Text: Light colors (white, slate-300)
- Padding: `pt-16 pb-24 sm:pt-20 sm:pb-32` (excessive vertical space)
- Effects: Gradient blurs and grid overlay

**New Design:**
```typescript
// Color Scheme
background: 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
text: 'text-slate-900' (primary), 'text-slate-600' (secondary)
borders: 'border-slate-200'

// Spacing
padding: 'pt-8 pb-12 sm:pt-12 sm:pb-16' (reduced by ~40%)

// Visual Effects
- Remove dark gradient blurs
- Add subtle border-bottom for separation
- Use lighter accent colors (teal-500, blue-500)
```

**Question Number Badge:**
```typescript
// Maintain gradient but adjust for light background
className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 
            text-white font-bold text-2xl shadow-lg"
```

**Metadata Badges:**
```typescript
// Exam Paper Badge
className: "bg-slate-100 border-slate-300 text-slate-700"

// Institution Badge
className: "bg-teal-50 text-teal-700 border-teal-200"

// Marks Badge
className: "bg-orange-500 text-white"
```

### 2. Layout Container Optimization

**Current State:**
- Max width: `max-w-4xl` (896px)
- Creates excessive whitespace on large screens

**New Design:**
```typescript
// Responsive container widths
className: "container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"

// Breakpoint behavior:
// - Mobile (< 640px): Full width with 1rem padding
// - Tablet (640px - 1024px): Constrained with 1.5rem padding
// - Desktop (> 1024px): Max 1280px with 2rem padding
```

### 3. Content Area Improvements

**Answer Cards:**
```typescript
// Enhanced visual separation
className: "rounded-xl border border-slate-200 bg-white shadow-sm 
            hover:shadow-md transition-shadow"

// Verified answer styling
verifiedClassName: "border-emerald-200 bg-emerald-50/30"

// Spacing
padding: "p-6 sm:p-8"
gap: "space-y-6" (between answers)
```

**Section Headers:**
```typescript
// Consistent typography hierarchy
h2: "text-2xl font-bold text-slate-900"
h3: "text-lg font-semibold text-slate-800"

// Visual accent
decorativeBar: "w-1 h-8 bg-gradient-to-b from-teal-500 to-blue-600 rounded-full"
```

### 4. Navigation Elements

**Previous/Next Navigation:**
```typescript
// Card styling for better visibility
className: "rounded-xl border-2 border-slate-200 bg-white p-6 
            hover:border-teal-400 hover:shadow-lg transition-all"

// Icon containers
iconClassName: "w-12 h-12 rounded-xl bg-slate-50 
                group-hover:bg-teal-50 transition-colors"
```

## Data Models

No changes to data models are required. The component continues to use the existing API response types:

```typescript
interface Question {
  id: string;
  question_number: string;
  text: string | OutputData;
  marks?: number;
  exam_paper?: {
    id: string;
    identifying_name: string;
    slug: string;
  };
  institution?: {
    id: string;
    name: string;
  };
  answers?: Answer[];
  created_at: string;
}

interface Answer {
  id: string;
  text: string | OutputData;
  created_by?: User;
  likes: number;
  dislikes: number;
  is_accepted: boolean;
  reviewed: boolean;
  created_at: string;
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: No Horizontal Overflow

*For any* viewport width between 320px and 2560px, the question details page should not produce horizontal scrolling, ensuring all content remains visible within the viewport bounds.

**Validates: Requirements 4.2**

### Property 2: Minimum Touch Target Size

*For any* interactive button or link element on the question details page, the element should have a minimum touch target size of 44x44 pixels to ensure accessibility and usability on touch devices.

**Validates: Requirements 4.4**

## Error Handling

### Styling Fallbacks

The component maintains existing error handling for data loading:

```typescript
// Missing question data
if (error || !question) {
  return <ErrorDisplay message={error} />;
}

// Missing metadata (graceful degradation)
const examPaperName = question.exam_paper?.identifying_name || 'Exam Paper';
const institutionName = question.institution?.name;
```

### Responsive Behavior

The design uses Tailwind's responsive utilities to ensure graceful degradation:

```typescript
// Mobile-first approach with progressive enhancement
className: "pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20"

// Container adapts to viewport
className: "container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
```

### Browser Compatibility

All styling changes use standard CSS properties supported across modern browsers:
- Flexbox for layout
- CSS Grid where appropriate
- Tailwind CSS classes (compiled to standard CSS)
- No experimental features or vendor prefixes required

## Testing Strategy

### Unit Tests

Unit tests will verify specific styling and functional requirements:

1. **Hero Section Styling**
   - Verify background color classes are applied correctly
   - Check that text color classes provide sufficient contrast
   - Validate padding reduction from previous values

2. **Layout Container**
   - Verify max-width class is updated to `max-w-7xl`
   - Check responsive padding classes at different breakpoints

3. **Component Rendering**
   - Ensure all metadata badges render when data is present
   - Verify question text renders correctly (both string and EditorJS formats)
   - Check that navigation links are present when siblings exist

4. **Functional Preservation**
   - Test that like/dislike buttons trigger correct handlers
   - Verify comment form submission works
   - Check that previous/next navigation links are correct

### Property-Based Tests

Property tests will verify universal behaviors across various inputs:

1. **Property 1: No Horizontal Overflow**
   - Generate random viewport widths (320px - 2560px)
   - Render component with various question data
   - Assert that `document.body.scrollWidth <= window.innerWidth`
   - Run with minimum 100 iterations
   - **Tag: Feature: question-details-ui-enhancement, Property 1: No horizontal overflow**

2. **Property 2: Minimum Touch Target Size**
   - Query all interactive elements (buttons, links)
   - For each element, measure computed width and height
   - Assert that `width >= 44 && height >= 44`
   - Run with minimum 100 iterations across different data sets
   - **Tag: Feature: question-details-ui-enhancement, Property 2: Minimum touch target size**

### Visual Regression Testing

While not automated in this spec, visual regression testing is recommended:
- Capture screenshots at key breakpoints (mobile, tablet, desktop)
- Compare before/after styling changes
- Verify color contrast ratios meet WCAG AA standards (4.5:1 for normal text)

### Manual Testing Checklist

1. **Visual Verification**
   - [ ] Hero section uses lighter background
   - [ ] Text is readable with good contrast
   - [ ] Content width is optimized on large screens
   - [ ] Spacing feels balanced throughout

2. **Responsive Testing**
   - [ ] Test on mobile (320px, 375px, 414px widths)
   - [ ] Test on tablet (768px, 1024px widths)
   - [ ] Test on desktop (1280px, 1920px widths)
   - [ ] Verify no horizontal scrolling at any width

3. **Functional Testing**
   - [ ] All buttons and links work correctly
   - [ ] Like/dislike functionality preserved
   - [ ] Comment system works as before
   - [ ] Previous/next navigation functions correctly

4. **Accessibility Testing**
   - [ ] Keyboard navigation works
   - [ ] Screen reader announces content correctly
   - [ ] Color contrast meets WCAG AA standards
   - [ ] Touch targets are adequately sized

## Implementation Notes

### CSS Class Changes Summary

**Hero Section:**
```diff
- className="bg-slate-900"
+ className="bg-gradient-to-br from-slate-50 via-white to-slate-100 border-b border-slate-200"

- className="text-white"
+ className="text-slate-900"

- className="text-slate-400"
+ className="text-slate-600"

- className="pt-16 pb-24 sm:pt-20 sm:pb-32"
+ className="pt-8 pb-12 sm:pt-12 sm:pb-16"
```

**Layout Container:**
```diff
- className="container mx-auto max-w-4xl px-4 sm:px-6"
+ className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
```

**Badges:**
```diff
- className="bg-white/5 border-white/10 text-slate-300"
+ className="bg-slate-100 border-slate-300 text-slate-700"

- className="bg-teal-500/20 text-teal-300 border-teal-500/30"
+ className="bg-teal-50 text-teal-700 border-teal-200"
```

### Performance Considerations

- No JavaScript changes required
- CSS changes are minimal and don't affect bundle size
- Tailwind CSS purges unused classes in production
- No additional dependencies needed

### Accessibility Considerations

- Maintain ARIA labels on all interactive elements
- Ensure color contrast ratios meet WCAG AA standards
- Preserve keyboard navigation functionality
- Keep focus indicators visible and clear

### Migration Path

1. Update styling classes in `QuestionDetailsContent` component
2. Test at various breakpoints
3. Verify all functionality remains intact
4. Deploy to staging for QA review
5. Collect user feedback
6. Deploy to production

## Future Enhancements

Potential improvements for future iterations:

1. **Dark Mode Support**
   - Add dark mode variants for the new light theme
   - Ensure proper contrast in both modes

2. **Customizable Layout**
   - Allow users to adjust content width preference
   - Save layout preferences in user settings

3. **Enhanced Animations**
   - Add subtle transitions when navigating between questions
   - Animate answer card appearances

4. **Print Styling**
   - Optimize layout for printing
   - Remove unnecessary UI elements in print view
