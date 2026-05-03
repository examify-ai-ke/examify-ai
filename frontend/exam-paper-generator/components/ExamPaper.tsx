import React from 'react';
import type { ExamData, QuestionSet as QuestionSetType } from '../types';
import QuestionSet from './QuestionSet';

interface ExamPaperProps {
    data: ExamData;
}

const ExamPaper: React.FC<ExamPaperProps> = ({ data }) => {
    return (
        <div id="exam-paper" className="w-full max-w-4xl mx-auto bg-white p-8 md:p-16 shadow-lg print:shadow-none">
            <header className="text-center border-b-4 border-black pb-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold uppercase">{data.institution.name}</h1>
                <h2 className="text-lg md:text-xl font-semibold">{data.course.name}</h2>
            </header>

            <section className="text-center mb-8">
                <h3 className="text-xl md:text-2xl font-bold uppercase">{data.title.name}</h3>
                {data.modules.map(module => (
                    <p key={module.id} className="text-md md:text-lg">{module.name} ({module.unit_code})</p>
                ))}
                <p className="text-md md:text-lg font-semibold mt-2">{data.description.name} - {data.year_of_exam}</p>
            </section>

            <section className="flex justify-between font-semibold border-y-2 border-black py-2 mb-8">
                <p>DATE: {new Date(data.exam_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>TIME: {data.exam_duration / 60} HOURS</p>
            </section>

            <section className="mb-10">
                <h4 className="text-lg font-bold uppercase underline mb-4">Instructions:</h4>
                <ul className="list-decimal list-inside space-y-1">
                    {data.instructions.map(instruction => (
                        <li key={instruction.id}>{instruction.name}</li>
                    ))}
                    <li>Total marks for this paper is 100.</li>
                </ul>
            </section>

            <main className="space-y-8">
                {data.question_sets.map((questionSet: QuestionSetType) => (
                    <QuestionSet key={questionSet.id} questionSet={questionSet} />
                ))}
            </main>
        </div>
    );
};

export default ExamPaper;
