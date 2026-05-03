'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { publicAPI } from '@/lib/api-public';
import {
  Loader2, Calendar, Clock, Building2, BookOpen, Tag, ArrowLeft,
  Download, Share2, BookCheck, AlertTriangle, FileQuestion
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestionCard } from './question-card';
import { PDFPreviewModal } from '@/components/pdf/pdf-preview-modal';
import { ShareDialog } from '@/components/ui/share-dialog';

interface ExamPaperDetailsContentProps {
  slug: string;
}

export function ExamPaperDetailsContent({ slug }: ExamPaperDetailsContentProps) {
  const router = useRouter();
  const [paper, setPaper] = useState<any>(null);
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [relatedPapers, setRelatedPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const toggleQuestion = (questionId: string) => {
    setActiveQuestionId(prevId => prevId === questionId ? null : questionId);
  };

  useEffect(() => {
    async function fetchPaper() {
      setIsLoading(true);
      setError(null);
      try {
        let result = await publicAPI.examPapers.getBySlug(slug);
        if (result.error || !result.data) {
          result = await publicAPI.examPapers.getById(slug);
        }
        if (result.error || !result.data) {
          setError('Exam paper not found');
          return;
        }
        setPaper(result.data);

        if (result.data.id) {
          setIsLoadingQuestions(true);
          setQuestionsError(null);
          try {
            const questionSetsResult = await publicAPI.questionSets.getByExamPaperId(result.data.id);
            if (questionSetsResult.error) {
              const errorMessage = typeof questionSetsResult.error === 'object' && 'message' in questionSetsResult.error
                ? questionSetsResult.error.message
                : 'Failed to load questions';
              setQuestionsError(errorMessage);
              setQuestionSets([]);
              setIsLoadingQuestions(false);
              return;
            }
            setQuestionSets(questionSetsResult.data || []);
          } catch (err) {
            setQuestionsError('An unexpected error occurred while loading questions');
            setQuestionSets([]);
          } finally {
            setIsLoadingQuestions(false);
          }
        } else {
          setQuestionsError('Cannot load questions: exam paper ID is missing');
        }
      } catch (err) {
        setError('Failed to load exam paper');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPaper();
  }, [slug]);

  useEffect(() => {
    async function fetchRelatedPapers() {
      if (!paper || !paper.institution?.id) return;
      setIsLoadingRelated(true);
      try {
        const result = await publicAPI.examPapers.list({ skip: 0, limit: 5, institution_id: paper.institution.id });
        if (result.data) {
          setRelatedPapers(result.data.filter((p: any) => p.id !== paper.id).slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching related papers:', err);
      } finally {
        setIsLoadingRelated(false);
      }
    }
    fetchRelatedPapers();
  }, [paper]);

  /* ─── Loading Skeleton ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 border-b border-teal-700/30 shadow-lg">
          <div className="container mx-auto px-4 py-12">
            <div className="h-6 w-28 bg-white/20 rounded-full mb-8 animate-pulse" />
            <div className="flex items-start gap-4">
              <div className="p-4 bg-white/20 rounded-xl w-16 h-16 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-10 bg-white/20 rounded-lg w-2/3 animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-4" />
                {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 dark:bg-slate-600 rounded w-full" />)}
              </div>
            </aside>
            <main className="lg:col-span-3 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                  <div className="h-4 bg-gray-100 dark:bg-slate-600 rounded w-full" />
                  <div className="h-4 bg-gray-100 dark:bg-slate-600 rounded w-4/5" />
                </div>
              ))}
            </main>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-heading">Exam Paper Not Found</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">{error || 'The exam paper you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/exampapers')} className="bg-teal-500 hover:bg-teal-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to ExamPapers
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Main View ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 shadow-xl border-b border-teal-700/30">
        <div className="container mx-auto px-4 py-10">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/exampapers')}
            className="text-white/80 hover:text-white hover:bg-white/15 mb-6 -ml-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to ExamPapers
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Title block */}
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3.5 bg-white/15 backdrop-blur-sm rounded-xl flex-shrink-0 shadow-sm">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-white font-heading font-normal leading-tight mb-4 text-3xl md:text-4xl">
                  {paper.identifying_name || paper.title?.title || 'Exam Paper'}
                </h1>
                {/* Meta chips */}
                <div className="flex flex-wrap gap-3 text-sm">
                  {paper.institution && (
                    <div className="flex items-center gap-1.5 text-white/90 bg-white/10 rounded-full px-3 py-1">
                      <Building2 className="h-3.5 w-3.5 text-white/70" />
                      <span className="font-medium">{paper.institution.name}</span>
                    </div>
                  )}
                  {paper.course && (
                    <div className="flex items-center gap-1.5 text-white/90 bg-white/10 rounded-full px-3 py-1">
                      <BookOpen className="h-3.5 w-3.5 text-white/70" />
                      <span>{paper.course.name}</span>
                    </div>
                  )}
                  {paper.modules && paper.modules.length > 0 && paper.modules[0].unit_code && (
                    <div className="flex items-center gap-1.5 text-white/90 bg-white/10 rounded-full px-3 py-1">
                      <BookCheck className="h-3.5 w-3.5 text-white/70" />
                      <span>{paper.modules[0].unit_code}</span>
                    </div>
                  )}
                  {paper.year_of_exam && (
                    <div className="flex items-center gap-1.5 text-white/90 bg-white/10 rounded-full px-3 py-1">
                      <Calendar className="h-3.5 w-3.5 text-white/70" />
                      <span>{paper.year_of_exam}</span>
                    </div>
                  )}
                  {paper.exam_duration && (
                    <div className="flex items-center gap-1.5 text-white/90 bg-white/10 rounded-full px-3 py-1">
                      <Clock className="h-3.5 w-3.5 text-white/70" />
                      <span>{paper.exam_duration} minutes</span>
                    </div>
                  )}
                </div>
                {/* Tags */}
                {paper.tags && paper.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {paper.tags.map((tag: string) => (
                      <Badge key={tag} className="bg-white/15 text-white border-white/25 hover:bg-white/25 text-xs cursor-default">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/25 hover:bg-white/20 hover:text-white cursor-pointer"
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/25 hover:bg-white/20 hover:text-white cursor-pointer"
                onClick={() => setShowPDFModal(true)}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PDFPreviewModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        examPaperData={{ ...paper, question_sets: questionSets }}
      />
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={`${paper?.identifying_name || 'Exam Paper'} - ${paper?.institution?.name || ''}`}
        description={`Check out this exam paper from ${paper?.institution?.name || 'ExamPapel'} - ${paper?.course?.name || ''} (${paper?.year_of_exam || ''})`}
      />

      {/* ── Main Layout ── */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ─ Sidebar ─ */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">

              {/* Exam Details card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Exam Details</h3>
                </div>
                <div className="p-5 space-y-4 text-sm">
                  {paper.modules && paper.modules.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Modules</p>
                      <div className="space-y-1">
                        {paper.modules.map((module: any) => (
                          <p key={module.id} className="text-gray-800 dark:text-slate-300 font-medium">{module.name}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {paper.exam_date && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">Exam Date</p>
                      <p className="text-gray-800 dark:text-slate-300 font-medium">{new Date(paper.exam_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {questionSets && questionSets.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">Question Sets</p>
                      <p className="text-gray-800 dark:text-slate-300 font-medium">{questionSets.length} set{questionSets.length !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                  {questionSets && questionSets.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">Total Questions</p>
                      <p className="text-gray-800 dark:text-slate-300 font-medium">
                        {questionSets.reduce((total, set) => total + (set.questions?.length || 0), 0)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Related papers – loading */}
              {isLoadingRelated && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Related Papers</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-3 rounded-xl border border-gray-100 dark:border-slate-700 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related papers – data */}
              {!isLoadingRelated && relatedPapers.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Related Papers</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {relatedPapers.map((relatedPaper: any) => (
                      <button
                        key={relatedPaper.id}
                        onClick={() => router.push(`/exampapers/${relatedPaper.slug}`)}
                        className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-teal-400/60 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition-all duration-200 group cursor-pointer"
                      >
                        <p className="text-sm font-semibold text-gray-800 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-teal-400 line-clamp-2 mb-2">
                          {relatedPaper.identifying_name || relatedPaper.title?.name || 'Exam Paper'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {relatedPaper.course?.course_acronym && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                              {relatedPaper.course.course_acronym}
                            </Badge>
                          )}
                          {relatedPaper.modules?.[0]?.unit_code && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                              {relatedPaper.modules[0].unit_code}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {relatedPaper.year_of_exam && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />{relatedPaper.year_of_exam}
                            </span>
                          )}
                          {relatedPaper.exam_duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{relatedPaper.exam_duration}m
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {relatedPapers.length >= 5 && (
                    <div className="px-4 pb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/exampapers?institution_id=${paper.institution?.id}`)}
                        className="w-full text-xs"
                      >
                        View All Papers
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* ─ Main Content ─ */}
          <main className="lg:col-span-3 space-y-6">

            {/* Instructions */}
            {paper.instructions && Array.isArray(paper.instructions) && paper.instructions.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-200/70 dark:border-blue-800 bg-blue-100/50 dark:bg-blue-900/30">
                  <h2 className="text-base font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">Instructions</h2>
                </div>
                <ul className="p-6 space-y-3">
                  {paper.instructions.map((instruction: any, index: number) => {
                    const instructionText =
                      instruction.name || instruction.instruction || instruction.text ||
                      instruction.content || (typeof instruction === 'string' ? instruction : null);
                    if (!instructionText) return null;
                    return (
                      <li key={instruction.id || index} className="flex items-start gap-3 text-blue-800 dark:text-blue-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-300 flex items-center justify-center text-xs font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="flex-1 leading-relaxed text-sm">{instructionText}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Questions section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Questions</h2>
                {questionSets.length > 0 && !isLoadingQuestions && !questionsError && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-sm font-semibold">
                    {questionSets.reduce((total, set) => total + (set.questions?.length || 0), 0)} questions
                  </span>
                )}
              </div>

              {/* Loading */}
              {isLoadingQuestions && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-10 text-center shadow-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Loading questions…</p>
                </div>
              )}

              {/* Error */}
              {!isLoadingQuestions && questionsError && (
                <div className="bg-red-50 border border-red-200/70 rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-red-900 mb-1.5">Error Loading Questions</h3>
                  <p className="text-red-600 text-sm mb-5">{questionsError}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty */}
              {!isLoadingQuestions && !questionsError && questionSets.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-10 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 font-medium mb-1">No questions available</p>
                  <p className="text-sm text-gray-400 dark:text-slate-500">Questions will appear here once they are added.</p>
                </div>
              )}

              {/* Question sets */}
              {!isLoadingQuestions && !questionsError && questionSets.length > 0 && (
                <div className="space-y-8">
                  {questionSets.map((questionSet: any, setIndex: number) => (
                    <div key={questionSet.id || setIndex}>
                      {/* Set header */}
                      {questionSet.title && (
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-shrink-0 w-1 h-8 rounded-full bg-teal-500" />
                          <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{questionSet.title}</h3>
                            {questionSet.description && (
                              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{questionSet.description}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Questions in set */}
                      {questionSet.questions && questionSet.questions.length > 0 ? (
                        <div className="space-y-4">
                          {[...questionSet.questions]
                            .sort((a: any, b: any) => {
                              const numA = a.question_number || '';
                              const numB = b.question_number || '';
                              return numA.localeCompare(numB, undefined, { numeric: true });
                            })
                            .map((question: any, qIndex: number) => (
                              <QuestionCard
                                key={question.id || qIndex}
                                question={question}
                                questionNumber={question.question_number || (qIndex + 1)}
                                isOpen={activeQuestionId === question.id}
                                onToggle={() => toggleQuestion(question.id)}
                              />
                            ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 text-center">
                          <p className="text-gray-500 dark:text-slate-400 text-sm">No questions in this set</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
