import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { compareAnswers, MatchResult } from '../utils/textMatcher';

interface TypingRunnerProps {
  title: string;
  questions: Question[];
  isTimed: boolean;
  onFinish: (userAnswers: Record<number, string>, timeSpentSeconds: number) => void;
  onExit: () => void;
  onMarkMistake: (chapter: number, questionId: number, reason?: string) => void;
  onRemoveMistake: (chapter: number, questionId: number) => void;
}

export const TypingRunner: React.FC<TypingRunnerProps> = ({
  title,
  questions,
  isTimed,
  onFinish,
  onExit,
  onMarkMistake,
  onRemoveMistake,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, MatchResult>>({});
  const [matchedOptionKey, setMatchedOptionKey] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const initialSeconds = isTimed ? questions.length * 60 : 0;
  const [seconds, setSeconds] = useState(initialSeconds);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsAnswered(false);
    setMatchedOptionKey(null);
    setInputText(userAnswers[questions[currentIndex].id] || '');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [currentIndex, questions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (isTimed) {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimed]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const targetText = currentQ.answer_text;

  const handleCheckAnswer = () => {
    if (isAnswered) {
      handleNext();
      return;
    }

    if (!inputText.trim()) return;

    const evalResult = compareAnswers(inputText, targetText);

    let typedKey: string | null = null;
    let highestSim = 0;
    for (const opt of currentQ.options_list) {
      const optEval = compareAnswers(inputText, opt.text);
      if (optEval.similarity > highestSim && optEval.similarity >= 75) {
        highestSim = optEval.similarity;
        typedKey = opt.key;
      }
    }
    setMatchedOptionKey(typedKey);

    const newAnswers = { ...userAnswers, [currentQ.id]: inputText };
    const newResults = { ...results, [currentQ.id]: evalResult };

    setUserAnswers(newAnswers);
    setResults(newResults);
    setIsAnswered(true);

    if (currentQ.chapter) {
      if (evalResult.isCorrect) {
        onRemoveMistake(currentQ.chapter, currentQ.id);
      } else {
        onMarkMistake(currentQ.chapter, currentQ.id, `Gõ: ${inputText}`);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowConfirmSubmit(true);
    }
  };

  const handleSubmit = () => {
    const timeSpent = isTimed ? questions.length * 60 - seconds : seconds;
    onFinish(userAnswers, timeSpent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheckAnswer();
    }
  };

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
          <span className="text-zinc-100 font-bold text-sm sm:text-base truncate max-w-xs sm:max-w-md">
            {title}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#d97757]/20 text-[#d97757] border border-[#d97757]/30">
            {isTimed ? 'GÕ TÍNH GIỜ' : 'GÕ ÔN TẬP'}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <span className="text-zinc-500">câu: </span>
            <span className="text-zinc-100 font-bold text-sm sm:text-base">{currentIndex + 1}</span>
            <span className="text-zinc-500">/{questions.length}</span>
          </div>

          <span className="text-zinc-700">│</span>

          <div className="font-mono">
            <span className="text-zinc-500">thời gian: </span>
            <span className={isTimed && seconds < 180 ? 'text-rose-400 font-bold text-sm sm:text-base animate-pulse' : 'text-[#d97757] font-bold text-sm sm:text-base'}>
              {formatTime(seconds)}
            </span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-3.5 py-1.5 rounded-lg border border-emerald-700 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs sm:text-sm font-bold transition-colors active:scale-95"
          >
            Hoàn thành
          </button>
        </div>
      </div>

      <div className="border border-zinc-800 bg-[#161619] rounded-xl p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-7 shadow-xl">
        <div className="flex items-center justify-between text-xs sm:text-sm pb-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <span className="text-[#d97757] font-bold text-base sm:text-lg">&gt;</span>
            <span className="text-zinc-400 font-bold tracking-wider">CÂU HỎI {currentIndex + 1}</span>
          </div>
          <span className="text-zinc-500 text-xs hidden sm:inline">
            (Nhìn 4 phương án bên dưới và nhập lại nội dung đáp án đúng)
          </span>
        </div>

        <div className="text-lg sm:text-2xl lg:text-3xl text-zinc-100 font-bold leading-relaxed tracking-tight">
          {currentQ.question}
        </div>

        <div className="space-y-3 pt-1">
          <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">
            Các lựa chọn đáp án:
          </div>
          {currentQ.options_list.map((option) => {
            const isCorrect = option.key === currentQ.answer;
            const isUserTypedThis = matchedOptionKey === option.key;

            let cardCls = "border-zinc-800/80 bg-[#121214] text-zinc-300";

            if (isAnswered) {
              if (isCorrect) {
                cardCls = "border-emerald-500/80 bg-emerald-950/40 text-emerald-200 font-bold ring-1 ring-emerald-500/50";
              } else if (isUserTypedThis && !isCorrect) {
                cardCls = "border-rose-500/80 bg-rose-950/40 text-rose-200 font-bold";
              } else {
                cardCls = "border-zinc-850 bg-[#121214]/50 text-zinc-600 opacity-60";
              }
            }

            return (
              <div
                key={option.key}
                onClick={() => {
                  if (!isAnswered) {
                    setInputText(option.text);
                    inputRef.current?.focus();
                  }
                }}
                className={`p-4 sm:p-4.5 rounded-lg border flex items-start gap-3.5 text-sm sm:text-base lg:text-lg transition-all ${cardCls} ${!isAnswered ? 'hover:border-zinc-700 cursor-pointer' : ''}`}
                title={!isAnswered ? "Bấm vào để nạp nhanh nội dung vào ô gõ bên dưới" : ""}
              >
                <span className="font-mono font-bold text-base sm:text-lg shrink-0 text-zinc-400">
                  [{option.key}]
                </span>
                <span className="leading-relaxed flex-1">
                  {option.text}
                </span>

                {isAnswered && (
                  <span className="text-xs sm:text-sm shrink-0 font-bold uppercase tracking-wider">
                    {isCorrect && <span className="text-emerald-400">✓ đáp án đúng</span>}
                    {isUserTypedThis && !isCorrect && <span className="text-rose-400">✗ bạn đã gõ câu này</span>}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-3 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400">
            <span className="font-bold text-[#d97757] flex items-center gap-1.5">
              <span>wanng&gt;</span>
              <span className="text-zinc-200">Nhập lại nội dung đáp án bạn chọn:</span>
            </span>
            <span className="text-zinc-500 text-xs hidden sm:inline">
              (Gõ xong bấm Enter)
            </span>
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              disabled={isAnswered}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập toàn bộ nội dung của đáp án tại đây..."
              className="flex-1 bg-[#111113] border border-zinc-700 focus:border-[#d97757] focus:ring-1 focus:ring-[#d97757] rounded-lg px-4 py-3 sm:py-3.5 text-base sm:text-lg text-zinc-100 font-mono outline-none transition-all placeholder:text-zinc-600"
            />

            {!isAnswered ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!inputText.trim()}
                className="px-5 sm:px-7 py-3 rounded-lg border border-[#d97757] bg-[#d97757]/20 hover:bg-[#d97757]/30 disabled:opacity-40 disabled:cursor-not-allowed text-[#d97757] hover:text-white font-bold text-sm sm:text-base transition-all active:scale-95 shrink-0"
              >
                Xác nhận [Enter]
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 sm:px-7 py-3 rounded-lg border border-emerald-700 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-bold text-sm sm:text-base transition-colors active:scale-95 shrink-0"
              >
                Câu tiếp [Enter] ▶
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-lg border border-zinc-800 bg-[#161619] hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-200 font-semibold transition-colors"
        >
          [←] Câu trước
        </button>

        <span className="text-zinc-500 text-xs hidden sm:inline">
          Nhìn 4 đáp án trên • Gõ lại nội dung vào ô • Bấm [Enter]
        </span>

        <button
          onClick={handleNext}
          className="px-4 py-2.5 rounded-lg border border-zinc-800 bg-[#161619] hover:bg-zinc-800 text-zinc-200 font-semibold transition-colors"
        >
          {currentIndex === questions.length - 1 ? 'Tổng kết' : 'Câu tiếp [→]'}
        </button>
      </div>

      <div className="border border-zinc-800 bg-[#161619] rounded-xl p-4 sm:p-5">
        <div className="text-zinc-500 text-xs sm:text-sm mb-3 flex items-center justify-between font-semibold">
          <span>BẢNG TIẾN ĐỘ (Đã trả lời {answeredCount}/{questions.length} câu)</span>
          <span className="text-zinc-600 text-xs">Click số để chuyển câu</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const res = results[q.id];
            const isCur = idx === currentIndex;

            let cellStyle = "border-zinc-800 bg-[#121214] text-zinc-500 hover:border-zinc-700";
            if (res) {
              if (res.isCorrect) {
                cellStyle = "border-emerald-700 bg-emerald-950/40 text-emerald-300 font-bold";
              } else {
                cellStyle = "border-rose-700 bg-rose-950/40 text-rose-300 font-bold";
              }
            }
            if (isCur) {
              cellStyle += " ring-2 ring-[#d97757]";
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border text-xs sm:text-sm flex items-center justify-center transition-colors ${cellStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="border border-zinc-700 bg-[#161619] w-full max-w-lg rounded-xl p-6 font-mono text-sm sm:text-base space-y-5 shadow-2xl">
            <div className="text-[#d97757] font-bold text-base sm:text-lg pb-3 border-b border-zinc-800">
              ? KẾT THÚC BÀI GÕ ĐÁP ÁN
            </div>

            <p className="text-zinc-300 leading-relaxed">
              Bạn đã trả lời <span className="text-white font-bold">{answeredCount}/{questions.length}</span> câu hỏi.
              {answeredCount < questions.length && (
                <span className="text-amber-400 block mt-2 font-semibold">
                  ⚠ Vẫn còn {questions.length - answeredCount} câu chưa gõ đáp án!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm"
              >
                [Esc] Gõ tiếp
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmit();
                }}
                className="px-5 py-2 rounded-lg border border-emerald-700 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-bold text-xs sm:text-sm"
              >
                [Enter] Xem kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
