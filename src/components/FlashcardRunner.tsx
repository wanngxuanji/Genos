import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface FlashcardRunnerProps {
  title: string;
  questions: Question[];
  onExit: () => void;
  onMarkMistake: (chapter: number, questionId: number, reason?: string) => void;
  onRemoveMistake: (chapter: number, questionId: number) => void;
}

export const FlashcardRunner: React.FC<FlashcardRunnerProps> = ({
  title,
  questions,
  onExit,
  onMarkMistake,
  onRemoveMistake,
}) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<Record<number, boolean>>({});

  const currentQ = questions[index];

  useEffect(() => {
    setIsFlipped(false);
  }, [index]);

  const handleMarkMastered = () => {
    setMastered((prev) => ({ ...prev, [currentQ.id]: true }));
    if (currentQ.chapter) {
      onRemoveMistake(currentQ.chapter, currentQ.id);
    }
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
    }
  };

  const handleMarkNeedReview = () => {
    setMastered((prev) => ({ ...prev, [currentQ.id]: false }));
    if (currentQ.chapter) {
      onMarkMistake(currentQ.chapter, currentQ.id, 'Flashcard');
    }
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === 'ArrowRight' && index < questions.length - 1) {
        setIndex((i) => i + 1);
      } else if (e.key === 'ArrowLeft' && index > 0) {
        setIndex((i) => i - 1);
      } else if (e.key === '1') {
        handleMarkNeedReview();
      } else if (e.key === '2') {
        handleMarkMastered();
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, questions.length, currentQ, onExit]);

  const masteredCount = Object.values(mastered).filter(Boolean).length;

  return (
    <div className="py-6 sm:py-8 font-mono space-y-6">
      <div className="border border-zinc-800 bg-[#161619] rounded-xl p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm text-zinc-400">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-zinc-500 hover:text-zinc-200 transition-colors font-semibold"
          >
            [Esc] Thoát
          </button>
          <span className="text-zinc-700">│</span>
          <span className="text-zinc-100 font-bold text-sm sm:text-base">{title}</span>
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <span>thẻ: <strong className="text-zinc-100 font-bold">{index + 1}</strong>/{questions.length}</span>
          <span className="text-zinc-700">│</span>
          <span>đã thuộc: <strong className="text-emerald-400 font-bold">{masteredCount}</strong></span>
        </div>
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="border border-zinc-800 bg-[#161619] hover:border-zinc-700 rounded-xl p-8 sm:p-12 lg:p-16 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between cursor-pointer select-none transition-all shadow-xl"
      >
        <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-500 pb-4 border-b border-zinc-800/80">
          <span className="text-[#d97757] font-bold text-sm sm:text-base">&gt; CÂU HỎI {currentQ.id}</span>
          <span className="text-zinc-400 hover:text-zinc-200 font-semibold">
            [Space] Lật xem đáp án
          </span>
        </div>

        <div className="my-auto py-6">
          {!isFlipped ? (
            <div className="space-y-3">
              <div className="text-xs sm:text-sm text-zinc-500 uppercase tracking-wider font-semibold">
                Mặt trước (Nội dung câu hỏi):
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl text-zinc-100 font-bold leading-relaxed">
                {currentQ.question}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-xs sm:text-sm text-emerald-400 uppercase tracking-wider font-bold">
                ✓ Mặt sau (Đáp án đúng):
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl text-emerald-300 font-extrabold leading-relaxed">
                [{currentQ.answer}] {currentQ.answer_text}
              </div>

              <div className="pt-4 border-t border-zinc-800 text-xs sm:text-sm text-zinc-400 space-y-1.5">
                <div className="text-zinc-500 font-semibold">Các phương án còn lại:</div>
                {currentQ.options_list
                  .filter((o) => o.key !== currentQ.answer)
                  .map((o) => (
                    <div key={o.key} className="text-zinc-400">
                      [{o.key}] {o.text}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs sm:text-sm text-zinc-500 pt-4 border-t border-zinc-800/60 font-medium">
          {isFlipped ? 'Đang xem: MẶT SAU (Đáp án)' : 'Đang xem: MẶT TRƯỚC (Câu hỏi) — Bấm chuột hoặc gõ Space để lật'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
        <button
          onClick={handleMarkNeedReview}
          className="p-4 rounded-xl border border-rose-900 bg-rose-950/30 hover:bg-rose-950/50 text-rose-300 font-bold transition-colors active:scale-98"
        >
          [1] Chưa nhớ (Cần ôn lại)
        </button>

        <button
          onClick={handleMarkMastered}
          className="p-4 rounded-xl border border-emerald-900 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 font-bold transition-colors active:scale-98"
        >
          [2] Đã thuộc lòng
        </button>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="px-4 py-2 rounded-lg border border-zinc-800 bg-[#161619] hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
        >
          [←] Thẻ trước
        </button>

        <span className="text-xs text-zinc-500 hidden sm:inline">
          Phím tắt: [Space] lật • [1] chưa nhớ • [2] đã nhớ • [←/→] chuyển thẻ
        </span>

        <button
          onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={index === questions.length - 1}
          className="px-4 py-2 rounded-lg border border-zinc-800 bg-[#161619] hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
        >
          Thẻ sau [→]
        </button>
      </div>
    </div>
  );
};
