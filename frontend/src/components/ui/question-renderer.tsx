'use client';

import React from 'react';
import EditorRenderer from './editor-renderer';
import { Badge } from './badge';

interface QuestionData {
  id: string;
  text: any; // Editor.js OutputData
  marks?: number;
  numbering_style?: string;
  question_number?: string;
  slug?: string;
  children?: QuestionData[];
  answers?: any[];
  question_set?: {
    id: string;
    title: string;
    slug: string;
  };
  exam_paper?: {
    id: string;
    year_of_exam: string;
    identifying_name: string;
    slug: string;
  };
  created_by?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  institution?: {
    id: string;
    name: string;
    slug: string;
  };
  course?: {
    id: string;
    name: string;
    course_acronym: string;
  };
  modules?: any[];
  programme?: {
    id: string;
    name: string;
  };
  children_count?: number;
  answers_count?: number;
  total_marks?: number;
  is_main_question?: boolean;
  is_sub_question?: boolean;
}

interface QuestionRendererProps {
  question: QuestionData;
  showMetadata?: boolean;
  showQuestionNumber?: boolean;
  showMarks?: boolean;
  showSubQuestions?: boolean;
  className?: string;
  onQuestionClick?: (questionId: string) => void;
}

/**
 * QuestionRenderer - Renders a question with its content and metadata
 * 
 * Features:
 * - Renders question text using EditorRenderer
 * - Displays question number and marks
 * - Shows metadata (optional)
 * - Renders sub-questions recursively (optional)
 * - Supports click handlers for interactive use
 */
const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  showMetadata = false,
  showQuestionNumber = true,
  showMarks = true,
  showSubQuestions = true,
  className = '',
  onQuestionClick,
}) => {
  const handleClick = () => {
    if (onQuestionClick) {
      onQuestionClick(question.id);
    }
  };

  return (
    <div
      className={`question-renderer ${className} ${onQuestionClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={handleClick}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {showQuestionNumber && question.question_number && (
            <span className="font-semibold text-lg">
              {question.question_number}.
            </span>
          )}
          {showMarks && question.marks !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
            </Badge>
          )}
          {question.is_main_question && (
            <Badge variant="default" className="text-xs">
              Main Question
            </Badge>
          )}
          {question.is_sub_question && (
            <Badge variant="outline" className="text-xs">
              Sub Question
            </Badge>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="question-content mb-4">
        {question.text && <EditorRenderer data={question.text} />}
      </div>

      {/* Metadata (Optional) */}
      {showMetadata && (
        <div className="question-metadata text-sm text-gray-600 mb-4 space-y-1">
          {question.question_set && (
            <div>
              <span className="font-medium">Question Set:</span> {question.question_set.title}
            </div>
          )}
          {question.institution && (
            <div>
              <span className="font-medium">Institution:</span> {question.institution.name}
            </div>
          )}
          {question.course && (
            <div>
              <span className="font-medium">Course:</span> {question.course.name} ({question.course.course_acronym})
            </div>
          )}
          {question.programme && (
            <div>
              <span className="font-medium">Programme:</span> {question.programme.name}
            </div>
          )}
          {question.exam_paper && (
            <div>
              <span className="font-medium">Exam Year:</span> {question.exam_paper.year_of_exam}
            </div>
          )}
        </div>
      )}

      {/* Sub-questions */}
      {showSubQuestions && question.children && question.children.length > 0 && (
        <div className="sub-questions ml-6 mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
          {question.children.map((subQuestion) => (
            <QuestionRenderer
              key={subQuestion.id}
              question={subQuestion}
              showMetadata={false}
              showQuestionNumber={showQuestionNumber}
              showMarks={showMarks}
              showSubQuestions={showSubQuestions}
              onQuestionClick={onQuestionClick}
            />
          ))}
        </div>
      )}

      {/* Answer Count Indicator */}
      {question.answers_count !== undefined && question.answers_count > 0 && (
        <div className="mt-2 text-sm text-blue-600">
          {question.answers_count} {question.answers_count === 1 ? 'answer' : 'answers'}
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
