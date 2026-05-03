# Design Document: Answer Renderer Integration for Public Exam Papers

## Overview

This design integrates the existing AnswerRenderer component into the public exam papers details page, replacing the custom AnswerDisplay function in the QuestionCard component. The solution provides a consistent answer display experience with full metadata (author, timestamps, votes, replies) across both dashboard and public pages.

## Architecture

### Current Architecture

```
ExamPaperDetailsContent
└── QuestionCard
    └── AnswerDisplay (custom function)
        └── EditorRenderer
```

### Proposed Architecture

```
ExamPaperDetailsContent
└── QuestionCard
    └── AnswerRenderer (component)
        └── EditorRenderer
```

### Component Comparison

**Current AnswerDisplay Function:**
- Custom implementation within QuestionCard
- Shows: answer content, author name, timestamp, like/dislike buttons
- Missing: profile images, verified badges, accepted badges, nested replies display
- Uses: EditorRenderer for content

**AnswerRenderer Component:**
- Standalone reusable component
- Shows: answer content, author with profile image, timestamps, vote counts, verified/accepted badges, nested replies
- Supports: recursive rendering for nested replies
- Uses: EditorRenderer for content

## Components and Interfaces

### 1. QuestionCard Component Updates

**File:** `src/components/public/question-card.tsx`

**Changes:**
1. Import AnswerRenderer component
2. Remove AnswerDisplay function
3. Replace AnswerDisplay usage with AnswerRenderer component
4. Remove local state for likes/dislikes (handled by AnswerRenderer)
5. Remove handleLike/handleDislike functions (handled by AnswerRenderer)

**Before:**
```typescript
function AnswerDisplay({ answer, index }: { answer: any; index: number }) {
  const { addNotification } = useUIStore();
  const [likes, setLikes] = useState(answer.likes || 0);
  const [dislikes, setDislikes] = useState(answer.dislikes || 0);
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = async () => { /* ... */ };
  const handleDislike = async () => { /* ... */ };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      {/* Custom answer display */}
      <EditorRenderer data={answer.text} />
      {/* Custom like/dislike buttons */}
    </div>
  );
}
```

**After:**
```typescript
import AnswerRenderer from '@/components/ui/answer-renderer';

// Remove AnswerDisplay function entirely

// In QuestionCard render:
{showMainAnswer && (
  <div className="mt-3 space-y-3">
    {question.answers.map((answer: any, index: number) => (
      <AnswerRenderer
        key={answer.id || index}
        answer={answer}
        showAuthor={true}
        showTimestamp={true}
        showVotes={true}
        showReplies={true}
        className="bg-green-50 border-green-200"
      />
    ))}
  </div>
)}
```

### 2. AnswerRenderer Component Interface

**File:** `src/components/ui/answer-renderer.tsx` (existing)

**Current Interface:**
```typescript
interface AnswerData {
  id: string;
  text: any; // Editor.js OutputData
  is_accepted?: boolean;
  is_verified?: boolean;
  upvotes_count?: number;
  downvotes_count?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  question_id?: string;
  parent_answer_id?: string;
  replies?: AnswerData[];
  replies_count?: number;
}

interface AnswerRendererProps {
  answer: AnswerData;
  showAuthor?: boolean;
  showTimestamp?: boolean;
  showVotes?: boolean;
  showReplies?: boolean;
  className?: string;
  onAnswerClick?: (answerId: string) => void;
  onReplyClick?: (answerId: string) => void;
}
```

**No changes needed** - The existing interface already supports all required features.

### 3. Data Mapping

The API returns answer data with the following structure:

```typescript
{
  id: string;
  text: OutputData;  // EditorJS format
  created_at: string;
  updated_at: string;
  created_by: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  likes: number;      // Maps to upvotes_count
  dislikes: number;   // Maps to downvotes_count
  reviewed: boolean;  // Maps to is_verified
  children: Answer[]; // Maps to replies
}
```

**Mapping Required:**
- `likes` → `upvotes_count`
- `dislikes` → `downvotes_count`
- `reviewed` → `is_verified`
- `children` → `replies`

