# Questions Display Implementation

## Overview
Integrated the new backend API endpoint to fetch and display questions with sub-questions and answers on the exam paper details page.

## Backend API Integration

### New Endpoint
**GET** `/api/v1/question-set/by-exam-paper/{exam_paper_id}`

### Response Structure
```json
{
  "data": [
    {
      "id": "...",
      "title": "Question One",
      "questions": [
        {
          "id": "...",
          "text": {...},
          "marks": 20,
          "answers": [...],
          "children": [
            {
              "id": "...",
              "text": {...},
              "marks": 5,
              "answers": [...]
            }
          ]
        }
      ],
      "questions_count": 4,
      "exam_papers_count": 1
    }
  ]
}
```

## Frontend Implementation

### 1. API Client Method
**File:** `src/lib/api-public.ts`

Added `questionSets.getByExamPaperId()` method:
```typescript
questionSets: {
  async getByExamPaperId(examPaperId: string) {
    // Fetches question sets with questions, sub-questions, and answers
  }
}
```

### 2. Question Card Component
**File:** `src/components/public/question-card.tsx`

Beautiful card component that displays:
- Question number in circular badge
- Marks badge
- Sub-questions count badge
- Main question text
- Expandable sub-questions (a, b, c, etc.)
- Collapsible answers section
- Question stats (answers count, views)

### 3. Details Page Integration
**File:** `src/components/public/exam-paper-details-content.tsx`

- Fetches question sets when exam paper loads
- Displays loading state while fetching
- Shows empty state if no questions
- Renders question sets with headers
- Maps questions to QuestionCard components

## Features

### Question Display
✅ **Question numbering** - Sequential numbers (1, 2, 3...)
✅ **Marks display** - Shows marks for each question
✅ **Sub-questions** - Lettered (a, b, c...) with indentation
✅ **Expandable sections** - Collapse/expand sub-questions
✅ **Visual hierarchy** - Clear parent-child relationship

### Answer Display
✅ **Collapsible answers** - "View/Hide X Answer(s)" button
✅ **Answer cards** - Blue background for visibility
✅ **Multiple answers** - Shows all available answers
✅ **Answer count** - Badge showing number of answers

### Question Sets
✅ **Set headers** - Gradient background with title
✅ **Set descriptions** - Optional description text
✅ **Multiple sets** - Supports multiple question sets per paper
✅ **Set separation** - Clear visual separation between sets

### Text Rendering
✅ **JSON format support** - Handles Editor.js blocks format
✅ **String fallback** - Works with plain text
✅ **Prose styling** - Clean typography

## Design Features

### Question Card Design
```
┌─────────────────────────────────────────┐
│ ⭕ 1    [20 marks] [3 sub-questions]  ▼│
├─────────────────────────────────────────┤
│ Main question text here...              │
│                                         │
│ ├─ a) Sub-question text [5 marks]      │
│ ├─ b) Sub-question text [5 marks]      │
│ └─ c) Sub-question text [10 marks]     │
├─────────────────────────────────────────┤
│ [View 2 Answer(s)]                      │
│ 💬 2 answers  👁️ 0 views              │
└─────────────────────────────────────────┘
```

### Color Scheme
- **Question number badge:** Teal-100 background, Teal-700 text
- **Marks badge:** Secondary gray
- **Sub-questions:** Gray-200 left border, indented
- **Answers:** Blue-50 background, Blue-200 border
- **Question set header:** Gradient teal-50 to blue-50

### Interactions
- **Hover effect:** Shadow increases on card hover
- **Expand/collapse:** Smooth transition for sub-questions
- **Show/hide answers:** Toggle button for answers
- **Responsive:** Works on all screen sizes

## States

### Loading State
```
┌─────────────────────────────────────────┐
│         🔄 Loading questions...         │
└─────────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────────┐
│              📚                         │
│   No questions available for this       │
│         exam paper                      │
│                                         │
│   Questions will appear here once       │
│         they are added                  │
└─────────────────────────────────────────┘
```

### Loaded State
- Question sets with headers
- Questions in cards
- Sub-questions indented
- Answers collapsible

## Data Flow

### 1. Page Load
```
User visits /exampapers/[slug]
  ↓
Fetch exam paper by slug/ID
  ↓
Extract exam paper ID
  ↓
Fetch question sets by exam paper ID
  ↓
Render question sets and questions
```

### 2. Question Rendering
```
Question Sets Array
  ↓
Map each question set
  ↓
Render set header (if title exists)
  ↓
Map each question in set
  ↓
Render QuestionCard component
  ↓
Display main question + sub-questions + answers
```

## Text Format Handling

### Editor.js Format (JSON)
```json
{
  "blocks": [
    {
      "type": "paragraph",
      "text": "Question text here"
    }
  ]
}
```

### Plain String
```
"Question text here"
```

### Rendering Logic
```typescript
if (typeof text === 'string') {
  return <p>{text}</p>;
}
if (text.blocks && Array.isArray(text.blocks)) {
  return text.blocks.map(block => <p>{block.text}</p>);
}
```

## Performance Optimizations

### 1. Lazy Loading
- Questions fetched after exam paper loads
- Separate loading state for questions
- Non-blocking UI

### 2. Conditional Rendering
- Only render sub-questions if expanded
- Only render answers if shown
- Reduces initial DOM size

### 3. Efficient State
- Single state for all question sets
- Minimal re-renders
- Local state for expand/collapse

## Responsive Behavior

### Desktop
- Full-width question cards
- Side-by-side layout with sidebar
- Hover effects enabled

### Tablet
- Stacked layout
- Full-width cards
- Touch-friendly buttons

### Mobile
- Single column
- Compact badges
- Touch-optimized interactions

## Future Enhancements

### Phase 2
1. **Question navigation** - Jump to specific question
2. **Search within questions** - Find specific text
3. **Print view** - Printer-friendly format
4. **Export questions** - Download as PDF

### Phase 3
1. **Answer submission** - Allow users to submit answers
2. **Answer voting** - Upvote/downvote answers
3. **Comments** - Discuss questions
4. **Bookmarking** - Save favorite questions

### Phase 4
1. **AI assistance** - Get hints for questions
2. **Similar questions** - Find related questions
3. **Difficulty rating** - Rate question difficulty
4. **Time tracking** - Track time spent per question

## Testing Checklist

### Functionality
- [x] Questions load correctly
- [x] Sub-questions display properly
- [x] Answers show/hide works
- [x] Expand/collapse works
- [x] Multiple question sets display
- [x] Empty state shows correctly
- [x] Loading state shows correctly

### Edge Cases
- [ ] Question with no sub-questions
- [ ] Question with no answers
- [ ] Question with no marks
- [ ] Very long question text
- [ ] Many sub-questions (10+)
- [ ] Question set with no title
- [ ] Question set with no questions

### Visual
- [ ] Cards align properly
- [ ] Badges display correctly
- [ ] Colors are consistent
- [ ] Hover effects work
- [ ] Responsive on mobile
- [ ] Print layout works

## Notes

- Questions are fetched automatically when exam paper loads
- Sub-questions are collapsed by default (can be changed)
- Answers are hidden by default (user must click to view)
- Question numbering is sequential across all sets
- Sub-question lettering resets for each main question
- Empty question sets show a message
- Loading is non-blocking (exam paper info shows first)

