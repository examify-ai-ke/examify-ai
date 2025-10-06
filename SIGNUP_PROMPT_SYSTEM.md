# Sign-Up Prompt System

## Overview

A smart, non-intrusive sign-up prompt system that encourages visitors to create accounts at strategic moments during their browsing experience.

## Features

✅ **Multiple Prompt Types** - Different prompts for different contexts
✅ **Smart Tracking** - Tracks user behavior and shows prompts at optimal times
✅ **Non-Intrusive** - Respects user preferences with "Maybe Later" option
✅ **Persistent State** - Remembers dismissed prompts across sessions
✅ **Conversion Optimized** - Shows prompts when users are most engaged

## Components

### 1. SignUpPrompt Component (`src/components/public/sign-up-prompt.tsx`)

Beautiful modal with four prompt types:

#### Prompt Types

**1. View Answer (`view-answer`)**
- **Trigger:** User clicks "View Answer" button
- **Message:** "Want to see the answer?"
- **Benefits:**
  - View complete answers and solutions
  - Access marking schemes
  - Get detailed explanations
  - Track your progress

**2. Save Paper (`save-paper`)**
- **Trigger:** User tries to bookmark/save a paper
- **Message:** "Save this for later?"
- **Benefits:**
  - Bookmark unlimited papers
  - Create custom collections
  - Access from any device
  - Get personalized recommendations

**3. Track Progress (`track-progress`)**
- **Trigger:** After completing several questions
- **Message:** "Track your revision progress"
- **Benefits:**
  - Track questions attempted
  - Monitor your progress
  - Get performance insights
  - Receive study recommendations

**4. Time-Based (`time-based`)**
- **Trigger:** After 3-5 question views or 5 seconds on page
- **Message:** "Enjoying Exampapel?"
- **Benefits:**
  - Access all exam papers
  - Save your favorites
  - Track your progress
  - Get personalized study plans

### 2. Tracking Hook (`src/hooks/useSignUpPrompt.ts`)

Manages prompt display logic and user interaction tracking.

#### Key Functions

```typescript
const {
  // State
  isPromptOpen,        // Is prompt currently showing?
  promptType,          // Which prompt type is showing?
  viewCount,           // How many questions viewed?
  
  // Actions
  incrementViewCount,  // Track a question view
  showPrompt,          // Show specific prompt type
  dismissPrompt,       // User clicked "Maybe Later"
  closePrompt,         // Close without dismissing
  resetPromptState,    // Reset all tracking (after sign-up)
  checkTimeBasedPrompt, // Check if time-based prompt should show
  
  // Utilities
  shouldShowPrompt,    // Check if prompt should be shown
} = useSignUpPrompt();
```

#### Tracking Logic

**View Count Tracking:**
- Increments each time a question is viewed
- Stored in localStorage
- Persists across sessions

**Dismissal Tracking:**
- Tracks which prompts user has dismissed
- Prevents showing same prompt for 24 hours
- Respects user preferences

**Time-Based Triggers:**
- Shows after 3 question views
- Waits 5 seconds before displaying
- Only shows once per 24 hours

### 3. Question View Tracking (`useQuestionViewTracking`)

Automatic tracking hook for question views:

```typescript
function MyQuestionPage() {
  useQuestionViewTracking(); // Automatically tracks views
  
  return <div>Question content...</div>;
}
```

## Integration

### QuestionModal Integration

The QuestionModal now includes:

1. **View Answer Button** - Triggers `view-answer` prompt
2. **Automatic View Tracking** - Increments count when modal opens
3. **Sign-Up Prompt** - Shows appropriate prompt based on user action

```tsx
<QuestionModal
  question={question}
  isOpen={isOpen}
  onClose={handleClose}
/>
// Automatically includes sign-up prompt system
```

## Usage Examples

### Basic Usage in Component

```tsx
'use client';

import { useSignUpPrompt } from '@/hooks/useSignUpPrompt';
import { SignUpPrompt } from '@/components/public';

export function MyComponent() {
  const { 
    isPromptOpen, 
    promptType, 
    showPrompt, 
    dismissPrompt, 
    closePrompt 
  } = useSignUpPrompt();

  const handleSaveClick = () => {
    // Show save-paper prompt when user tries to save
    showPrompt('save-paper');
  };

  return (
    <>
      <button onClick={handleSaveClick}>
        Save Paper
      </button>

      <SignUpPrompt
        isOpen={isPromptOpen}
        onClose={closePrompt}
        onDismiss={dismissPrompt}
        type={promptType}
      />
    </>
  );
}
```

### Automatic View Tracking

```tsx
'use client';

import { useQuestionViewTracking } from '@/hooks/useSignUpPrompt';

export function QuestionPage() {
  // Automatically tracks views and shows time-based prompt
  useQuestionViewTracking();

  return <div>Question content...</div>;
}
```

### Manual Tracking

```tsx
const { incrementViewCount, checkTimeBasedPrompt } = useSignUpPrompt();

// Track a view
incrementViewCount();

// Check if time-based prompt should show
setTimeout(() => {
  checkTimeBasedPrompt();
}, 5000);
```

## Configuration

### Timing Constants

Located in `src/hooks/useSignUpPrompt.ts`:

```typescript
const MIN_PROMPT_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const VIEW_THRESHOLD = 3; // Show after 3 views
```

**Customize:**
- Change `MIN_PROMPT_INTERVAL` to adjust cooldown period
- Change `VIEW_THRESHOLD` to show prompts sooner/later

### LocalStorage Key

```typescript
const STORAGE_KEY = 'exampapel_prompt_state';
```

