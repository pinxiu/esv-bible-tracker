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
import SettingsView from './components/SettingsView';
import FeedbackModal from './components/FeedbackModal';

import { BIBLE_PLAN as initialPlanData } from './data/biblePlanData';
import { INITIAL_MEMORY_VERSES as initialMemoryVerses } from './data/initialMemoryVerses';
import { getTodayBeijingDate, isDatePast, isDateToday, formatDateDisplay } from './utils/dateUtils';
import { canonicalizeReference } from './utils/textNormalizer';
import { applyMemoryReview } from './utils/memoryProgress';
import { findOldestMissedUnreadPassage, getPassagesForDay } from './utils/readingPlan.mjs';
import { esvDb } from './services/esvDatabase';
import { INTERNET_REQUIRED_TITLE, useOnlineStatus } from './hooks/useOnlineStatus';
import { Sparkles, CheckCircle2, ArrowUp, Bug, MessageSquare } from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTabState] = useState('plan');
  const [previousTab, setPreviousTab] = useState('plan');

  const setActiveTab = (tab) => {
    if (activeTab !== 'settings') {
      setPreviousTab(activeTab);
    }
    setActiveTabState(tab);
  };

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
              text: cleanText ? cleanText.replace(/\s+/g, ' ').trim() : ''
            };
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved verses data:', e);
    }
    return initialMemoryVerses.map(v => ({
      ...v,
      reference: canonicalizeReference(v.reference),
      text: v.text ? v.text.replace(/\s+/g, ' ').trim() : ''
    }));
  });

  // Helper to find next unread passage in reading plan
  const getNextUnreadPassage = (planList) => {
    if (!planList || !Array.isArray(planList)) return 'Genesis 1-2';
    for (const day of planList) {
      if (!day.completed) {
        const passagesList = getPassagesForDay(day);
        
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
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(() => {
    try {
      const local = localStorage.getItem('esv_auto_update_enabled');
      return local !== 'false';
    } catch (e) {
      return true;
    }
  });

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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isCustomSchedule, setIsCustomSchedule] = useState(() => {
    try {
      return localStorage.getItem('esv_custom_schedule_active') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [appVersion, setAppVersion] = useState('1.0.8');
  const [timezone, setTimezone] = useState(() => {
    try {
      return localStorage.getItem('esv_tracker_timezone') || 'local';
    } catch (e) {
      return 'local';
    }
  });

  const [updatePrompt, setUpdatePrompt] = useState({ show: false, version: '' });
  const [updateInstallError, setUpdateInstallError] = useState('');

  useEffect(() => {
    if (window.electronAPI?.onUpdateMessage) {
      const cleanup = window.electronAPI.onUpdateMessage((data) => {
        if (data.status === 'downloaded') {
          setUpdatePrompt({ show: true, version: data.info?.version || '' });
        } else if (data.status === 'error' && data.action === 'manual-download') {
          setUpdatePrompt({ show: true, version: '' });
          setUpdateInstallError(data.error);
        } else if (data.status === 'available') {
          const autoUpdate = localStorage.getItem('esv_auto_update_enabled') !== 'false';
          if (autoUpdate || window.userTriggeredUpdate) {
            window.userTriggeredUpdate = false;
            if (window.electronAPI?.startDownloadUpdate) {
              window.electronAPI.startDownloadUpdate();
            }
          }
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('esv_notifications_enabled') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationPermissionType, setNotificationPermissionType] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isConfigured = localStorage.getItem('esv_notifications_enabled') !== null;
      const lastPromptTime = localStorage.getItem('lastNotificationPromptTime');
      const blockPrompt = localStorage.getItem('blockNotificationPrompt') === 'true';
      const nextPromptTime = localStorage.getItem('nextNotificationPromptTime');
      const now = Date.now();

      if (window.debugLogger) {
        window.debugLogger.addLog('info', `Notification permission check: isConfigured=${isConfigured}, blockPrompt=${blockPrompt}, lastPromptTime=${lastPromptTime}, nextPromptTime=${nextPromptTime}`);
      }

      if (blockPrompt || isConfigured) {
        return;
      }

      let shouldPrompt = false;
      if (!lastPromptTime) {
        // Absolute first launch
        shouldPrompt = true;
      } else if (nextPromptTime && now >= Number(nextPromptTime)) {
        // Postponed duration expired!
        shouldPrompt = true;
      }

      if (shouldPrompt) {
        setNotificationPermissionType('default');
        const timer = setTimeout(() => {
          setShowNotificationModal(true);
          if (window.debugLogger) {
            window.debugLogger.addLog('info', 'Dispatched custom notification permission modal.');
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [showNotificationModal]);

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
          completed: allDone,
          completionDate: allDone ? getTodayBeijingDate() : null
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
          completedPassages: newPassageMap,
          completionDate: newCompleted ? getTodayBeijingDate() : null
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
  const handleUpdateMemoryProgress = (
    verseId,
    stageCompleted,
    partialFraction = 1,
    { awardMastery = true, countReview = partialFraction >= 1 } = {}
  ) => {
    setSavedVerses(prev => prev.map(v => {
      if (v.id === verseId) {
        const updated = applyMemoryReview(v, stageCompleted, partialFraction, { awardMastery, countReview });
        debugLogger.addLog('info', `Updating memory progress for ${v.reference}: Stage ${stageCompleted}, Mastery ${updated.masteryLevel}%, Review count ${updated.reviewCount}`);
        return updated;
      }
      return v;
    }));
  };

  // Catch-Up Assistant: Jump to oldest missed day
  const handleCatchUpOldest = () => {
    const targetPassage = findOldestMissedUnreadPassage(planData, isDatePast);
    if (targetPassage) handleOpenPassage(targetPassage);
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
        localStorage.removeItem('esv_reader_highlight_prompt_seen');
        localStorage.removeItem('esv_notifications_enabled');
        localStorage.removeItem('lastNotificationPromptTime');
        localStorage.removeItem('blockNotificationPrompt');
        localStorage.removeItem('esv_custom_schedule_active');
      } catch (e) {
        console.warn('Failed to clear local storage:', e);
      }
      setPlanData(initialPlanData);
      setIsCustomSchedule(false);
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
        onOpenSettings={() => setActiveTab('settings')}
        isOnline={isOnline}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area - Scrollable across all screens */}
      <main ref={mainScrollRef} onScroll={handleMainScroll} className="flex-1 flex flex-col overflow-y-auto min-h-0 relative">
        {activeTab === 'plan' && (
          <ReadingPlanView
            planData={planData}
            onTogglePassage={handleTogglePassage}
            onToggleDay={handleToggleDay}
            onOpenPassage={handleOpenPassage}
            onOpenCommentary={(ref) => setCommentaryPassage(ref)}
            isOnline={isOnline}
            todayDateStr={todayDateStr}
            missedDaysCount={missedDaysCount}
            onCatchUpOldest={handleCatchUpOldest}
            onCatchUpToday={handleCatchUpToday}
            setActiveTab={setActiveTab}
            onReplacePlan={(nextPlan) => {
              setPlanData(nextPlan);
              setCurrentPassage(getNextUnreadPassage(nextPlan));
              setIsCustomSchedule(true);
              try {
                localStorage.setItem('esv_custom_schedule_active', 'true');
              } catch (e) {}
            }}
            isCustomSchedule={isCustomSchedule}
            onResetDefaultPlan={() => {
              if (!window.confirm('Replace the customized schedule with the default 52-week schedule? Custom schedule progress will be cleared.')) return;
              setPlanData(initialPlanData);
              setCurrentPassage(getNextUnreadPassage(initialPlanData));
              setIsCustomSchedule(false);
              try {
                localStorage.removeItem('esv_custom_schedule_active');
                localStorage.setItem('esv_bible_plan', JSON.stringify(initialPlanData));
              } catch (e) {}
            }}
          />
        )}

        {activeTab === 'reader' && (
          <PassageViewer
            currentPassage={currentPassage}
            onSelectPassage={(ref) => setCurrentPassage(canonicalizeReference(ref))}
            onOpenCommentary={(ref) => setCommentaryPassage(ref)}
            onSaveVerse={handleSaveVerse}
            isOnline={isOnline}
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

        {activeTab === 'settings' && (
          <SettingsView
            settings={{
              notifyUnread: notificationsEnabled,
              autoUpdateEnabled
            }}
            onSaveSettings={(newSettings) => {
              try {
                localStorage.setItem('esv_notifications_enabled', String(newSettings.notifyUnread));
                localStorage.setItem('esv_auto_update_enabled', String(newSettings.autoUpdateEnabled));
              } catch (e) {}
              setNotificationsEnabled(newSettings.notifyUnread);
              setAutoUpdateEnabled(newSettings.autoUpdateEnabled);
              setActiveTab(previousTab);
            }}
            onCancel={() => {
              setActiveTab(previousTab);
            }}
            onResetProgress={handleResetToDefault}
            onShowTutorial={() => {
              try {
                localStorage.removeItem('esv_onboarding_dismissed');
              } catch (e) {}
              setShowOnboarding(true);
            }}
          />
        )}
      </main>

      {/* Floating Return to Top Button for Plan, Treasury & Memory views */}
      {showScrollToTop && activeTab !== 'reader' && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-20 right-6 z-40 p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-2xl flex items-center space-x-2 border border-amber-400/50 transition-all animate-fadeIn"
          title="Return to Top"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="text-xs font-sans">Top</span>
        </button>
      )}

      <div
        className="internet-tooltip fixed bottom-5 right-6 z-40"
        data-internet-tooltip={!isOnline ? INTERNET_REQUIRED_TITLE : undefined}
      >
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          disabled={!isOnline}
          className="group flex h-11 max-w-11 items-center overflow-hidden rounded-2xl border border-amber-500/40 bg-slate-900 px-3 text-amber-300 shadow-2xl transition-all duration-200 hover:max-w-40 hover:border-amber-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:max-w-11"
          title={isOnline ? 'Send feedback' : undefined}
          aria-label={isOnline ? 'Send feedback' : `Send feedback. ${INTERNET_REQUIRED_TITLE}`}
        >
          <MessageSquare className="h-5 w-5 shrink-0" />
          <span className="ml-2 whitespace-nowrap text-xs font-bold opacity-0 transition-opacity duration-150 group-hover:opacity-100">Send Feedback</span>
        </button>
      </div>

      {/* Commentary Modal Overlay */}
      {commentaryPassage && (
        <CommentaryModal
          passageRef={commentaryPassage}
          onClose={() => setCommentaryPassage(null)}
          isOnline={isOnline}
        />
      )}

      {/* Interactive First-Time Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleDismissOnboarding}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        activePage={activeTab}
        isOnline={isOnline}
      />

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
                {updateInstallError || `Version ${updatePrompt.version ? `v${updatePrompt.version}` : ''} has been successfully downloaded. Restart the app now to complete the update?`}
              </p>
            </div>
            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={async () => {
                  if (updateInstallError && window.electronAPI?.openLatestRelease) {
                    await window.electronAPI.openLatestRelease();
                    return;
                  }
                  if (window.electronAPI?.quitAndInstall) {
                    const result = await window.electronAPI.quitAndInstall();
                    if (result && !result.success) setUpdateInstallError(result.reason || 'The update could not be installed.');
                  }
                }}
                disabled={Boolean(updateInstallError) && !isOnline}
                data-internet-tooltip={updateInstallError && !isOnline ? INTERNET_REQUIRED_TITLE : undefined}
                className="internet-tooltip w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updateInstallError ? 'Download Latest Release' : 'Restart & Update Now'}
              </button>
              <button
                onClick={() => { setUpdatePrompt({ show: false, version: '' }); setUpdateInstallError(''); }}
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
        onForceShowPermissionModal={() => setShowNotificationModal(true)}
      />

      {/* Custom Notification Permission Guidance Modal */}
      <NotificationPermissionModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </div>
  );
}
