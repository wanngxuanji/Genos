import React from 'react';
import { StreakInfo } from '../utils/storage';

interface HeaderProps {
  streak: StreakInfo;
  mistakesCount: number;
  currentView: string;
  currentRoute: '/' | '/pldc' | '/ktct';
  subjectTitle?: string;
  zoomLevel: 'normal' | 'large' | 'xlarge';
  onCycleZoom: () => void;
  onNavigateSubjects: () => void;
  onNavigateHome: () => void;
  onNavigateMistakes: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  mistakesCount,
  currentView,
  currentRoute,
  subjectTitle = 'Môn học',
  zoomLevel,
  onCycleZoom,
  onNavigateSubjects,
  onNavigateHome,
  onNavigateMistakes,
}) => {
  const zoomLabel = zoomLevel === 'normal' ? '100%' : zoomLevel === 'large' ? '125%' : '150%';
  const isSubjectPage = currentRoute === '/pldc' || currentRoute === '/ktct';

  return (
    <header className="border-b border-zinc-800/80 bg-[#141416]/95 sticky top-0 z-40 text-xs sm:text-sm font-mono">
      <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5 select-none text-zinc-300">
          <span className="text-[#d97757] font-bold text-sm">●</span>
          
          <a
            href="https://github.com/wanngxuanji"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold tracking-wide text-sm sm:text-base text-zinc-200 hover:text-[#d97757] transition-colors underline-offset-4 hover:underline"
            title="Mở GitHub Wanng"
          >
            Wanng
          </a>

          <span className="text-zinc-600">/</span>

          {!isSubjectPage ? (
            <span className="text-zinc-300 text-xs sm:text-sm font-semibold">
              Chọn Môn Học
            </span>
          ) : (
            <>
              <button
                onClick={onNavigateSubjects}
                className="text-zinc-400 hover:text-white transition-colors text-xs sm:text-sm font-medium hover:underline underline-offset-4"
                title="Quay lại danh sách chọn môn học"
              >
                Môn học
              </button>

              <span className="text-zinc-600">/</span>

              <button
                onClick={onNavigateHome}
                className="text-zinc-200 hover:text-white transition-colors text-xs sm:text-sm font-bold text-left truncate max-w-[150px] sm:max-w-none"
                title={`Về trang chủ môn ${subjectTitle}`}
              >
                {subjectTitle}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-5 text-zinc-400">
          <button
            onClick={onCycleZoom}
            className="px-2 py-1 rounded border border-zinc-800 bg-[#161619] hover:bg-zinc-800 text-[11px] sm:text-xs text-zinc-300 transition-colors"
            title="Nhấp để phóng to / thu nhỏ cỡ chữ màn hình"
          >
            cỡ chữ: <span className="text-[#d97757] font-bold">{zoomLabel}</span>
          </button>

          {isSubjectPage && (
            <>
              <span className="text-zinc-700 hidden sm:inline">│</span>

              <div 
                title={`Chuỗi học liên tục: ${streak.count} ngày`}
                className="flex items-center gap-1.5"
              >
                <span className="text-[#d97757]">streak:</span>
                <span className="text-zinc-200 font-bold">{streak.count}d</span>
              </div>

              <span className="text-zinc-700">│</span>

              <button
                onClick={onNavigateMistakes}
                className={`flex items-center gap-1.5 transition-colors ${
                  currentView === 'mistakes'
                    ? 'text-[#d97757] font-bold'
                    : 'hover:text-zinc-200'
                }`}
              >
                <span>câu-sai:</span>
                <span className={mistakesCount > 0 ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                  {mistakesCount}
                </span>
              </button>

              {currentView !== 'home' && (
                <>
                  <span className="text-zinc-700">│</span>
                  <button
                    onClick={onNavigateHome}
                    className="hover:text-white transition-colors text-zinc-400 flex items-center gap-1 font-semibold"
                    title="Về trang chủ môn [H]"
                  >
                    <span>[H]ome</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
