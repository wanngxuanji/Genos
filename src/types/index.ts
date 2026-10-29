export interface OptionItem {
  key: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  options_list: OptionItem[];
  answer: string;
  answer_text: string;
  chapter?: number;
}

export interface ChapterData {
  chapter: number;
  title: string;
  total_questions: number;
  questions: Question[];
}

export type QuizMode = 'practice' | 'exam' | 'flashcard' | 'type_practice' | 'type_exam';

export interface QuizHistoryItem {
  timestamp: number;
  chapterTitle: string;
  chapterId: number | 'mistakes';
  mode: QuizMode;
  totalQuestions: number;
  correctCount: number;
  score: number;
  timeSpentSeconds: number;
}

export interface StoredMistake {
  chapter: number;
  questionId: number;
  selectedAnswer: string;
  lastWrongAt: number;
}
