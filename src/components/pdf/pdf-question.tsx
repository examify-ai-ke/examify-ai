import React from 'react';
import type { PDFQuestion as PDFQuestionType } from './types';
import { BlockRenderer } from './block-renderer';

interface PDFQuestionProps {
  question: PDFQuestionType;
  level: number;
}

export const PDFQuestion: React.FC<PDFQuestionProps> = ({ question, level }) => {
  const isSubQuestion = level > 0;
  const paddingLeft = `${level * 2}rem`;

  return (
    <div style={{ paddingLeft }}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-grow">
          <div className="flex items-start">
            {!isSubQuestion && (
              <span className="font-bold mr-2">{question.question_number.toUpperCase()})</span>
            )}
            {isSubQuestion && <span className="font-normal mr-2">{question.question_number})</span>}
            <div className="flex-1">
              <BlockRenderer blocks={question.text.blocks} />
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 font-bold text-right">
          <p>[{question.marks} Marks]</p>
        </div>
      </div>
      {question.children && question.children.length > 0 && (
        <div className="mt-4 space-y-4">
          {question.children.map((child) => (
            <PDFQuestion key={child.id} question={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
