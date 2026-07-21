import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ReadingPlanView from './components/ReadingPlanView';
import PassageViewer from './components/PassageViewer';
import SavedVersesView from './components/SavedVersesView';
import VerseMemoryView from './components/VerseMemoryView';
import CommentaryModal from './components/CommentaryModal';
import OnboardingModal from './components/OnboardingModal';
import DeveloperDebugModal, { debugLogger } from './components/DeveloperDebugModal';
import NotificationPermissionModal from './components/NotificationPermissionModal';

import { BIBLE_PLAN as initialPlanData } from './data/biblePlanData';
import { INITIAL_MEMORY_VERSES as initialMemoryVerses } from './data/initialMemoryVerses';
import { getTodayBeijingDate, isDatePast, isDateToday, formatDateDisplay } from './utils/dateUtils';
import { canonicalizeReference } from './utils/textNormalizer';
import { esvDb } from './services/esvDatabase';
import { Sparkles, CheckCircle2, ArrowUp, Bug } from 'lucide-react';

export default function App() {
  // Active Navigation Tab: 'plan' | 'reader' | 'saved' | 'memory'
  const [activeTab, setActiveTab] = useState('plan');

  useEffect(() => {
    debugLogger.addLog('info', `Switched active view tab to: "${activeTab}"`);
  }, [activeTab]);

  // Reading Plan State with safe parsing & per-passage completed tracking
  const [planData, setPlanData] = useState(() => {
    try {
      const local = localStorage.getItem('esv_bible_plan');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved plan data:', e);
    }
    return initialPlanData;
  });

  // Saved Verses & Highlights Treasury State with safe parsing, auto-canonicalizing, & full chapter text population
  const [savedVerses, setSavedVerses] = useState(() => {
    try {
      const local = localStorage.getItem('esv_saved_verses');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(v => {
            const rawRef = v.reference ? v.reference.replace(/\s*\(Whole Chapter\)/gi, '').trim() : '';
            const cleanRef = canonicalizeReference(rawRef);
            let cleanText = v.text;

            if (!cleanText || cleanText.includes("Chapter Memorization Target") || cleanText.includes("Auto-Populate")) {
              const dbLookup = esvDb.lookupPassage(cleanRef);
              if (dbLookup && dbLookup.text) {
                cleanText = dbLookup.text;
              }
            }

            return {
              ...v,
              reference: cleanRef,
              text: cleanText
            };
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved verses data:', e);
    }
    return initialMemoryVerses.map(v => ({
      ...v,
      reference: canonicalizeReference(v.reference)
    }));
  });

  // Helper to find next unread passage in reading plan
  const getNextUnreadPassage = (planList) => {
    if (!planList || !Array.isArray(planList)) return 'Genesis 1-2';
    for (const day of planList) {
      if (!day.completed) {
        const passagesList = day.passages && day.passages.length > 0
          ? day.passages
          : (day.text ? day.text.split(/;\s*/) : []);
        
        const completedMap = day.completedPassages || {};
        const unread = passagesList.find(p => !completedMap[p]);
        if (unread) return unread;
        if (passagesList.length > 0) return passagesList[0];
      }
    }
    return 'Genesis 1-2';
  };

  // Currently Active Passage in ESV Reader (Defaults to saved passage or next unread passage in reading plan)
  const [currentPassage, setCurrentPassage] = useState(() => {
    try {
      const savedPassage = localStorage.getItem('esv_current_passage');
      if (savedPassage && savedPassage.trim().length > 0) {
        return savedPassage;
      }
    } catch (e) {}
    return getNextUnreadPassage(planData);
  });

  useEffect(() => {
    if (currentPassage) {
      try {
        localStorage.setItem('esv_current_passage', currentPassage);
      } catch (e) {}
    }
  }, [currentPassage]);

  // Currently Selected Memory Verse for Typewriter Practice
  const [selectedMemoryVerse, setSelectedMemoryVerse] = useState(null);

  // Commentary Modal State
  const [commentaryPassage, setCommentaryPassage] = useState(null);

  // Settings State
  const [esvApiKey, setEsvApiKey] = useState(() => {
    try {
      return localStorage.getItem('esv_api_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // First-Time Interactive Onboarding Walkthrough State
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem('esv_onboarding_dismissed');
    } catch (e) {
      return false;
    }
  });

  // Developer Debug Backdoor Console State
  const [showDebugModal, setShowDebugModal] = useState(false);

  const [appVersion, setAppVersion] = useState('1.0.8');
  const [timezone, setTimezone] = useState(() => {
    try {
      return localStorage.getItem('esv_tracker_timezone') || 'local';
    } catch (e) {
      return 'local';
    }
  });

  const [updatePrompt, setUpdatePrompt] = useState({ show: false, version: '' });

  useEffect(() => {
    if (window.electronAPI?.onUpdateMessage) {
      const cleanup = window.electronAPI.onUpdateMessage((data) => {
        if (data.status === 'downloaded') {
          setUpdatePrompt({ show: true, version: data.info?.version || '' });
        }
      });
      return cleanup;
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI?.getAppInfo) {
      window.electronAPI.getAppInfo().then(info => {
        if (info && info.version) setAppVersion(info.version);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setShowDebugModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('esv_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('esv_theme', next);
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Notification Permission State & Weekly Reminder Loop
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationPermissionType, setNotificationPermissionType] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Notification) {
      const permission = window.Notification.permission;
      const lastPromptTime = localStorage.getItem('lastNotificationPromptTime');
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      // Case 1: First time launch (permission is default)
      if (permission === 'default') {
        if (!lastPromptTime || (now - Number(lastPromptTime) > oneWeek)) {
          setNotificationPermissionType('default');
          const timer = setTimeout(() => {
            setShowNotificationModal(true);
          }, 4000);
          return () => clearTimeout(timer);
        }
      }
      // Case 2: System notifications are disabled in settings
      else if (permission === 'denied') {
        if (!lastPromptTime || (now - Number(lastPromptTime) > oneWeek)) {
          setNotificationPermissionType('denied');
          const timer = setTimeout(() => {
            setShowNotificationModal(true);
          }, 5000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, []);

  // Per-Passage Scroll Position Persistence for ESV Reader
  const [readerScrollMap, setReaderScrollMap] = useState({});

  const handleUpdateScrollPos = (passageRef, scrollTop) => {
    if (passageRef) {
      setReaderScrollMap(prev => ({
        ...prev,
        [passageRef]: scrollTop
      }));
    }
  };

  // Beijing Today Date
  const todayDateStr = getTodayBeijingDate();

  // Save Plan Data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('esv_bible_plan', JSON.stringify(planData));
    } catch (e) {
      console.warn('Failed to save plan data:', e);
    }
  }, [planData]);

  // Save Verses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('esv_saved_verses', JSON.stringify(savedVerses));
    } catch (e) {
      console.warn('Failed to save verses:', e);
    }
  }, [savedVerses]);

  // Calculate Plan Overall Stats
  const totalDays = planData.length;
  const completedDays = planData.filter(d => d.completed).length;
  const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Calculate missed days for Catch-Up Assistant
  const missedDaysCount = planData.filter(d => isDatePast(d.date, d.year) && !d.completed).length;

  // Per-Passage Toggle Handler
  const handleTogglePassage = (dayId, passageRef) => {
    debugLogger.addLog('info', `Toggling passage: ${passageRef} (Day ID: ${dayId})`);
    setPlanData(prev => prev.map(item => {
      if (item.day === dayId || item.id === dayId) {
        const passagesList = item.passages && item.passages.length > 0
          ? item.passages
          : (item.text ? item.text.split(/;\s*/) : []);

        const currentMap = { ...(item.completedPassages || {}) };
        currentMap[passageRef] = !currentMap[passageRef];

        // Check if all passages in day are completed
        const allDone = passagesList.length > 0 && passagesList.every(p => currentMap[p]);

        return {
          ...item,
          completedPassages: currentMap,
          completed: allDone
        };
      }
      return item;
    }));
  };

  // Whole Day Toggle Handler
  const handleToggleDay = (dayId) => {
    debugLogger.addLog('info', `Toggling completion for whole day: ${dayId}`);
    setPlanData(prev => prev.map(item => {
      if (item.day === dayId || item.id === dayId) {
        const newCompleted = !item.completed;
        const passagesList = item.passages && item.passages.length > 0
          ? item.passages
          : (item.text ? item.text.split(/;\s*/) : []);

        const newPassageMap = {};
        passagesList.forEach(p => {
          newPassageMap[p] = newCompleted;
        });

        return {
          ...item,
          completed: newCompleted,
          completedPassages: newPassageMap
        };
      }
      return item;
    }));
  };

  // Open Passage in ESV Reader
  const handleOpenPassage = (passageRef) => {
    debugLogger.addLog('info', `Opening passage in Reader: ${passageRef}`);
    setCurrentPassage(passageRef);
    setActiveTab('reader');
  };

  // Save Verse / Highlight
  const handleSaveVerse = (newVerse) => {
    debugLogger.addLog('info', `Saving verse to Treasury: ${newVerse.reference}`);
    setSavedVerses(prev => {
      const exists = prev.some(v => v.reference === newVerse.reference && v.text === newVerse.text);
      if (exists) return prev;
      return [newVerse, ...prev];
    });

    if (newVerse.isMemoryVerse) {
      setSelectedMemoryVerse(newVerse);
    }
  };

  // Delete Saved Verse
  const handleDeleteVerse = (id) => {
    const targetVerse = savedVerses.find(v => v.id === id);
    debugLogger.addLog('info', `Deleting verse from Treasury: ${targetVerse ? targetVerse.reference : id}`);
    setSavedVerses(prev => prev.filter(v => v.id !== id));
  };

  // Update Existing Saved Verse in Treasury
  const handleUpdateVerse = (updatedVerse) => {
    debugLogger.addLog('info', `Updating Treasury verse: ${updatedVerse.reference}`);
    setSavedVerses(prev => prev.map(v => v.id === updatedVerse.id ? { ...v, ...updatedVerse } : v));
  };

  // Switch to Memory View with specific verse
  const handlePracticeVerse = (verse) => {
    debugLogger.addLog('info', `Initiating memory practice: ${verse.reference}`);
    setSelectedMemoryVerse(verse);
    setActiveTab('memory');
  };

  // Update Memory Mastery Progress & Review Count (support partial completion in verse-by-verse mode)
  const handleUpdateMemoryProgress = (verseId, stageCompleted, partialFraction = 1) => {
    setSavedVerses(prev => prev.map(v => {
      if (v.id === verseId) {
        const prevLevel = v.masteryLevel || 0;
        const isFullStage = partialFraction >= 1;

        let newLevel = prevLevel;
        if (stageCompleted === 4 && isFullStage) {
          newLevel = 100;
        } else {
          // Base mastery from previously fully completed stages
          const baseMastery = (stageCompleted - 1) * 25;
          // Partial mastery earned in current stage
          const currentStageBonus = Math.round(25 * Math.min(1, Math.max(0, partialFraction)));
          const targetLevel = baseMastery + currentStageBonus;
          newLevel = Math.min(100, Math.max(prevLevel, targetLevel));
        }

        const newReviewCount = (v.reviewCount || 0) + (isFullStage ? 1 : 0);
        debugLogger.addLog('info', `Updating memory progress for ${v.reference}: Stage ${stageCompleted}, Mastery ${newLevel}%, Review count ${newReviewCount}`);
        return {
          ...v,
          masteryLevel: newLevel,
          stageProgress: isFullStage ? Math.max(v.stageProgress || 1, stageCompleted) : (v.stageProgress || 1),
          reviewCount: newReviewCount,
          lastReviewed: new Date().toISOString().split('T')[0]
        };
      }
      return v;
    }));
  };

  // Catch-Up Assistant: Jump to oldest missed day
  const handleCatchUpOldest = () => {
    const oldestMissed = planData.find(d => isDatePast(d.date, d.year) && !d.completed);
    if (oldestMissed) {
      const targetPassage = oldestMissed.passages ? oldestMissed.passages[0] : oldestMissed.text.split(';')[0];
      handleOpenPassage(targetPassage);
    }
  };

  // Catch-Up Assistant: Jump to today's date in Beijing timezone
  const handleCatchUpToday = () => {
    const todayItem = planData.find(d => isDateToday(d.date, d.year));
    if (todayItem) {
      const targetPassage = todayItem.passages ? todayItem.passages[0] : todayItem.text.split(';')[0];
      handleOpenPassage(targetPassage);
    } else {
      const firstUncompleted = planData.find(d => !d.completed);
      if (firstUncompleted) {
        const targetPassage = firstUncompleted.passages ? firstUncompleted.passages[0] : firstUncompleted.text.split(';')[0];
        handleOpenPassage(targetPassage);
      } else {
        handleOpenPassage('Genesis 1-2');
      }
    }
  };

  const handleDismissOnboarding = () => {
    try {
      localStorage.setItem('esv_onboarding_dismissed', 'true');
    } catch (e) {}
    setShowOnboarding(false);
  };

  // Global Container Ref & Return to Top for Plan, Treasury, Memory views
  const mainScrollRef = useRef(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleMainScroll = (e) => {
    if (e && e.target) {
      setShowScrollToTop(e.target.scrollTop > 250);
    }
  };

  const handleScrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to reset all app data to the clean default state? This will clear all local testing data and restore initial memory verses and reading plan progress.")) {
      try {
        localStorage.removeItem('esv_bible_plan');
        localStorage.removeItem('esv_saved_verses');
        localStorage.removeItem('esv_reader_scroll_map');
        localStorage.removeItem('esv_onboarding_dismissed');
      } catch (e) {
        console.warn('Failed to clear local storage:', e);
      }
      setPlanData(initialPlanData);
      setSavedVerses(initialMemoryVerses.map(v => ({
        ...v,
        reference: canonicalizeReference(v.reference)
      })));
      setReaderScrollMap({});
      setShowApiKeyModal(false);
      alert("App data successfully reset to clean default state!");
    }
  };

  return (
    <div className={`h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-hidden transition-colors duration-300 ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progressPercent={progressPercent}
        completedDays={completedDays}
        totalDays={totalDays}
        onOpenSettings={() => setShowApiKeyModal(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area - Scrollable across all screens */}
      <main ref={mainScrollRef} onScroll={handleMainScroll} className="flex-1 overflow-y-auto min-h-0 relative">
        {activeTab === 'plan' && (
          <ReadingPlanView
            planData={planData}
            onTogglePassage={handleTogglePassage}
            onToggleDay={handleToggleDay}
            onOpenPassage={handleOpenPassage}
            onOpenCommentary={(ref) => setCommentaryPassage(ref)}
            todayDateStr={todayDateStr}
            missedDaysCount={missedDaysCount}
            onCatchUpOldest={handleCatchUpOldest}
            onCatchUpToday={handleCatchUpToday}
          />
        )}

        {activeTab === 'reader' && (
          <PassageViewer
            currentPassage={currentPassage}
            onSelectPassage={(ref) => setCurrentPassage(ref)}
            onOpenCommentary={(ref) => setCommentaryPassage(ref)}
            onSaveVerse={handleSaveVerse}
            esvApiKey={esvApiKey}
            savedScrollPos={readerScrollMap[currentPassage]}
            onUpdateScrollPos={handleUpdateScrollPos}
          />
        )}

        {activeTab === 'saved' && (
          <SavedVersesView
            savedVerses={savedVerses}
            onAddVerse={handleSaveVerse}
            onUpdateVerse={handleUpdateVerse}
            onDeleteVerse={handleDeleteVerse}
            onPracticeVerse={handlePracticeVerse}
          />
        )}

        {activeTab === 'memory' && (
          <VerseMemoryView
            initialVerse={selectedMemoryVerse}
            savedVerses={savedVerses}
            onUpdateProgress={handleUpdateMemoryProgress}
          />
        )}
      </main>

      {/* Floating Return to Top Button for Plan, Treasury & Memory views */}
      {showScrollToTop && activeTab !== 'reader' && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-2xl flex items-center space-x-2 border border-amber-400/50 transition-all animate-fadeIn"
          title="Return to Top"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="text-xs font-sans">Top</span>
        </button>
      )}

      {/* Commentary Modal Overlay */}
      {commentaryPassage && (
        <CommentaryModal
          passageRef={commentaryPassage}
          onClose={() => setCommentaryPassage(null)}
        />
      )}

      {/* Interactive First-Time Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleDismissOnboarding}
      />

      {/* Settings / API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-slate-100">Settings & Configuration</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                v{appVersion}
              </span>
            </div>
             <p className="text-xs text-slate-400 font-sans">
              Passages default to <strong>Bible Gateway ESV</strong>. Updates preserve 100% of your saved reading progress & memory data.
            </p>

            {/* Configurable Unified Timezone Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Active Timezone Reference
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="local">
                  Local Time ({Intl.DateTimeFormat().resolvedOptions().timeZone || 'Detected'})
                </option>
                <option value="Asia/Shanghai">Beijing Time (Asia/Shanghai)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York">Eastern Time (America/New_York)</option>
                <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                <option value="Europe/London">London Time (Europe/London)</option>
                <option value="Asia/Tokyo">Tokyo Time (Asia/Tokyo)</option>
                <option value="Asia/Singapore">Singapore Time (Asia/Singapore)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setShowOnboarding(true);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Re-open Onboarding Tour
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  title="Wipe local testing state and restore clean default shared state"
                >
                  Reset to Clean Default State
                </button>
              </div>

              <div className="flex items-center justify-end pt-1 space-x-2">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem('esv_tracker_timezone', timezone);
                    } catch (e) {}
                    setShowApiKeyModal(false);
                    // Force reload to apply timezone modifications dynamically everywhere
                    window.location.reload();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Ready Restart Prompt Modal */}
      {updatePrompt.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-slate-100">Update Ready!</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Version {updatePrompt.version ? `v${updatePrompt.version}` : ''} has been successfully downloaded. Restart the app now to complete the update?
              </p>
            </div>
            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={() => {
                  if (window.electronAPI?.quitAndInstall) {
                    window.electronAPI.quitAndInstall();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
              >
                Restart & Update Now
              </button>
              <button
                onClick={() => setUpdatePrompt({ show: false, version: '' })}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all border border-slate-800/80 hover:border-slate-700"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Backdoor Debug Modal */}
      <DeveloperDebugModal
        isOpen={showDebugModal}
        onClose={() => setShowDebugModal(false)}
      />

      {/* Custom Notification Permission Guidance Modal */}
      <NotificationPermissionModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        permissionType={notificationPermissionType}
      />
    </div>
  );
}