**Implementation:**
```typescript
const mapAnswerData = (answer: any): AnswerData => ({
  id: answer.id,
  text: answer.text,
  is_accepted: answer.is_accepted,
  is_verified: answer.reviewed,
  upvotes_count: answer.likes,
  downvotes_count: answer.dislikes,
  created_at: answer.created_at,
  updated_at: answer.updated_at,
  created_by: answer.created_by,
  question_id: answer.question_id,
  parent_answer_id: answer.parent_answer_id,
  replies: answer.children?.map(mapAnswerData),
  replies_count: answer.children?.length || 0,
});
```

## Data Models

### Answer Data Structure

**API Response Format:**
```typescript
{
  id: string;
  text: OutputData;
  created_at: string;
  updated_at: string;
  created_by: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  likes: number;
  dislikes: number;
  reviewed: boolean;
  children: Answer[];
}
```

**AnswerRenderer Expected Format:**
```typescript
{
  id: string;
  text: OutputData;
  is_accepted?: boolean;
  is_verified?: boolean;
  upvotes_count?: number;
  downvotes_count?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  replies?: AnswerData[];
  replies_count?: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Answer Metadata Display

*For any* answer with author information, the AnswerRenderer should display the author's name and profile image (if available) in the answer header.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 2: Timestamp Display

*For any* answer with a created_at timestamp, the AnswerRenderer should display a human-readable relative time (e.g., "2 hours ago").

**Validates: Requirements 3.1, 3.3**

### Property 3: Vote Count Display

*For any* answer with vote counts, the AnswerRenderer should display both upvote and downvote counts with appropriate icons.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 4: Badge Display

*For any* answer marked as accepted or verified, the AnswerRenderer should display the corresponding badge in the answer header.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 5: Nested Replies Rendering

*For any* answer with replies, when the reply count is clicked, the AnswerRenderer should recursively render all nested replies with proper indentation.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Graceful Degradation

*For any* answer with missing metadata fields, the AnswerRenderer should display available information without errors and use appropriate defaults for missing fields.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 7: Data Mapping Consistency

*For any* answer from the API, the mapped data structure should correctly transform all fields to the AnswerRenderer expected format without data loss.

**Validates: Requirements 1.1, 1.3**

## Error Handling

### Missing Author Information

**Scenario:** Answer has no created_by field

**Handling:**
1. AnswerRenderer checks for created_by existence
2. Displays "Anonymous" if missing
3. Omits profile image if not available

**Implementation:** Already handled by AnswerRenderer component

### Missing Timestamps

**Scenario:** Answer has no created_at or updated_at

**Handling:**
1. AnswerRenderer checks for timestamp existence
2. Omits timestamp display if missing
3. No error thrown

**Implementation:** Already handled by AnswerRenderer component

### Invalid Vote Counts

**Scenario:** Answer has undefined or null vote counts

**Handling:**
1. AnswerRenderer defaults to 0 for undefined counts
2. Displays "0" instead of crashing

**Implementation:** Already handled by AnswerRenderer component

### Malformed Answer Text

**Scenario:** Answer text is not valid EditorJS format

**Handling:**
1. EditorRenderer handles invalid format gracefully
2. Displays error message or empty state
3. Does not crash the page

**Implementation:** Already handled by EditorRenderer component

## Testing Strategy

### Unit Tests

**Test File:** `src/components/public/__tests__/question-card-answer-renderer.test.tsx`

1. **Test: AnswerRenderer is used instead of AnswerDisplay**
   - Render QuestionCard with answers
   - Verify AnswerRenderer component is rendered
   - Verify AnswerDisplay function is not used

2. **Test: Answer data is correctly mapped**
   - Provide answer with API format (likes, dislikes, reviewed, children)
   - Verify AnswerRenderer receives correct format (upvotes_count, downvotes_count, is_verified, replies)

3. **Test: Author information is displayed**
   - Provide answer with author data
   - Verify author name is displayed
   - Verify profile image is displayed if available

4. **Test: Timestamps are displayed**
   - Provide answer with created_at timestamp
   - Verify relative time is displayed
   - Verify "edited" indicator for updated answers

5. **Test: Vote counts are displayed**
   - Provide answer with likes and dislikes
   - Verify upvote count is displayed
   - Verify downvote count is displayed

6. **Test: Badges are displayed**
   - Provide answer with is_accepted flag
   - Verify "Accepted Answer" badge is displayed
   - Provide answer with is_verified flag
   - Verify "Verified" badge is displayed

7. **Test: Nested replies are rendered**
   - Provide answer with children array
   - Verify reply count is displayed
   - Click reply count
   - Verify nested replies are rendered with indentation

8. **Test: Missing data is handled gracefully**
   - Provide answer with missing author
   - Verify "Anonymous" is displayed
   - Provide answer with missing timestamps
   - Verify no errors occur

### Integration Tests

**Test File:** `src/app/(public)/exampapers/__tests__/details-page-answers.test.tsx`

1. **Test: Answers display on exam paper details page**
   - Navigate to exam paper details page
   - Expand a question with answers
   - Verify AnswerRenderer components are rendered
   - Verify all answer metadata is displayed

2. **Test: Answer interaction works correctly**
   - Click "View Answer" button
   - Verify answers are displayed
   - Click like button
   - Verify like count updates
   - Click reply count
   - Verify nested replies are displayed

3. **Test: Multiple answers are displayed correctly**
   - Load question with multiple answers
   - Verify all answers are rendered
   - Verify each answer has correct metadata
   - Verify answers are visually distinct

### Property-Based Tests

**Test File:** `src/components/public/__tests__/answer-renderer-properties.test.tsx`

1. **Property Test: Data mapping consistency**
   - Generate random answer data in API format
   - Map to AnswerRenderer format
   - Verify all fields are correctly transformed
   - Run 100 iterations with different data

2. **Property Test: Graceful degradation**
   - Generate random answer data with missing fields
   - Render with AnswerRenderer
   - Verify no errors occur
   - Verify appropriate defaults are used
   - Run 100 iterations with different missing fields

3. **Property Test: Nested replies rendering**
   - Generate random answer data with nested replies (1-5 levels deep)
   - Render with AnswerRenderer
   - Verify all replies are rendered
   - Verify indentation increases with depth
   - Run 100 iterations with different nesting structures

### Manual Testing Checklist

- [ ] View exam paper with answers
- [ ] Verify author names are displayed
- [ ] Verify profile images are displayed (if available)
- [ ] Verify timestamps are displayed
- [ ] Verify vote counts are displayed
- [ ] Verify accepted answer badge is displayed
- [ ] Verify verified badge is displayed
- [ ] Click reply count to expand nested replies
- [ ] Verify nested replies are indented correctly
- [ ] Test with answer missing author (should show "Anonymous")
- [ ] Test with answer missing timestamps (should not crash)
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport
- [ ] Verify like/dislike buttons work
- [ ] Verify answer expand/collapse works

## Visual Design

### Answer Display Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [✓ Accepted Answer] [✓ Verified]  [Profile] John Doe       │
│                                    2 hours ago              │
│                                                   ↑ 5  ↓ 1  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Answer content rendered with EditorRenderer                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 3 replies  (edited 1 hour ago)                             │
└─────────────────────────────────────────────────────────────┘
```

