import ch1 from './chuong_1.json';
import ch2 from './chuong_2.json';
import ch3 from './chuong_3.json';
import ch4 from './chuong_4.json';
import ch5 from './chuong_5.json';
import ch6 from './chuong_6.json';
import { ChapterData, Question } from '../../types';

export const CHAPTERS_DATA: ChapterData[] = [
  ch1 as ChapterData,
  ch2 as ChapterData,
  ch3 as ChapterData,
  ch4 as ChapterData,
  ch5 as ChapterData,
  ch6 as ChapterData,
].map((ch, idx) => ({
  ...ch,
  questions: ch.questions.map((q) => ({
    ...q,
    chapter: idx + 1,
  })),
}));

export const CHAPTER_DESCRIPTIONS: Record<number, string> = {
  1: "Nhà nước, nguồn gốc, bản chất và bộ máy Nhà nước CHXHCN Việt Nam.",
  2: "Nguồn gốc, bản chất, vai trò của Pháp luật và Ý thức pháp luật.",
  3: "Hình thức pháp luật và Hệ thống văn bản quy phạm pháp luật tại Việt Nam.",
  4: "Quy phạm pháp luật, cấu thành (Giả định, Quy định, Chế tài).",
  5: "Quan hệ pháp luật, chủ thể, khách thể và năng lực pháp luật.",
  6: "Thực hiện pháp luật, vi phạm pháp luật và các loại trách nhiệm pháp lý.",
};

export function getAllChapters(): ChapterData[] {
  return CHAPTERS_DATA;
}

export function getChapter(id: number): ChapterData | undefined {
  return CHAPTERS_DATA.find((c) => c.chapter === id);
}

export function getAllQuestions(): Question[] {
  return CHAPTERS_DATA.flatMap((c) => c.questions);
}
