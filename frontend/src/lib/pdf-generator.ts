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
 * Generate PDF by opening in new window and triggering print
 */
export function generatePDF(elementId: string = 'exam-paper-pdf', onComplete?: () => void) {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error('PDF element not found');
    return;
  }

  // Clone the element
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Create a new window
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to generate PDF');
    return;
  }

  // Write the HTML content
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Exam Paper - ExamPapel</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            margin: 2cm 1.5cm;
            size: A4;
          }
          /* Page header */
          @page {
            @top-center {
              content: "ExamPapel - Revise Smarter With Real Exams";
              font-size: 10pt;
              color: #666;
              font-family: sans-serif;
            }
          }
          /* Page footer */
          @page {
            @bottom-center {
              content: "Generated from https://exampapel.com | Page " counter(page) " | © ${new Date().getFullYear()} ExamPapel";
              font-size: 9pt;
              color: #999;
              font-family: sans-serif;
            }
          }
          /* Avoid page breaks inside elements */
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          /* Hide the footer in the content */
          #exam-paper-pdf footer {
            display: none;
          }
        }
        body {
          font-family: serif;
          background: white;
        }
        /* Print header and footer visible in print preview */
        .print-header {
          display: none;
        }
        .print-footer {
          display: none;
        }
        @media print {
          .print-header {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            text-align: center;
            padding: 10px;
            font-size: 10pt;
            color: #666;
            border-bottom: 1px solid #ddd;
            background: white;
          }
          .print-footer {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            padding: 10px;
            font-size: 9pt;
            color: #999;
            border-top: 1px solid #ddd;
            background: white;
          }
        }
      </style>
    </head>
    <body>
      <!-- Print Header -->
      <div class="print-header">
        <strong>ExamPapel</strong> - Revise Smarter With Real Exams
      </div>
      
      <!-- Main Content -->
      ${clonedElement.outerHTML}
      
      <!-- Print Footer -->
      <div class="print-footer">
        Generated from <strong>https://exampapel.com</strong> | Page <span class="page-number"></span> | © ${new Date().getFullYear()} ExamPapel
      </div>
      
      <script>
        // Wait for Tailwind to load and styles to apply
        window.onload = function() {
          setTimeout(function() {
            window.print();
            // Close window after print dialog is closed (optional)
            // window.onafterprint = function() {
            //   window.close();
            // };
          }, 500);
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
  
  // Call onComplete callback to close the modal
  if (onComplete) {
    setTimeout(() => {
      onComplete();
    }, 600);
  }
}
