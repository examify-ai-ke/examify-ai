'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFExamPaper } from './pdf-exam-paper';
import { transformToPDFFormat, generatePDF } from '@/lib/pdf-generator';
import type { PDFExamData } from './types';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  examPaperData: any;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  examPaperData,
}) => {
  const [pdfData, setPdfData] = useState<PDFExamData | null>(null);

  useEffect(() => {
    if (isOpen && examPaperData) {
      const transformed = transformToPDFFormat(examPaperData);
      setPdfData(transformed);
    }
  }, [isOpen, examPaperData]);

  if (!isOpen) return null;

  const handleDownload = () => {
    generatePDF();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 print:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto print:relative print:inset-auto">
        <div className="min-h-screen px-4 py-8 print:p-0">
          {/* Modal Header - Hidden on print */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 mb-4 print:hidden">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <h2 className="text-xl font-semibold">Exam Paper Preview</h2>
              <div className="flex items-center gap-2">
                <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                  Generate PDF / Print
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* PDF Content */}
          {pdfData && <PDFExamPaper data={pdfData} />}
        </div>
      </div>
    </>
  );
};
