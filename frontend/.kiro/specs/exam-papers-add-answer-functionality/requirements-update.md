# Requirements Update: Answer Display and Interaction Improvements

## Issue Summary

The answer functionality has been partially implemented (tasks 1-6 complete), but several display and interaction features are missing or broken:

1. **Missing Comment API Functions**: Comment endpoints exist in the backend but are not wrapped in `api-admin.ts` and `api-public.ts`
2. **User Avatar Not Displaying**: AnswerRenderer shows duplicate author names instead of avatar + name
3. **Missing Visual Separator**: No clear separation between answer content and footer
4. **Like/Dislike Not Functional**: Buttons exist in API but not integrated into UI

## New Requirements

### Requirement 8: Comment Management

**User Story:** As a user, I want to add comments to answers, so that I can provide additional context or ask follow-up questions.

#### Acceptance Criteria

1. THE System SHALL provide API functions to create comments on answers
2. THE System SHALL provide API functions to retrieve comments for an answer
3. THE System SHALL provide API functions to get comment counts for answers
4. THE System SHALL provide API functions to like/dislike comments
5. THE System SHALL provide API functions to reply to comments (nested comments)
6. WHEN displaying an answer, THE System SHALL show the comm
ents count
7. THE System SHALL display comments in chronological order (oldest first)

### Requirement 9: Answer Display Improvements

**User Story:** As a user, I want to see clear, well-formatted answers with proper author information, so that I can easily understand who wrote what.

#### Acceptance Criteria

1. WHEN displaying an answer, THE System SHALL show the author's profile image (avatar) if available
2. WHEN displaying an answer, THE System SHALL show the author's full name once (not duplicated)
3. WHEN an author has no profile image, THE System SHALL display a default avatar placeholder
4. THE System SHALL display a visual separator between answer content and answer footer
5. THE System SHALL use consistent spacing and alignment for all answer elements
6. THE System SHALL display the author avatar at 32x32 pixels (w-8 h-8)
7. THE System SHALL display author information in a single row with avatar, name, and timestamp

### Requirement 10: Answer Interaction Features

**User Story:** As a user, I want to like/dislike answers and see vote counts, so that I can indicate which answers are helpful.

#### Acceptance Criteria

1. WHEN viewing an answer, THE System SHALL display like and dislike buttons
2. WHEN a user clicks the like button, THE System SHALL toggle the like status
3. WHEN a user clicks the dislike button, THE System SHALL toggle the dislike status
4. THE System SHALL display the current like count next to the like button
5. THE System SHALL display the current dislike count next to the dislike button
6. THE System SHALL visually indicate when the current user has liked/disliked an answer
7. WHEN a user switches from like to dislike (or vice versa), THE System SHALL update both counts appropriately
8. THE System SHALL disable like/dislike buttons while the API request is in progress

## Technical Requirements

### API Functions to Add

#### In `src/lib/api-admin.ts` - Add to `adminAPI.answers`:

```typescript
// Comments
async getComments(answerId: string, params?: { skip?: number; limit?: number; order?: 'ascendent' | 'descendent' }) {
    return api.GET('/api/v1/comment/by_answer/{answer_id}', {
        params: {
            path: { answer_id: answerId },
            query: params
        }
    });
},

async getCommentCount(answerId: string) {
    return api.GET('/api/v1/comment/count/{answer_id}', {
        params: {
            path: { answer_id: answerId }
        }
    });
},

async createComment(commentData: components['schemas']['CommentCreate']) {
    return api.POST('/api/v1/comment', {
        body: commentData
    });
},

async updateComment(commentId: string, commentData: components['schemas']['CommentUpdate']) {
    return api.PUT('/api/v1/comment/{comment_id}', {
        params: {
            path: { comment_id: commentId }
        },
        body: commentData
    });
},

async deleteComment(commentId: string) {
    return api.DELETE('/api/v1/comment/{comment_id}', {
        params: {
            path: { comment_id: commentId }
        }
    });
},

async createCommentReply(parentId: string, replyData: components['schemas']['CommentCreate']) {
    return api.POST('/api/v1/comment/reply/{parent_id}', {
        params: {
            path: { parent_id: parentId }
        },
        body: replyData
    });
},

async toggleCommentLike(commentId: string) {
    return api.POST('/api/v1/comment/{comment_id}/like', {
        params: {
            path: { comment_id: commentId }
        }
    });
},

async toggleCommentDislike(commentId: string) {
    return api.POST('/api/v1/comment/{comment_id}/dislike', {
        params: {
            path: { comment_id: commentId }
        }
    });
},
```

#### In `src/lib/api-public.ts` - Add to `publicAPI.answers`:

```typescript
// Comments (same functions as admin, but in public API)
async getComments(answerId: string, params?: { skip?: number; limit?: number; order?: 'ascendent' | 'descendent' }) {
    try {
        const response = await api.GET('/api/v1/comment/by_answer/{answer_id}', {
            params: {
                path: { answer_id: answerId },
                query: params
            }
        });

        return {
            data: response.data,
            error: response.error,
        };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return {
            data: null,
            error: error as any,
        };
    }
},

async getCommentCount(answerId: string) {
    try {
        const response = await api.GET('/api/v1/comment/count/{answer_id}', {
            params: {
                path: { answer_id: answerId }
            }
        });

        return {
            data: response.data,
            error: response.error,
        };
    } catch (error) {
        console.error('Error fetching comment count:', error);
        return {
            data: null,
            error: error as any,
        };
    }
},

async createComment(commentData: components['schemas']['CommentCreate']) {
    try {
        const response = await api.POST('/api/v1/comment', {
            body: commentData
        });

        return {
            data: response.data,
            error: response.error,
        };
    } catch (error) {
        console.error('Error creating comment:', error);
        return {
            data: null,
            error: error as any,
        };
    }
},
```

### AnswerRenderer Component Updates

The `src/components/ui/answer-renderer.tsx` component needs these fixes:

1. **Fix duplicate author name**: Remove one instance of the author name display
2. **Add avatar with proper sizing**: Use `w-8 h-8` (32x32px) for avatar
3. **Add default avatar**: Show placeholder when `profile_image` is missing
4. **Add separator**: Add `<Separator />` component between content and footer
5. **Add like/dislike buttons**: Integrate interactive buttons with API calls
6. **Add comment count display**: Show comments count from `comments_count` field

## Implementation Priority

1. **High Priority** (Blocking user experience):
   - Fix duplicate author names
   - Add avatar display with default fallback
   - Add visual separator

2. **Medium Priority** (Enhances functionality):
   - Add comment API functions
   - Add like/dislike interactive buttons
   - Add comment count display

3. **Low Priority** (Future enhancement):
   - Nested comment replies UI
   - Comment editing/deletion UI
   - Real-time vote count updates

## Files to Modify

1. `src/lib/api-admin.ts` - Add comment functions to `adminAPI.answers`
2. `src/lib/api-public.ts` - Add comment functions to `publicAPI.answers`
3. `src/components/ui/answer-renderer.tsx` - Fix display issues and add interactions
4. `src/components/ui/separator.tsx` - Verify this component exists (from shadcn/ui)

## Testing Requirements

- Test avatar display with and without profile_image
- Test like/dislike toggle functionality
- Test comment count display
- Test visual separator rendering
- Test responsive layout on mobile/tablet/desktop
