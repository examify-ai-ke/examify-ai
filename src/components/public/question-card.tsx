'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, MessageSquare, ThumbsUp, ThumbsDown, Clock, CircleCheck, Loader2, Reply, Edit, Trash2 } from 'lucide-react';
import EditorRenderer from '@/components/ui/editor-renderer';
import AnswerRenderer from '@/components/ui/answer-renderer';
import { publicAPI } from '@/lib/api-public';
import { useUIStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeTime } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { OutputData } from '@editorjs/editorjs';

// Dynamically import Editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/ui/editor'), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500 p-4">Loading editor...</div>
});

interface QuestionCardProps {
  question: any;
  questionNumber: string | number;
}

// AnswerData type for AnswerRenderer component
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

// Utility function to map API answer format to AnswerRenderer format
const mapAnswerData = (answer: any): AnswerData => {
  return {
    id: answer.id,
    text: answer.text,
    is_accepted: answer.is_accepted,
    is_verified: answer.reviewed, // Map 'reviewed' to 'is_verified'
    upvotes_count: answer.likes, // Map 'likes' to 'upvotes_count'
    downvotes_count: answer.dislikes, // Map 'dislikes' to 'downvotes_count'
    created_at: answer.created_at,
    updated_at: answer.updated_at,
    created_by: answer.created_by,
    question_id: answer.question_id,
    parent_answer_id: answer.parent_answer_id,
    replies: answer.children?.map(mapAnswerData), // Recursively map 'children' to 'replies'
    replies_count: answer.children?.length || 0, // Calculate replies_count from children array length
  };
};

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

