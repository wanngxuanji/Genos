import { QuizHistoryItem, StoredMistake } from '../types';

export interface StreakInfo {
  count: number;
  lastDate: string;
}

const getHistoryKey = (subject: string = 'pldc') => `wanng_quiz_history_${subject}_v1`;
const getMistakesKey = (subject: string = 'pldc') => `wanng_mistakes_${subject}_v1`;
const STREAK_KEY = 'wanng_streak_v1';

export function getQuizHistory(subject: string = 'pldc'): QuizHistoryItem[] {
  try {
    const key = getHistoryKey(subject);
    let raw = localStorage.getItem(key);
    if (!raw) {
      raw = localStorage.getItem(`genos_quiz_history_${subject}_v1`) || (subject === 'pldc' ? localStorage.getItem('genos_quiz_history_v1') : null);
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuizHistory(item: QuizHistoryItem, subject: string = 'pldc'): void {
  try {
    const history = getQuizHistory(subject);
    history.unshift(item);
    localStorage.setItem(getHistoryKey(subject), JSON.stringify(history.slice(0, 50)));
    updateStreak();
  } catch (err) {
    console.error('Lỗi khi lưu lịch sử thi:', err);
  }
}

export function clearQuizHistory(subject: string = 'pldc'): void {
  try {
    localStorage.removeItem(getHistoryKey(subject));
    localStorage.removeItem(`genos_quiz_history_${subject}_v1`);
    if (subject === 'pldc') {
      localStorage.removeItem('genos_quiz_history_v1');
    }
  } catch (err) {
    console.error('Lỗi khi xóa lịch sử thi:', err);
  }
}

export function getMistakes(subject: string = 'pldc'): StoredMistake[] {
  try {
    const key = getMistakesKey(subject);
    let raw = localStorage.getItem(key);
    if (!raw) {
      raw = localStorage.getItem(`genos_mistakes_${subject}_v1`) || (subject === 'pldc' ? localStorage.getItem('genos_mistakes_v1') : null);
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordMistake(chapter: number, questionId: number, selectedAnswer: string, subject: string = 'pldc'): void {
  try {
    const mistakes = getMistakes(subject);
    const existingIndex = mistakes.findIndex(
      (m) => m.chapter === chapter && m.questionId === questionId
    );
    const item: StoredMistake = {
      chapter,
      questionId,
      selectedAnswer,
      lastWrongAt: Date.now(),
    };
    if (existingIndex >= 0) {
      mistakes[existingIndex] = item;
    } else {
      mistakes.push(item);
    }
    localStorage.setItem(getMistakesKey(subject), JSON.stringify(mistakes));
  } catch (err) {
    console.error('Lỗi khi ghi nhận câu sai:', err);
  }
}

export function removeMistake(chapter: number, questionId: number, subject: string = 'pldc'): void {
  try {
    const mistakes = getMistakes(subject).filter(
      (m) => !(m.chapter === chapter && m.questionId === questionId)
    );
    localStorage.setItem(getMistakesKey(subject), JSON.stringify(mistakes));
  } catch (err) {
    console.error('Lỗi khi xóa câu sai:', err);
  }
}

export function clearAllMistakes(subject: string = 'pldc'): void {
  try {
    localStorage.removeItem(getMistakesKey(subject));
    localStorage.removeItem(`genos_mistakes_${subject}_v1`);
    if (subject === 'pldc') {
      localStorage.removeItem('genos_mistakes_v1');
    }
  } catch (err) {
    console.error('Lỗi khi xóa toàn bộ câu sai:', err);
  }
}

export function getStreak(): StreakInfo {
  try {
    let raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      raw = localStorage.getItem('genos_streak_v1');
    }
    return raw ? JSON.parse(raw) : { count: 0, lastDate: '' };
  } catch {
    return { count: 0, lastDate: '' };
  }
}

export function updateStreak(): void {
  try {
    const streak = getStreak();
    const today = new Date().toISOString().split('T')[0];

    if (!streak.lastDate) {
      streak.count = 1;
      streak.lastDate = today;
    } else if (streak.lastDate === today) {
      return;
    } else {
      const last = new Date(streak.lastDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        streak.count += 1;
        streak.lastDate = today;
      } else if (diffDays > 1) {
        streak.count = 1;
        streak.lastDate = today;
      }
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch (err) {
    console.error('Lỗi khi cập nhật streak:', err);
  }
}
