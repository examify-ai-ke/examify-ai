'use client';

import React from 'react';
import QuestionRenderer from '@/components/ui/question-renderer';
import AnswerRenderer from '@/components/ui/answer-renderer';
import EditorRenderer from '@/components/ui/editor-renderer';

/**
 * Example usage of the renderer components
 * 
 * This file demonstrates how to use:
 * - EditorRenderer: For rendering any Editor.js content
 * - QuestionRenderer: For rendering questions with metadata
 * - AnswerRenderer: For rendering answers with author info
 */

// Example question data (from your API response)
const exampleQuestion = {
  text: {
    time: 1761408254963,
    blocks: [
      {
        id: '8z7KYTOioJ',
        data: {
          file: {
            url: 'https://exampapel-images-bucket2025.s3.amazonaws.com/019a1c1c-a20e-77fc-b3c8-dfd5587162b0favicon-exam.png',
            name: 'favicon-exam.png',
            size: 104763,
            width: 265,
            format: 'PNG',
            height: 262,
          },
          caption: 'logo-sample',
          stretched: false,
          withBorder: false,
          withBackground: false,
        },
        type: 'image',
      },
      {
        id: 'pp0wt2psxQ',
        data: {
          text: 'this is a question with an image',
        },
        type: 'paragraph',
      },
    ],
  },
  marks: 1,
  numbering_style: 'roman',
  question_number: 'i',
  id: '019a1c1d-40ac-7148-a9d0-48c18b5644ac',
  slug: 'this-is-a-question-with-an-image',
  created_at: '2025-10-25T16:04:30.508123',
  question_set_id: '019a1560-fc4c-74e8-ba16-c646e3ddc3d6',
  exam_paper_id: '01986e2a-b1b9-78fc-950a-f9970498b067',
  parent_id: null,
  children: [],
  answers: [],
  question_set: {
    id: '019a1560-fc4c-74e8-ba16-c646e3ddc3d6',
    title: 'Question Four',
    slug: 'question-four',
  },
  exam_paper: {
    id: '01986e2a-b1b9-78fc-950a-f9970498b067',
    year_of_exam: '2023',
    identifying_name:
      '2023 Final Examination | Zetech University | Bachelor Of Science In Computer Science | - | Introduction to Programming | 2025-08-03',
    slug: 'introduction-to-programming-2023-computer-science-zetech-university',
  },
  created_by: {
    id: '01986e2a-aa36-7386-9bdf-ab2aff6ac71e',
    first_name: 'Admin',
    last_name: 'FastAPI',
    email: 'david@techgrids.com',
  },
  institution: {
    id: '01986e3c-e84d-702e-b49c-7cf0f73cd9bf',
    name: 'Zetech University',
    slug: 'zetech-university',
  },
  course: {
    id: '0199bbb8-b3e6-7027-8622-7c59d95daa2b',
    name: 'Bachelor Of Science In Computer Science',
    course_acronym: 'BSc CS',
  },
  modules: [],
  programme: {
    id: '01986e2a-b230-7667-a570-d767a6ca5e49',
    name: 'Bachelors/Undergraduate',
  },
  children_count: 0,
  answers_count: 0,
  total_marks: 1,
  is_main_question: true,
  is_sub_question: false,
};

export function RendererExamples() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">1. Basic EditorRenderer</h2>
        <p className="text-gray-600 mb-4">
          Use this for rendering any Editor.js content without question metadata
        </p>
        <div className="border rounded-lg p-4 bg-white">
          <EditorRenderer data={exampleQuestion.text} />
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {`<EditorRenderer data={questionData.text} />`}
        </pre>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">2. QuestionRenderer (Basic)</h2>
        <p className="text-gray-600 mb-4">
          Renders question with number and marks
        </p>
        <div className="border rounded-lg p-4 bg-white">
          <QuestionRenderer question={exampleQuestion} />
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {`<QuestionRenderer 
  question={questionData}
/>`}
        </pre>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">3. QuestionRenderer (With Metadata)</h2>
        <p className="text-gray-600 mb-4">
          Shows full question details including institution, course, etc.
        </p>
        <div className="border rounded-lg p-4 bg-white">
          <QuestionRenderer question={exampleQuestion} showMetadata={true} />
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {`<QuestionRenderer 
  question={questionData}
  showMetadata={true}
/>`}
        </pre>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">4. QuestionRenderer (Minimal)</h2>
        <p className="text-gray-600 mb-4">
          Just the question content without any metadata
        </p>
        <div className="border rounded-lg p-4 bg-white">
          <QuestionRenderer
            question={exampleQuestion}
            showQuestionNumber={false}
            showMarks={false}
          />
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {`<QuestionRenderer 
  question={questionData}
  showQuestionNumber={false}
  showMarks={false}
/>`}
        </pre>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">5. QuestionRenderer (Interactive)</h2>
        <p className="text-gray-600 mb-4">
          With click handler for navigation
        </p>
        <div className="border rounded-lg p-4 bg-white">
          <QuestionRenderer
            question={exampleQuestion}
            onQuestionClick={(id) => alert(`Clicked question: ${id}`)}
          />
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {`<QuestionRenderer 
  question={questionData}
  onQuestionClick={(id) => router.push(\`/questions/\${id}\`)}
/>`}
        </pre>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Common Use Cases</h2>
        <div className="space-y-4 text-sm">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">📝 Exam Paper View</h3>
            <pre className="bg-white p-2 rounded overflow-x-auto">
              {`{questions.map(q => (
  <QuestionRenderer 
    key={q.id}
    question={q}
    showQuestionNumber={true}
    showMarks={true}
    showSubQuestions={true}
  />
))}`}
            </pre>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold mb-2">🔍 Question Preview</h3>
            <pre className="bg-white p-2 rounded overflow-x-auto">
              {`<QuestionRenderer 
  question={question}
  showMetadata={true}
  onQuestionClick={(id) => router.push(\`/questions/\${id}\`)}
/>`}
            </pre>
          </div>

          <div className="bg-purple-50 p-4 rounded">
            <h3 className="font-semibold mb-2">📚 Study Mode</h3>
            <pre className="bg-white p-2 rounded overflow-x-auto">
              {`<QuestionRenderer 
  question={question}
  showQuestionNumber={false}
  showMarks={false}
/>
{showAnswer && (
  <AnswerRenderer 
    answer={answer}
    showAuthor={true}
    showVotes={true}
  />
)}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RendererExamples;
