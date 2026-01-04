'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { publicAPI } from '@/lib/api-public';
import { Loader2, Calendar, Clock, Building2, BookOpen, Tag, ArrowLeft, Download, Share2, BookCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestionCard } from './question-card';
import { PDFPreviewModal } from '@/components/pdf/pdf-preview-modal';


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

  useEffect(() => {
    async function fetchPaper() {
      setIsLoading(true);
      setError(null);

      try {
        // First, try to fetch by slug
        let result = await publicAPI.examPapers.getBySlug(slug);

        // If slug fetch fails, try by ID (slug might actually be an ID)
        if (result.error || !result.data) {
          result = await publicAPI.examPapers.getById(slug);
        }

        if (result.error || !result.data) {
          setError('Exam paper not found');
          return;
        }

        setPaper(result.data);

        // Fetch question sets for this exam paper
        if (result.data.id) {
          setIsLoadingQuestions(true);
          setQuestionsError(null);

          try {
            const questionSetsResult = await publicAPI.questionSets.getByExamPaperId(result.data.id);

            // Handle API errors
            if (questionSetsResult.error) {
              const errorMessage = typeof questionSetsResult.error === 'object' && 'message' in questionSetsResult.error
                ? questionSetsResult.error.message
                : 'Failed to load questions';
              console.error('[Component] Error loading questions:', errorMessage);
              setQuestionsError(errorMessage);
              setQuestionSets([]);
              setIsLoadingQuestions(false);
              return;
            }

            // Update state with validated data
            setQuestionSets(questionSetsResult.data || []);
          } catch (err) {
            console.error('[Component] Exception while fetching questions:', err);
            setQuestionsError('An unexpected error occurred while loading questions');
            setQuestionSets([]);
          } finally {
            setIsLoadingQuestions(false);
          }
        } else {
          console.warn('[Component] Exam paper has no ID, cannot fetch question sets');
          setQuestionsError('Cannot load questions: exam paper ID is missing');
        }
      } catch (err) {
        console.error('[Component] Error fetching exam paper:', err);
        setError('Failed to load exam paper');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaper();
  }, [slug]);

  // Fetch related exam papers
  useEffect(() => {
    async function fetchRelatedPapers() {
      if (!paper || !paper.institution?.id) return;

      setIsLoadingRelated(true);
      try {
        // Fetch papers from the same institution, excluding current paper
        const result = await publicAPI.examPapers.list({
          skip: 0,
          limit: 5,
          institution_id: paper.institution.id,
        });

        if (result.data) {
          // Filter out current paper and limit to 5
          const filtered = result.data
            .filter((p: any) => p.id !== paper.id)
            .slice(0, 5);
          setRelatedPapers(filtered);
        }
      } catch (err) {
        console.error('Error fetching related papers:', err);
      } finally {
        setIsLoadingRelated(false);
      }
    }

    fetchRelatedPapers();
  }, [paper]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 border-b border-teal-700 shadow-lg">
          <div className="container mx-auto px-4 py-12">
            <div className="h-8 w-32 bg-white/20 rounded mb-6 animate-pulse"></div>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg w-16 h-16 animate-pulse"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-10 bg-white/20 rounded w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-white/20 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-4 w-40 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-white/20 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Skeleton */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Paper Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The exam paper you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/exampapers')} className="bg-teal-500 hover:bg-teal-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to ExamPapers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 border-b border-teal-700 shadow-lg">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/exampapers')}
              className="text-white hover:text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to ExamPapers
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Title and Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl font-normal text-white mb-3 line-clamp-3 tracking-wide">
                    {paper.identifying_name  ||  paper.title?.title || 'Exam Paper'}
                  </h3>
                  {/* {paper.description?.description && (
                    <p className="text-white/90 text-lg leading-relaxed">{paper.description.description}</p>
                  )} */}
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-6 text-base">
                {paper.institution && (
                  <div className="flex items-center gap-2 text-white/95">
                    <Building2 className="h-4 w-4 text-white/80" />
                    <span className="font-medium">{paper.institution.name}</span>
                  </div>
                )}

                {paper.course && (
                  <div className="flex items-center gap-2 text-white/95">
                    <BookOpen className="h-4 w-4 text-white/80" />
                    <span>{paper.course.name}</span>
                  </div>
                )}
                {paper.modules && paper.modules.length > 0 && paper.modules[0].unit_code && (
                  <div className="flex items-center gap-2 text-white/95">
                    <BookCheck className="h-4 w-4 text-white/80" />
                    <span>{paper.modules[0].unit_code}</span>
                  </div>
                )}


                {paper.year_of_exam && (
                  <div className="flex items-center gap-2 text-white/95">
                    <Calendar className="h-4 w-4 text-white/80" />
                    <span>{paper.year_of_exam}</span>
                  </div>
                )}

                {paper.exam_duration && (
                  <div className="flex items-center gap-2 text-white/95">
                    <Clock className="h-4 w-4 text-white/80" />
                    <span>{paper.exam_duration} minutes</span>
                  </div>
                )}
                
              </div>

              {/* Tags */}
              {paper.tags && paper.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {paper.tags.map((tag: string) => (
                    <Badge key={tag} className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                onClick={() => setShowPDFModal(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        examPaperData={{ ...paper, question_sets: questionSets }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Exam Details</h3>

                <div className="space-y-4 text-sm">
                {paper.modules && paper.modules.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-2">Modules</p>
                    <div className="space-y-1">
                      {paper.modules.map((module: any) => (
                        <p key={module.id} className="text-gray-900">{module.name}</p>
                      ))}
                    </div>
                  </div>
                )}

                {paper.exam_date && (
                  <div>
                    <p className="text-gray-500 mb-1">Exam Date</p>
                    <p className="text-gray-900">{new Date(paper.exam_date).toLocaleDateString()}</p>
                  </div>
                )}

                {paper.question_sets && paper.question_sets.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Question Sets</p>
                    <p className="text-gray-900">{paper.question_sets.length} set(s)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Related Exam Papers */}
            {relatedPapers.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Related Exam Papers</h3>
                <div className="space-y-3">
                  {relatedPapers.map((relatedPaper: any) => (
                    <button
                      key={relatedPaper.id}
                      onClick={() => router.push(`/exampapers/${relatedPaper.slug}`)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all group"
                    >
                      <p className="text-sm font-medium text-gray-900 group-hover:text-teal-700 line-clamp-2 mb-2">
                        {relatedPaper.identifying_name || relatedPaper.title?.name || 'Exam Paper'}
                      </p>
                      
                      {/* Badges for Course and Module */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {relatedPaper.course?.course_acronym && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 hover:bg-blue-200">
                            {relatedPaper.course.course_acronym}
                          </Badge>
                        )}
                        {relatedPaper.modules && relatedPaper.modules.length > 0 && relatedPaper.modules[0].unit_code && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 hover:bg-purple-200">
                            {relatedPaper.modules[0].unit_code}
                          </Badge>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {relatedPaper.year_of_exam && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {relatedPaper.year_of_exam}
                          </span>
                        )}
                        {relatedPaper.exam_duration && (
                          <span className="flex items-center gap-1">
                            • <Clock className="h-3 w-3" />
                            {relatedPaper.exam_duration}m
                          </span>
                        )}
                        {relatedPaper.questions_count > 0 && (
                          <span>• {relatedPaper.questions_count} Q</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {relatedPapers.length >= 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/exampapers?institution_id=${paper.institution?.id}`)}
                    className="w-full mt-3"
                  >
                    View All
                  </Button>
                )}
              </div>
            )}

            {/* Loading state for related papers */}
            {isLoadingRelated && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Related Exam Papers</h3>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 rounded-lg border border-gray-200 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </aside>

          {/* Questions Section */}
          <main className="lg:col-span-3">
            {/* Instructions */}
            {paper.instructions && Array.isArray(paper.instructions) && paper.instructions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Instructions</h2>
                <ul className="space-y-2">
                  {paper.instructions.map((instruction: any, index: number) => {
                    // Extract instruction text - API returns it in the 'name' field
                    const instructionText = instruction.name ||
                      instruction.instruction ||
                      instruction.text ||
                      instruction.content ||
                      (typeof instruction === 'string' ? instruction : null);

                    if (!instructionText) return null;

                    return (
                      <li key={instruction.id || index} className="flex items-start gap-3 text-blue-800">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center text-xs font-semibold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="flex-1 leading-relaxed">{instructionText}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
                {questionSets.length > 0 && !isLoadingQuestions && !questionsError && (
                  <Badge variant="secondary">
                    {questionSets.reduce((total, set) => total + (set.questions?.length || 0), 0)} questions
                  </Badge>
                )}
              </div>

              {isLoadingQuestions ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500 mx-auto mb-3" />
                  <p className="text-gray-600">Loading questions...</p>
                </div>
              ) : questionsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                  <div className="text-red-500 text-5xl mb-4">⚠️</div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Questions</h3>
                  <p className="text-red-700 mb-4">{questionsError}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Try Again
                  </Button>
                </div>
              ) : questionSets.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No questions available for this exam paper</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Questions will appear here once they are added
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {questionSets.map((questionSet: any, setIndex: number) => (
                    <div key={questionSet.id || setIndex} className="space-y-4">
                      {/* Question Set Header */}
                      {questionSet.title && (
                        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-teal-900">
                            {questionSet.title}
                          </h3>
                          {questionSet.description && (
                            <p className="text-sm text-teal-700 mt-1">{questionSet.description}</p>
                          )}
                        </div>
                      )}

                      {/* Questions */}
                      {questionSet.questions && questionSet.questions.length > 0 ? (
                        <div className="space-y-4">
                          {[...questionSet.questions]
                            .sort((a: any, b: any) => {
                              // Sort by question_number
                              const numA = a.question_number || '';
                              const numB = b.question_number || '';
                              return numA.localeCompare(numB, undefined, { numeric: true });
                            })
                            .map((question: any, qIndex: number) => (
                              <QuestionCard
                                key={question.id || qIndex}
                                question={question}
                                questionNumber={question.question_number || (qIndex + 1)}
                              />
                            ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                          <p className="text-gray-600 text-sm">No questions in this set</p>
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
