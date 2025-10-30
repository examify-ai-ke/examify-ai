'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, MessageSquare } from 'lucide-react';

interface QuestionCardProps {
  question: any;
  questionNumber: string | number;
}

export function QuestionCard({ question, questionNumber }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMainAnswer, setShowMainAnswer] = useState(false);
  const [showSubAnswers, setShowSubAnswers] = useState<{ [key: string]: boolean }>({});

  const hasSubQuestions = question.children && question.children.length > 0;
  const hasMainAnswer = question.answers && question.answers.length > 0;

  // Convert Roman numerals to display format
  const displayNumber = typeof questionNumber === 'string' ? questionNumber.toUpperCase() : questionNumber;

  // Toggle sub-question answer visibility
  const toggleSubAnswer = (subQuestionId: string) => {
    setShowSubAnswers(prev => ({
      ...prev,
      [subQuestionId]: !prev[subQuestionId]
    }));
  };

  // Render question text as heading (handle JSON format)
  const renderQuestionText = (text: any, isMainQuestion: boolean = true) => {
    const HeadingTag = isMainQuestion ? 'h3' : 'h4';
    const headingClass = isMainQuestion
      ? 'text-3xl font-normal text-gray-1000 mb-3'
      : 'text-2xl font-light text-gray-800 mb-2';

    // Handle null or undefined
    if (text === null || text === undefined) {
      return <p className="text-gray-400 italic">No question text available</p>;
    }

    // Handle string format - render as heading
    if (typeof text === 'string') {
      return <HeadingTag className={headingClass}>{text}</HeadingTag>;
    }

    // Handle object format
    if (typeof text === 'object') {
      // Handle JSON blocks format (EditorJS format)
      if (text.blocks && Array.isArray(text.blocks)) {
        if (text.blocks.length === 0) {
          return <p className="text-gray-400 italic">No question text available</p>;
        }

        // Extract text from all blocks and render as heading
        const textContent = text.blocks
          .map((block: any) => {
            if (block.type === 'paragraph') {
              return block.data?.text || '';
            }
            if (block.type === 'header') {
              return block.data?.text || '';
            }
            if (block.type === 'list') {
              return block.data?.items?.join(', ') || '';
            }
            return block.text || block.data?.text || '';
          })
          .filter(Boolean)
          .join(' ');

        if (textContent) {
          return <HeadingTag className={headingClass}>{textContent}</HeadingTag>;
        }

        return <p className="text-gray-400 italic">No question text available</p>;
      }

      // Fallback: render as heading with JSON string
      return <HeadingTag className={headingClass}>{JSON.stringify(text)}</HeadingTag>;
    }

    // Fallback for unexpected types
    return <p className="text-gray-400 italic">Invalid question text format</p>;
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (hasSubQuestions && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  // Handle container click
  const handleContainerClick = () => {
    if (hasSubQuestions) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="group">
      {/* Main Question - Clickable to expand/collapse */}
      <div
        {...(hasSubQuestions && {
          role: 'button',
          tabIndex: 0,
          onClick: handleContainerClick,
          onKeyDown: handleKeyDown,
          'aria-expanded': isExpanded,
          'aria-label': `Question ${displayNumber}, click to ${isExpanded ? 'collapse' : 'expand'} sub-questions`
        })}
        className="w-full text-left"
      >
        <Card className={`
          transition-all duration-200
          ${isExpanded ? 'border-teal-500 bg-teal-50/50' : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'}
          ${!hasSubQuestions ? 'cursor-default' : 'cursor-pointer'}
        `}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Left Content */}
              <div className="flex-1 min-w-0">
                {/* Question Number and Badges */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-500 text-white font-bold text-2xl">
                    {displayNumber}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {question.marks && (
                      <Badge className="text-xs bg-orange-500 hover:bg-orange-600 text-white">
                        {question.marks} marks
                      </Badge>
                    )}
                    {hasSubQuestions && (
                      <Badge variant="outline" className="text-xs border-teal-500 text-teal-700">
                        {question.children.length} sub-questions
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Main Question Text as H3 */}
                {renderQuestionText(question.text, true)}

                {/* Main Question Answer Section */}
                {hasMainAnswer ? (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMainAnswer(!showMainAnswer);
                      }}
                      className="text-xs"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {showMainAnswer ? 'Hide' : 'View'} Answer{question.answers.length > 1 ? 's' : ''}
                    </Button>

                    {showMainAnswer && (
                      <div className="mt-3 space-y-2">
                        {question.answers.map((answer: any, index: number) => (
                          <div
                            key={answer.id || index}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                          >
                            <div className="text-xs font-semibold text-blue-700 mb-2">Answer:</div>
                            <div className="prose prose-sm max-w-none text-blue-900">
                              {renderQuestionText(answer.text || answer.content)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500 italic">
                    No answer available yet
                  </div>
                )}
              </div>

              {/* Expand Icon */}
              {hasSubQuestions && (
                <div className="flex-shrink-0">
                  <ChevronDown
                    className={`w-5 h-5 text-teal-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expanded Content - Sub-questions */}
      {isExpanded && hasSubQuestions && (
        <div className="mt-2 ml-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {[...question.children]
            .sort((a: any, b: any) => {
              // Sort by question_number (handles roman numerals, letters, and numbers)
              const numA = a.question_number || '';
              const numB = b.question_number || '';
              return numA.localeCompare(numB, undefined, { numeric: true });
            })
            .map((subQuestion: any, index: number) => {
            const subQuestionId = subQuestion.id || `sub-${index}`;
            const hasSubAnswer = subQuestion.answers && subQuestion.answers.length > 0;

            return (
              <Card
                key={subQuestionId}
                className="bg-gray-50/50 border-gray-200 hover:bg-gray-100/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-semibold text-teal-600 min-w-fit">
                      ({subQuestion.question_number || String.fromCharCode(97 + index)})
                    </span>
                    <div className="flex-1">
                      {/* Sub-question Text as H4 */}
                      {renderQuestionText(subQuestion.text, false)}

                      {/* Marks Badge */}
                      {subQuestion.marks && (
                        <Badge className="text-xs bg-orange-500 hover:bg-orange-600 text-white mt-2">
                          {subQuestion.marks} marks
                        </Badge>
                      )}

                      {/* Sub-question Answer Section */}
                      {hasSubAnswer ? (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSubAnswer(subQuestionId)}
                            className="text-xs"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {showSubAnswers[subQuestionId] ? 'Hide' : 'View'} Answer{subQuestion.answers.length > 1 ? 's' : ''}
                          </Button>

                          {showSubAnswers[subQuestionId] && (
                            <div className="mt-3 space-y-2">
                              {subQuestion.answers.map((answer: any, ansIndex: number) => (
                                <div
                                  key={answer.id || ansIndex}
                                  className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                                >
                                  <div className="text-xs font-semibold text-blue-700 mb-2">Answer:</div>
                                  <div className="prose prose-sm max-w-none text-blue-900">
                                    {renderQuestionText(answer.text || answer.content)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 text-sm text-gray-500 italic">
                          No answer available yet
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
