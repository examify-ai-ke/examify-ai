'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  CircleCheck, 
  Share2, 
  Bookmark,
  Calendar,
  AlertCircle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from 'lucide-react';

import { publicAPI } from '@/lib/api-public';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EditorRenderer from '@/components/ui/editor-renderer';
import { useUIStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { useAuth } from '@/hooks/useAuth';
import { CommentForm } from '@/components/shared/comment-form';
import { CommentItem } from '@/components/shared/comment-item';
import { buildCommentTree } from '@/utils/comments';
import { getQuestionUrl } from '@/utils/question-url';
import { formatDistanceToNow } from 'date-fns';
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
import type { OutputData } from '@editorjs/editorjs';

interface QuestionDetailsContentProps {
  id: string;
}

export function QuestionDetailsContent({ id }: QuestionDetailsContentProps) {
  const [question, setQuestion] = useState<any>(null);
  const [parentQuestion, setParentQuestion] = useState<any>(null);
  const [siblings, setSiblings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestionData() {
      try {
        setLoading(true);
        const { data, error } = await publicAPI.questions.getById(id);

        if (error || !data) {
          setError(error?.message || 'Failed to load question details.');
          setLoading(false);
          return;
        }

        setQuestion(data);

        // If this is a sub-question, fetch the parent question
        if (data.parent_id) {
          const { data: parentData } = await publicAPI.questions.getById(data.parent_id);
          if (parentData) {
            setParentQuestion(parentData);
          }
        }

        // Fetch sibling questions from the same exam paper for next/prev navigation
        if (data.exam_paper_id) {
          const { data: siblingsData } = await publicAPI.questions.search({
            exam_paper_id: data.exam_paper_id,
            limit: 100, // Fetch enough to find siblings
            // sort_by is not available in search schema, omitting it or handling purely on client
          });

          if (siblingsData && siblingsData.length > 0) {
            // Sort them properly by numbering
            const sortedSiblings = siblingsData.sort((a, b) => {
              const numA = String(a.question_number || '');
              const numB = String(b.question_number || '');
              return numA.localeCompare(numB, undefined, { numeric: true });
            });
            setSiblings(sortedSiblings);
          }
        }
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('An unexpected error occurred while loading the question.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestionData();
  }, [id]);

  // Determine Next and Previous Questions
  const navigationContext = useMemo(() => {
    if (!siblings.length || !question) return { prev: null, next: null };
    const currentIndex = siblings.findIndex(q => q.id === question.id);
    
    // Fallback if not found in list
    if (currentIndex === -1) return { prev: null, next: null };

    return {
      prev: currentIndex > 0 ? siblings[currentIndex - 1] : null,
      next: currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null,
    };
  }, [siblings, question]);

  if (loading) {
    return <QuestionDetailsSkeleton />;
  }

  if (error || !question) {
    return (
      <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Question Not Found</h2>
          <p className="text-red-600/80 mb-6">{error || 'The question you are looking for does not exist or has been removed.'}</p>
          <Button asChild variant="outline" className="bg-white hover:bg-red-50 text-red-600 border-red-200">
            <Link href="/browse">Return to Browse</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { prev, next } = navigationContext;
  const examPaperName = question.exam_paper?.identifying_name || 'Exam Paper';
  const institutionName = question.institution?.name;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 border-b border-slate-200 overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-teal-500/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <Link 
            href={question.exam_paper?.slug ? `/exampapers/${question.exam_paper.slug}` : "/browse"}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to Exam Paper
          </Link>

          {/* Parent Question Indicator (for sub-questions) */}
          {parentQuestion && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Sub-question of:</span>
                  <Link
                    href={getQuestionUrl(parentQuestion)}
                    className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline transition-colors flex items-center gap-2"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-600 text-white font-bold text-xs">
                      {parentQuestion.question_number || '?'}
                    </span>
                    <span className="line-clamp-1">
                      {typeof parentQuestion.text === 'string' 
                        ? parentQuestion.text 
                        : parentQuestion.text?.blocks?.[0]?.data?.text || 'View parent question'}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex-1 space-y-5">
              {/* Meta Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {institutionName && (
                  <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                    {institutionName}
                  </Badge>
                )}
                {question.course?.course_acronym && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {question.course.course_acronym}
                  </Badge>
                )}
                {question.modules && question.modules.length > 0 && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {question.modules[0].unit_code || question.modules[0].name}
                  </Badge>
                )}
                {question.exam_paper?.year_of_exam && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {question.exam_paper.year_of_exam}
                  </Badge>
                )}
                {question.marks && (
                  <Badge className="bg-orange-500 text-white border-0 shadow-lg shadow-orange-500/20">
                    {question.marks} marks
                  </Badge>
                )}
              </div>

              {/* Question Number and Title Area */}
              <div className="flex items-start gap-6">
                <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-white font-bold text-2xl shadow-lg">
                  {question.question_number || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                    {parentQuestion ? 'Sub-Question Details' : 'Question Details'}
                  </h1>
                  <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed">
                    {typeof question.text === 'string' ? (
                      <p>{question.text}</p>
                    ) : (
                      <EditorRenderer data={question.text} />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-600 pt-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {question.created_at ? new Date(question.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown date'}
                </div>
                {question.answers?.length > 0 && (
                  <div className="flex items-center">
                    <CircleCheck className="w-4 h-4 mr-2 text-teal-500" />
                    {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'} available
                  </div>
                )}
              </div>

              {/* Exam Paper Source */}
              {examPaperName && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">From Exam Paper:</span>
                      {question.exam_paper?.slug ? (
                        <Link
                          href={`/exampapers/${question.exam_paper.slug}`}
                          className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline line-clamp-2 transition-colors"
                        >
                          {examPaperName}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-slate-700 line-clamp-2">{examPaperName}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex md:flex-col gap-3 shrink-0">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-lg shadow-teal-500/20 px-8">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button variant="outline" size="lg" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
                <Bookmark className="w-4 h-4 mr-2" /> Bookmark
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">

        {/* Answers Section */}
        <div className="space-y-6 mb-16">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-blue-600 rounded-full" />
              Answers <span className="text-slate-400 text-lg font-normal">({question.answers?.length || 0})</span>
            </h2>
          </div>

          {question.answers && question.answers.length > 0 ? (
            <div className="space-y-6">
              {question.answers.map((answer: any, index: number) => (
                <EnhancedAnswerDisplay key={answer.id} answer={answer} index={index + 1} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No answers yet</h3>
              <p className="text-slate-500 max-w-sm mb-6">Be the first to provide an answer to this question and help others.</p>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                Write an Answer
              </Button>
            </Card>
          )}
        </div>

        {/* Navigation bottom */}
        {siblings.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800/50 pt-12 mt-16">
            {prev ? (
              <Link href={getQuestionUrl(prev)} className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-center gap-5 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/5 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 flex items-center justify-center shrink-0 transition-colors text-slate-400 group-hover:text-teal-600 shadow-inner">
                  <ChevronLeft className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Previous</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg">Question {prev.question_number || 'Previous'}</p>
                </div>
              </Link>
            ) : <div />}

            {next && (
              <Link href={getQuestionUrl(next)} className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-row-reverse items-center gap-5 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/5 transition-all cursor-pointer sm:text-right">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 flex items-center justify-center shrink-0 transition-colors text-slate-400 group-hover:text-teal-600 shadow-inner">
                  <ChevronRight className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Up Next</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg">Question {next.question_number || 'Next'}</p>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EnhancedAnswerDisplay({ answer, index }: { answer: any, index: number }) {
  const { addNotification } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  const [likes, setLikes] = useState(answer.likes || 0);
  const [dislikes, setDislikes] = useState(answer.dislikes || 0);
  const [isAccepted, setIsAccepted] = useState(answer.is_accepted || false);
  const [isVerified, setIsVerified] = useState(answer.reviewed || answer.is_verified || false);
  
  const [showComments, setShowComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentEditorData, setCommentEditorData] = useState<OutputData>({ time: Date.now(), blocks: [] });
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState<number>(Date.now());
  const [commentToDelete, setCommentToDelete] = useState<any>(null);

  const canAcceptAnswer = user?.role?.name === 'Admin' || user?.role?.name === 'Manager' || user?.is_superuser;

  useEffect(() => {
    async function fetchCommentCount() {
      try {
        const countResponse = await publicAPI.comments.getCountByAnswerId(answer.id);
        if (!countResponse.error && typeof countResponse.data === 'number') {
          setCommentCount(countResponse.data);
        }
      } catch (error) {
        console.error('Error fetching comment count:', error);
      }
    }
    fetchCommentCount();
  }, [answer.id]);

  useEffect(() => {
    if (!showComments) return;
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const commentsResponse = await publicAPI.comments.getByAnswerId(answer.id, { limit: 100 });
        if (!commentsResponse.error && Array.isArray(commentsResponse.data)) {
          let allComments = [...commentsResponse.data];
          
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
    if (!isAuthenticated) return addNotification({ type: 'error', title: 'Authentication Required', message: 'Please log in to like answers.' });
    try {
      const response = await publicAPI.answers.toggleLike(answer.id);
      if (!response.error) {
        const data = response.data && typeof response.data === 'object' && 'data' in response.data ? (response.data as any).data : response.data;
        if (data) {
          setLikes(data.likes || 0);
          setDislikes(data.dislikes || 0);
        }
      }
    } catch (e) {}
  };

  const handleDislike = async () => {
    if (!isAuthenticated) return addNotification({ type: 'error', title: 'Authentication Required', message: 'Please log in to dislike answers.' });
    try {
      const response = await publicAPI.answers.toggleDislike(answer.id);
      if (!response.error) {
        const data = response.data && typeof response.data === 'object' && 'data' in response.data ? (response.data as any).data : response.data;
        if (data) {
          setLikes(data.likes || 0);
          setDislikes(data.dislikes || 0);
        }
      }
    } catch (e) {}
  };

  const handleAcceptAnswer = async () => {
    if (!canAcceptAnswer) return addNotification({ type: 'error', title: 'Permission Denied', message: 'Only administrators and managers can mark answers as verified.' });
    try {
      const response = await publicAPI.answers.markAsReviewed(answer.id, !isVerified);
      if (!response.error) {
        setIsVerified(!isVerified);
        addNotification({ type: 'success', title: 'Success', message: !isVerified ? 'Answer marked as verified' : 'Answer unmarked as verified' });
      }
    } catch (e) {}
  };

  const handleToggleComments = () => setShowComments(!showComments);

  const handleComment = () => {
    if (!isAuthenticated) return addNotification({ type: 'error', title: 'Authentication Required', message: 'Please log in to comment.' });
    if (!showCommentForm) {
      setCommentEditorData({ time: Date.now(), blocks: [] });
      setEditorKey(Date.now());
      setShowCommentForm(true);
      setReplyToId(null);
    } else {
      setShowCommentForm(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentEditorData.blocks || commentEditorData.blocks.length === 0) {
      return addNotification({ type: 'error', title: 'Empty Comment', message: 'Please enter a comment before submitting.' });
    }
    setSubmitting(true);
    try {
      let response;
      if (replyToId) {
         response = await publicAPI.comments.createReply({ text: commentEditorData, answer_id: answer.id, parent_id: replyToId });
      } else {
         response = await publicAPI.comments.create({ text: commentEditorData, answer_id: answer.id, parent_id: null });
      }
      if (!response.error) {
        addNotification({ type: 'success', title: 'Comment Added', message: 'Your comment has been added successfully.' });
        setCommentEditorData({ time: Date.now(), blocks: [] });
        setEditorKey(Date.now());
        setShowCommentForm(false);
        setReplyToId(null);
        if (response.data) {
          const newComment = { ...response.data, created_by: response.data.created_by || user };
          setComments(prev => [...prev, newComment]);
          setCommentCount(prev => prev + 1);
          setShowComments(true);
        }
      }
    } catch (e) {
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyToId(commentId);
    setCommentEditorData({ time: Date.now(), blocks: [] });
    setEditorKey(Date.now());
    setShowCommentForm(false);
  };
  const handleCancelReply = () => {
    setReplyToId(null);
    setCommentEditorData({ time: Date.now(), blocks: [] });
  };
  const handleEditComment = async (comment: any, newText: OutputData) => {
    try {
      let response = comment.parent_id 
        ? await publicAPI.comments.updateReply(comment.id, newText)
        : await publicAPI.comments.update(comment.id, newText);
      if (!response.error) {
        addNotification({ type: 'success', title: 'Success', message: 'Comment updated successfully' });
        setComments(prev => prev.map(c => c.id === comment.id ? { ...c, text: newText, updated_at: new Date().toISOString() } : c));
      }
    } catch (e) {}
  };
  const handleDeleteComment = (comment: any) => setCommentToDelete(comment);
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    try {
      let response = commentToDelete.parent_id 
        ? await publicAPI.comments.deleteReply(commentToDelete.id) 
        : await publicAPI.comments.delete(commentToDelete.id);
      if (!response.error) {
        addNotification({ type: 'success', title: 'Success', message: 'Comment deleted successfully' });
        const idsToRemove = new Set([commentToDelete.id]);
        comments.forEach(c => { if (c.parent_id === commentToDelete.id) idsToRemove.add(c.id); });
        setComments(prev => prev.filter(c => !idsToRemove.has(c.id)));
        setCommentCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {} finally {
      setCommentToDelete(null);
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 rounded-xl border ${isVerified ? 'border-emerald-200 dark:border-emerald-900/50 shadow-md bg-emerald-50/30 dark:bg-emerald-900/5' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'}`}>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-inner">
              {answer.created_by?.first_name?.charAt(0) || answer.created_by?.username?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {answer.created_by ? `${answer.created_by.first_name || ''} ${answer.created_by.last_name || ''}`.trim() || answer.created_by.username : 'Anonymous Contributor'}
              </p>
              {answer.created_at && (
                <p className="text-xs text-slate-500">
                  {new Date(answer.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            {isVerified && (
              <Badge variant="outline" className="bg-green-50/50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 px-3 py-1 flex items-center gap-1.5 font-medium shrink-0">
                <CircleCheck className="w-3.5 h-3.5" /> Verified Answer
              </Badge>
            )}
            {canAcceptAnswer && !isVerified && (
              <Button variant="ghost" size="sm" onClick={handleAcceptAnswer} className="h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800" title="Mark as verified">
                <CircleCheck className="h-4 w-4 text-slate-400 hover:text-green-600 transition-colors" />
              </Button>
            )}
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 relative z-10">
          {typeof answer.text === 'string' ? (
            <p className="leading-relaxed whitespace-pre-wrap">{answer.text}</p>
          ) : (
            <EditorRenderer data={answer.text} />
          )}
        </div>

        <div className="mt-8 pt-4 flex flex-wrap items-center justify-between gap-4 relative z-10 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLike} className="text-slate-500 hover:text-green-600 rounded-full h-9">
              <ThumbsUp className="w-4 h-4 mr-1.5" /> {likes}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDislike} className="text-slate-500 hover:text-red-600 rounded-full h-9">
              <ThumbsDown className="w-4 h-4 mr-1.5" /> {dislikes}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleToggleComments} className={`text-sm font-medium h-9 rounded-full ${showComments ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
              <MessageSquare className="w-4 h-4 mr-2" /> Comments ({commentCount})
            </Button>
            <Button variant="outline" size="sm" onClick={handleComment} className={`text-xs ${showCommentForm ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
              <MessageSquare className="h-3 w-3 mr-1" /> {showCommentForm ? 'Cancel' : 'Add Comment'}
            </Button>
          </div>
        </div>

        {showCommentForm && (
          <div className="mt-4 px-4 pb-3 pt-3 border border-blue-200 bg-blue-50/30 rounded-lg">
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

        {showComments && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 relative z-10">
            {isLoadingComments ? (
              <div className="flex justify-center p-8">
                <Spinner />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {buildCommentTree(comments).map(comment => (
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
              <div className="text-center py-6 text-sm text-slate-500 italic">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete this comment? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 flex-none px-4 py-2 hover:bg-destructive/90 text-white rounded-md">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

function QuestionDetailsSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6">
      <div className="mb-6"><Skeleton className="h-4 w-32" /></div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      
      <Card className="mb-12 border-slate-100 shadow-sm">
        <CardContent className="p-8">
          <div className="flex gap-6">
            <Skeleton className="w-14 h-14 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-[90%]" />
              <Skeleton className="h-6 w-[70%]" />
              <Skeleton className="h-4 w-40 mt-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Skeleton className="h-8 w-40 mb-6" />
        <Card className="p-8"><Skeleton className="h-32 w-full" /></Card>
        <Card className="p-8"><Skeleton className="h-32 w-full" /></Card>
      </div>
    </div>
  );
}