// Helper to build comment tree
// Reusable Comment Form Component
function CommentForm({ 
  editorData, 
  onEditorChange, 
  onCancel, 
  onSubmit, 
  isSubmitting, 
  title = "Add Your Comment",
  submitLabel = "Post Comment",
  autoFocus = false,
  showCancel = true,
  componentKey // Stable key for the editor instance
}: { 
  editorData: OutputData;
  onEditorChange: (data: OutputData) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  title?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  showCancel?: boolean;
  componentKey: string | number;
}) {
  const hasContent = React.useMemo(() => {
    return editorData.blocks && editorData.blocks.length > 0;
  }, [editorData]);

  return (
    <div className="mt-3 p-3 border border-blue-200 rounded-md bg-white">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">{title}</span>
        </div>
        <div className="border border-blue-200 rounded-md bg-white">
          <Editor
            key={`comment-editor-${componentKey}`} // Use stable key passed from parent
            data={editorData}
            onChange={onEditorChange}
          />
        </div>
        <div className="flex justify-end gap-2">
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting || !hasContent}
            className={`
              ${isSubmitting || !hasContent
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }
            `}
            title={!hasContent ? 'Please enter some text' : 'Click to post'}
          >
            {isSubmitting ? 'Posting...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper to build comment tree
const buildCommentTree = (comments: any[]) => {
  const commentMap = new Map();
  const roots: any[] = [];

  // First pass: create map nodes
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  // Second pass: link children to parents
  comments.forEach(comment => {
    const node = commentMap.get(comment.id);
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      commentMap.get(comment.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort by created_at desc (newest first) for roots, asc for replies? 
  // Usually roots are new first, replies are old first (chronological).
  // Let's stick to simple chronological for now or whatever the API returned (likely chronological).
  return roots.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

// Answer Display Component with Interactive Like/Dislike
function AnswerDisplay({ answer, index }: { answer: any; index: number }) {
  const { addNotification } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  const [likes, setLikes] = useState(answer.likes || 0);
  const [dislikes, setDislikes] = useState(answer.dislikes || 0);
  const [isAccepted, setIsAccepted] = useState(answer.is_accepted || false);
  const [isVerified, setIsVerified] = useState(answer.reviewed || answer.is_verified || false);
  const [showComments, setShowComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentEditorData, setCommentEditorData] = useState<OutputData>({
    time: Date.now(),
    blocks: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState<number>(Date.now()); // Stable key for editor

  // Check if comment has content
  const hasCommentContent = React.useMemo(() => {
    return commentEditorData.blocks && commentEditorData.blocks.length > 0;
  }, [commentEditorData]);

  // Check if user is admin or manager
  const canAcceptAnswer = user?.role?.name === 'Admin' || user?.role?.name === 'Manager' || user?.is_superuser;

  // Fetch comment count on mount (always)
  React.useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const countResponse = await publicAPI.comments.getCountByAnswerId(answer.id);
        
        if (!countResponse.error && typeof countResponse.data === 'number') {
          setCommentCount(countResponse.data);
        }
      } catch (error) {
        console.error('Error fetching comment count:', error);
      }
    };
    
    fetchCommentCount();
  }, [answer.id]);

  // Fetch comments only when user opens the comments section
  React.useEffect(() => {
    if (!showComments) return; // Don't fetch if not showing
    
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        // Increase limit to ensure we get replies if they are included in the flat list
        const commentsResponse = await publicAPI.comments.getByAnswerId(answer.id, { limit: 100 });
        
        if (!commentsResponse.error && Array.isArray(commentsResponse.data)) {
          let allComments = [...commentsResponse.data];
          
          // Fetch replies for each root comment
          const fetchRepliesPromises = commentsResponse.data.map(async (rootComment: any) => {
             const repliesResponse = await publicAPI.comments.getReplies(rootComment.id, { limit: 100 });
             if (!repliesResponse.error && Array.isArray(repliesResponse.data)) {
                 return repliesResponse.data;
             }
             return [];
          });
          
          const repliesArrays = await Promise.all(fetchRepliesPromises);
          const allReplies = repliesArrays.flat();
          
          if (allReplies.length > 0) {
              allComments = [...allComments, ...allReplies];
              
               // Optional: Fetch replies of replies (Depth 2)
              const fetchRepliesOfRepliesPromises = allReplies.map(async (reply: any) => {
                 const deepRepliesResponse = await publicAPI.comments.getReplies(reply.id, { limit: 50 });
                 if (!deepRepliesResponse.error && Array.isArray(deepRepliesResponse.data)) {
                     return deepRepliesResponse.data;
                 }
                 return [];
              });
              
              const deepRepliesArrays = await Promise.all(fetchRepliesOfRepliesPromises);
              const deepReplies = deepRepliesArrays.flat();
              if (deepReplies.length > 0) {
                   allComments = [...allComments, ...deepReplies];
              }
          }

          // Remove duplicates just in case
          const uniqueComments = Array.from(new Map(allComments.map(c => [c.id, c])).values());
          setComments(uniqueComments);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };
    
    fetchComments();
  }, [answer.id, showComments]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to like answers.'
      });
      return;
    }

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
    if (!isAuthenticated) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to dislike answers.'
      });
      return;
    }

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

  const handleAcceptAnswer = async () => {
    if (!canAcceptAnswer) {
      addNotification({
        type: 'error',
        title: 'Permission Denied',
        message: 'Only administrators and managers can mark answers as verified.'
      });
      return;
    }

    try {
      // Use the review endpoint to mark answer as verified (accepted)
      const response = await publicAPI.answers.markAsReviewed(answer.id, !isVerified);
      
      if (response.error) {
        throw new Error('Failed to mark answer');
      }
      
      const newStatus = !isVerified;
      setIsVerified(newStatus);

      addNotification({
        type: 'success',
        title: 'Success',
        message: newStatus ? 'Answer marked as verified' : 'Answer unmarked as verified'
      });
      
    } catch (error) {
      console.error('Error marking answer:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update answer status'
      });
    }
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to comment on answers.'
      });
      return;
    }
    // Toggle comment form
    // Toggle comment form
    if (!showCommentForm) {
      // Opening comment form - reset editor
      setCommentEditorData({
        time: Date.now(),
        blocks: []
      });
      setEditorKey(Date.now()); // Refresh editor instance
      setShowCommentForm(true);
      setReplyToId(null); // Reset reply target when opening main comment form
    } else {
      setShowCommentForm(false);
    }
  };

  const handleReply = (commentId: string) => {
      setReplyToId(commentId);
      // Reset editor for fresh reply
      setCommentEditorData({
        time: Date.now(),
        blocks: []
      });
      setEditorKey(Date.now()); // Refresh editor instance
      // Ensure we don't show the main comment form when replying inline
      setShowCommentForm(false);
  };

  const handleCancelReply = () => {
    setReplyToId(null);
    setCommentEditorData({
      time: Date.now(),
      blocks: []
    });
    // No need to refresh key here as form unmounts
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleEditComment = async (comment: any, newText: OutputData) => {
      try {
          let response;
          if (comment.parent_id) {
              response = await publicAPI.comments.updateReply(comment.id, newText);
          } else {
              response = await publicAPI.comments.update(comment.id, newText);
          }

          if (response.error) {
              throw new Error('Failed to update comment');
          }

          addNotification({
              type: 'success',
              title: 'Success',
              message: 'Comment updated successfully'
          });

          // Update local state
          setComments(prev => prev.map(c => 
              c.id === comment.id ? { ...c, text: newText, updated_at: new Date().toISOString() } : c
          ));

      } catch (error) {
          console.error('Error updating comment:', error);
          addNotification({
              type: 'error',
              title: 'Error',
              message: 'Failed to update comment'
          });
      }
  };

  const [commentToDelete, setCommentToDelete] = useState<any>(null);

  const handleDeleteComment = (comment: any) => {
      setCommentToDelete(comment);
  };

  const handleConfirmDelete = async () => {
      if (!commentToDelete) return;
      
      const comment = commentToDelete;

      try {
          let response;
          if (comment.parent_id) {
              response = await publicAPI.comments.deleteReply(comment.id);
          } else {
              response = await publicAPI.comments.delete(comment.id);
          }

          if (response.error) {
              throw new Error('Failed to delete comment');
          }

          addNotification({
              type: 'success',
              title: 'Success',
              message: 'Comment deleted successfully'
          });

          // Update local state
          const idsToRemove = new Set([comment.id]);
          comments.forEach(c => {
              if (c.parent_id === comment.id) idsToRemove.add(c.id);
          });
          
          setComments(prev => prev.filter(c => !idsToRemove.has(c.id)));
          setCommentCount(prev => Math.max(0, prev - 1));

      } catch (error) {
          console.error('Error deleting comment:', error);
          addNotification({
              type: 'error',
              title: 'Error',
              message: 'Failed to delete comment'
          });
      } finally {
          setCommentToDelete(null);
      }
  };

  const handleSubmitComment = async () => {
    if (!commentEditorData.blocks || commentEditorData.blocks.length === 0) {
      addNotification({
        type: 'error',
        title: 'Empty Comment',
        message: 'Please enter a comment before submitting.'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      let response;
      
      if (replyToId) {
         // Use specialized endpoint for replies
         response = await publicAPI.comments.createReply({
            text: commentEditorData,
            answer_id: answer.id,
            parent_id: replyToId
         });
      } else {
         // Create top-level comment
         response = await publicAPI.comments.create({
            text: commentEditorData,
            answer_id: answer.id,
            parent_id: null
         });
      }
      
      if (response.error) {
        throw new Error('Failed to add comment');
      }
      
      addNotification({
        type: 'success',
        title: 'Comment Added',
        message: 'Your comment has been added successfully.'
      });
      
      // Reset and hide form
      setCommentEditorData({
        time: Date.now(),
        blocks: []
      });
      setEditorKey(Date.now()); // Refresh editor instance
      setShowCommentForm(false);
      setReplyToId(null);
      
      // Optimistically update properties
      if (response.data) {
        // Construct new comment object (API returns the comment)
        const newComment = {
            ...response.data,
            // Ensure created_by is populated for immediate display
            created_by: response.data.created_by || user
        };
        
        setComments(prev => [...prev, newComment]);
        setCommentCount(prev => prev + 1);
        setShowComments(true);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add comment. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get author display name (prefer last name)
  const getAuthorName = () => {
    if (!answer.created_by) return 'Anonymous';
    const { last_name, first_name, name } = answer.created_by;
    return last_name || first_name || name || 'Anonymous';
  };

  // Get avatar URL or default
  const getAvatarUrl = () => {
    return answer.created_by?.profile_image || '/default-avatar-profile-picture-male-icon.svg';
  };

  // Format time like "about 2 hours ago"
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="border-l-2 border-green-200 bg-green-50/50 rounded-r overflow-hidden mb-3">
      <div className="px-4 pt-3 pb-2">
        {/* Answer Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <CircleCheck className={`h-5 w-5 flex-shrink-0 ${isAccepted ? 'text-green-600 fill-green-100' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700">Answer {index + 1}</span>
            {isVerified && (
              <Badge variant="outline" className="text-xs border-green-600 text-green-700">
                ✓ Verified
              </Badge>
            )}
            {isAccepted && (
              <Badge className="text-xs bg-green-600">
                ✓ Accepted
              </Badge>
            )}
          </div>
          
          {/* Accept Answer Button - Only for Admins/Managers and only if NOT verified */}
          {canAcceptAnswer && !isVerified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAcceptAnswer}
              className={`h-7 px-2 text-xs hover:bg-gray-100`}
              title="Mark as verified"
            >
              <CircleCheck className="h-4 w-4 text-gray-400 hover:text-green-600 transition-colors" />
            </Button>
          )}
        </div>

        {/* Answer Content with CircleCheck icon */}
        <div className="flex items-start gap-2 mb-3">
          <CircleCheck className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isAccepted ? 'text-green-600' : 'text-green-500'}`} />
          <div className="prose prose-sm max-w-none text-gray-800 flex-1">
            {answer.text && <EditorRenderer data={answer.text} />}
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-green-200 my-2"></div>

        {/* Answer Footer with Author, Timestamp, and Actions */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-3">
            {/* Author Info with Avatar */}
            <div className="flex items-center gap-2">
              <img
                src={getAvatarUrl()}
                alt={getAuthorName()}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar-profile-picture-male-icon.svg';
                }}
              />
              <span className="font-medium">{getAuthorName()}</span>
            </div>
            
            {/* Timestamp */}
            {answer.created_at && (
              <>
                <span className="text-gray-400">•</span>
                <span>{getTimeAgo(answer.created_at)}</span>
              </>
            )}
            
            {/* Edited Indicator */}
            {answer.updated_at && answer.updated_at !== answer.created_at && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 italic">(edited {getTimeAgo(answer.updated_at)})</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-green-600 transition-colors"
              title="Like this answer"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{likes}</span>
            </button>
            
            {/* Dislike Button */}
            <button
              onClick={handleDislike}
              className="flex items-center gap-1 hover:text-red-600 transition-colors"
              title="Dislike this answer"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>{dislikes}</span>
            </button>

            {/* Comments Button - Shows count */}
            <button
              onClick={handleToggleComments}
              className={`flex items-center gap-1 transition-colors ${
                showComments 
                  ? 'text-blue-700 font-semibold' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
              title="View comments"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Comments ({commentCount})</span>
            </button>
          </div>
        </div>

        {/* Add Comment Button - Always visible below footer */}
        <div className="mt-3 pt-3 border-t border-green-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleComment}
            className={`text-xs ${showCommentForm ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400'}`}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {showCommentForm ? 'Cancel' : 'Add Comment'}
          </Button>
        </div>
      </div>

      {/* Comment Form - Shows when Add Comment is clicked */}
      {showCommentForm && (
        <div className="px-4 pb-3 border-t border-blue-200 bg-blue-50/30">
          <CommentForm 
            editorData={commentEditorData}
            onEditorChange={setCommentEditorData}
            onCancel={handleComment}
            onSubmit={handleSubmitComment}
            isSubmitting={submitting}
            title="Add Your Comment"
            componentKey={editorKey}
          />
        </div>
      )}

      {/* Comments Section - Shows when Comments button is clicked */}
      {showComments && (
        <div className="px-4 pb-3 border-t border-blue-200 bg-blue-50/30">
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
            </div>
          ) : comments.length > 0 ? (
            <div className="mt-3 space-y-3">
              {buildCommentTree(comments).map((comment: any) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  activeReplyId={replyToId}
                  onCancelReply={handleCancelReply}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  commentFormProps={{
                    editorData: commentEditorData,
                    onEditorChange: setCommentEditorData,
                    onSubmit: handleSubmitComment,
                    isSubmitting: submitting,
                    componentKey: editorKey
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-500 italic">
              No comments yet. Be the first to start the discussion!
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Recursive Comment Item Component
function CommentItem({ 
  comment, 
  onReply, 
  depth = 0,
  activeReplyId,
  onCancelReply,
  onDelete,
  onEdit,
  commentFormProps
}: { 
  comment: any; 
  onReply: (id: string) => void; 
  depth?: number;
  activeReplyId: string | null;
  onCancelReply: () => void;
  onDelete?: (comment: any) => void;
  onEdit?: (comment: any, newText: any) => void;
  commentFormProps: {
    editorData: any;
    onEditorChange: (data: any) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    componentKey: string | number;
  }
}) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(comment.text);
  
  // Calculate permissions
  const canEditOrDelete = React.useMemo(() => {
    if (!user) return false;
    
    // 1. Admins and Managers are always exempt
    const isExempt = user.is_superuser || 
                    user.role?.name === 'Admin' || 
                    user.role?.name === 'Manager';
    
    if (isExempt) return true;
    
    // 2. Must be owner
    const isOwner = user.id === comment.created_by?.id;
    if (!isOwner) return false;
    
    // 3. Time limit check (6 hours)
    if (!comment.created_at) return true; // Fallback if no date
    
    const createdTime = new Date(comment.created_at).getTime();
    const sixHoursMs = 6 * 60 * 60 * 1000;
    const timeElapsed = Date.now() - createdTime;
    
    return timeElapsed <= sixHoursMs;
  }, [user, comment]);

  // Get author display name (prefer last name)
  const getAuthorName = (user: any) => {
    if (!user) return 'Anonymous';
    const { last_name, first_name, name } = user;
    return last_name || first_name || name || 'Anonymous';
  };

  const { addNotification } = useUIStore();
  const [likes, setLikes] = useState(comment.likes || 0);
  const [dislikes, setDislikes] = useState(comment.dislikes || 0);

  // Format time like "about 2 hours ago"
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };
  
  // Get avatar URL or default
  const getAvatarUrl = (user: any) => {
    return user?.profile_image || user?.image?.media?.link || '/default-avatar-profile-picture-male-icon.svg';
  };

  const isReplying = activeReplyId === comment.id;

  const handleEditSubmit = () => {
      if (onEdit) {
          onEdit(comment, editData);
          setIsEditing(false);
      }
  };

  const handleLike = async () => {
    if (!user) {
        addNotification({
            type: 'error',
            title: 'Authentication Required',
            message: 'Please log in to like comments.'
        });
        return;
    }

    try {
        const response = await publicAPI.comments.toggleLike(comment.id);
        if (!response.error) {
            // Update local state from response
            const data = response.data && typeof response.data === 'object' && 'data' in response.data
            ? (response.data as any).data
            : response.data;
            
            if (data) {
                setLikes(data.likes || 0);
                setDislikes(data.dislikes || 0);
            }
        }
    } catch (error) {
        console.error('Error liking comment:', error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
        addNotification({
            type: 'error',
            title: 'Authentication Required',
            message: 'Please log in to dislike comments.'
        });
        return;
    }

    try {
        const response = await publicAPI.comments.toggleDislike(comment.id);
        if (!response.error) {
             // Update local state from response
            const data = response.data && typeof response.data === 'object' && 'data' in response.data
            ? (response.data as any).data
            : response.data;
            
            if (data) {
                setLikes(data.likes || 0);
                setDislikes(data.dislikes || 0);
            }
        }
    } catch (error) {
        console.error('Error disliking comment:', error);
    }
  };

  return (
    <div className={`
      ${depth > 0 ? 'ml-6 border-l-2 border-blue-100 pl-3 mt-2' : 'py-3 border-b border-blue-100 last:border-b-0'}
    `}>
      <div className="flex items-center gap-2 mb-2">
        <img
            src={getAvatarUrl(comment.created_by)}
            alt={getAuthorName(comment.created_by)}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar-profile-picture-male-icon.svg';
            }}
        />
        <span className="text-xs font-medium text-gray-600">
           {getAuthorName(comment.created_by)}
        </span>
        {comment.created_at && (
          <span className="text-gray-400 text-xs">• {getTimeAgo(comment.created_at)}</span>
        )}
      </div>
      
      <div className="prose prose-sm max-w-none text-gray-800 mb-2 ml-6">
        {isEditing ? (
             <CommentForm 
              editorData={editData}
              onEditorChange={setEditData}
              onCancel={() => setIsEditing(false)}
              onSubmit={handleEditSubmit}
              isSubmitting={commentFormProps.isSubmitting} // Share creating submitting state or local? Local is better but prop is easier.
              title="Edit comment"
              submitLabel="Save Changes"
              componentKey={`edit-${comment.id}`}
           />
        ) : (
             comment.text && <EditorRenderer data={comment.text} />
        )}
      </div>
      
      {/* Actions: Like, Dislike, Reply, Edit, Delete */}
      {!isReplying && !isEditing && (
        <div className="flex items-center justify-start text-xs text-gray-500 ml-6 mb-2 gap-4">
           {/* Like Button */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-green-600 transition-colors"
              title="Like"
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{likes}</span>
            </button>
            
            {/* Dislike Button */}
            <button
              onClick={handleDislike}
              className="flex items-center gap-1 hover:text-red-600 transition-colors"
              title="Dislike"
            >
              <ThumbsDown className="h-3 w-3" />
              <span>{dislikes}</span>
            </button>

          <button 
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>

          {canEditOrDelete && (
              <>
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete && onDelete(comment)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
              </>
          )}
        </div>
      )}

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="ml-6 mt-2 mb-4">
           <CommentForm 
              editorData={commentFormProps.editorData}
              onEditorChange={commentFormProps.onEditorChange}
              onCancel={onCancelReply}
              onSubmit={commentFormProps.onSubmit}
              isSubmitting={commentFormProps.isSubmitting}
              title="Reply to comment"
              submitLabel="Post Reply"
              componentKey={commentFormProps.componentKey}
           />
        </div>
      )}

      {/* Recursive Children */}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          {comment.children.map((child: any) => (
             <CommentItem 
               key={child.id} 
               comment={child} 
               onReply={onReply} 
               depth={depth + 1}
               activeReplyId={activeReplyId}
               onCancelReply={onCancelReply}
               onEdit={onEdit}
               onDelete={onDelete}
               commentFormProps={commentFormProps}
             />
          ))}
        </div>
      )}
    </div>
  );
}