### Styling Consistency

**Current QuestionCard Styling:**
- Answer container: `bg-green-50 border border-green-200 rounded-lg p-4`
- Answer badge: `bg-green-600`

**AnswerRenderer Default Styling:**
- Answer container: `border rounded-lg p-4`
- Accepted answer: `border-green-500 bg-green-50`
- Regular answer: `border-gray-200`

**Solution:**
Pass custom className to AnswerRenderer to maintain green styling:
```typescript
<AnswerRenderer
  answer={mappedAnswer}
  className="border-green-200 bg-green-50"
/>
```

## Implementation Notes

### Backward Compatibility

- The change is internal to QuestionCard component
- No API changes required
- No changes to parent components
- Existing answer data structure is compatible

### Performance Considerations

- AnswerRenderer is already optimized for rendering
- No additional API calls required
- Recursive rendering of replies is efficient
- No performance degradation expected

### Accessibility

- AnswerRenderer already includes proper ARIA labels
- Keyboard navigation is supported
- Screen reader friendly
- No accessibility regressions

### Migration Path

1. Import AnswerRenderer component
2. Create data mapping function
3. Replace AnswerDisplay usage with AnswerRenderer
4. Remove AnswerDisplay function
5. Remove unused state and handlers
6. Test thoroughly
7. Deploy

### Rollback Plan

If issues arise:
1. Revert QuestionCard changes
2. Restore AnswerDisplay function
3. No database changes required
4. No API changes required
