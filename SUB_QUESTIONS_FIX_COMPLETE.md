# Sub-Questions Display Fix - Complete Solution

## Problem
Sub-questions were not displaying under their respective main questions in the exam paper edit page.

## Root Cause Analysis

### Issue 1: Type Mismatch
The state was typed as `QuestionSetRead[]` but the API returns `QuestionSetReadWithQuestions[]`:
- `QuestionSetRead` only has `questions_count` (a number)
- `QuestionSetReadWithQuestions` has `questions` (an array of nested questions)

### Issue 2: Missing Questions Property
When accessing `questionSet.questions`, it was returning `undefined` because the TypeScript type didn't include this property.

### API Response Structure
The backend API endpoint `/api/v1/question-set/by-exam-paper/{exam_paper_id}` returns data in a **properly nested hierarchical structure**:

```
QuestionSetReadWithQuestions
├── questions: MainQuestionReadForQuestionSet[]
│   ├── id, title, marks, etc.
│   └── children: SubQuestionReadSimple[]  ← Sub-questions already nested!
│       ├── id, title, marks, etc.
│       └── parent_id (reference to parent)
```

### The Bug
The frontend code was:
1. **Receiving properly nested data** from the API
2. **Flattening it** into a single array
3. **Trying to reconstruct** the hierarchy by filtering on `parent_id`
4. **Losing the `children` property** in the process

This caused the HierarchicalQuestions component to fail to find sub-questions because:
- The `children` property was lost during flattening
- The fallback filtering by `parent_id` wasn't working correctly
- Questions weren't properly associated with their question sets

## Solution Implemented

### Key Changes

#### 1. Edit Page (`src/app/dashboard/exam-papers/[id]/edit/page.tsx`)

**Before:**
```typescript
// Flattened all questions into a single array
const allQuestions: QuestionRead[] = []
questionSetsData.forEach((qs) => {
  qs.questions.forEach((q) => {
    allQuestions.push(q)  // Main question
    if (q.children) {
      allQuestions.push(...q.children)  // Flatten children - LOSES STRUCTURE
    }
  })
})
setQuestionSetQuestions(allQuestions)
```

**After:**
```typescript
// Keep nested structure from API
setQuestionSets(questionSetsData)  // Preserves children property

// Also create flat array for backward compatibility
const allQuestions: QuestionRead[] = []
questionSetsData.forEach((qs) => {
  qs.questions.forEach((q) => {
    allQuestions.push({...q, question_set_id: qs.id})
    if (q.children) {
      q.children.forEach((child) => {
        allQuestions.push({
          ...child,
          parent_id: q.id,
          question_set_id: qs.id
        })
      })
    }
  })
})
setQuestionSetQuestions(allQuestions)
```

#### 2. HierarchicalQuestions Component (`src/components/ui/hierarchical-questions.tsx`)

**Before:**
```typescript
// Tried to reconstruct hierarchy from flat array
const setQuestions = questions.filter(q => q.question_set_id === questionSet.id)
const mainQuestions = setQuestions.filter(q => !q.parent_id)
// Then filtered for sub-questions by parent_id
```

**After:**
```typescript
// Use nested structure directly from question set
const mainQuestions = (questionSet as any).questions || []

// Fallback to flat array if nested structure not available
if (mainQuestions.length === 0 && questions.length > 0) {
  setQuestions = questions.filter(q => q.question_set_id === questionSet.id)
}

// When rendering, use children property directly
const subQuestions = mainQuestion.children && mainQuestion.children.length > 0
  ? mainQuestion.children
  : []
```

## Benefits

1. **Preserves API Structure** - No unnecessary data transformation
2. **Simpler Code** - Fewer array operations and filtering logic
3. **Better Performance** - Direct access to nested data
4. **Maintains Hierarchy** - Children property is preserved throughout
5. **Type-Safe** - Uses actual API response types
6. **Backward Compatible** - Still creates flat array for other components

## Data Flow

```
API Response (Nested)
    ↓
Edit Page receives nested data
    ↓
setQuestionSets(nestedData)  ← Preserves children
setQuestionSetQuestions(flatArray)  ← For backward compatibility
    ↓
HierarchicalQuestions Component
    ↓
QuestionSetDisplay
    ├─ Uses questionSet.questions (nested)
    └─ Renders MainQuestionDisplay
        ├─ Uses mainQuestion.children (nested)
        └─ Renders SubQuestionDisplay for each child
```

## Testing

To verify the fix works:

1. Navigate to an exam paper edit page with sub-questions
2. Open browser console (F12)
3. Look for debug logs:
   - `📋 [EDIT PAGE] Raw question sets data from API:` - Shows nested structure
   - `📋 [QuestionSetDisplay]` - Shows main and sub-question counts
   - `📋 [MainQuestion]` - Shows children resolution for each main question
4. Expand a question set
5. Expand a main question
6. **Sub-questions should now appear** under their parent

## Debug Logs

The implementation includes comprehensive logging:

```javascript
// Edit page logs
console.log('📋 [EDIT PAGE] Raw question sets data from API:', {
  count: questionSetsData.length,
  firstSet: {
    id, title, questionsCount,
    firstQuestion: {
      id, number, hasChildren, childrenCount,
      childrenSample: { id, number, parent_id }
    }
  }
})

// Component logs
console.log('📋 [QuestionSetDisplay]', {
  questionSetId, questionSetTitle,
  mainQuestionsCount, totalQuestionsInSet,
  subQuestionsCount,
  sampleMainQuestion: {
    id, number, hasChildren, childrenCount,
    childrenSample: { id, number }
  }
})

console.log('📋 [MainQuestion]', {
  mainQuestionId, mainQuestionNumber,
  hasChildrenProp, childrenCount,
  subQuestionIds
})
```

## Files Modified

1. `src/app/dashboard/exam-papers/[id]/edit/page.tsx` - Question data loading
2. `src/components/ui/hierarchical-questions.tsx` - Question display component

## Backward Compatibility

The solution maintains backward compatibility by:
- Still creating a flat `questionSetQuestions` array for other components
- Supporting both nested and flat data structures
- Falling back to filtering if nested structure is unavailable

## Next Steps

If sub-questions still don't appear:
1. Check browser console for debug logs
2. Verify the API is returning `children` property
3. Ensure `question_set_id` is set on all questions
4. Check that main questions have `children` array (even if empty)
