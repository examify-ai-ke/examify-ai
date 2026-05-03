# Design Document: Add Answer Functionality for Exam Papers

## Overview

This design implements the ability to add answers to questions directly from the exam papers edit page. The solution integrates the existing AnswerForm component into the MainQuestionCard and SubQuestionCard components, providing an inline answer creation experience that maintains the current UI patterns and state management approach.

## Architecture

### Component Hierarchy

```
ExamPaperEditPage
├── QuestionSetList
│   └── QuestionSetCard
│       └── MainQuestionCard
│           ├── AnswerList (existing)
│           ├── AddAnswerButton (new)
│           ├── AnswerForm (conditional, existing component)
│           └── SubQuestionCard
│               ├── AnswerList (existing)
│               ├── AddAnswerButton (new)
│               └── AnswerForm (conditional, existing component)
```

### State Management

The answer form state will be managed locally within each question card component using React hooks:

- `showAnswerForm: boolean` - Controls visibility of the AnswerForm
- Form state is managed by the AnswerForm component itself via react-hook-form

### Data Flow

1. User clicks "Add Answer" button
2. Component sets `showAnswerForm = true`
3. AnswerForm renders with the question ID
4. User fills in answer content using EditorJS
5. User submits form
6. AnswerForm calls API to create answer
7. On success, AnswerForm calls `onSuccess` callback
8. Parent component reloads question sets via `reloadQuestionSets()`
9. Component sets `showAnswerForm = false`
10. Updated answer list displays with new answer

## Components and Interfaces

### 1. MainQuestionCard Component Updates

**File:** `src/components/questions/MainQuestionCard.tsx`

**Changes:**
- Add state: `const [showAnswerForm, setShowAnswerForm] = useState(false)`
- Add "Add Answer" button after AnswerList (when expanded)
- Conditionally render AnswerForm when `showAnswerForm === true`
- Pass `onAnswersChange` callback to trigger reload

**New Props:**
```typescript
interface MainQuestionCardProps {
  // ... existing props
  onAnswersChange?: () => void; // Callback to reload questions after answer changes
}
```

**UI Structure (when expanded):**
```tsx
{isExpanded && (
  <div className="ml-9 space-y-3">
    {/* Existing AnswerList */}
    <AnswerList answers={question.answers} />
    
    {/* New: Add Answer Button */}
    {!showAnswerForm && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAnswerForm(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Answer
      </Button>
    )}
    
    {/* New: Answer Form */}
    {showAnswerForm && (
      <div className="border rounded-lg p-4 bg-gray-50">
        <AnswerForm
          questionId={question.id}
          onSuccess={() => {
            setShowAnswerForm(false);
            onAnswersChange?.();
          }}
          onCancel={() => setShowAnswerForm(false)}
        />
      </div>
    )}
  </div>
)}
```

### 2. SubQuestionCard Component Updates

**File:** `src/components/questions/SubQuestionCard.tsx`

**Changes:**
- Add state: `const [showAnswerForm, setShowAnswerForm] = useState(false)`
- Add "Add Answer" button after AnswerList (when expanded)
- Conditionally render AnswerForm when `showAnswerForm === true`
- Pass `onAnswersChange` callback to trigger reload

**New Props:**
```typescript
interface SubQuestionCardProps {
  // ... existing props
  onAnswersChange?: () => void; // Callback to reload questions after answer changes
}
```

**UI Structure (similar to MainQuestionCard):**
```tsx
{isExpanded && (
  <div className="ml-6 space-y-3">
    <AnswerList answers={question.answers} />
    
    {!showAnswerForm && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAnswerForm(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Answer
      </Button>
    )}
    
    {showAnswerForm && (
      <div className="border rounded-lg p-4 bg-gray-50">
        <AnswerForm
          questionId={question.id}
          onSuccess={() => {
            setShowAnswerForm(false);
            onAnswersChange?.();
          }}
          onCancel={() => setShowAnswerForm(false)}
        />
      </div>
    )}
  </div>
)}
```

### 3. QuestionSetCard Component Updates

**File:** `src/components/questions/QuestionSetCard.tsx`

**Changes:**
- Pass `onAnswersChange` prop through to MainQuestionCard components

