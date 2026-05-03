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
  style?: 'ordered' | 'unordered';
  items?: string[];
  content?: string[][];
  withHeadings?: boolean;
  alignment?: string;
  url?: string;
  stretched?: boolean;
  withBorder?: boolean;
  withBackground?: boolean;
}

export interface Block {
  id: string;
  data: BlockData;
  type: 'paragraph' | 'header' | 'image' | 'code' | 'list' | 'table' | 'quote' | 'delimiter' | 'raw' | 'embed' | 'warning' | 'checklist';
}

export interface TextContent {
  time: number;
  blocks: Block[];
}

export interface PDFQuestion {
  id: string;
  slug: string;
  text: TextContent;
  marks: number;
  numbering_style: 'roman' | 'alpha' | 'numeric';
  question_number: string;
  children?: PDFQuestion[];
}

export interface PDFQuestionSet {
  id: string;
  slug: string;
  title: string;
  questions_count: number;
  questions: PDFQuestion[];
}

export interface PDFExamData {
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
  question_sets: PDFQuestionSet[];
}
