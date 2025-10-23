'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuestionRead } from './types';

interface RecentQuestionsSectionProps {
  questions: QuestionRead[];
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Helper to extract plain text from question blocks
 */
function extractQuestionText(questionText: unknown): string {
  if (typeof questionText === 'string') {
    return questionText;
  }

  if (questionText && typeof questionText === 'object') {
    const textObj = questionText as any;
    if (textObj.blocks && Array.isArray(textObj.blocks)) {
      return textObj.blocks
        .map((block: any) => block?.data?.text || '')
        .filter(Boolean)
        .join(' ')
        .trim();
    }
  }

  if (Array.isArray(questionText)) {
    return questionText
      .map((block: any) => {
        if (typeof block === 'string') return block;
        if (block?.data?.text) return block.data.text;
        if (block?.text) return block.text;
        return '';
      })
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  return '';
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
}: RecentQuestionsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
    <section className="py-16 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-semibold text-foreground mb-4">Recent Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the latest exam questions added to our platform. Practice with real past paper questions from top
            institutions.
          </p>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question) => {
            const isExpanded = expandedId === question.id;
            const mainText = extractQuestionText(question.question_text || (question as any).text);
            
            // Try to get data from both question level and exam_paper level
            const questionData = question as any;
            const institution = 
              questionData.institution?.name || 
              question.exam_paper?.institution?.name || 
              'Unknown Institution';
            const courseAcronym =
              questionData.course?.course_acronym ||
              questionData.course?.code ||
              questionData.course?.name ||
              question.exam_paper?.course?.course_acronym ||
              question.exam_paper?.course?.code ||
              question.exam_paper?.course?.name ||
              'N/A';
            const year = 
              questionData.exam_paper?.year_of_exam || 
              question.exam_paper?.year_of_exam || 
              'N/A';
            
            // Calculate total marks by summing all sub-question marks
            const childrenCount = question.children_count || question.children?.length || 0;
            const calculatedTotalMarks = question.children && question.children.length > 0
              ? question.children.reduce((sum: number, child: any) => sum + (child.marks || 0), 0)
              : question.marks || 0;
            
            // Use calculated total or fallback to total_marks from API
            const totalMarks = calculatedTotalMarks || question.total_marks || question.marks || 0;
            const programme = 
              questionData.programme?.name || 
              question.exam_paper?.programme?.name;
            const module = 
              questionData.module?.name || 
              questionData.modules?.[0]?.name ||
              question.exam_paper?.module?.name;
            const exam_paper_name = 
              questionData.exam_paper?.identifying_name || 
              'Unknown Exam Paper';

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

                        <h3 className="text-foreground mb-3 line-clamp-3">
                          {mainText || 'No question text available'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4">
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

                           <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Exam Paper:</span>
                            <span className="text-base font-medium text-foreground">{exam_paper_name}</span>
                          </div>
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
                      const subText = extractQuestionText(subQuestion.question_text || subQuestion.text);
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
                              <p className="text-xl text-foreground">{subText || 'No text available'}</p>
                              <div className="mt-2 flex items-center gap-4">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Marks: <span className="text-primary">{subQuestion.marks || 0}</span>
                                </span>
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
