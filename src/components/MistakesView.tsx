import React, { useEffect } from 'react';
import { Question } from '../types';

interface MistakesViewProps {
  questions: Question[];
  onPracticeMistakes: (mode: 'practice' | 'flashcard') => void;
  onRemoveMistake: (chapter: number, questionId: number) => void;
  onClearAll: () => void;
  onGoHome: () => void;
}

export const MistakesView: React.FC<MistakesViewProps> = ({
  questions,
  onPracticeMistakes,
  onRemoveMistake,
  onClearAll,
  onGoHome,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'p' && questions.length > 0) onPracticeMistakes('practice');
      if (k === 'f' && questions.length > 0) onPracticeMistakes('flashcard');
      if (k === 'h' || e.key === 'Escape') onGoHome();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions.length, onPracticeMistakes, onGoHome]);

  if (questions.length === 0) {
    return (
      <div className="py-20 max-w-xl mx-auto font-mono text-center space-y-4">
        <div className="text-[#d97757] text-3xl font-black">&gt; _</div>
        <div className="text-zinc-100 font-bold text-lg sm:text-xl">
          Chưa có câu nào trong danh sách cần ôn!
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          Các câu bạn làm sai khi luyện thi hoặc đánh dấu khi lướt thẻ sẽ tự động xuất hiện ở đây để bạn ôn luyện lại.
        </p>
        <button
          onClick={onGoHome}
          className="px-5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-bold transition-colors active:scale-95"
        >
          [H] Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 font-mono space-y-6 sm:space-y-8">
      <div className="border border-zinc-800 bg-[#161619] rounded-xl p-6 sm:p-7 space-y-4 shadow-lg">
        <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-500 pb-3 border-b border-zinc-800">
          <span># DANH SÁCH CÂU HỎI CẦN ÔN LẠI</span>
          <span className="font-bold text-zinc-400">{questions.length} câu ghi nhận</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-zinc-100 font-bold text-base sm:text-xl">
              Tập hợp các câu bạn từng trả lời chưa đúng
            </div>
            <div className="text-xs sm:text-sm text-zinc-400 mt-1">
              Luyện tập riêng các câu này để củng cố kiến thức trước kỳ thi thật.
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <button
              onClick={() => onPracticeMistakes('practice')}
              className="px-4 py-2.5 rounded-lg border border-rose-800 bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 font-bold transition-colors active:scale-95"
            >
              [P] Luyện trắc nghiệm
            </button>

            <button
              onClick={() => onPracticeMistakes('flashcard')}
              className="px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors active:scale-95"
            >
              [F] Lật flashcard
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400">
        <span className="font-semibold">Chi tiết {questions.length} câu:</span>
        <button
          onClick={onClearAll}
          className="hover:text-rose-400 transition-colors"
        >
          [Xóa sạch danh sách này]
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div
            key={`${q.chapter}-${q.id}`}
            className="border border-zinc-800 bg-[#161619] rounded-xl p-5 sm:p-6 space-y-3 text-sm sm:text-base shadow-sm"
          >
            <div className="flex items-center justify-between text-xs sm:text-sm pb-2.5 border-b border-zinc-800/80 text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="text-[#d97757] font-bold text-base">&gt;</span>
                <span className="text-zinc-300 font-bold">
                  Chương {q.chapter} / Câu {q.id}
                </span>
              </div>

              <button
                onClick={() => q.chapter && onRemoveMistake(q.chapter, q.id)}
                className="text-zinc-400 hover:text-emerald-400 font-semibold transition-colors text-xs sm:text-sm"
                title="Xóa khỏi danh sách câu sai"
              >
                [✓ Đã thuộc]
              </button>
            </div>

            <div className="text-zinc-100 font-bold leading-relaxed text-base sm:text-lg">
              {q.question}
            </div>

            <div className="text-sm sm:text-base text-emerald-400 pt-1 font-medium">
              ↳ Đáp án đúng: <strong className="text-emerald-300 font-bold">[{q.answer}] {q.answer_text}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
