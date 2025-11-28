# Sub-Questions Display Fix

## Problem
Sub-questions were not displaying under their respective main questions in the exam paper edit page (`/dashboard/exam-papers/[id]/edit`).

## Root Cause
The issue was in how questions were being extracted and flattened from the API response in the edit page. The code was:

1. Adding main questions to the flat array
2. Adding sub-questions (children) to the flat array separately
3. But NOT preserving the hierarchical structure properly

When the `HierarchicalQuestions` component tried to reconstruct the hierarchy, it looked for:
- `mainQuestion.children` property (which was lost during flattening)
- OR questions with matching `parent_id` (which wasn't being set correctly)

## Solution
Modified the question extraction logic in `src/app/dashboard/exam-papers/[id]/edit/page.tsx` (lines 568-598) to:

1. **Preserve the `children` property** on main questions when adding them to the flat array
2. **Explicitly set `parent_id` and `question_set_id`** on sub-questions when adding them separately
3. **Add debug logging** to track the extraction process

### Code Changes

**File: `src/app/dashboard/exam-papers/[id]/edit/page.tsx`**

```typescript
// Before: Lost hierarchical structure
allQuestions.push(q)
if (q.children && Array.isArray(q.children)) {
    allQuestions.push(...q.children)  // Just spread children
}

// After: Preserve hierarchy and set proper IDs
allQuestions.push(q)  // Main question with children intact
if (q.children && Array.isArray(q.children)) {
    q.children.forEach((child: any) => {
        allQuestions.push({
            ...child,
            parent_id: q.id,           // Ensure parent_id is set
            question_set_id: qs.id     // Ensure question_set_id is set
        })
    })
}
```

**File: `src/components/ui/hierarchical-questions.tsx`**

Added debug logging to track:
- How many questions are in each question set
- How many main vs sub-questions
- Whether main questions have the `children` property
- How many sub-questions are found via filtering

## Testing
To verify the fix works:

1. Navigate to an exam paper edit page with sub-questions
2. Open browser console to see debug logs
3. Expand a question set
4. Expand a main question
5. Verify sub-questions appear under their parent

## Debug Logs
The fix includes console logs that show:
- `📋 [EDIT PAGE] Extracted questions:` - Shows total, main, and sub-question counts
- `📋 [QuestionSetDisplay]` - Shows question distribution per set
- `📋 [MainQuestion]` - Shows sub-question resolution for each main question

## Related Files
- `src/app/dashboard/exam-papers/[id]/edit/page.tsx` - Question data loading
- `src/components/ui/hierarchical-questions.tsx` - Question display component
