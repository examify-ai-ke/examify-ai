# Design Document

## Overview

This design addresses the nested button HTML validation error in the QuestionCard component by replacing the outer `<button>` wrapper with a semantic `<div>` element that maintains the same interactive behavior through proper event handling and accessibility attributes. The solution preserves all existing functionality, styling, and user experience while ensuring HTML validity and React hydration compatibility.

## Architecture

### Component Structure

The QuestionCard component will be refactored to use the following structure:

```
QuestionCard
├── Clickable Container (div with role="button" for expandable questions)
│   ├── Card Component
│   │   ├── CardContent
│   │   │   ├── Question Header (number, badges)
│   │   │   ├── Question Text (h3)
│   │   │   ├── Main Answer Section
│   │   │   │   └── View Answer Button (with stopPropagation)
│   │   │   └── Expand Icon (if has sub-questions)
│   └── Expanded Sub-questions Section
│       └── Sub-question Cards (each with View Answer Button)
```

### Key Changes

1. **Outer Container**: Replace `<button>` with `<div>` that has appropriate ARIA attributes
2. **Event Handling**: Add keyboard event handlers for Enter/Space keys
3. **Accessibility**: Maintain WCAG 2.1 AA compliance with proper roles and attributes
4. **Event Propagation**: Ensure nested buttons properly stop event propagation

## Components and Interfaces

### QuestionCard Component

**Props Interface** (unchanged):
```typescript
interface QuestionCardProps {
  question: any;
  questionNumber: string | number;
}
```

**State Management** (unchanged):
```typescript
const [isExpanded, setIsExpanded] = useState(false);
const [showMainAnswer, setShowMainAnswer] = useState(false);
const [showSubAnswers, setShowSubAnswers] = useState<{ [key: string]: boolean }>({});
```

### Container Element Design

**For Questions WITH Sub-questions:**
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={() => setIsExpanded(!isExpanded)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  }}
  className="w-full text-left cursor-pointer"
  aria-expanded={isExpanded}
  aria-label={`Question ${displayNumber}, click to ${isExpanded ? 'collapse' : 'expand'} sub-questions`}
>
  {/* Card content */}
</div>
```

**For Questions WITHOUT Sub-questions:**
```tsx
<div className="w-full text-left">
  {/* Card content - not interactive at container level */}
</div>
```

### Button Event Handling

All nested Button components will include `stopPropagation`:

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={(e) => {
    e.stopPropagation(); // Prevent triggering parent container click
    setShowMainAnswer(!showMainAnswer);
  }}
  className="text-xs"
>
  <MessageSquare className="h-3 w-3 mr-1" />
  {showMainAnswer ? 'Hide' : 'View'} Answer
</Button>
```

## Data Models

No changes to data models. The component continues to accept the same question structure:

```typescript
interface Question {
  id: string;
  text: any; // JSON or string format
  marks?: number;
  question_number?: string;
  children?: Question[]; // Sub-questions
  answers?: Answer[];
}

interface Answer {
  id: string;
  text: any; // JSON or string format
  content?: any;
}
```

## Error Handling

### HTML Validation
- **Before**: Nested buttons cause console warnings and hydration errors
- **After**: Valid HTML structure with no nesting violations

### Event Handling Edge Cases
1. **Rapid Clicks**: React's state batching handles multiple rapid clicks gracefully
2. **Keyboard + Mouse**: Event handlers are independent and don't conflict
3. **Touch Devices**: onClick works for both mouse and touch events

### Accessibility Fallbacks
- If JavaScript is disabled, the card remains readable (non-interactive)
- Screen readers announce the role, state, and label correctly
- Focus indicators are visible for keyboard users

## Testing Strategy

### Unit Tests
Not required for this fix as per project guidelines (testing marked as optional).

### Manual Testing Checklist

