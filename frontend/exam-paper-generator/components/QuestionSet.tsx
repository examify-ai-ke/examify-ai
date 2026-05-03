import React from 'react';
import type { QuestionSet as QuestionSetType } from '../types';
import Question from './Question';

interface QuestionSetProps {
    questionSet: QuestionSetType;
}

const QuestionSet: React.FC<QuestionSetProps> = ({ questionSet }) => {
    return (
        <section>
            <h2 className="text-xl font-bold uppercase underline mb-4">{questionSet.title}</h2>
            <div className="space-y-6">
                {questionSet.questions.map(question => (
                    <Question key={question.id} question={question} level={0} />
                ))}
            </div>
        </section>
    );
};

export default QuestionSet;
