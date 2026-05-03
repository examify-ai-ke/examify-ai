# Question Edit Implementation Summary

## ✅ Completed: Edit Questions in Dialog

Successfully implemented the ability to edit questions using the same dialog used for creating questions, instead of navigating to a separate edit page.

## Changes Made

### 1. **Added Edit State** (`src/app/dashboard/exam-papers/[id]/edit/page.tsx`)
```typescript
const [editingQuestion, setEditingQuestion] = useState<QuestionRead | null>(null)
```

### 2. **Updated Edit Handler**
Changed from navigation to dialog:

**Before:**
```typescript
const handleEditQuestion = (question: QuestionRead) => {
    router.push(`/dashboard/questions/${question.id}/edit`)
}
```

**After:**
```typescript
const handleEditQuestion = (question: QuestionRead) => {
    setEditingQuestion(question)
    setIsSubQuestion(question.is_sub_question || false)
    setParentQuestionId(question.parent_id || '')
    setShowAddQuestionDialog(true)
}
```

### 3. **Enhanced Dialog**
Updated the Add Question Dialog to support editing:

- **Dynamic Title**: Shows "Edit Question", "Add Sub-question", or "Add New Question"
- **Dynamic Description**: Contextual message based on mode
- **Question Prop**: Passes `editingQuestion` to QuestionForm
- **Key Prop**: Forces re-render when editing different questions
- **Reset on Close**: Clears editing state when dialog closes

```tsx
<Dialog open={showAddQuestionDialog} onOpenChange={(open) => {
    setShowAddQuestionDialog(open)
    if (!open) {
        setEditingQuestion(null)
        setIsSubQuestion(false)
        setParentQuestionId('')
    }
}}>
    <DialogHeader>
        <DialogTitle>
            {editingQuestion ? 'Edit Question' : ...}
        </DialogTitle>
    </DialogHeader>
    <QuestionForm
        key={editingQuestion?.id || 'new'}
        question={editingQuestion || undefined}
        questionSetId={editingQuestion?.question_set_id || questionSets[0]?.id}
        ...
    />
</Dialog>
```

## How It Works

### Creating a New Question
1. Click "Add Question" button
2. Dialog opens with empty form
3. Fill in details and submit
4. Question is created via API
5. Dialog closes and questions reload

### Editing an Existing Question
1. Click "Edit" from question actions menu
2. Dialog opens with question data pre-filled
3. Modify any fields (text, marks, numbering, etc.)
4. Submit changes
5. Question is updated via API
6. Dialog closes and questions reload

### Adding a Sub-Question
1. Click "Add Sub-question" from main question actions
2. Dialog opens in sub-question mode
3. Parent question is pre-selected
4. Fill in sub-question details
5. Sub-question is created and linked to parent

## Benefits

✅ **Consistent UX**: Same interface for create and edit
✅ **No Navigation**: Stay on the same page
✅ **Faster Workflow**: Quick edits without page loads
✅ **Context Preserved**: Don't lose your place in the exam paper
✅ **Reuses Existing Code**: QuestionForm already supported editing
✅ **Clean State Management**: Proper cleanup on dialog close

## User Flow

```
Exam Paper Edit Page
    ↓
Click "Edit" on Question
    ↓
Dialog Opens with Question Data
    ↓
Modify Question Content (Editor.js)
    ↓
Update Marks, Number, Style
    ↓
Click "Save"
    ↓
API Updates Question
    ↓
Dialog Closes
    ↓
Questions Reload
    ↓
See Updated Question
```

## Technical Details

### State Management
- `editingQuestion`: Holds the question being edited (null when creating)
- `isSubQuestion`: Tracks if editing/creating a sub-question
- `parentQuestionId`: Stores parent ID for sub-questions
- `showAddQuestionDialog`: Controls dialog visibility

### Form Behavior
- **Create Mode**: `question` prop is undefined
- **Edit Mode**: `question` prop contains existing question data
- **Key Prop**: `key={editingQuestion?.id || 'new'}` forces form reset when switching questions

### API Calls
- **Create**: `adminAPI.questions.createMain()` or `createSubQuestion()`
- **Update**: `adminAPI.questions.update(questionId, data)`

### Cleanup
Dialog `onOpenChange` handler ensures state is reset when closing:
```typescript
onOpenChange={(open) => {
    setShowAddQuestionDialog(open)
    if (!open) {
        setEditingQuestion(null)
        setIsSubQuestion(false)
        setParentQuestionId('')
    }
}}
```

## Testing Checklist

- [x] Edit main question
- [x] Edit sub-question
- [x] Create new main question
- [x] Create new sub-question
- [x] Cancel edit (state resets)
- [x] Edit different questions (form updates)
- [x] Update question text with Editor.js
- [x] Update marks and numbering
- [x] Questions reload after save

## Future Enhancements

Possible improvements:
1. **Optimistic Updates**: Update UI before API response
2. **Undo/Redo**: Allow reverting changes
3. **Auto-save**: Save drafts automatically
4. **Version History**: Track question changes over time
5. **Bulk Edit**: Edit multiple questions at once

## Related Files

- `src/app/dashboard/exam-papers/[id]/edit/page.tsx` - Main edit page
- `src/components/forms/question-form.tsx` - Question form component
- `src/components/ui/hierarchical-questions.tsx` - Question display
- `src/lib/api-admin.ts` - API client methods

---

**Status**: ✅ Complete and Working
**Date**: 2025-10-25
