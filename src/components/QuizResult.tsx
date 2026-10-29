import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface QuizResultProps {
  title: string;
  questions: Question[];
  userAnswers: Record<number, string>;
  timeSpentSeconds: number;
  onRetake: () => void;
  onPracticeMistakesOnly: (mistakeQuestions: Question[]) => void;
  onGoHome: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  title,
  questions,
  userAnswers,
  timeSpentSeconds,
  onRetake,
  onPracticeMistakesOnly,
  onGoHome,
}) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');

  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  const mistakes: Question[] = [];

  questions.forEach((q) => {
    const ans = userAnswers[q.id];
    if (ans === undefined) {
      skippedCount++;
      mistakes.push(q);
    } else if (ans === q.answer) {
      correctCount++;
    } else {
      wrongCount++;
      mistakes.push(q);
    }
  });

  const total = questions.length;
  const score = total > 0 ? Number(((correctCount / total) * 10).toFixed(1)) : 0;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'r') onRetake();
      if (k === 'h' || e.key === 'Escape') onGoHome();
      if (k === 'm' && mistakes.length > 0) onPracticeMistakesOnly(mistakes);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRetake, onGoHome, mistakes, onPracticeMistakesOnly]);

  const filteredQuestions = questions.filter((q) => {
    const ans = userAnswers[q.id];
    const isCorrect = ans === q.answer;
    if (filter === 'correct') return isCorrect;
    if (filter === 'wrong') return !isCorrect;
    return true;
  });

  return (
    <div className="py-6 sm:py-8 font-mono space-y-6 sm:space-y-8">
      <div className="border border-zinc-800 bg-[#161619] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between text-xs sm:text-sm pb-3 border-b border-zinc-800 text-zinc-500 font-semibold">
          <span># BÁO CÁO KẾT QUẢ THI</span>
          <span className="text-zinc-400">{title}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-4">
          <div>
            <div className="text-zinc-500 text-xs sm:text-sm uppercase tracking-wider font-semibold">
              Điểm số tổng kết
            </div>
            <div className="text-4xl sm:text-6xl font-black text-white mt-1.5 tracking-tight">
              <span className={score >= 8 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-rose-400'}>
                {score}
              </span>
              <span className="text-zinc-600 text-xl sm:text-2xl font-bold"> / 10.0</span>
            </div>
            <div className="text-sm sm:text-base text-zinc-400 mt-2 font-medium">
              Đúng <strong className="text-emerald-400 font-bold">{correctCount}/{total}</strong> câu • Sai <strong className="text-rose-400 font-bold">{wrongCount}</strong> • Chưa làm <strong className="text-amber-400 font-bold">{skippedCount}</strong>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-zinc-400 space-y-2 sm:text-right border-l sm:border-l-0 sm:border-r border-zinc-800 pl-4 sm:pl-0 sm:pr-6">
            <div><span className="text-zinc-500">Thời gian làm:</span> <strong className="text-zinc-200">{formatTime(timeSpentSeconds)}</strong></div>
            <div><span className="text-zinc-500">Độ chính xác:</span> <strong className="text-zinc-200">{Math.round((correctCount / total) * 100)}%</strong></div>
            <div>
              <span className="text-zinc-500">Xếp loại: </span>
              <span className="text-zinc-100 font-bold">
                {score >= 8 ? 'Đạt loại Giỏi 🌟' : score >= 5 ? 'Đạt Trung Bình 👍' : 'Cần ôn thêm 📖'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-zinc-800/80 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <button
            onClick={onRetake}
            className="px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold transition-colors active:scale-95"
          >
            [R] Làm lại đề này
          </button>

          {mistakes.length > 0 && (
            <button
              onClick={() => onPracticeMistakesOnly(mistakes)}
              className="px-4 py-2.5 rounded-lg border border-rose-800 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold transition-colors active:scale-95"
            >
              [M] Luyện riêng {mistakes.length} câu làm sai
            </button>
          )}

          <button
            onClick={onGoHome}
            className="px-4 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            [H] Về trang chủ
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-zinc-400 uppercase font-bold tracking-wider">
            # Chi tiết từng câu hỏi
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                filter === 'all' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tất cả ({total})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                filter === 'wrong' ? 'bg-rose-950 border border-rose-800 text-rose-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sai ({mistakes.length})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                filter === 'correct' ? 'bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Đúng ({correctCount})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const userChoice = userAnswers[q.id];
            const isCorrect = userChoice === q.answer;

            return (
              <div
                key={q.id}
                className="border border-zinc-800 bg-[#161619] rounded-xl p-5 sm:p-6 text-sm sm:text-base space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-500 border-b border-zinc-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#d97757] font-bold text-base">&gt;</span>
                    <span className="text-zinc-200 font-bold">Câu {q.id}</span>
                  </div>
                  <div>
                    {isCorrect ? (
                      <span className="text-emerald-400 font-bold">✓ Đúng</span>
                    ) : (
                      <span className="text-rose-400 font-bold">✗ Chưa đúng</span>
                    )}
                  </div>
                </div>

                <div className="text-zinc-100 font-bold leading-relaxed text-base sm:text-lg">
                  {q.question}
                </div>

                <div className="space-y-2 pt-1 text-sm sm:text-base">
                  {q.options_list.map((opt) => {
                    const isUserPick = userChoice === opt.key;
                    const isRightAnswer = opt.key === q.answer;

                    let optCls = "text-zinc-400 p-2.5 rounded";
                    let prefix = `  [${opt.key}] `;

                    if (isRightAnswer) {
                      optCls = "text-emerald-300 font-bold bg-emerald-950/30 border border-emerald-800/60 p-2.5 rounded";
                      prefix = `✓ [${opt.key}] `;
                    } else if (isUserPick && !isRightAnswer) {
                      optCls = "text-rose-300 font-bold bg-rose-950/30 border border-rose-800/60 p-2.5 rounded";
                      prefix = `✗ [${opt.key}] `;
                    }

                    return (
                      <div key={opt.key} className={`flex items-start justify-between gap-3 ${optCls}`}>
                        <div>
                          <span className="font-mono font-bold mr-1">{prefix}</span>
                          <span>{opt.text}</span>
                        </div>
                        {isUserPick && !isRightAnswer && (
                          <span className="text-rose-400 text-xs font-semibold shrink-0">(Bạn chọn)</span>
                        )}
                        {isRightAnswer && (
                          <span className="text-emerald-400 text-xs font-semibold shrink-0">(Đáp án chuẩn)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
