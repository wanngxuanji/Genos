import React, { useState, useEffect } from 'react';
import { ChapterData, QuizHistoryItem, QuizMode } from '../types';

interface HomeViewProps {
  chapters: ChapterData[];
  history: QuizHistoryItem[];
  subjectTitle?: string;
  onStartQuiz: (chapterId: number, mode: QuizMode) => void;
  onClearHistory: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  chapters,
  history,
  subjectTitle = 'Pháp luật đại cương',
  onStartQuiz,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (['1', '2', '3', '4', '5', '6'].includes(key)) {
        const chNum = parseInt(key, 10);
        setSelectedChapter(chNum);
      } else if (key === 'escape') {
        setSelectedChapter(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalQuestions = chapters.reduce((sum, c) => sum + c.total_questions, 0);

  return (
    <div className="py-6 sm:py-8 space-y-8 font-mono">
      <div className="border border-zinc-800 bg-[#161619] rounded-xl p-5 sm:p-7 shadow-lg">
        <div className="flex items-center justify-between text-zinc-500 text-xs sm:text-sm mb-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block" />
            <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block" />
            <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block" />
          </div>
          <span className="font-semibold text-zinc-400">{totalQuestions} câu / {chapters.length} chương</span>
        </div>

        <div className="text-zinc-300 space-y-2">
          <p className="text-zinc-100 font-bold text-base sm:text-xl lg:text-2xl leading-snug">
            <span className="text-[#d97757] font-extrabold mr-2">&gt;</span> Ôn thi {subjectTitle} (Ngân hàng {totalQuestions} câu trắc nghiệm)
          </p>
          <p className="text-zinc-400 text-xs sm:text-sm lg:text-base leading-relaxed">
            Chọn chương học bên dưới hoặc nhấn phím <span className="text-zinc-200 font-bold">[1-6]</span> để mở nhanh từng chương.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-zinc-400 text-xs sm:text-sm uppercase tracking-wider font-bold">
          # Danh sách {chapters.length} chương học
        </div>

        <div className="border border-zinc-800 bg-[#161619] rounded-xl divide-y divide-zinc-800/70 overflow-hidden shadow-lg">
          {chapters.map((ch) => {
            const isExpanded = selectedChapter === ch.chapter;
            return (
              <div 
                key={ch.chapter}
                className={`transition-colors ${isExpanded ? 'bg-zinc-800/40' : 'hover:bg-zinc-800/20'}`}
              >
                <div 
                  onClick={() => setSelectedChapter(isExpanded ? null : ch.chapter)}
                  className="p-4 sm:p-5 lg:p-6 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-[#d97757] font-bold text-base sm:text-lg w-7">
                      [{ch.chapter}]
                    </span>
                    <span className="text-zinc-100 font-bold text-sm sm:text-base lg:text-lg leading-snug">
                      {ch.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-400 shrink-0 font-medium">
                    <span>{ch.total_questions} câu</span>
                    <span className="text-zinc-500 font-mono text-sm">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 py-4 bg-[#131315] border-t border-zinc-800/60 flex flex-wrap items-center gap-3">
                    <span className="text-xs sm:text-sm text-zinc-500 mr-2 font-semibold">Chọn chế độ:</span>
                    
                    <button
                      onClick={() => onStartQuiz(ch.chapter, 'practice')}
                      className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 active:scale-95"
                    >
                      <span className="text-emerald-400 font-bold">&gt;</span>
                      <span>Ôn tập (Hiện đáp án)</span>
                    </button>

                    <button
                      onClick={() => onStartQuiz(ch.chapter, 'exam')}
                      className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 active:scale-95"
                    >
                      <span className="text-[#d97757] font-bold">&gt;</span>
                      <span>Thi thử (Tính giờ)</span>
                    </button>

                    <button
                      onClick={() => onStartQuiz(ch.chapter, 'type_practice')}
                      className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 active:scale-95"
                      title="Tự gõ lại toàn bộ văn bản của đáp án"
                    >
                      <span className="text-cyan-400 font-bold">&gt;</span>
                      <span>Gõ đáp án (Ôn tập)</span>
                    </button>

                    <button
                      onClick={() => onStartQuiz(ch.chapter, 'type_exam')}
                      className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 active:scale-95"
                      title="Tự gõ lại toàn bộ đáp án dưới áp lực thời gian"
                    >
                      <span className="text-pink-400 font-bold">&gt;</span>
                      <span>Gõ đáp án (Tính giờ)</span>
                    </button>

                    <button
                      onClick={() => onStartQuiz(ch.chapter, 'flashcard')}
                      className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 active:scale-95"
                    >
                      <span className="text-amber-400 font-bold">&gt;</span>
                      <span>Flashcard</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-3">
          <div className="text-zinc-400 text-xs sm:text-sm uppercase tracking-wider font-bold">
            # Lịch sử làm bài gần đây
          </div>

          <div className="border border-zinc-800 bg-[#161619] rounded-xl p-4 sm:p-5 text-xs sm:text-sm overflow-x-auto shadow-md">
            <div className="min-w-[600px] space-y-1.5 text-zinc-400">
              <div className="grid grid-cols-12 text-zinc-500 pb-2 border-b border-zinc-800 font-bold text-xs uppercase">
                <span className="col-span-3">THỜI GIAN</span>
                <span className="col-span-5">CHƯƠNG HỌC</span>
                <span className="col-span-2">CHẾ ĐỘ</span>
                <span className="col-span-2 text-right">KẾT QUẢ</span>
              </div>

              {history.slice(0, 5).map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 py-1.5 items-center hover:text-zinc-200">
                  <span className="col-span-3 text-zinc-500 text-xs">
                    {new Date(item.timestamp).toLocaleDateString('vi-VN')} {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="col-span-5 text-zinc-200 font-medium truncate pr-2">
                    {item.chapterTitle}
                  </span>
                  <span className="col-span-2 text-zinc-400 text-xs">
                    {item.mode}
                  </span>
                  <span className={`col-span-2 text-right font-bold text-sm sm:text-base ${
                    item.score >= 8 ? 'text-emerald-400' : item.score >= 5 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {item.score.toFixed(1)}/10 ({item.correctCount}/{item.totalQuestions})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
