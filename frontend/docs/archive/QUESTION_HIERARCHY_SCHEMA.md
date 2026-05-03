# Question Hierarchy Schema Reference

## Overview
This document explains the hierarchical structure of questions in the ExamPapel API and how to work with main questions and sub-questions.

## API Endpoints

### Get Question Sets for Exam Paper
**Endpoint:** `GET /api/v1/question-set/by-exam-paper/{exam_paper_id}`

**Response Type:** `IGetResponseBase[List[QuestionSetReadWithQuestions]]`

**Returns:** Array of question sets with nested questions

```typescript
{
  data: QuestionSetReadWithQuestions[]
}
```

## Data Structures

### QuestionSetReadWithQuestions
```typescript
{
  id: string (UUID)
  title: "Question One" | "Question Two" | ... | "Question Ten"
  slug?: string
  questions: MainQuestionReadForQuestionSet[]  // ← Main questions
  questions_count: number
  exam_papers_count: number
}
```

### MainQuestionReadForQuestionSet
```typescript
{
  id: string (UUID)
  question_number: string
  text: QuestionTextSchema  // Editor.js format
  marks?: number
  numbering_style: NumberingStyleEnum
  question_set_id?: string
  exam_paper_id?: string
  created_at: string (ISO 8601)
  children: SubQuestionReadSimple[]  // ← Sub-questions NESTED HERE
  answers: AnswerReadForQuestion[]
}
```

### SubQuestionReadSimple
```typescript
{
  id: string (UUID)
  question_number: string
  text: QuestionTextSchema
  marks?: number
  numbering_style: NumberingStyleEnum
  question_set_id?: string
  exam_paper_id?: string
  parent_id?: string  // ← Reference to parent question
  created_at: string (ISO 8601)
  answers: AnswerReadForQuestion[]
}
```

### QuestionRead (Full Schema)
```typescript
{
  id: string
  question_number: string
  text: QuestionTextSchema
  marks?: number
  numbering_style: NumberingStyleEnum
  question_set_id?: string
  exam_paper_id?: string
  parent_id?: string
  created_at: string
  children: QuestionRead[]  // ← Recursive structure
  answers: AnswerReadForQuestion[]
  question_set?: QuestionSetReadMinimal
  exam_paper?: ExamPaperReadMinimal
  created_by?: UserReadMinimal
  institution?: InstitutionReadMinimal
  course?: CourseReadMinimal
  modules?: ModuleReadMinimal[]
  programme?: ProgrammeReadMinimal
  children_count: number
  answers_count: number
  total_marks: number
  is_main_question?: boolean
  is_sub_question?: boolean
}
```

## Hierarchy Levels

### Level 1: Question Set
- Contains multiple main questions
- Identified by `id` and `title`
- Example: "Question One", "Question Two"

### Level 2: Main Question
- Belongs to a question set
- Has `question_set_id` reference
- Can have sub-questions in `children` array
- Has `is_main_question: true`

### Level 3: Sub-Question
- Belongs to a main question
- Has `parent_id` reference to main question
- Has `question_set_id` reference (inherited from parent)
- Has `is_sub_question: true`

## Working with Hierarchies

### Accessing Sub-Questions
```typescript
// From API response (nested structure)
const questionSet = response.data[0]
const mainQuestion = questionSet.questions[0]
const subQuestions = mainQuestion.children  // ← Direct access

// Identifying relationships
const parentId = subQuestion.parent_id
const questionSetId = subQuestion.question_set_id
```

### Flattening Hierarchy (if needed)
```typescript
function flattenQuestions(questionSets: QuestionSetReadWithQuestions[]) {
  const flat: QuestionRead[] = []
  
  questionSets.forEach(qs => {
    qs.questions.forEach(mainQ => {
      flat.push({...mainQ, question_set_id: qs.id})
      
      if (mainQ.children) {
        mainQ.children.forEach(subQ => {
          flat.push({
            ...subQ,
            parent_id: mainQ.id,
            question_set_id: qs.id
          })
        })
      }
    })
  })
  
  return flat
}
```

