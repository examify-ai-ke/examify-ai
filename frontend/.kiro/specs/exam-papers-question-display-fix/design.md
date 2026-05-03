# Design Document

## Overview

This design addresses the issue where questions are not displaying on the exam paper details page. The investigation will focus on the data flow from the backend API through the frontend API client to the React component, identifying where the questions data is being lost or incorrectly processed.

## Architecture

### Current Flow

```
Backend API (/api/v1/question-set/by-exam-paper/{id})
    ↓
openapi-fetch client (api.GET)
    ↓
publicAPI.questionSets.getByExamPaperId()
    ↓
ExamPaperDetailsContent component
    ↓
QuestionCard component (rendering)
```

### Key Components

1. **Backend API Endpoint**: `/api/v1/question-set/by-exam-paper/{exam_paper_id}`
   - Returns: `IGetResponseBase[List[QuestionSetReadWithQuestions]]`
   - Expected structure: `{ data: QuestionSetReadWithQuestions[] }`

2. **API Client Layer** (`src/lib/api-public.ts`)
   - Function: `publicAPI.questionSets.getByExamPaperId()`
   - Handles response extraction and error handling

3. **Component Layer** (`src/components/public/exam-paper-details-content.tsx`)
   - Fetches question sets on mount
   - Stores in `questionSets` state
   - Renders questions using QuestionCard

4. **Display Layer** (`src/components/public/question-card.tsx`)
   - Renders individual questions
   - Handles sub-questions

## Components and Interfaces

### API Response Structure

Based on the OpenAPI schema, the expected response structure is:

```typescript
// Backend returns
{
  success: boolean;
  message: string;
  data: QuestionSetReadWithQuestions[]
}

// Where QuestionSetReadWithQuestions is:
{
  id: string;
  slug: string | null;
  title: QuestionSetTitleEnum | null;
  questions: MainQuestionReadForQuestionSet[];
  questions_count: number | null;
  exam_papers_count: number | null;
}

// Where MainQuestionReadForQuestionSet is:
{
  id: string;
  slug: string | null;
  question_number: string;
  text: QuestionTextSchema | null;
  marks: number | null;
  numbering_style: NumberingStyleEnum;
  question_set_id: string | null;
  exam_paper_id: string | null;
  created_at: string;
  children: SubQuestionReadSimple[];
  answers: AnswerReadForQuestion[];
}
```

### Data Extraction Logic

The current implementation in `api-public.ts` uses a generic extraction pattern:

```typescript
const data = response.data && typeof response.data === 'object' && 'data' in response.data
    ? (response.data as any).data
    : response.data;
```

This should handle the nested `{ data: { data: [...] } }` structure, but we need to verify it's working correctly.

### Potential Issues

1. **Response Structure Mismatch**: The backend might be returning a different structure than expected
2. **Data Extraction Error**: The extraction logic might not handle the actual response format
3. **Empty Questions Array**: Questions might exist but the array is empty
4. **Null/Undefined Handling**: Questions field might be null instead of an empty array
5. **Type Mismatch**: The questions field might have a different property name

## Data Models

### Question Set State

```typescript
interface QuestionSetState {
  id: string;
  title: string | null;
  description?: string | null;
  questions: Question[];
  questions_count: number | null;
}
```

### Question State

```typescript
interface Question {
  id: string;
  question_number: string;
  text: QuestionTextSchema | null;
  marks: number | null;
  children: SubQuestion[];
  // ... other fields
}
```

## Error Handling

### API Error Handling

1. **Network Errors**: Catch and log network failures
2. **404 Errors**: Handle missing exam papers gracefully
3. **Empty Responses**: Distinguish between "no questions" and "error loading questions"
4. **Malformed Data**: Validate response structure before processing

### Component Error States

1. **Loading State**: Show spinner while fetching
2. **Error State**: Display error message with retry option
3. **Empty State**: Show "no questions available" message
4. **Success State**: Render questions normally

## Testing Strategy

### Investigation Steps

1. **Add Comprehensive Logging**
   - Log raw API response
   - Log extracted data structure
   - Log each question set and its questions
   - Log rendering decisions

2. **Verify API Response**
   - Test the endpoint directly (curl/Postman)
   - Check response structure matches schema
   - Verify questions array is populated

3. **Test Data Extraction**
   - Add unit tests for extraction logic
   - Test with various response structures
   - Handle edge cases (null, undefined, empty)

