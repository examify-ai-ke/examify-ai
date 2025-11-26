'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EditorRenderer from '@/components/ui/editor-renderer';
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

/**
 * Sort sub-questions by question number
 */
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
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="p-6 rounded-lg border-2 border-border bg-card animate-pulse">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="h-6 w-24 rounded-full bg-muted"></div>
                  <div className="h-6 w-20 rounded-full bg-muted"></div>
                  <div className="h-6 w-16 rounded-full bg-muted"></div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-muted"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="h-4 w-16 bg-muted rounded"></div>
                  <div className="h-4 w-20 bg-muted rounded"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  // Debug pagination
  console.log('📄 Pagination Info:', {
    currentPage,
    totalPages,
    totalItems,
    hasOnPageChange: !!onPageChange,
    shouldShowPagination: totalPages > 1 && !!onPageChange,
  });

  return (
    <section className="bg-background">
      <div className="w-full max-w-7xl mx-auto">
        {/* Optional Section Header */}
        {showHeading && (
          <div className="text-center mb-12 py-12">
            <h2 className="text-5xl font-semibold text-foreground mb-4">Recent Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the latest exam questions added to our platform. Practice with real past paper questions from top institutions.
            </p>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question) => {
            const isExpanded = expandedId === question.id;

            // Get data from question level (direct properties on QuestionRead)
            const institution =
              question.institution?.name ||
              'Unknown Institution';
            
            const courseAcronym =
              question.course?.course_acronym ||
              question.course?.name ||
              'N/A';
            
            const year =
              question.exam_paper?.year_of_exam ||
              'N/A';

            // Calculate total marks by summing all sub-question marks
            const childrenCount = question.children_count || 0;
            const calculatedTotalMarks = question.children && question.children.length > 0
              ? question.children.reduce((sum: number, child: any) => sum + (child.marks || 0), 0)
              : question.marks || 0;

            // Use calculated total or fallback to total_marks from API
            const totalMarks = calculatedTotalMarks || question.total_marks || 0;
            
            const programme =
              question.programme?.name;
            
            const module =
              question.modules?.[0]?.name;
            
            const exam_paper_name =
              question.exam_paper?.identifying_name ||
              'Unknown Exam Paper';

            const exam_paper_slug = question.exam_paper?.slug;
            
            // Check if question has answers
            const hasAnswers = (question.answers_count || 0) > 0;

            return (
              <div key={question.id} className="group">
                <button onClick={() => toggleExpand(question.id)} className="w-full text-left">
                  <div
                    className={`
                        w-full p-6 rounded-lg border-2 transition-all duration-200
                        ${isExpanded ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'}
                      `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {institution}
                          </span>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-chart-2 text-white text-xs font-bold">
                            {courseAcronym}
                          </span>
                          {programme && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-chart-4 text-white text-xs font-bold">
                              {programme}
                            </span>
                          )}
                          {module && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-chart-5 text-white text-xs font-bold">
                              {module}
                            </span>
                          )}
                          {hasAnswers && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Has Answer
                            </span>
                          )}
                        </div>

                        {/* Question Number Badge */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                            {question.question_number || '?'}
                          </span>
                          <span className="text-md font-bold text-muted-foreground uppercase tracking-wide">
                            Question
                          </span>
                        </div>

                        {/* Question Content - Rendered with EditorRenderer */}
                        <div className="text-foreground mb-3 line-clamp-3">
                          {question.text && typeof question.text === 'object' && question.text.blocks ? (
                            <EditorRenderer data={question.text} className="line-clamp-3" />
                          ) : (
                            <p>No question text available</p>
                          )}
                        </div>

                        {/* First Row: Marks, Sub-questions, Year */}
                        <div className="flex flex-wrap items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Marks:</span>
                            <span className="text-base font-bold text-primary">{totalMarks}</span>
                          </div>
                          {childrenCount > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">Sub-questions:</span>
                              <span className="text-base font-bold text-foreground">{childrenCount}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Year:</span>
                            <span className="text-base font-bold text-foreground">{year}</span>
                          </div>
                        </div>

                        {/* Second Row: Exam Paper - Clickable Link */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Exam Paper:</span>
                          {exam_paper_slug ? (
                            <Link
                              href={`/exampapers/${exam_paper_slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-base font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                            >
                              {exam_paper_name}
                            </Link>
                          ) : (
                            <span className="text-base font-medium text-foreground">{exam_paper_name}</span>
                          )}
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <div className="flex-shrink-0">
                        <ChevronDown
                          className={`w-5 h-5 text-primary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Content - Sub-questions */}
                {isExpanded && childrenCount > 0 && (
                  <div className="mt-2 ml-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {sortSubQuestions(question.children || []).map((subQuestion: any) => {
                      const subHasAnswers = (subQuestion.answers_count || 0) > 0;
                      return (
                        <div
                          key={subQuestion.id}
                          className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-semibold text-primary min-w-fit">
                              ({subQuestion.question_number || '?'})
                            </span>
                            <div className="flex-1">
                              {/* Sub-question Content - Rendered with EditorRenderer */}
                              <div className="text-foreground mb-2">
                                {subQuestion.text && typeof subQuestion.text === 'object' && subQuestion.text.blocks ? (
                                  <EditorRenderer data={subQuestion.text} />
                                ) : (
                                  <p>No text available</p>
                                )}
                              </div>
                              <div className="mt-2 flex items-center gap-4">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Marks: <span className="text-primary">{subQuestion.marks || 0}</span>
                                </span>
                                {subHasAnswers && (
                                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
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

        {/* Pagination */}
        {onPageChange && (
          <div className="mt-12 flex items-center justify-end gap-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} • {totalItems} total questions
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {totalPages > 0 && Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
