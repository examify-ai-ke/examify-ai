# Answer Functionality Implementation Status

## Current Status Summary

### ✅ Completed (Tasks 1-6 from original tasks.md)
- TypeScript interfaces updated with `onAnswersChange` callbacks
- Add Answer functionality implemented in MainQuestionCard
- Add Answer functionality implemented in SubQuestionCard
- Props passed through QuestionSetCard and QuestionSetList
- ExamPaperEditPage integrated with answer creation

### ❌ Issues Identified

#### 1. Missing Comment API Functions
**Problem**: Comment endpoints exist in backend API but are not wrapped in utility files.

**Evidence**:
- Backend has endpoints: `/api/v1/comment`, `/api/v1/comment/by_answer/{answer_id}`, etc.
- `src/lib/api-admin.ts` has `answers` section but no comment functions
- `src/lib/api-public.ts` has `answers` section but no comment functions

**Solution**: Add comment API functions to both files (see `requirements-update.md` and `tasks-update.md`)

#### 2. Duplicate Author Names in AnswerRenderer
**Problem**: Author name appears twice in the answer header.

**Current Code** (`src/components/ui/answer-renderer.tsx` lines 73-85):
```typescript
{showAuthor && answer.created_by && (
  <div className="flex items-center gap-2">
    {answer.created_by.profile_image && (
      <img
        src={answer.created_by.profile_image}
        alt={`${answer.created_by.first_name} ${answer.created_by.last_name}`}
        className="w-6 h-6 rounded-full"
      />
    )}
    <span className="text-sm font-medium text-gray-700">
      {answer.created_by.first_name} {answer.created_by.last_name}
    </span>
  </div>
)}
```

**Issue**: The name appears in both the `alt` text AND the `<span>`. The `<span>` should be the only visible instance.

**Solution**: This is actually correct - the alt text is for accessibility and won't be visible. The issue must be elsewhere in the rendering.

#### 3. Missing User Avatar
**Problem**: User avatar not displaying properly.

**Current Code**: Avatar only shows if `profile_image` exists (line 74-79). No fallback for missing images.

**Solution**: Add default avatar placeholder when `profile_image` is missing:
```typescript
{answer.created_by.profile_image ? (
  <img
    src={answer.created_by.profile_image}
    alt={`${answer.created_by.first_name} ${answer.created_by.last_name}`}
    className="w-8 h-8 rounded-full"
  />
) : (
  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
    {answer.created_by.first_name[0]}{answer.created_by.last_name[0]}
  </div>
)}
```

#### 4. Missing Visual Separator
**Problem**: No clear separation between answer content and footer.

**Current Code**: No separator between lines 96 (answer content) and 99 (answer footer).

**Solution**: Add Separator component:
```typescript
import { Separator } from './separator';

// After answer content (line 96), before footer (line 99):
<Separator className="my-3" />
```

#### 5. Like/Dislike Not Interactive
**Problem**: Vote counts are displayed but not interactive.

**Current Code** (lines 88-97):
```typescript
{showVotes && (
  <div className="flex items-center gap-3 text-sm">
    {answer.upvotes_count !== undefined && (
      <span className="text-green-600">
        ↑ {answer.upvotes_count}
      </span>
    )}
    {answer.downvotes_count !== undefined && (
      <span className="text-red-600">
        ↓ {answer.downvotes_count}
      </span>
    )}
  </div>
)}
```

**Solution**: Replace static spans with interactive buttons that call `publicAPI.answers.toggleLike()` and `publicAPI.answers.toggleDislike()`.

#### 6. Missing Comments Count Display
**Problem**: `comments_count` field exists in answer data but not displayed.

**Solution**: Add to footer section:
```typescript
{answer.comments_count !== undefined && answer.comments_count > 0 && (
  <span className="flex items-center gap-1 text-gray-600">
    <MessageCircle className="w-4 h-4" />
    {answer.comments_count} {answer.comments_count === 1 ? 'comment' : 'comments'}
  </span>
)}
```

## API Functions Status

### ✅ Already Implemented
- `adminAPI.answers.toggleLike()` - Line 1991 in api-admin.ts
- `adminAPI.answers.toggleDislike()` - Line 1999 in api-admin.ts
- `publicAPI.answers.toggleLike()` - Line 1204 in api-public.ts
- `publicAPI.answers.toggleDislike()` - Line 1228 in api-public.ts

### ❌ Missing (Need to Add)
- `adminAPI.answers.getComments()`
- `adminAPI.answers.getCommentCount()`
- `adminAPI.answers.createComment()`
- `adminAPI.answers.updateComment()`
- `adminAPI.answers.deleteComment()`
- `adminAPI.answers.createCommentReply()`
- `adminAPI.answers.toggleCommentLike()`
- `adminAPI.answers.toggleCommentDislike()`
- Same functions for `publicAPI.answers`

## Next Steps

1. **Immediate Fixes** (High Priority):
   - Fix avatar display with default fallback
   - Add visual separator
   - Verify no duplicate author names (may already be correct)

2. **Add Interactivity** (Medium Priority):
   - Make like/dislike buttons interactive
   - Add comment count display
   - Add comment API functions

3. **Future Enhancements** (Low Priority):
   - Comment viewing UI
   - Comment creation UI
   - Nested comment replies UI

## Files to Modify

1. `src/lib/api-admin.ts` - Add comment functions (lines ~2000+)
2. `src/lib/api-public.ts` - Add comment functions (lines ~1240+)
3. `src/components/ui/answer-renderer.tsx` - Fix display and add interactions

## Testing Checklist

- [ ] Avatar displays with profile_image
- [ ] Default avatar displays without profile_image
- [ ] Author name appears only once
- [ ] Visual separator is visible
- [ ] Like button is interactive
- [ ] Dislike button is interactive
- [ ] Vote counts update correctly
- [ ] Comment count displays
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors

## References

- Original tasks: `.kiro/specs/exam-papers-add-answer-functionality/tasks.md`
- Updated requirements: `.kiro/specs/exam-papers-add-answer-functionality/requirements-update.md`
- Updated tasks: `.kiro/specs/exam-papers-add-answer-functionality/tasks-update.md`
- API types: `src/types/generated/api.ts`
- Answer renderer: `src/components/ui/answer-renderer.tsx`
