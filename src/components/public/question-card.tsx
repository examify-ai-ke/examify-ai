'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, MessageSquare, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import EditorRenderer from '@/components/ui/editor-renderer';
import { publicAPI } from '@/lib/api-public';
import { useUIStore } from '@/stores/ui';
import { formatRelativeTime } from '@/lib/utils';

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

  // Render question text using EditorRenderer (handle JSON format)
  const renderQuestionText = (text: any, isMainQuestion: boolean = true) => {
    const containerClass = isMainQuestion
      ? 'text-lg font-medium text-gray-900 mb-3'
      : 'text-base font-normal text-gray-800 mb-2';

    // Handle null or undefined
    if (text === null || text === undefined) {
      return <p className="text-gray-400 italic">No question text available</p>;
    }

    // Handle string format - render as plain text
    if (typeof text === 'string') {
      return <div className={containerClass}>{text}</div>;
    }

    // Handle object format
    if (typeof text === 'object') {
      // Handle JSON blocks format (EditorJS format)
      if (text.blocks && Array.isArray(text.blocks)) {
        if (text.blocks.length === 0) {
          return <p className="text-gray-400 italic">No question text available</p>;
        }

        // Use EditorRenderer to properly render formatted content
        return (
          <div className={containerClass}>
            <EditorRenderer data={text} />
          </div>
        );
      }

      // Fallback: render as plain text with JSON string
      return <div className={containerClass}>{JSON.stringify(text)}</div>;
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
                      {showMainAnswer ? 'Hide' : 'View'} Answer{question.answers.length > 1 ? 's' : ''} ({question.answers.length})
                    </Button>

                    {showMainAnswer && (
                      <div className="mt-3 space-y-3">
                        {question.answers.map((answer: any, index: number) => (
                          <AnswerDisplay key={answer.id || index} answer={answer} index={index} />
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
                              {showSubAnswers[subQuestionId] ? 'Hide' : 'View'} Answer{subQuestion.answers.length > 1 ? 's' : ''} ({subQuestion.answers.length})
                            </Button>

                            {showSubAnswers[subQuestionId] && (
                              <div className="mt-3 space-y-3">
                                {subQuestion.answers.map((answer: any, ansIndex: number) => (
                                  <AnswerDisplay key={answer.id || ansIndex} answer={answer} index={ansIndex} />
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

// Answer Display Component with Like/Dislike and Replies
function AnswerDisplay({ answer, index }: { answer: any; index: number }) {
  const { addNotification } = useUIStore();
  const [likes, setLikes] = useState(answer.likes || 0);
  const [dislikes, setDislikes] = useState(answer.dislikes || 0);
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = async () => {
    try {
      const response = await publicAPI.answers.toggleLike(answer.id);
      if (!response.error) {
        // Update counts from response
        const data = response.data && typeof response.data === 'object' && 'data' in response.data
          ? (response.data as any).data
          : response.data;

        if (data) {
          setLikes(data.likes || 0);
          setDislikes(data.dislikes || 0);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to toggle like'
      });
    }
  };

  const handleDislike = async () => {
    try {
      const response = await publicAPI.answers.toggleDislike(answer.id);
      if (!response.error) {
        // Update counts from response
        const data = response.data && typeof response.data === 'object' && 'data' in response.data
          ? (response.data as any).data
          : response.data;

        if (data) {
          setLikes(data.likes || 0);
          setDislikes(data.dislikes || 0);
        }
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to toggle dislike'
      });
    }
  };

  const hasReplies = answer.children && answer.children.length > 0;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      {/* Answer Header */}
      <div className="flex items-center gap-2 mb-3">
        <Badge className="text-xs bg-green-600">Answer {index + 1}</Badge>
        {answer.reviewed && (
          <Badge variant="outline" className="text-xs border-green-600 text-green-700">
            Reviewed
          </Badge>
        )}
      </div>

      {/* Answer Content */}
      <div className="prose prose-sm max-w-none text-gray-800">
        {answer.text && <EditorRenderer data={answer.text} />}
      </div>

      {/* Answer Metadata with Like/Dislike */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>
            By: {answer.created_by?.first_name || answer.created_by?.last_name
              ? `${answer.created_by.first_name || ''} ${answer.created_by.last_name || ''}`.trim()
              : answer.created_by?.name || 'Anonymous'}
          </span>
          <Clock className="h-3 w-3" />
          <span>{formatRelativeTime(answer.created_at)}</span>
        </div>

        {/* Like/Dislike Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="h-6 px-2 text-xs hover:bg-green-100"
          >
            <ThumbsUp className="h-3 w-3 mr-1" />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDislike}
            className="h-6 px-2 text-xs hover:bg-red-100"
          >
            <ThumbsDown className="h-3 w-3 mr-1" />
            {dislikes}
          </Button>
        </div>
      </div>

      {/* Replies Section */}
      {hasReplies && (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {showReplies ? 'Hide' : 'Show'} Replies ({answer.children.length})
          </Button>

          {showReplies && (
            <div className="mt-3 ml-4 space-y-2">
              {answer.children.map((reply: any, replyIndex: number) => (
                <div
                  key={reply.id || replyIndex}
                  className="bg-white border border-gray-200 rounded-lg p-3"
                >
                  <Badge variant="outline" className="text-xs mb-2">Reply {replyIndex + 1}</Badge>
                  <div className="prose prose-sm max-w-none text-gray-800">
                    {reply.text && <EditorRenderer data={reply.text} />}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>
                        By: {reply.created_by?.first_name || reply.created_by?.last_name
                          ? `${reply.created_by.first_name || ''} ${reply.created_by.last_name || ''}`.trim()
                          : reply.created_by?.name || 'Anonymous'}
                      </span>
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(reply.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>👍 {reply.likes || 0}</span>
                      <span>👎 {reply.dislikes || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
