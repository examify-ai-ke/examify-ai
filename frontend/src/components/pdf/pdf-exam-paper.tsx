import React from 'react';
import type { PDFExamData } from './types';
import { PDFQuestionSet } from './pdf-question-set';

interface PDFExamPaperProps {
  data: PDFExamData;
}

export const PDFExamPaper: React.FC<PDFExamPaperProps> = ({ data }) => {
  const institutionLogo = (data.institution as any)?.logo?.media?.link;

  return (
    <div
      id="exam-paper-pdf"
      className="w-full max-w-4xl mx-auto bg-white p-8 md:p-16 shadow-lg print:shadow-none font-serif relative"
      style={{ backgroundColor: '#ffffff', color: '#000000' }}
    >
      <header className="text-center border-b-4 border-black pb-4 mb-8">
        {/* Institution Logo */}
        {institutionLogo && (
          <div className="flex justify-center mb-4">
            <img
              src={institutionLogo}
              alt={data.institution.name}
              className="h-20 w-auto object-contain"
            />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold uppercase">{data.institution.name}</h1>
        <h2 className="text-lg md:text-xl font-semibold">{data.course.name}</h2>
      </header>

      <section className="text-center mb-8">
        <h3 className="text-xl md:text-2xl font-bold uppercase">{data.title.name}</h3>
        {data.modules.map((module) => (
          <p key={module.id} className="text-md md:text-lg">
            {module.name} ({module.unit_code})
          </p>
        ))}
        <p className="text-md md:text-lg font-semibold mt-2">
          {data.description.name} - {data.year_of_exam}
        </p>
      </section>

      <section className="flex justify-between font-semibold border-y-2 border-black py-2 mb-8">
        <p>
          DATE:{' '}
          {new Date(data.exam_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <p>TIME: {data.exam_duration / 60} HOURS</p>
      </section>

      <section className="mb-10">
        <h4 className="text-lg font-bold uppercase underline mb-4">Instructions:</h4>
        <ul className="list-decimal list-inside space-y-1">
          {data.instructions.map((instruction) => (
            <li key={instruction.id}>{instruction.name}</li>
          ))}
          <li>Total marks for this paper is 100.</li>
        </ul>
      </section>

      <main className="space-y-8 mb-16">
        {data.question_sets.map((questionSet) => (
          <PDFQuestionSet key={questionSet.id} questionSet={questionSet} />
        ))}
      </main>

      {/* Footer with Credits */}
      <footer className="mt-12 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
        <p className="mb-1">
          Generated from <strong>ExamPapel</strong> - Revise Smarter With Real Exams.
        </p>
        <p className="text-xs">
          <a href="https://exampapel.com" className="text-blue-600 hover:underline">
            https://exampapel.com
          </a>
        </p>
        <p className="text-xs mt-2 text-gray-500">
          © {new Date().getFullYear()} ExamPapel. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
