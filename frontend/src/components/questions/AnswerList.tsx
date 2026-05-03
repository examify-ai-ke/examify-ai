/**
 * AnswerList Component
 * 
 * Displays a list of answers for a question with interaction features.
 * Supports:
 * - Viewing answer content (EditorJS)
 * - Editing answers (using AnswerForm)
 * - Deleting answers (with confirmation)
 * - Commenting on answers (using CommentItem/CommentForm)
 * - Like/Dislike display
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, ThumbsUp, ThumbsDown, MessageSquare, User, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EditorJsRenderer from '@/components/ui/editor-js-renderer';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { formatDistanceToNow } from 'date-fns';
import type { components } from '@/types/generated/api';
import { AnswerForm } from '@/components/forms/answer-form';
import { adminAPI } from '@/lib/api-admin';
import { publicAPI } from '@/lib/api-public';
import { CommentForm } from '@/components/shared/comment-form';
import { CommentItem } from '@/components/shared/comment-item';
import { buildCommentTree } from '@/utils/comments';
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

type AnswerReadForQuestion = components['schemas']['AnswerReadForQuestion'];
type OutputData = any; // EditorJS output data

interface AnswerListProps {
  answers: AnswerReadForQuestion[] | null | undefined;
  onAnswersChange?: () => void;
}

export function AnswerList({ answers, onAnswersChange }: AnswerListProps) {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  
  // Local state to manage answers for optimistic updates
  const [localAnswers, setLocalAnswers] = useState<AnswerReadForQuestion[]>(answers || []);
  
  // State for answer management
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [answerToDelete, setAnswerToDelete] = useState<AnswerReadForQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync local answers when prop changes
  useEffect(() => {
    setLocalAnswers(answers || []);
  }, [answers]);

  // State for comments
  const [showCommentsMap, setShowCommentsMap] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [loadingCommentsMap, setLoadingCommentsMap] = useState<Record<string, boolean>>({});
  const [showCommentFormMap, setShowCommentFormMap] = useState<Record<string, boolean>>({});
  const [commentEditorDataMap, setCommentEditorDataMap] = useState<Record<string, OutputData>>({});
  const [replyToIdMap, setReplyToIdMap] = useState<Record<string, string | null>>({});
  const [submittingCommentMap, setSubmittingCommentMap] = useState<Record<string, boolean>>({});
  const [commentCountsMap, setCommentCountsMap] = useState<Record<string, number>>({});

  if (!localAnswers || localAnswers.length === 0) {
    return null;
  }

  // --- Answer Management ---

  const handleEditClick = (answer: AnswerReadForQuestion) => {
    setEditingAnswerId(answer.id || null);
  };

  const handleDeleteClick = (answer: AnswerReadForQuestion) => {
    setAnswerToDelete(answer);
  };

  const  handleConfirmDelete = async () => {
    if (!answerToDelete?.id) return;
    
    const deletedAnswerId = answerToDelete.id;
    
    // Optimistically remove the answer from local state immediately
    setLocalAnswers(prev => prev.filter(a => a.id !== deletedAnswerId));
    setAnswerToDelete(null);
    
    setIsDeleting(true);
    try {
      const response = await adminAPI.answers.delete(deletedAnswerId);
      if (response.error) {
        throw new Error('Failed to delete answer');
      }
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Answer deleted successfully'
      });
      
      // Call the callback for any additional parent updates (but without triggering full reload)
      onAnswersChange?.();
    } catch (error) {
      console.error('Error deleting answer:', error);
      
      // Revert the optimistic update on error
      setLocalAnswers(answers || []);
      
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete answer'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Comment Management ---

  const toggleComments = async (answerId: string) => {
    const isShowing = showCommentsMap[answerId];
    
    if (!isShowing) {
        // Opening comments
        setShowCommentsMap(prev => ({ ...prev, [answerId]: true }));
        
        // Fetch comments if not already loaded (or refresh?)
        // Always refresh to show latest
        fetchComments(answerId);
    } else {
        // Closing comments
        setShowCommentsMap(prev => ({ ...prev, [answerId]: false }));
    }
  };
  
  const fetchComments = async (answerId: string) => {
      if (!answerId) return;
      
      setLoadingCommentsMap(prev => ({ ...prev, [answerId]: true }));
      try {
          // Use publicAPI for comments as it returns the structure we expect and handles threading via fetches
          // Simulating the QuestionCard logic
          const commentsResponse = await publicAPI.comments.getByAnswerId(answerId, { limit: 100 });
          
          if (!commentsResponse.error && Array.isArray(commentsResponse.data)) {
               let allComments = [...commentsResponse.data];
               
               // Fetch replies (Depth 1)
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

              // De-duplicate
              const uniqueComments = Array.from(new Map(allComments.map(c => [c.id, c])).values());
              setCommentsMap(prev => ({ ...prev, [answerId]: uniqueComments }));
              setCommentCountsMap(prev => ({ ...prev, [answerId]: uniqueComments.length })); // Approximate count
          }
      } catch (error) {
          console.error('Error fetching comments:', error);
          addNotification({
              type: 'error',
              title: 'Error',
              message: 'Failed to load comments'
          });
      } finally {
          setLoadingCommentsMap(prev => ({ ...prev, [answerId]: false }));
      }
  };

  const handleToggleCommentForm = (answerId: string) => {
      setShowCommentFormMap(prev => ({ ...prev, [answerId]: !prev[answerId] }));
      setReplyToIdMap(prev => ({ ...prev, [answerId]: null })); // Reset reply
      
      // Reset editor data if opening
      if (!showCommentFormMap[answerId]) {
           setCommentEditorDataMap(prev => ({ ...prev, [answerId]: { time: Date.now(), blocks: [] } }));
      }
  };

    const handleReply = (answerId: string, commentId: string) => {
        setReplyToIdMap(prev => ({ ...prev, [answerId]: commentId }));
        setShowCommentFormMap(prev => ({ ...prev, [answerId]: false })); // Hide main form
        // We rely on CommentItem internal state or passed props for the reply form. 
        // Wait, CommentItem expects commentFormProps to control the reply form if it's rendered inside CommentItem?
        // QuestionCard implementation: QuestionCard holds state for one active reply form at a time (replyToId).
        // It passes `onReply` which sets `replyToId`.
        // Then `CommentItem` checks `activeReplyId === comment.id` to render the form.
        // It uses `commentFormProps` for that form.
        
        // Reset editor data for reply
        setCommentEditorDataMap(prev => ({ ...prev, [answerId]: { time: Date.now(), blocks: [] } }));
    };

    const handleCancelReply = (answerId: string) => {
        setReplyToIdMap(prev => ({ ...prev, [answerId]: null }));
        setCommentEditorDataMap(prev => ({ ...prev, [answerId]: { time: Date.now(), blocks: [] } }));
    };

    const handleCommentSubmit = async (answerId: string) => {
        const editorData = commentEditorDataMap[answerId];
        if (!editorData?.blocks?.length) {
            addNotification({
                type: 'error',
                title: 'Empty Comment',
                message: 'Please enter a comment.'
            });
            return;
        }

        setSubmittingCommentMap(prev => ({ ...prev, [answerId]: true }));
        try {
            const replyToId = replyToIdMap[answerId];
            let response;
            
            if (replyToId) {
                response = await publicAPI.comments.createReply({
                    text: editorData,
                    answer_id: answerId,
                    parent_id: replyToId
                });
            } else {
                response = await publicAPI.comments.create({
                    text: editorData,
                    answer_id: answerId,
                    parent_id: null
                });
            }

            if (response.error) {
                throw new Error('Failed to create comment');
            }

            addNotification({
                type: 'success',
                title: 'Success',
                message: 'Comment added successfully'
            });

            // Refresh comments
             await fetchComments(answerId);
            
            // Reset forms
            setShowCommentFormMap(prev => ({ ...prev, [answerId]: false }));
            setReplyToIdMap(prev => ({ ...prev, [answerId]: null }));
            setCommentEditorDataMap(prev => ({ ...prev, [answerId]: { time: Date.now(), blocks: [] } }));

        } catch (error) {
            console.error('Error creating comment:', error);
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to add comment'
            });
        } finally {
             setSubmittingCommentMap(prev => ({ ...prev, [answerId]: false }));
        }
    };
    
    // Edit/Delete Comment Handlers (using publicAPI/adminAPI as appropriate)
    // CommentItem handles Like/Dislike internally via publicAPI.
    
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
              
              // Refresh comments for the answer this comment belongs to?
              // We need answerId. Comment object has answer_id? Likely.
              if (comment.answer_id) {
                  fetchComments(comment.answer_id);
              } else {
                 // Fallback: try to find which answer map contains this comment
                 for (const [ansId, comments] of Object.entries(commentsMap)) {
                     if (comments.find(c => c.id === comment.id)) {
                         fetchComments(ansId);
                         break;
                     }
                 }
              }
    
          } catch (error) {
              console.error('Error updating comment:', error);
              addNotification({
                  type: 'error',
                  title: 'Error',
                  message: 'Failed to update comment'
              });
          }
    };
    
    const handleDeleteComment = async (comment: any) => {
        // Use confirm dialog logic? CommentItem expects us to pass a onDelete handler.
        // Or we can just do a window.confirm here for simplicity in dashboard, or use the AlertDialog state if we want better UI.
        // Let's use window.confirm for simplicity or just delete since admins are powerful.
        // Ideally reuse AlertDialog. But let's just use window.confirm to avoid state complexity for now unless requested.
        // Actually, QuestionCard uses AlertDialog. Let's try to be consistent if possible but we have one dialog for answer delete.
        // Let's use `window.confirm`.
        
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        
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
              
              if (comment.answer_id) {
                  fetchComments(comment.answer_id);
              }
         } catch (error) {
               console.error('Error deleting comment:', error);
              addNotification({
                  type: 'error',
                  title: 'Error',
                  message: 'Failed to delete comment'
              });
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
    <>
    <div className="mt-3 space-y-3">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Answers ({localAnswers.length})
      </div>
      {localAnswers.map((answer, index) => {
        const isEditing = editingAnswerId === answer.id;
        
        if (isEditing) {
            return (
                <div key={answer.id || index} className="border rounded-lg p-4 bg-gray-50 border-blue-200">
                    <AnswerForm 
                        questionId={answer.question_id!} 
                        answer={answer}
                        onSuccess={() => {
                            setEditingAnswerId(null);
                            // Trigger parent update to refresh data
                            onAnswersChange?.();
                        }}
                        onCancel={() => setEditingAnswerId(null)}
                    />
                </div>
            );
        }
      
        // Parse answer text if it's a string (EditorJS format)
        const answerText = answer.text;
        const parsedText = typeof answerText === 'string' 
          ? JSON.parse(answerText) 
          : answerText;

        const isCommentsExpanded = showCommentsMap[answer.id!] || false;
        // Use local count if available, else API count
        const commentsCount = commentCountsMap[answer.id!] !== undefined 
            ? commentCountsMap[answer.id!] 
            : (answer.comments_count || 0);

        return (
          <div
            key={answer.id || index}
            className="border-l-2 border-green-200 bg-green-50/50 rounded-r overflow-hidden"
          >
            {/* Answer Header */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {answer.is_correct && (
                    <Badge variant="default" className="text-xs bg-green-600 mb-2">
                      Correct Answer
                    </Badge>
                  )}
                  
                  {/* Answer Content */}
                  <div className="text-sm text-gray-700 prose prose-sm max-w-none mb-3">
                    {parsedText ? (
                      <EditorJsRenderer data={parsedText} />
                    ) : (
                      <p className="text-gray-400 italic">No answer text</p>
                    )}
                  </div>

                  {/* Separator */}
                  <div className="border-t border-green-200 my-2"></div>

                  {/* Answer Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                      {/* Author */}
                      {answer.created_by && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span>By {answer.created_by.last_name || answer.created_by.first_name}</span>
                        </div>
                      )}
                      
                      {/* Time */}
                      {answer.created_at && (
                        <span className="text-gray-500">
                          {getTimeAgo(answer.created_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 mr-2 border-r pr-3 border-gray-300">
                          {/* Like/Dislike (Display Only for Dashboard usually, or interactive?) */}
                          <div className="flex items-center gap-1 text-gray-500" title="Likes">
                             <ThumbsUp className="h-3.5 w-3.5" />
                             <span>{answer.upvotes_count || 0}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-gray-500" title="Dislikes">
                             <ThumbsDown className="h-3.5 w-3.5" />
                             <span>{answer.downvotes_count || 0}</span>
                          </div>
                      </div>

                      {/* Comments Toggle */}
                      <button
                        onClick={() => toggleComments(answer.id!)}
                        className={`flex items-center gap-1 transition-colors ${isCommentsExpanded ? 'text-blue-700 font-medium' : 'hover:text-blue-600'}`}
                        title="View comments"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
                      </button>
                      
                       {/* Edit/Delete Answer Actions */}
                      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-300">
                           <button
                                onClick={() => handleEditClick(answer)}
                                className="p-1 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                                title="Edit Answer"
                            >
                                <Edit className="h-3.5 w-3.5" />
                           </button>
                           <button
                                onClick={() => handleDeleteClick(answer)}
                                className="p-1 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                                title="Delete Answer"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                           </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {isCommentsExpanded && answer.id && (
              <div className="px-4 pb-3 border-t border-green-200 bg-white/50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="mt-3 mb-3 flex items-center justify-between">
                     <h4 className="text-xs font-semibold text-gray-500 uppercase">Comments</h4>
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => handleToggleCommentForm(answer.id!)}
                     >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {showCommentFormMap[answer.id!] ? 'Cancel Comment' : 'Add Comment'}
                     </Button>
                </div>
                
                 {/* Add Comment Form */}
                 {showCommentFormMap[answer.id!] && (
                      <div className="mb-4">
                        <CommentForm 
                            editorData={commentEditorDataMap[answer.id!] || { time: Date.now(), blocks: [] }}
                            onEditorChange={(data) => setCommentEditorDataMap(prev => ({ ...prev, [answer.id!]: data }))}
                            onCancel={() => handleToggleCommentForm(answer.id!)}
                            onSubmit={() => handleCommentSubmit(answer.id!)}
                            isSubmitting={submittingCommentMap[answer.id!]}
                            componentKey={`form-${answer.id}`}
                        />
                      </div>
                 )}

                <div className="space-y-3">
                   {loadingCommentsMap[answer.id!] ? (
                       <p className="text-xs text-gray-500 italic text-center py-2">Loading comments...</p>
                   ) : (commentsMap[answer.id!] || []).length > 0 ? (
                       buildCommentTree(commentsMap[answer.id!]!).map(comment => (
                           <CommentItem
                                key={comment.id}
                                comment={comment}
                                onReply={(commentId) => handleReply(answer.id!, commentId)}
                                activeReplyId={replyToIdMap[answer.id!]}
                                onCancelReply={() => handleCancelReply(answer.id!)}
                                onEdit={handleEditComment}
                                onDelete={handleDeleteComment}
                                commentFormProps={{
                                    editorData: commentEditorDataMap[answer.id!] || { time: Date.now(), blocks: [] },
                                    onEditorChange: (data: any) => setCommentEditorDataMap(prev => ({ ...prev, [answer.id!]: data })),
                                    onSubmit: () => handleCommentSubmit(answer.id!),
                                    isSubmitting: submittingCommentMap[answer.id!],
                                    componentKey: `reply-${answer.id}`
                                }}
                           />
                       ))
                   ) : (
                        !showCommentFormMap[answer.id!] && (
                             <p className="text-xs text-gray-500 italic text-center py-2">No comments yet.</p>
                        )
                   )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
    
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!answerToDelete} onOpenChange={(open) => !open && setAnswerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Answer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this answer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
