export interface BlockData {
  text?: string;
  level?: number;
  file?: {
    url: string;
    name: string;
    size: number;
    width: number;
    format: string;
    height: number;
  };
  caption?: string;
  code?: string;
}

export interface Block {
  id: string;
  data: BlockData;
  type: 'paragraph' | 'header' | 'image' | 'code' | 'list';
}

export interface TextContent {
  time: number;
  blocks: Block[];
}

export interface Question {
  id: string;
  slug: string;
  text: TextContent;
  marks: number;
  numbering_style: 'roman' | 'alpha' | 'numeric';
  question_number: string;
  // FIX: Made `children` optional to match the data structure where sub-questions may not have a `children` property. This resolves the type error in App.tsx.
  children?: Question[];
}

export interface QuestionSet {
  id: string;
  slug: string;
  title: string;
  questions_count: number;
  questions: Question[];
}

export interface ExamData {
  year_of_exam: string;
  exam_duration: number;
  exam_date: string;
  id: string;
  slug: string;
  instructions: { id: string; name: string; slug: string }[];
  title: { name: string; slug: string };
  description: { id: string; name: string; slug: string };
  modules: { id: string; name: string; slug: string | null; unit_code: string }[];
  institution: { id: string; name: string };
  course: { id: string; name: string; slug: string | null };
  question_sets: QuestionSet[];
}