### Reconstructing Hierarchy (if needed)
```typescript
function reconstructHierarchy(flatQuestions: QuestionRead[]) {
  const mainQuestions = flatQuestions.filter(q => !q.parent_id)
  
  return mainQuestions.map(mainQ => ({
    ...mainQ,
    children: flatQuestions.filter(q => q.parent_id === mainQ.id)
  }))
}
```

## Important Notes

1. **Children Property is Populated by API**
   - The API returns `children` array already populated
   - Do NOT flatten and lose this structure
   - Use it directly when possible

2. **Parent-Child Relationships**
   - Sub-questions have `parent_id` pointing to main question
   - Sub-questions inherit `question_set_id` from parent
   - Both IDs should be set for proper filtering

3. **Question Numbers**
   - Main questions: "1", "2", "3", etc.
   - Sub-questions: "1.1", "1.2", "2.1", etc.
   - Format: `{main_number}.{sub_number}`

4. **Marks Calculation**
   - Main question marks: sum of all sub-question marks
   - Or standalone marks if no sub-questions
   - Use `total_marks` field for total

5. **Answers**
   - Both main and sub-questions can have answers
   - Answers are stored separately per question
   - Use `answers_count` for quick count

## Common Patterns

### Get All Sub-Questions for a Main Question
```typescript
const subQuestions = mainQuestion.children || []
```

### Get All Questions in a Set (Flat)
```typescript
const allQuestions = [
  ...questionSet.questions,
  ...questionSet.questions.flatMap(q => q.children || [])
]
```

### Find a Question by ID
```typescript
function findQuestion(questionSets: QuestionSetReadWithQuestions[], id: string) {
  for (const qs of questionSets) {
    for (const mainQ of qs.questions) {
      if (mainQ.id === id) return mainQ
      const subQ = mainQ.children?.find(q => q.id === id)
      if (subQ) return subQ
    }
  }
  return null
}
```

### Get Parent Question
```typescript
function getParentQuestion(
  questionSets: QuestionSetReadWithQuestions[],
  subQuestion: QuestionRead
) {
  if (!subQuestion.parent_id) return null
  
  for (const qs of questionSets) {
    const parent = qs.questions.find(q => q.id === subQuestion.parent_id)
    if (parent) return parent
  }
  return null
}
```

## Type Safety

Always use the proper types from the API:

```typescript
import type { components } from '@/types/generated/api'

type QuestionSetReadWithQuestions = components['schemas']['QuestionSetReadWithQuestions']
type MainQuestionReadForQuestionSet = components['schemas']['app__schemas__question_schema__MainQuestionReadForQuestionSet']
type SubQuestionReadSimple = components['schemas']['SubQuestionReadSimple']
type QuestionRead = components['schemas']['QuestionRead']
```

## Performance Considerations

1. **Nested Structure is Efficient**
   - API returns optimized nested structure
   - No need to flatten unless required
   - Direct access to children is O(1)

2. **Filtering Operations**
   - Filtering by `parent_id` is O(n)
   - Use nested structure when possible
   - Cache filtered results if used multiple times

3. **Rendering**
   - Render nested structure directly
   - Avoid unnecessary flattening/reconstruction
   - Use React keys based on question IDs

## Troubleshooting

### Sub-questions not appearing
- Check if `children` array is populated in API response
- Verify `parent_id` is set on sub-questions
- Ensure `question_set_id` is set on all questions
- Check browser console for debug logs

### Hierarchy not preserved
- Don't flatten the data unnecessarily
- Use `children` property directly from API
- Maintain `parent_id` and `question_set_id` when transforming data

### Performance issues
- Avoid repeated filtering operations
- Cache question lookups if needed
- Use memoization for expensive computations
