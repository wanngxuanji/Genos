import React, { useState, useEffect } from 'react';
import { 
  getAllChapters, 
  getChapter, 
  getAllQuestions 
} from './data/pldc/chapters';
import { 
  getAllKTCTChapters, 
  getKTCTChapter, 
  getAllKTCTQuestions 
} from './data/ktct/chapters';
import { Question, QuizMode, QuizHistoryItem, StoredMistake } from './types';
import { 
  getQuizHistory, 
  saveQuizHistory, 
  getMistakes, 
  recordMistake, 
  removeMistake, 
  clearQuizHistory,
  clearAllMistakes,
  getStreak,
  StreakInfo 
} from './utils/storage';
import { compareAnswers } from './utils/textMatcher';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { HomeView } from './components/HomeView';
import { QuizRunner } from './components/QuizRunner';
import { QuizResult } from './components/QuizResult';
import { FlashcardRunner } from './components/FlashcardRunner';
import { TypingRunner } from './components/TypingRunner';
import { MistakesView } from './components/MistakesView';

export function App() {
  const getInitialRoute = (): '/' | '/pldc' | '/ktct' => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('ktct') || hash.includes('ktct')) {
      return '/ktct';
    }
    if (path.includes('pldc') || hash.includes('pldc')) {
      return '/pldc';
    }
    return '/';
  };

  const [currentRoute, setCurrentRoute] = useState<'/' | '/pldc' | '/ktct'>(getInitialRoute);

  useEffect(() => {
    const handleRouteSync = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
    };
  }, []);

  const navigateToRoute = (route: '/' | '/pldc' | '/ktct') => {
    setCurrentRoute(route);
    window.location.hash = route === '/' ? '' : route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isKTCT = currentRoute === '/ktct';
  const subjectSlug = isKTCT ? 'ktct' : 'pldc';
  const subjectTitle = isKTCT ? 'Kinh Tế Chính Trị' : 'Pháp Luật Đại Cương';

  const chapters = isKTCT ? getAllKTCTChapters() : getAllChapters();
  const getChapterFn = isKTCT ? getKTCTChapter : getChapter;
  const getAllQuestionsFn = isKTCT ? getAllKTCTQuestions : getAllQuestions;

  const [currentView, setCurrentView] = useState<'home' | 'quiz' | 'result' | 'flashcard' | 'mistakes' | 'typing'>('home');
  const [activeTitle, setActiveTitle] = useState('');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeMode, setActiveMode] = useState<QuizMode>('practice');
  const [activeChapterId, setActiveChapterId] = useState<number | 'mistakes'>(1);

  const [zoomLevel, setZoomLevel] = useState<'normal' | 'large' | 'xlarge'>(() => {
    try {
      return (localStorage.getItem('wanng_zoom_v1') as any) || 'normal';
    } catch {
      return 'normal';
    }
  });

  useEffect(() => {
    const updateRootFont = () => {
      if (window.innerWidth < 640) {
        document.documentElement.style.fontSize = '100%';
      } else {
        const scale = zoomLevel === 'normal' ? '100%' : zoomLevel === 'large' ? '125%' : '150%';
        document.documentElement.style.fontSize = scale;
      }
    };
    updateRootFont();
    window.addEventListener('resize', updateRootFont);
    return () => window.removeEventListener('resize', updateRootFont);
  }, [zoomLevel]);

  const cycleZoom = () => {
    const nextZoom = zoomLevel === 'normal' ? 'large' : zoomLevel === 'large' ? 'xlarge' : 'normal';
    setZoomLevel(nextZoom);
    try {
      localStorage.setItem('wanng_zoom_v1', nextZoom);
    } catch {}
  };

  const [lastUserAnswers, setLastUserAnswers] = useState<Record<number, string>>({});
  const [lastTimeSpent, setLastTimeSpent] = useState(0);

  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [streak, setStreak] = useState<StreakInfo>({ count: 0, lastDate: '' });
  const [mistakesList, setMistakesList] = useState<StoredMistake[]>([]);

  useEffect(() => {
    setHistory(getQuizHistory(subjectSlug));
    setStreak(getStreak());
    setMistakesList(getMistakes(subjectSlug));
  }, [subjectSlug]);

  const refreshStorage = () => {
    setHistory(getQuizHistory(subjectSlug));
    setStreak(getStreak());
    setMistakesList(getMistakes(subjectSlug));
  };

  const handleStartQuiz = (chapterId: number, mode: QuizMode) => {
    const ch = getChapterFn(chapterId);
    if (!ch) return;

    const qList = [...ch.questions];
    const titleStr = `${ch.title} (${qList.length} câu)`;

    setActiveQuestions(qList);
    setActiveTitle(titleStr);
    setActiveMode(mode);
    setActiveChapterId(chapterId);

    if (mode === 'flashcard') {
      setCurrentView('flashcard');
    } else if (mode === 'type_practice' || mode === 'type_exam') {
      setCurrentView('typing');
    } else {
      setCurrentView('quiz');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishQuiz = (answers: Record<number, string>, timeSpentSeconds: number) => {
    setLastUserAnswers(answers);
    setLastTimeSpent(timeSpentSeconds);

    let correct = 0;
    const isTyping = activeMode === 'type_practice' || activeMode === 'type_exam';

    activeQuestions.forEach((q) => {
      const userChoice = answers[q.id];
      const chNum = q.chapter || 1;

      let isCorrect = false;
      if (isTyping) {
        const evalRes = compareAnswers(userChoice || '', q.answer_text);
        isCorrect = evalRes.isCorrect;
      } else {
        isCorrect = userChoice === q.answer;
      }

      if (isCorrect) {
        correct++;
        removeMistake(chNum, q.id, subjectSlug);
      } else {
        recordMistake(chNum, q.id, userChoice || 'Bỏ qua', subjectSlug);
      }
    });

    const total = activeQuestions.length;
    const score = total > 0 ? Number(((correct / total) * 10).toFixed(1)) : 0;

    saveQuizHistory({
      timestamp: Date.now(),
      chapterTitle: activeTitle,
      chapterId: activeChapterId,
      mode: activeMode,
      totalQuestions: total,
      correctCount: correct,
      score,
      timeSpentSeconds,
    }, subjectSlug);

    refreshStorage();
    setCurrentView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePracticeMistakesOnly = (mistakeQuestions: Question[]) => {
    setActiveQuestions(mistakeQuestions);
    setActiveTitle(`Ôn lại ${mistakeQuestions.length} câu vừa làm sai`);
    setActiveMode('practice');
    setCurrentView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePracticeAllMistakes = (mode: 'practice' | 'flashcard') => {
    const allQ = getAllQuestionsFn();
    const mistakeSet = new Set(mistakesList.map((m) => `${m.chapter}-${m.questionId}`));
    const questions = allQ.filter((q) => mistakeSet.has(`${q.chapter}-${q.id}`));

    if (questions.length === 0) return;

    setActiveQuestions(questions);
    setActiveTitle(`Luyện tập ${questions.length} câu cần ôn lại`);
    setActiveMode(mode);
    setActiveChapterId('mistakes');

    if (mode === 'flashcard') {
      setCurrentView('flashcard');
    } else {
      setCurrentView('quiz');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveMistake = (chapter: number, questionId: number) => {
    removeMistake(chapter, questionId, subjectSlug);
    refreshStorage();
  };

  const handleClearAllMistakes = () => {
    if (window.confirm(`Xóa toàn bộ danh sách câu cần ôn lại của môn ${subjectTitle}?`)) {
      clearAllMistakes(subjectSlug);
      refreshStorage();
    }
  };

  const allQ = getAllQuestionsFn();
  const mistakeSet = new Set(mistakesList.map((m) => `${m.chapter}-${m.questionId}`));
  const currentMistakeQuestions = allQ.filter((q) => mistakeSet.has(`${q.chapter}-${q.id}`));

  return (
    <div className="min-h-screen bg-[#111113] text-[#e4e4e7] flex flex-col font-mono selection:bg-[#d97757]/30 selection:text-white">
      <Header
        streak={streak}
        mistakesCount={mistakesList.length}
        currentView={currentView}
        currentRoute={currentRoute}
        subjectTitle={subjectTitle}
        zoomLevel={zoomLevel}
        onCycleZoom={cycleZoom}
        onNavigateSubjects={() => {
          navigateToRoute('/');
          setCurrentView('home');
        }}
        onNavigateHome={() => {
          navigateToRoute(currentRoute === '/ktct' ? '/ktct' : '/pldc');
          setCurrentView('home');
        }}
        onNavigateMistakes={() => {
          navigateToRoute(currentRoute === '/ktct' ? '/ktct' : '/pldc');
          setCurrentView('mistakes');
        }}
      />

      <main className="flex-1 max-w-5xl lg:max-w-6xl w-full mx-auto px-4 sm:px-6">
        {currentRoute === '/' ? (
          <LandingView
            onSelectSubject={(slug) => {
              navigateToRoute('/' + slug as any);
              setCurrentView('home');
            }}
          />
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                chapters={chapters}
                history={history}
                subjectTitle={subjectTitle}
                onStartQuiz={handleStartQuiz}
                onClearHistory={() => {
                  clearQuizHistory(subjectSlug);
                  refreshStorage();
                }}
              />
            )}

            {currentView === 'quiz' && (
              <QuizRunner
                title={activeTitle}
                questions={activeQuestions}
                mode={activeMode}
                onFinish={handleFinishQuiz}
                onExit={() => setCurrentView('home')}
              />
            )}

            {currentView === 'typing' && (
              <TypingRunner
                title={activeTitle}
                questions={activeQuestions}
                isTimed={activeMode === 'type_exam'}
                onFinish={handleFinishQuiz}
                onExit={() => setCurrentView('home')}
                onMarkMistake={(ch, qId, reason) => {
                  recordMistake(ch, qId, reason || 'Gõ sai', subjectSlug);
                  refreshStorage();
                }}
                onRemoveMistake={(ch, qId) => {
                  removeMistake(ch, qId, subjectSlug);
                  refreshStorage();
                }}
              />
            )}

            {currentView === 'result' && (
              <QuizResult
                title={activeTitle}
                questions={activeQuestions}
                userAnswers={lastUserAnswers}
                timeSpentSeconds={lastTimeSpent}
                onRetake={() => handleStartQuiz(activeChapterId as number, activeMode)}
                onPracticeMistakesOnly={handlePracticeMistakesOnly}
                onGoHome={() => setCurrentView('home')}
              />
            )}

            {currentView === 'flashcard' && (
              <FlashcardRunner
                title={activeTitle}
                questions={activeQuestions}
                onExit={() => setCurrentView('home')}
                onMarkMistake={(ch, qId) => {
                  recordMistake(ch, qId, 'Flashcard', subjectSlug);
                  refreshStorage();
                }}
                onRemoveMistake={(ch, qId) => {
                  removeMistake(ch, qId, subjectSlug);
                  refreshStorage();
                }}
              />
            )}

            {currentView === 'mistakes' && (
              <MistakesView
                questions={currentMistakeQuestions}
                onPracticeMistakes={handlePracticeAllMistakes}
                onRemoveMistake={handleRemoveMistake}
                onClearAll={handleClearAllMistakes}
                onGoHome={() => setCurrentView('home')}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-zinc-800/60 py-6 text-center text-xs text-zinc-500 bg-[#0d0e10] mt-12 font-mono">
        <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6">
          <p className="leading-relaxed text-zinc-500">
            * Miễn trừ trách nhiệm: Không chịu trách nhiệm về nội dung trên web. Đây là tài liệu ôn tập riêng tại DNTU, các trường hợp khác không chịu trách nhiệm.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
