'use client';

import React from 'react';
import EditorRenderer from './editor-renderer';
import { Badge } from './badge';
import { formatDistanceToNow } from 'date-fns';

interface AnswerData {
  id: string;
  text: any; // Editor.js OutputData
  is_accepted?: boolean;
  is_verified?: boolean;
  upvotes_count?: number;
  downvotes_count?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  question_id?: string;
  parent_answer_id?: string;
  replies?: AnswerData[];
  replies_count?: number;
}

interface AnswerRendererProps {
  answer: AnswerData;
  showAuthor?: boolean;
  showTimestamp?: boolean;
  showVotes?: boolean;
  showReplies?: boolean;
  className?: string;
  onAnswerClick?: (answerId: string) => void;
  onReplyClick?: (answerId: string) => void;
}

/**
 * AnswerRenderer - Renders an answer with its content and metadata
 * 
 * Features:
 * - Renders answer text using EditorRenderer
 * - Displays author information
 * - Shows timestamps and vote counts
 * - Renders nested replies recursively
 * - Supports verification and acceptance badges
 */
const AnswerRenderer: React.FC<AnswerRendererProps> = ({
  answer,
  showAuthor = true,
  showTimestamp = true,
  showVotes = true,
  showReplies = true,
  className = '',
  onAnswerClick,
  onReplyClick,
}) => {
  const handleClick = () => {
    if (onAnswerClick) {
      onAnswerClick(answer.id);
    }
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReplyClick) {
      onReplyClick(answer.id);
    }
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`answer-renderer border rounded-lg p-4 ${className} ${
        onAnswerClick ? 'cursor-pointer hover:bg-gray-50' : ''
      } ${answer.is_accepted ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
      onClick={handleClick}
    >
      {/* Answer Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {answer.is_accepted && (
            <Badge variant="default" className="bg-green-600 text-xs">
              ✓ Accepted Answer
            </Badge>
          )}
          {answer.is_verified && (
            <Badge variant="secondary" className="text-xs">
              ✓ Verified
            </Badge>
          )}
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
          {showTimestamp && answer.created_at && (
            <span className="text-xs text-gray-500">
              {getTimeAgo(answer.created_at)}
            </span>
          )}
        </div>

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
      </div>

      {/* Answer Content */}
      <div className="answer-content mb-3">
        {answer.text && <EditorRenderer data={answer.text} />}
      </div>

      {/* Answer Footer */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        {showReplies && answer.replies_count !== undefined && answer.replies_count > 0 && (
          <button
            onClick={handleReplyClick}
            className="hover:text-blue-600 transition-colors"
          >
            {answer.replies_count} {answer.replies_count === 1 ? 'reply' : 'replies'}
          </button>
        )}
        {answer.updated_at && answer.updated_at !== answer.created_at && (
          <span className="text-xs text-gray-400">
            (edited {getTimeAgo(answer.updated_at)})
          </span>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && answer.replies && answer.replies.length > 0 && (
        <div className="replies ml-6 mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
          {answer.replies.map((reply) => (
            <AnswerRenderer
              key={reply.id}
              answer={reply}
              showAuthor={showAuthor}
              showTimestamp={showTimestamp}
              showVotes={showVotes}
              showReplies={showReplies}
              onAnswerClick={onAnswerClick}
              onReplyClick={onReplyClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnswerRenderer;
