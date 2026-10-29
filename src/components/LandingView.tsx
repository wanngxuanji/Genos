import React, { useEffect } from 'react';

interface LandingViewProps {
  onSelectSubject: (subjectSlug: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onSelectSubject }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key.toLowerCase() === 'p') {
        onSelectSubject('pldc');
      } else if (e.key === '2' || e.key.toLowerCase() === 'k') {
        onSelectSubject('ktct');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectSubject]);

  return (
    <div className="py-12 sm:py-20 font-mono space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <div className="text-zinc-500 text-xs sm:text-sm uppercase tracking-wider font-bold">
          # HỆ THỐNG ÔN THI TRẮC NGHIỆM (DNTU)
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
          Chọn Môn Học
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm">
          Chọn môn học bên dưới để vào luyện tập và thi thử.
        </p>
      </div>

      <div className="space-y-4">
        <div
          onClick={() => onSelectSubject('pldc')}
          className="group p-6 sm:p-7 rounded-xl border border-zinc-800 bg-[#161619] hover:bg-[#19191d] hover:border-[#d97757]/80 cursor-pointer transition-all active:scale-[0.99] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[#d97757] font-bold text-base sm:text-xl">[1]</span>
              <h2 className="text-lg sm:text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors">
                Pháp Luật Đại Cương
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                189 câu
              </span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Ngân hàng 6 chương trắc nghiệm • Ôn tập • Thi thử • Gõ đáp án • Flashcard
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#d97757] group-hover:translate-x-1 transition-transform self-end sm:self-center">
            <span>Bắt đầu [1]</span>
            <span>&gt;&gt;</span>
          </div>
        </div>

        <div
          onClick={() => onSelectSubject('ktct')}
          className="group p-6 sm:p-7 rounded-xl border border-zinc-800 bg-[#161619] hover:bg-[#19191d] hover:border-[#d97757]/80 cursor-pointer transition-all active:scale-[0.99] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[#d97757] font-bold text-base sm:text-xl">[2]</span>
              <h2 className="text-lg sm:text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors">
                Kinh Tế Chính Trị
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                304 câu
              </span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Ngân hàng 6 chương trắc nghiệm Mác - Lênin • Ôn tập • Thi thử • Gõ đáp án • Flashcard
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#d97757] group-hover:translate-x-1 transition-transform self-end sm:self-center">
            <span>Bắt đầu [2]</span>
            <span>&gt;&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
