import React from 'react';
import type { PDFQuestionSet as PDFQuestionSetType } from './types';
import { PDFQuestion } from './pdf-question';

interface PDFQuestionSetProps {
  questionSet: PDFQuestionSetType;
}

export const PDFQuestionSet: React.FC<PDFQuestionSetProps> = ({ questionSet }) => {
  return (
    <section>
      <h2 className="text-xl font-bold uppercase underline mb-4">{questionSet.title}</h2>
      <div className="space-y-6">
        {questionSet.questions.map((question) => (
          <PDFQuestion key={question.id} question={question} level={0} />
        ))}
      </div>
    </section>
  );
};
