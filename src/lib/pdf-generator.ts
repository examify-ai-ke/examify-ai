import type { PDFExamData, PDFQuestion, PDFQuestionSet } from '@/components/pdf/types';

/**
 * Transform API exam paper data to PDF format
 */
export function transformToPDFFormat(apiData: any): PDFExamData {
  // Transform questions recursively
  const transformQuestion = (question: any): PDFQuestion => ({
    id: question.id,
    slug: question.slug || '',
    text: question.text || { time: Date.now(), blocks: [] },
    marks: question.marks || 0,
    numbering_style: question.numbering_style || 'numeric',
    question_number: question.question_number || '',
    children: question.children?.map(transformQuestion) || [],
  });

  // Transform question sets
  const transformQuestionSet = (questionSet: any): PDFQuestionSet => ({
    id: questionSet.id,
    slug: questionSet.slug || '',
    title: questionSet.title || 'Question Set',
    questions_count: questionSet.questions?.length || 0,
    questions: questionSet.questions?.map(transformQuestion) || [],
  });

  return {
    year_of_exam: apiData.year_of_exam || new Date().getFullYear().toString(),
    exam_duration: apiData.exam_duration || 180,
    exam_date: apiData.exam_date || new Date().toISOString(),
    id: apiData.id,
    slug: apiData.slug || '',
    instructions: apiData.instructions || [],
    title: apiData.title || { name: 'Exam Paper', slug: '' },
    description: apiData.description || { id: '', name: '', slug: '' },
    modules: apiData.modules || [],
    institution: apiData.institution || { id: '', name: 'Institution' },
    course: apiData.course || { id: '', name: 'Course', slug: null },
    question_sets: apiData.question_sets?.map(transformQuestionSet) || [],
  };
}

/**
 * Generate PDF using browser print functionality
 */
export function generatePDF() {
  window.print();
}
