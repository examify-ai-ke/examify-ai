'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EditorRenderer from '@/components/ui/editor-renderer';
import { getQuestionUrl } from '@/utils/question-url';
import type { QuestionRead } from './types';

interface RecentQuestionsSectionProps {
  questions: QuestionRead[];
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  showHeading?: boolean;
}

const sortSubQuestions = (children: any[]) => {
  if (!children || !Array.isArray(children)) return [];
  return [...children].sort((a, b) => {
    const numA = a.question_number || '';
    const numB = b.question_number || '';
    return numA.localeCompare(numB, undefined, { numeric: true });
  });
};

export function RecentQuestionsSection({
  questions,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  isLoading = false,
  showHeading = false,
}: RecentQuestionsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="p-6 rounded-2xl border border-border bg-card animate-pulse">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="h-6 w-28 rounded-full bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="h-3 bg-muted rounded w-40 mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  const PaginationControls = () => {
    if (!onPageChange || totalPages <= 1) return null;
    const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);
    return (
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground tabular-nums">
          Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}
          <span className="ml-2 text-muted-foreground/60">· {totalItems.toLocaleString()} questions</span>
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pages.map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`h-8 w-8 p-0 rounded-lg text-sm font-medium ${
                currentPage === pageNum ? 'shadow-sm' : ''
              }`}
            >
              {pageNum}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-background">
      <div className="w-full max-w-7xl mx-auto px-4">

        {/* Section Header */}
        {showHeading && (
          <div className="text-center py-16">
            <h2 className="font-heading font-normal text-foreground mb-4">
              Recent Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore the latest exam questions added to our platform. Practice with real past paper
              questions from top institutions.
            </p>
          </div>
        )}

        {/* Top Pagination */}
        {onPageChange && totalPages > 1 && (
          <div className="mb-6">
            <PaginationControls />
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-3">
          {questions.map((question) => {
            const isExpanded = expandedId === question.id;

            const institution = question.institution?.name || 'Unknown Institution';
            const courseAcronym = question.course?.course_acronym || question.course?.name || 'N/A';
            const year = question.exam_paper?.year_of_exam || 'N/A';
            const childrenCount = question.children_count || 0;
            const calculatedTotalMarks =
              question.children && question.children.length > 0
                ? question.children.reduce((sum: number, child: any) => sum + (child.marks || 0), 0)
                : question.marks || 0;
            const totalMarks = calculatedTotalMarks || question.total_marks || 0;
            const programme = question.programme?.name;
            const module = question.modules?.[0]?.name;
            const exam_paper_name = question.exam_paper?.identifying_name || 'Unknown Exam Paper';
            const exam_paper_slug = question.exam_paper?.slug;
            const hasAnswers = (question.answers_count || 0) > 0;

            return (
              <div key={question.id}>
                <button
                  onClick={() => childrenCount > 0 && toggleExpand(question.id)}
                  className="w-full text-left"
                  aria-expanded={isExpanded}
                >
                  <div
                    className={`
                      w-full p-5 rounded-2xl border-2 transition-all duration-200
                      ${isExpanded
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'}
                    `}
                  >
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                        {institution}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 text-xs font-semibold border border-teal-500/20">
                        {courseAcronym}
                      </span>
                      {programme && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 text-xs font-semibold border border-purple-500/20">
                          {programme}
                        </span>
                      )}
                      {module && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold border border-amber-500/20">
                          {module}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Question number + marks */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex-shrink-0">
                            {question.question_number || '?'}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Question
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold border border-border">
                            {totalMarks} {totalMarks === 1 ? 'mark' : 'marks'}
                          </span>
                          {hasAnswers && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-700 text-xs font-semibold border border-green-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Has Answer
                            </span>
                          )}
                        </div>

                        {/* Question text */}
                        <Link 
                          href={getQuestionUrl(question)} 
                          onClick={(e) => e.stopPropagation()}
                          className="block text-foreground mb-3 line-clamp-3 text-sm leading-relaxed hover:text-primary transition-colors cursor-pointer"
                        >
                          {question.text && typeof question.text === 'object' && question.text.blocks ? (
                            <EditorRenderer data={question.text} className="line-clamp-3" />
                          ) : (
                            <p className="text-muted-foreground italic">No question text available</p>
                          )}
                        </Link>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                          {childrenCount > 0 && (
                            <span><span className="font-medium text-foreground">{childrenCount}</span> sub-questions</span>
                          )}
                          <span>Year: <span className="font-medium text-foreground">{year}</span></span>
                          {question.modules && question.modules.length > 0 && (
                            <span>
                              Module:{' '}
                              <span className="font-medium text-foreground">
                                {question.modules.map((m: any) => m.unit_code).filter(Boolean).join(', ') ||
                                  question.modules.map((m: any) => m.name).filter(Boolean).join(', ')}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Exam paper footer */}
                        <div className="flex items-center gap-2 pt-2.5 border-t border-border/50">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">From:</span>
                          {exam_paper_slug ? (
                            <Link
                              href={`/exampapers/${exam_paper_slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-semibold text-primary hover:underline transition-colors"
                            >
                              {exam_paper_name}
                            </Link>
                          ) : (
                            <span className="text-xs font-medium text-foreground">{exam_paper_name}</span>
                          )}
                        </div>
                      </div>

                      {/* Expand chevron */}
                      {childrenCount > 0 && (
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isExpanded ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Sub-questions */}
                {isExpanded && childrenCount > 0 && (
                  <div className="mt-1.5 ml-6 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {sortSubQuestions(question.children || []).map((subQuestion: any) => {
                      const subHasAnswers = (subQuestion.answers_count || 0) > 0;
                      return (
                        <div
                          key={subQuestion.id}
                          className="p-4 bg-muted/40 rounded-xl border border-border hover:bg-muted/60 transition-colors"
                          style={{ borderLeft: '3px solid var(--color-primary)' }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-bold text-primary bg-primary/10 rounded-md px-2 py-1 min-w-fit">
                              {subQuestion.question_number || '?'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <Link 
                                href={getQuestionUrl(subQuestion.id ? subQuestion : question)}
                                onClick={(e) => e.stopPropagation()}
                                className="block text-sm text-foreground mb-2 leading-relaxed hover:text-primary transition-colors cursor-pointer"
                              >
                                {subQuestion.text && typeof subQuestion.text === 'object' && subQuestion.text.blocks ? (
                                  <EditorRenderer data={subQuestion.text} />
                                ) : (
                                  <p className="text-muted-foreground italic">No text available</p>
                                )}
                              </Link>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                  Marks: <span className="font-semibold text-primary">{subQuestion.marks || 0}</span>
                                </span>
                                {subHasAnswers && (
                                  <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Has Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination */}
        {onPageChange && totalPages > 1 && (
          <div className="mt-10 pt-6 border-t border-border">
            <PaginationControls />
          </div>
        )}
      </div>
    </section>
  );
}