**Functional Testing:**
1. ✓ Click on question card with sub-questions → expands/collapses
2. ✓ Click on "View Answer" button → shows/hides answer without expanding card
3. ✓ Click on sub-question "View Answer" button → shows/hides sub-answer
4. ✓ Question without sub-questions → card is not clickable at container level

**Keyboard Testing:**
1. ✓ Tab to expandable question card → receives focus
2. ✓ Press Enter on focused card → expands/collapses
3. ✓ Press Space on focused card → expands/collapses
4. ✓ Tab to "View Answer" button → button receives focus
5. ✓ Press Enter on "View Answer" button → shows/hides answer
6. ✓ Question without sub-questions → container is not in tab order

**Browser Console Testing:**
1. ✓ No "nested button" warnings in console
2. ✓ No hydration errors during page load
3. ✓ No React warnings about event handlers

**Accessibility Testing:**
1. ✓ Screen reader announces "button" role for expandable cards
2. ✓ Screen reader announces expanded/collapsed state
3. ✓ Focus indicators are visible
4. ✓ Color contrast meets WCAG AA standards (unchanged)

**Visual Regression Testing:**
1. ✓ Card styling remains identical
2. ✓ Hover effects work correctly
3. ✓ Expand/collapse animation works
4. ✓ Responsive layout unchanged

### Browser Compatibility
- Chrome/Edge (Chromium): Primary target
- Firefox: Should work identically
- Safari: Should work identically
- Mobile browsers: Touch events work via onClick

## Implementation Notes

### CSS Classes
All existing Tailwind classes remain unchanged. The cursor and hover states are preserved:

```typescript
className={`
  transition-all duration-200
  ${isExpanded ? 'border-teal-500 bg-teal-50/50' : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'}
  ${!hasSubQuestions ? 'cursor-default' : 'cursor-pointer'}
`}
```

### Performance Considerations
- No performance impact: replacing `<button>` with `<div>` has identical rendering cost
- Event handlers are already memoized by React's synthetic event system
- No additional re-renders introduced

### Backwards Compatibility
- Component API unchanged (same props)
- Visual appearance unchanged
- User interaction patterns unchanged
- Only internal implementation changes

## Security Considerations

No security implications. The change is purely structural and does not affect:
- Data handling
- API calls
- User authentication
- Input validation

## Accessibility Compliance

### WCAG 2.1 AA Requirements Met

**1.3.1 Info and Relationships (Level A)**
- ✓ Semantic structure maintained with proper ARIA roles

**2.1.1 Keyboard (Level A)**
- ✓ All functionality available via keyboard
- ✓ Enter and Space keys trigger expansion

**2.1.2 No Keyboard Trap (Level A)**
- ✓ Users can tab in and out of all interactive elements

**2.4.7 Focus Visible (Level AA)**
- ✓ Focus indicators visible on all interactive elements

**4.1.2 Name, Role, Value (Level A)**
- ✓ role="button" provides semantic meaning
- ✓ aria-expanded communicates state
- ✓ aria-label provides accessible name

### Screen Reader Experience

**VoiceOver (macOS/iOS):**
- "Question 1, button, collapsed, click to expand sub-questions"
- After activation: "Question 1, button, expanded, click to collapse sub-questions"

**NVDA/JAWS (Windows):**
- "Question 1, button, collapsed"
- After activation: "Question 1, button, expanded"

## Migration Path

### Deployment Strategy
1. Update QuestionCard component in single commit
2. No database migrations required
3. No API changes required
4. No environment variable changes required

### Rollback Plan
If issues arise, simply revert the commit. The change is isolated to one component file.

### Monitoring
After deployment, monitor:
- Browser console for any new errors
- User feedback for interaction issues
- Analytics for any drop in engagement with questions

## Future Enhancements

Potential improvements for future iterations:
1. Add animation for expand/collapse transition
2. Add "Expand All" / "Collapse All" functionality for question sets
3. Add bookmark/favorite functionality for individual questions
4. Add print-friendly view that auto-expands all questions