4. **Component Testing**
   - Verify state updates correctly
   - Check rendering logic
   - Test with mock data

### Debug Approach

1. **Phase 1: Logging**
   - Add detailed console logs at each step
   - Log the complete data flow
   - Identify where questions are lost

2. **Phase 2: Verification**
   - Verify backend returns questions
   - Check API client extracts correctly
   - Confirm component receives data

3. **Phase 3: Fix**
   - Implement fix based on findings
   - Add proper error handling
   - Improve user feedback

4. **Phase 4: Validation**
   - Test with real exam papers
   - Verify questions display correctly
   - Check sub-questions render properly

## Implementation Plan

### Step 1: Enhanced Logging

Add comprehensive logging to track data flow:

```typescript
// In api-public.ts
console.log('📝 Raw API Response:', response);
console.log('📦 Extracted data:', data);
console.log('📊 Data structure:', {
  isArray: Array.isArray(data),
  length: Array.isArray(data) ? data.length : 'N/A',
  firstItem: Array.isArray(data) && data[0] ? {
    hasQuestions: 'questions' in data[0],
    questionsType: typeof data[0].questions,
    questionsLength: Array.isArray(data[0].questions) ? data[0].questions.length : 'N/A'
  } : null
});
```

### Step 2: Response Validation

Add validation to ensure data structure is correct:

```typescript
function validateQuestionSets(data: any): QuestionSetReadWithQuestions[] {
  if (!Array.isArray(data)) {
    console.error('Expected array, got:', typeof data);
    return [];
  }
  
  return data.map((set, index) => {
    if (!set.questions) {
      console.warn(`Question set ${index} missing questions field`);
    }
    return set;
  });
}
```

### Step 3: Improved Error Handling

```typescript
try {
  const response = await api.GET('/api/v1/question-set/by-exam-paper/{exam_paper_id}', {
    params: { path: { exam_paper_id: examPaperId } }
  });

  if (response.error) {
    console.error('❌ API Error:', response.error);
    throw new Error(`API Error: ${JSON.stringify(response.error)}`);
  }

  // Extract and validate data
  const data = extractData(response);
  const validated = validateQuestionSets(data);
  
  return { data: validated, error: null };
} catch (error) {
  console.error('❌ Exception:', error);
  return { data: [], error: error as any };
}
```

### Step 4: Component State Management

Ensure component properly handles the data:

```typescript
useEffect(() => {
  async function fetchQuestionSets() {
    setIsLoadingQuestions(true);
    
    try {
      const result = await publicAPI.questionSets.getByExamPaperId(paperId);
      
      console.log('📦 Question sets result:', {
        hasData: !!result.data,
        dataLength: result.data?.length,
        hasError: !!result.error,
        firstSet: result.data?.[0]
      });
      
      if (result.error) {
        setError('Failed to load questions');
        return;
      }
      
      setQuestionSets(result.data || []);
    } catch (err) {
      console.error('Exception loading questions:', err);
      setError('Failed to load questions');
    } finally {
      setIsLoadingQuestions(false);
    }
  }
  
  if (paperId) {
    fetchQuestionSets();
  }
}, [paperId]);
```

## Design Decisions

### Decision 1: Comprehensive Logging

**Rationale**: Without visibility into the data flow, we cannot identify where the issue occurs. Comprehensive logging at each step will reveal the problem.

**Trade-offs**: 
- Pro: Quick identification of the issue
- Con: Verbose console output (can be removed after fix)

### Decision 2: Defensive Data Extraction

**Rationale**: The API response structure might vary or be nested differently than expected. Defensive extraction with validation prevents silent failures.

**Trade-offs**:
- Pro: Handles various response formats
- Con: Slightly more complex code

### Decision 3: Separate Loading States

**Rationale**: Distinguishing between loading the exam paper and loading questions provides better user feedback.

**Trade-offs**:
- Pro: Better UX, clearer what's happening
- Con: More state to manage

### Decision 4: Graceful Degradation

**Rationale**: If questions fail to load, the rest of the exam paper details should still be visible.

**Trade-offs**:
- Pro: Partial functionality better than complete failure
- Con: Users might not realize questions are missing

## Next Steps

1. Implement enhanced logging
2. Test with actual exam paper data
3. Identify the root cause from logs
4. Implement the appropriate fix
5. Add proper error handling
6. Clean up debug logging
7. Verify fix works across different exam papers
