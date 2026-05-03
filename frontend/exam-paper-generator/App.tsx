import React from 'react';
import ExamPaper from './components/ExamPaper';
import { examData } from './constants';
import type { ExamData } from './types';

const App: React.FC = () => {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen font-serif text-black">
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <ExamPaper data={examData as ExamData} />
        </div>
      </main>
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 flex justify-center print:hidden">
          <button
              onClick={handlePrint}
              className="px-8 py-3 bg-blue-600 text-white font-sans font-bold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300"
          >
              Generate PDF / Print
          </button>
      </div>
    </div>
  );
}

export default App;