**Props Update:**
```typescript
interface QuestionSetCardProps {
  // ... existing props
  onAnswersChange?: () => void;
}
```

### 4. QuestionSetList Component Updates

**File:** `src/components/questions/QuestionSetList.tsx`

**Changes:**
- Pass `onAnswersChange` prop through to QuestionSetCard components

**Props Update:**
```typescript
interface QuestionSetListProps {
  // ... existing props
  onAnswersChange?: () => void;
}
```

### 5. ExamPaperEditPage Component Updates

**File:** `src/app/dashboard/exam-papers/[id]/edit/page.tsx`

**Changes:**
- Pass `onAnswersChange={reloadQuestionSets}` to QuestionSetList component

**Updated QuestionSetList Usage:**
```tsx
<QuestionSetList
  questionSets={questionSets}
  isLoading={questionSetsLoading}
  onEditQuestion={handleEditQuestion}
  onDeleteQuestion={handleDeleteQuestion}
  onAddSubQuestion={handleAddSubQuestion}
  onEditQuestionSet={handleEditQuestionSet}
  onDeleteQuestionSet={handleRemoveQuestionSet}
  onAddQuestion={handleOpenAddQuestionDialog}
  onAnswersChange={reloadQuestionSets}  // New prop
  defaultExpanded={true}
/>
```

### 6. Types Updates

**File:** `src/components/questions/types.ts`

**Changes:**
- Add `onAnswersChange?: () => void` to relevant interfaces

```typescript
export interface MainQuestionCardProps {
  question: QuestionRead;
  subQuestions: QuestionRead[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubQuestion: () => void;
  onAnswersChange?: () => void;  // New
  onEditQuestion?: (question: QuestionRead) => void;
  onDeleteQuestion?: (questionId: string) => void;
}

export interface SubQuestionCardProps {
  question: QuestionRead;
  onEdit: () => void;
  onDelete: () => void;
  onAnswersChange?: () => void;  // New
}

export interface QuestionSetCardProps {
  questionSet: QuestionSetWithQuestions;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditQuestion: (question: QuestionRead) => void;
  onDeleteQuestion: (questionId: string) => void;
  onAddSubQuestion: (parentId: string) => void;
  onEditQuestionSet: () => void;
  onDeleteQuestionSet: () => void;
  onAddQuestion: () => void;
  onAnswersChange?: () => void;  // New
}

export interface QuestionSetListProps {
  questionSets: QuestionSetWithQuestions[];
  isLoading: boolean;
  onEditQuestion: (question: QuestionRead) => void;
  onDeleteQuestion: (questionId: string) => void;
  onAddSubQuestion: (parentId: string) => void;
  onEditQuestionSet: (questionSet: QuestionSetWithQuestions) => void;
  onDeleteQuestionSet: (questionSetId: string) => void;
  onAddQuestion: (questionSetId: string) => void;
  defaultExpanded?: boolean;
  onAnswersChange?: () => void;  // New
}
```

## Data Models

### Answer Creation Payload

The AnswerForm component already handles the answer creation payload:

```typescript
{
  text: OutputData,        // EditorJS format
  question_id: string,     // The question this answer belongs to
}
```

### API Endpoints Used

- `POST /api/answers` - Create a new answer (handled by AnswerForm)
- `GET /api/question-sets/exam-paper/{exam_paper_id}` - Reload questions with answers (existing)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Answer Form Visibility Toggle

*For any* question card (main or sub-question), when the "Add Answer" button is clicked, the answer form should become visible and the button should be hidden. When the form is cancelled or submitted successfully, the form should be hidden and the button should become visible again.

**Validates: Requirements 2.2, 2.3**

### Property 2: Answer Creation Persistence

*For any* valid answer submission, after successful API response, the reloaded question data should include the newly created answer in the question's answers array.

**Validates: Requirements 3.1, 3.3**

### Property 3: Independent Form State

*For any* two different questions displayed simultaneously, opening the answer form for one question should not affect the form state of the other question.

**Validates: Requirements 7.2**

### Property 4: Sub-Question Answer Association

*For any* sub-question, when an answer is created, the answer's question_id should match the sub-question's ID, not the parent question's ID.