**Stored Data:**
```json
{
  "viewCount": 5,
  "dismissedPrompts": ["time-based", "view-answer"],
  "lastPromptTime": 1704067200000,
  "hasSeenPrompt": true
}
```

## Prompt Display Logic

### Decision Flow

```
User Action
    ↓
Check if prompt dismissed recently (< 24h)
    ↓ No
Check if any prompt shown recently (< 24h)
    ↓ No
Check view threshold (≥ 3 views for time-based)
    ↓ Yes
Show Prompt
```

### Cooldown Rules

1. **Per-Prompt Cooldown:** 24 hours after dismissing specific prompt
2. **Global Cooldown:** 24 hours after seeing any prompt
3. **View Threshold:** Must view 3+ questions for time-based prompts

## Conversion Tracking

### Events to Track

```typescript
// When prompt is shown
analytics.track('signup_prompt_shown', {
  type: promptType,
  viewCount: viewCount,
});

// When user dismisses
analytics.track('signup_prompt_dismissed', {
  type: promptType,
});

// When user signs up from prompt
analytics.track('signup_from_prompt', {
  type: promptType,
  source: 'question_modal',
});
```

## Testing

### Test Different Prompts

```typescript
// In browser console
localStorage.setItem('exampapel_prompt_state', JSON.stringify({
  viewCount: 0,
  dismissedPrompts: [],
  lastPromptTime: 0,
  hasSeenPrompt: false,
}));

// Reload page and interact with questions
```

### Test View Threshold

```typescript
// Set view count to trigger time-based prompt
localStorage.setItem('exampapel_prompt_state', JSON.stringify({
  viewCount: 3,
  dismissedPrompts: [],
  lastPromptTime: 0,
  hasSeenPrompt: false,
}));
```

### Reset Prompt State

```typescript
const { resetPromptState } = useSignUpPrompt();
resetPromptState(); // Clears all tracking
```

## Best Practices

### 1. Show Prompts at High-Intent Moments

✅ **Good:**
- When user clicks "View Answer"
- When user tries to save/bookmark
- After viewing multiple questions

❌ **Bad:**
- Immediately on page load
- During active reading
- Multiple times in short period

### 2. Respect User Decisions

✅ **Good:**
- Honor "Maybe Later" for 24 hours
- Don't show multiple prompts quickly
- Allow easy dismissal

❌ **Bad:**
- Show same prompt repeatedly
- Block content behind prompts
- Make dismissal difficult

### 3. Provide Clear Value

✅ **Good:**
- List specific benefits
- Show what they'll unlock
- Make sign-up easy

❌ **Bad:**
- Generic "Sign up now"
- No clear benefits
- Complex registration

## Customization

### Change Prompt Content

Edit `promptContent` in `src/components/public/sign-up-prompt.tsx`:

```typescript
const promptContent = {
  'view-answer': {
    icon: Eye,
    title: 'Your custom title',
    description: 'Your custom description',
    benefits: [
      'Custom benefit 1',
      'Custom benefit 2',
    ],
  },
  // ... other prompts
};
```

### Add New Prompt Type

1. **Add type:**
```typescript
export type SignUpPromptType = 
  | 'view-answer' 
  | 'save-paper' 
  | 'track-progress' 
  | 'time-based'
  | 'your-new-type'; // Add here
```

2. **Add content:**
```typescript
const promptContent = {
  // ... existing prompts
  'your-new-type': {
    icon: YourIcon,
    title: 'Your Title',
    description: 'Your Description',
    benefits: ['Benefit 1', 'Benefit 2'],
  },
};
```

3. **Trigger it:**
```typescript
showPrompt('your-new-type');
```

### Style Customization

The prompt uses Tailwind classes and can be customized:

- **Colors:** Change `bg-teal-500` to your brand color
- **Size:** Adjust `max-w-md` for modal width
- **Spacing:** Modify padding/margin classes

## Performance

### Bundle Size
- SignUpPrompt: ~8KB (gzipped)
- useSignUpPrompt: ~2KB (gzipped)
- Total: ~10KB

### LocalStorage Usage
- ~200 bytes per user
- Minimal impact

### Render Performance
- Lazy loaded (only when needed)
- No impact on initial page load
- Efficient re-renders

## Troubleshooting

### Prompt Not Showing

**Check:**
1. View count: `localStorage.getItem('exampapel_prompt_state')`
2. Last prompt time (must be > 24h ago)
3. Dismissed prompts array
4. Console for errors

**Solution:**
```typescript
// Reset state
const { resetPromptState } = useSignUpPrompt();
resetPromptState();
```

### Prompt Showing Too Often

**Check:**
- `MIN_PROMPT_INTERVAL` setting
- Multiple components calling `showPrompt()`

**Solution:**
- Increase `MIN_PROMPT_INTERVAL`
- Consolidate prompt triggers

### LocalStorage Full

**Rare but possible:**
- Clear old data
- Implement data rotation
- Use smaller storage keys

## Future Enhancements

### Planned Features

- [ ] A/B testing different prompt messages
- [ ] Analytics integration
- [ ] Email capture without full registration
- [ ] Progressive disclosure (collect info gradually)
- [ ] Exit-intent prompts
- [ ] Scroll-based triggers
- [ ] Social proof ("Join 10,000+ students")
- [ ] Urgency indicators ("Limited time offer")

### Potential Improvements

- Server-side tracking for logged-in users
- Machine learning for optimal timing
- Personalized prompt messages
- Multi-step registration flow
- Gamification elements

---

**Status:** ✅ Complete and active
**Conversion Goal:** 5-10% of visitors
**Next:** Monitor conversion rates and optimize
