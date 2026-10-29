import React, { useState, useEffect } from 'react';
import { Question, QuizMode } from '../types';

interface QuizRunnerProps {
  title: string;
  questions: Question[];
  mode: QuizMode;
  onFinish: (userAnswers: Record<number, string>, timeSpentSeconds: number) => void;
  onExit: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  title,
  questions,
  mode,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const isExam = mode === 'exam';
  const initialSeconds = isExam ? questions.length * 60 : 0;
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (isExam) {
          if (prev <= 1) {
            clearInterval(timer);
            onFinish(userAnswers, questions.length * 60);
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExam, userAnswers, questions.length, onFinish]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const selectedAnswer = userAnswers[currentQ.id];
  const isAnswered = selectedAnswer !== undefined;

  const handleSelectOption = (key: string) => {
    if (mode === 'practice' && isAnswered) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: key,
    }));
  };

  const toggleFlag = (id: number) => {
    setFlagged((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    const timeSpent = isExam ? questions.length * 60 - seconds : seconds;
    onFinish(userAnswers, timeSpent);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showConfirmSubmit) {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') setShowConfirmSubmit(false);
        return;
      }

      const key = e.key.toLowerCase();
      if (['1', '2', '3', '4'].includes(key)) {
        const mapping: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        handleSelectOption(mapping[key]);
      } else if (['a', 'b', 'c', 'd'].includes(key)) {
        handleSelectOption(key.toUpperCase());
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      } else if (key === 'f') {
        toggleFlag(currentQ.id);
      } else if (e.key === 'Enter') {
        setShowConfirmSubmit(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length, mode, isAnswered, currentQ, showConfirmSubmit]);

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="py-6 sm:py-8 font-mono space-y-6">
      <div className="border border-zinc-800 bg-[#161619] rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between text-xs sm:text-sm text-zinc-400 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-zinc-500 hover:text-zinc-200 transition-colors font-semibold"
          >
            [Esc] Thoát
          </button>
          <span className="text-zinc-700">│</span>
          <span className="text-zinc-200 font-bold text-sm sm:text-base truncate max-w-xs sm:max-w-md lg:max-w-xl">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <span className="text-zinc-500">tiến độ: </span>
            <span className="text-zinc-100 font-bold text-sm sm:text-base">{currentIndex + 1}</span>
            <span className="text-zinc-500">/{questions.length}</span>
          </div>

          <span className="text-zinc-700">│</span>

          <div className="font-mono">
            <span className="text-zinc-500">thời gian: </span>
            <span className={isExam && seconds < 180 ? 'text-rose-400 font-bold text-sm sm:text-base animate-pulse' : 'text-[#d97757] font-bold text-sm sm:text-base'}>
              {formatTime(seconds)}
            </span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-3.5 py-1.5 rounded-lg border border-emerald-700 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs sm:text-sm font-bold transition-colors active:scale-95"
          >
            Nộp bài
          </button>
        </div>
      </div>

      <div className="border border-zinc-800 bg-[#161619] rounded-xl p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 shadow-xl">
        <div className="flex items-center justify-between text-xs sm:text-sm pb-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <span className="text-[#d97757] font-bold text-base sm:text-lg">&gt;</span>
            <span className="text-zinc-400 font-bold tracking-wider">CÂU HỎI {currentIndex + 1}</span>
            {flagged[currentQ.id] && (
              <span className="text-amber-400 font-semibold ml-2">[* Đã đánh dấu cờ]</span>
            )}
          </div>

          <button
            onClick={() => toggleFlag(currentQ.id)}
            className="text-zinc-500 hover:text-amber-400 transition-colors text-xs sm:text-sm"
          >
            [F] {flagged[currentQ.id] ? 'Bỏ cờ' : 'Đánh dấu cờ'}
          </button>
        </div>

        <div className="text-lg sm:text-2xl lg:text-3xl text-zinc-100 font-bold leading-relaxed tracking-tight">
          {currentQ.question}
        </div>

        <div className="space-y-3 pt-2">
          {currentQ.options_list.map((option) => {
            const isSelected = selectedAnswer === option.key;
            const isCorrect = option.key === currentQ.answer;

            let itemStyle = "border-zinc-800/90 bg-[#121214] hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-200";

            if (mode === 'practice' && isAnswered) {
              if (isCorrect) {
                itemStyle = "border-emerald-500/80 bg-emerald-950/40 text-emerald-200 font-bold";
              } else if (isSelected) {
                itemStyle = "border-rose-500/80 bg-rose-950/40 text-rose-200 font-bold";
              } else {
                itemStyle = "border-zinc-850 bg-[#121214]/50 text-zinc-600 opacity-60";
              }
            } else if (isSelected) {
              itemStyle = "border-[#d97757] bg-[#d97757]/15 text-white font-bold ring-1 ring-[#d97757]";
            }

            return (
              <div
                key={option.key}
                onClick={() => handleSelectOption(option.key)}
                className={`p-4 sm:p-5 rounded-lg border flex items-start gap-4 cursor-pointer text-sm sm:text-base lg:text-lg transition-all ${itemStyle}`}
              >
                <span className="font-mono font-bold text-base sm:text-lg shrink-0 text-zinc-400">
                  [{option.key}]
                </span>
                <span className="leading-relaxed flex-1">
                  {option.text}
                </span>

                {mode === 'practice' && isAnswered && (
                  <span className="text-xs sm:text-sm shrink-0 font-bold uppercase tracking-wider">
                    {isCorrect && <span className="text-emerald-400">✓ đúng</span>}
                    {isSelected && !isCorrect && <span className="text-rose-400">✗ sai</span>}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {mode === 'practice' && isAnswered && (
          <div className="p-4 sm:p-5 rounded-lg border border-zinc-800 bg-[#111113] text-sm sm:text-base space-y-1.5 text-zinc-300">
            <div className="text-emerald-400 font-bold flex items-center gap-2">
              <span>↳</span>
              <span>Đáp án chuẩn: [{currentQ.answer}] {currentQ.answer_text}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-lg border border-zinc-800 bg-[#161619] hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-200 font-semibold transition-colors"
          >
            [←] Câu trước
          </button>

          <span className="text-zinc-500 text-xs hidden sm:inline">
            Phím tắt: [1-4 / A-D] chọn • [F] cờ • [← / →] đổi câu • [Enter] nộp bài
          </span>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-5 py-2.5 rounded-lg border border-emerald-700 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-bold text-sm transition-colors active:scale-95"
            >
              [Enter] Nộp bài
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="px-4 py-2.5 rounded-lg border border-zinc-800 bg-[#161619] hover:bg-zinc-800 text-zinc-200 font-semibold transition-colors"
            >
              Câu tiếp [→]
            </button>
          )}
        </div>

        <div className="border border-zinc-800 bg-[#161619] rounded-xl p-4 sm:p-5">
          <div className="text-zinc-500 text-xs sm:text-sm mb-3 flex items-center justify-between font-semibold">
            <span>BẢNG CÂU HỎI (Đã làm {answeredCount}/{questions.length} câu)</span>
            <span className="text-zinc-600 text-xs">Click số để chuyển nhanh</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isDone = userAnswers[q.id] !== undefined;
              const isCur = idx === currentIndex;
              const isFl = flagged[q.id];

              let cellStyle = "border-zinc-800 bg-[#121214] text-zinc-500 hover:border-zinc-700";
              if (isDone) {
                cellStyle = "border-zinc-700 bg-zinc-800 text-zinc-200 font-bold";
              }
              if (isCur) {
                cellStyle += " ring-2 ring-[#d97757] text-[#d97757]";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border text-xs sm:text-sm flex items-center justify-center relative transition-colors ${cellStyle}`}
                >
                  <span>{idx + 1}</span>
                  {isFl && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="border border-zinc-700 bg-[#161619] w-full max-w-lg rounded-xl p-6 font-mono text-sm sm:text-base space-y-5 shadow-2xl">
            <div className="text-[#d97757] font-bold text-base sm:text-lg pb-3 border-b border-zinc-800">
              ? XÁC NHẬN NỘP BÀI
            </div>

            <p className="text-zinc-300 leading-relaxed">
              Bạn đã trả lời <span className="text-white font-bold">{answeredCount}/{questions.length}</span> câu hỏi.
              {answeredCount < questions.length && (
                <span className="text-amber-400 block mt-2 font-semibold">
                  ⚠ Vẫn còn {questions.length - answeredCount} câu chưa chọn đáp án!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm"
              >
                [Esc] Quay lại
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmit();
                }}
                className="px-5 py-2 rounded-lg border border-emerald-700 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-bold text-xs sm:text-sm"
              >
                [Enter] Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