**Validates: Requirements 4.2**

### Property 5: Form State Preservation on Validation Error

*For any* answer form submission that fails validation, the form content should remain unchanged and editable, allowing the user to correct the error without losing their work.

**Validates: Requirements 6.4**

## Error Handling

### API Errors

**Scenario:** Answer creation API call fails

**Handling:**
1. AnswerForm component catches the error
2. Displays error notification via `useUIStore`
3. Keeps form open with user's content preserved
4. User can retry submission or cancel

**Implementation:** Already handled by AnswerForm component

### Validation Errors

**Scenario:** User submits empty answer

**Handling:**
1. AnswerForm validates content before submission
2. Displays validation error message
3. Prevents API call
4. Keeps form open for correction

**Implementation:** Already handled by AnswerForm component

### Missing Question ID

**Scenario:** Question ID is undefined or invalid

**Handling:**
1. Component checks for valid question ID before rendering AnswerForm
2. Logs error to console
3. Does not render AnswerForm
4. Shows error notification to user

**Implementation:**
```typescript
const handleAddAnswer = () => {
  if (!question?.id) {
    console.error('Cannot add answer: question ID is missing');
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'Cannot add answer: question data is invalid'
    });
    return;
  }
  setShowAnswerForm(true);
};
```

## Testing Strategy

### Unit Tests

**Test File:** `src/components/questions/__tests__/MainQuestionCard.test.tsx`

1. **Test: Add Answer button renders when question is expanded**
   - Render MainQuestionCard with expanded state
   - Verify "Add Answer" button is visible
   - Verify button has correct text and icon

2. **Test: Add Answer button hidden when form is open**
   - Click "Add Answer" button
   - Verify button is no longer visible
   - Verify AnswerForm is rendered

3. **Test: Form closes on cancel**
   - Open answer form
   - Click cancel button
   - Verify form is hidden
   - Verify "Add Answer" button is visible again

4. **Test: Form closes and reloads on success**
   - Open answer form
   - Mock successful answer creation
   - Submit form
   - Verify form is hidden
   - Verify `onAnswersChange` callback was called

**Test File:** `src/components/questions/__tests__/SubQuestionCard.test.tsx`

1. **Test: Sub-question answer form uses correct question ID**
   - Render SubQuestionCard with specific question ID
   - Open answer form
   - Verify AnswerForm receives correct questionId prop

### Integration Tests

**Test File:** `src/app/dashboard/exam-papers/__tests__/edit-page-answers.test.tsx`

1. **Test: Adding answer to main question updates display**
   - Navigate to exam paper edit page
   - Expand a question
   - Click "Add Answer"
   - Fill in answer content
   - Submit form
   - Verify new answer appears in AnswerList

2. **Test: Adding answer to sub-question updates display**
   - Navigate to exam paper edit page
   - Expand a main question with sub-questions
   - Expand a sub-question
   - Click "Add Answer" on sub-question
   - Fill in answer content
   - Submit form
   - Verify new answer appears in sub-question's AnswerList

3. **Test: Multiple questions maintain independent form state**
   - Expand two different questions
   - Open answer form for first question
   - Verify second question's form is not open
   - Open answer form for second question
   - Verify first question's form remains open

### Property-Based Tests

Property-based tests will be implemented using the testing framework specified in the project (likely Jest with React Testing Library).

**Test File:** `src/components/questions/__tests__/answer-form-properties.test.tsx`

1. **Property Test: Form visibility toggle**
   - Generate random question data
   - Test that clicking "Add Answer" always shows form and hides button
   - Test that cancel/success always hides form and shows button
   - Run 100 iterations with different question data

2. **Property Test: Answer persistence**
   - Generate random answer content
   - Submit answer
   - Verify reloaded data includes the answer
   - Run 100 iterations with different answer content

### Manual Testing Checklist

- [ ] Add answer to main question
- [ ] Add answer to sub-question
- [ ] Cancel answer form
- [ ] Submit empty answer (should show validation error)
- [ ] Submit valid answer (should succeed)
- [ ] Verify answer appears in list after creation
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport
- [ ] Test with multiple questions expanded
- [ ] Test form state independence between questions
