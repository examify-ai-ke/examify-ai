'use client';

import React, { useEffect, useState } from 'react';
import { X, Printer } from 'lucide-react';
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

  const handlePrint = () => {
    generatePDF('exam-paper-pdf', () => {
      // Close modal after print window opens
      onClose();
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-8">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 mb-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <h2 className="text-xl font-semibold">Exam Paper Preview</h2>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handlePrint} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print / Save as PDF
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
