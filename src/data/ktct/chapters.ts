import ch1 from './chuong_1.json';
import ch2 from './chuong_2.json';
import ch3 from './chuong_3.json';
import ch4 from './chuong_4.json';
import ch5 from './chuong_5.json';
import ch6 from './chuong_6.json';
import { ChapterData, Question } from '../../types';

export const KTCT_CHAPTERS_DATA: ChapterData[] = [
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

export const KTCT_DESCRIPTIONS: Record<number, string> = {
  1: "Đối tượng, phương pháp nghiên cứu và chức năng của Kinh tế chính trị Mác - Lênin.",
  2: "Hàng hóa, thị trường và vai trò của các chủ thể tham gia thị trường.",
  3: "Sản xuất giá trị thặng dư trong nền kinh tế thị trường.",
  4: "Cạnh tranh và độc quyền trong nền kinh tế thị trường.",
  5: "Kinh tế thị trường định hướng XHCN và các quan hệ lợi ích kinh tế ở Việt Nam.",
  6: "Công nghiệp hoá, hiện đại hoá và hội nhập kinh tế quốc tế của Việt Nam.",
};

export function getAllKTCTChapters(): ChapterData[] {
  return KTCT_CHAPTERS_DATA;
}

export function getKTCTChapter(id: number): ChapterData | undefined {
  return KTCT_CHAPTERS_DATA.find((c) => c.chapter === id);
}

export function getAllKTCTQuestions(): Question[] {
  return KTCT_CHAPTERS_DATA.flatMap((c) => c.questions);
}

