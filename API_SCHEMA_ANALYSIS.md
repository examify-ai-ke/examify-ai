# API Schema Analysis - Sub-Questions Issue

## Problem Summary
Sub-questions are not displaying under main questions in the exam paper edit page because the hierarchical structure from the API is being flattened incorrectly.

## API Response Structure

### Endpoint: `/api/v1/question-set/by-exam-paper/{exam_paper_id}`

**Returns:** `IGetResponseBase[List[QuestionSetReadWithQuestions]]`

```typescript
QuestionSetReadWithQuestions {
  id: string
  title: QuestionSetTitleEnum
  slug?: string
  questions: MainQuestionReadForQuestionSet[]  // ← Main questions
  questions_count: number
  exam_papers_count: number
}

MainQuestionReadForQuestionSet {
  id: string
  question_number: string
  text: QuestionTextSchema
  marks?: number
  numbering_style: NumberingStyleEnum
  question_set_id?: string
  exam_paper_id?: string
  created_at: string
  children: SubQuestionReadSimple[]  // ← Sub-questions ALREADY NESTED!
  answers: AnswerReadForQuestion[]
}

SubQuestionReadSimple {
  id: string
  question_number: string
  text: QuestionTextSchema
  marks?: number
  numbering_style: NumberingStyleEnum
  question_set_id?: string
  exam_paper_id?: string
  parent_id?: string
  created_at: string
  answers: AnswerReadForQuestion[]
}
```

## Current Issue

The edit page code is:
1. Receiving properly nested data from the API
2. Flattening it into a single array
3. Trying to reconstruct the hierarchy by filtering

This causes:
- Loss of the `children` property on main questions
- Reliance on `parent_id` filtering which may not work correctly
- Questions not being properly associated with their question sets

## Solution

**DO NOT FLATTEN THE DATA**

Instead:
1. Keep the hierarchical structure as-is from the API
2. Pass the nested data directly to the HierarchicalQuestions component
3. Let the component work with the `children` property that's already populated

## Implementation Changes Required

### File: `src/app/dashboard/exam-papers/[id]/edit/page.tsx`

**Current approach (WRONG):**
```typescript
// Flattening the data
const allQuestions: QuestionRead[] = []
questionSetsData.forEach((qs) => {
  qs.questions.forEach((q) => {
    allQuestions.push(q)  // Main question
    if (q.children) {
      allQuestions.push(...q.children)  // Flatten children
    }
  })
})
setQuestionSetQuestions(allQuestions)
```

**New approach (CORRECT):**
```typescript
// Keep the nested structure
// Pass questionSetsData directly to HierarchicalQuestions
// The component already handles nested children via the children property
setQuestionSets(questionSetsData)
// Don't need a separate questionSetQuestions state
```

### File: `src/components/ui/hierarchical-questions.tsx`

**Current approach (WRONG):**
```typescript
// Trying to reconstruct hierarchy from flat array
const setQuestions = questions.filter(q => q.question_set_id === questionSet.id)
const mainQuestions = setQuestions.filter(q => !q.parent_id)
// Then filtering for sub-questions by parent_id
```

**New approach (CORRECT):**
```typescript
// Use the questions directly from questionSet.questions
// They're already properly nested with children property
const mainQuestions = questionSet.questions || []
// Sub-questions are already in mainQuestion.children
```

## Benefits of This Approach

1. **Preserves API structure** - No data transformation needed
2. **Simpler code** - No flattening/filtering logic
3. **Better performance** - No array operations
4. **Maintains hierarchy** - Children property is preserved
5. **Type-safe** - Uses the actual API response types

## Type Changes

The component should accept:
- `questionSets: QuestionSetReadWithQuestions[]` (instead of separate questions array)
- Remove the `questions` prop entirely
- Use `questionSet.questions` directly in the component

This aligns with how the API actually returns the data.
