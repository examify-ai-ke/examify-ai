# Editor.js Renderer Components

A set of React components for rendering Editor.js content in read-only mode across your application.

## Components

### 1. EditorRenderer
Basic renderer for Editor.js content without any additional metadata.

**Use when:** You just need to display Editor.js content (questions, answers, descriptions, etc.)

```tsx
import EditorRenderer from '@/components/ui/editor-renderer';

<EditorRenderer data={editorJsData} />
```

**Supported Blocks:**
- ✅ Paragraph
- ✅ Header (h1-h4)
- ✅ List (ordered/unordered)
- ✅ Quote
- ✅ Code
- ✅ Image (with caption, border, background options)
- ✅ Delimiter
- ✅ Table
- ✅ Embed (videos, etc.)

---

### 2. QuestionRenderer
Specialized renderer for questions with metadata, marks, and sub-questions.

**Use when:** Displaying exam questions with full context

```tsx
import QuestionRenderer from '@/components/ui/question-renderer';

<QuestionRenderer 
  question={questionData}
  showMetadata={true}
  showQuestionNumber={true}
  showMarks={true}
  showSubQuestions={true}
  onQuestionClick={(id) => router.push(`/questions/${id}`)}
/>
```

**Props:**
- `question` (required): Question data object
- `showMetadata` (default: false): Show institution, course, etc.
- `showQuestionNumber` (default: true): Display question number
- `showMarks` (default: true): Show marks allocation
- `showSubQuestions` (default: true): Render nested sub-questions
- `className`: Additional CSS classes
- `onQuestionClick`: Click handler for navigation

**Features:**
- Displays question number and marks
- Shows badges for main/sub questions
- Renders sub-questions recursively with indentation
- Shows answer count indicator
- Optional metadata display (institution, course, programme, etc.)

---

### 3. AnswerRenderer
Specialized renderer for answers with author info, votes, and nested replies.

**Use when:** Displaying user-submitted answers

```tsx
import AnswerRenderer from '@/components/ui/answer-renderer';

<AnswerRenderer 
  answer={answerData}
  showAuthor={true}
  showTimestamp={true}
  showVotes={true}
  showReplies={true}
  onAnswerClick={(id) => router.push(`/answers/${id}`)}
  onReplyClick={(id) => setReplyingTo(id)}
/>
```

**Props:**
- `answer` (required): Answer data object
- `showAuthor` (default: true): Display author name and avatar
- `showTimestamp` (default: true): Show "X time ago"
- `showVotes` (default: true): Display upvote/downvote counts
- `showReplies` (default: true): Render nested replies
- `className`: Additional CSS classes
- `onAnswerClick`: Click handler for answer
- `onReplyClick`: Click handler for reply button

**Features:**
- Displays author information with avatar
- Shows accepted/verified badges
- Displays vote counts (upvotes/downvotes)
- Renders nested replies recursively
- Shows edit indicator
- Time ago formatting

---

## Usage Examples

### Example 1: Exam Paper View
Display all questions in an exam paper:

```tsx
import QuestionRenderer from '@/components/ui/question-renderer';

export function ExamPaperView({ examPaper }) {
  return (
    <div className="space-y-6">
      <h1>{examPaper.title}</h1>
      
      {examPaper.questions.map((question) => (
        <QuestionRenderer
          key={question.id}
          question={question}
          showQuestionNumber={true}
          showMarks={true}
          showSubQuestions={true}
        />
      ))}
    </div>
  );
}
```

### Example 2: Question with Answers
Display a question and its answers:

```tsx
import QuestionRenderer from '@/components/ui/question-renderer';
import AnswerRenderer from '@/components/ui/answer-renderer';

export function QuestionDetailPage({ question, answers }) {
  return (
    <div className="space-y-8">
      {/* Question */}
      <QuestionRenderer
        question={question}
        showMetadata={true}
      />
      
      {/* Answers */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Answers</h2>
        {answers.map((answer) => (
          <AnswerRenderer
            key={answer.id}
            answer={answer}
            showAuthor={true}
            showVotes={true}
            showReplies={true}
          />
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Question Preview Card
Minimal question display for lists:

```tsx
import QuestionRenderer from '@/components/ui/question-renderer';

export function QuestionCard({ question }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <QuestionRenderer
        question={question}
        showQuestionNumber={false}
        showMarks={true}
        showSubQuestions={false}
        onQuestionClick={(id) => router.push(`/questions/${id}`)}
      />
    </div>
  );
}
```

### Example 4: Study Mode
Question without metadata for clean study view:

```tsx
import QuestionRenderer from '@/components/ui/question-renderer';
import AnswerRenderer from '@/components/ui/answer-renderer';
import { Button } from '@/components/ui/button';

export function StudyCard({ question, answer }) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  return (
    <div className="space-y-4">
      <QuestionRenderer
        question={question}
        showQuestionNumber={false}
        showMarks={false}
        showMetadata={false}
      />
      
      <Button onClick={() => setShowAnswer(!showAnswer)}>
        {showAnswer ? 'Hide' : 'Show'} Answer
      </Button>
      
      {showAnswer && (
        <AnswerRenderer
          answer={answer}
          showAuthor={false}
          showVotes={false}
          showReplies={false}
        />
      )}
    </div>
  );
}
```

### Example 5: Just the Content
Use EditorRenderer for simple content display:

```tsx
import EditorRenderer from '@/components/ui/editor-renderer';

export function InstructionsDisplay({ instructions }) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-bold mb-2">Instructions</h3>
      <EditorRenderer data={instructions.text} />
    </div>
  );
}
```

---

## Data Structure

### Question Data Format
```typescript
{
  id: string;
  text: OutputData; // Editor.js format
  marks?: number;
  numbering_style?: string;
  question_number?: string;
  children?: QuestionData[]; // Sub-questions
  answers?: AnswerData[];
  question_set?: { id, title, slug };
  exam_paper?: { id, year_of_exam, identifying_name, slug };
  institution?: { id, name, slug };
  course?: { id, name, course_acronym };
  programme?: { id, name };
  // ... more fields
}
```

### Answer Data Format
```typescript
{
  id: string;
  text: OutputData; // Editor.js format
  is_accepted?: boolean;
  is_verified?: boolean;
  upvotes_count?: number;
  downvotes_count?: number;
  created_at?: string;
  created_by?: { id, first_name, last_name, email, profile_image };
  replies?: AnswerData[]; // Nested replies
  // ... more fields
}
```

---

## Styling

All components use Tailwind CSS and are fully customizable:

```tsx
<QuestionRenderer 
  question={question}
  className="bg-white shadow-lg rounded-lg p-6"
/>
```

The components use semantic class names for easy targeting:
- `.question-renderer` - Question container
- `.question-content` - Question text content
- `.question-metadata` - Metadata section
- `.sub-questions` - Sub-questions container
- `.answer-renderer` - Answer container
- `.answer-content` - Answer text content
- `.replies` - Nested replies container

---

## Best Practices

1. **Performance**: Use React.memo for lists of questions/answers
2. **Loading States**: Show skeleton loaders while fetching data
3. **Error Handling**: Wrap in error boundaries
4. **Accessibility**: Components include proper ARIA labels
5. **SEO**: Server-side render for public content

---

## Dependencies

- `@editorjs/editorjs` - For OutputData types
- `date-fns` - For time formatting (AnswerRenderer)
- `next/image` - For optimized images (optional)
- Tailwind CSS - For styling

---

## See Also

- [Editor Component](./editor.tsx) - For editing content
- [Example Usage](../examples/renderer-examples.tsx) - Live examples
