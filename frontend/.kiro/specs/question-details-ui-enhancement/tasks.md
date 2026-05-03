# Implementation Plan: Question Details UI Enhancement

## Overview

This implementation plan focuses on updating the styling and layout of the question details page to create a lighter, more balanced user interface. The changes are primarily CSS class modifications using Tailwind CSS, with no changes to component logic or data handling.

## Tasks

- [x] 1. Update Hero Section Styling
  - Modify `QuestionDetailsContent` component in `src/components/public/question-details-content.tsx`
  - Change background from `bg-slate-900` to `bg-gradient-to-br from-slate-50 via-white to-slate-100`
  - Add `border-b border-slate-200` for section separation
  - Update text colors from light to dark (`text-white` → `text-slate-900`, `text-slate-400` → `text-slate-600`)
  - Reduce vertical padding from `pt-16 pb-24 sm:pt-20 sm:pb-32` to `pt-8 pb-12 sm:pt-12 sm:pb-16`
  - Remove or adjust dark background effects (gradient blurs)
  - Update breadcrumb link colors to work with light background
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Update Badge and Metadata Styling
  - Update exam paper badge: `bg-white/5 border-white/10 text-slate-300` → `bg-slate-100 border-slate-300 text-slate-700`
  - Update institution badge: `bg-teal-500/20 text-teal-300 border-teal-500/30` → `bg-teal-50 text-teal-700 border-teal-200`
  - Keep marks badge as is (already has good contrast)
  - Adjust question number badge if needed to maintain prominence
  - Update calendar and check icons colors to match new theme
  - _Requirements: 1.4, 1.5_

- [x] 3. Optimize Layout Container Width
  - Update all container instances from `max-w-4xl` to `max-w-7xl`
  - Ensure responsive padding scales appropriately: `px-4 sm:px-6 lg:px-8`
  - Apply changes to hero section, content area, and navigation sections
  - _Requirements: 2.1, 2.2_

- [x] 4. Update Action Buttons Styling
  - Update Share button to work with light background context
  - Update Bookmark button styling for better visibility
  - Ensure button hover states are appropriate for new theme
  - Maintain shadow effects but adjust for light background
  - _Requirements: 1.4_

- [x] 5. Enhance Answer Cards Visual Separation
  - Verify answer card borders and shadows are visible against new background
  - Adjust verified answer styling if needed (`border-green-200 bg-green-50/10`)
  - Ensure consistent spacing between answer cards
  - Update answer card hover effects if necessary
  - _Requirements: 2.4, 3.3_

- [x] 6. Update Navigation Cards Styling
  - Adjust previous/next navigation card styling for consistency
  - Update hover states to match new theme
  - Ensure icon containers have appropriate colors
  - Verify text contrast in navigation cards
  - _Requirements: 3.4_

- [x] 7. Verify Responsive Behavior
  - Test layout at mobile breakpoints (320px, 375px, 414px)
  - Test at tablet breakpoints (768px, 1024px)
  - Test at desktop breakpoints (1280px, 1920px, 2560px)
  - Ensure no horizontal scrolling at any viewport width
  - Verify hero section stacks properly on mobile
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 8. Write unit tests for styling changes
  - Test that hero section has correct background classes
  - Test that container has `max-w-7xl` class
  - Test that badges have updated color classes
  - Test that all metadata renders when present
  - _Requirements: 1.1, 1.2, 1.4, 2.1_

- [ ]* 9. Write property test for horizontal overflow
  - **Property 1: No Horizontal Overflow**
  - Generate random viewport widths (320px - 2560px)
  - Render component with various question data
  - Assert no horizontal scrolling occurs
  - **Validates: Requirements 4.2**

- [ ]* 10. Write property test for touch target sizes
  - **Property 2: Minimum Touch Target Size**
  - Query all interactive elements (buttons, links)
  - Measure computed dimensions
  - Assert all elements meet 44x44px minimum
  - **Validates: Requirements 4.4**

- [x] 11. Manual testing and verification
  - Perform visual inspection of all changes
  - Test all interactive features (like, dislike, comment, navigation)
  - Verify accessibility with keyboard navigation
  - Check color contrast ratios
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster implementation
- All changes are CSS-only, no logic modifications required
- The component structure remains unchanged
- All existing functionality must continue to work
- Focus on maintaining accessibility standards throughout
