import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateStageDisplay, validateVerseInput, cleanScriptureText, sortVersesAlphabetically, canonicalizeReference, matchesReference } from '../utils/textNormalizer';
import { fetchPassage } from '../services/bibleApi';
import { BrainCircuit, CheckCircle, RefreshCw, Eye, EyeOff, Sparkles, ChevronRight, Award, Zap, ToggleLeft, ToggleRight, ListOrdered, Type, HelpCircle, BarChart2, Search } from 'lucide-react';

// Helper to find the next un-Mastered verse in savedVerses
const findNextUnmasteredVerse = (versesList, currentId = null) => {
  if (!versesList || versesList.length === 0) return null;
  const sorted = sortVersesAlphabetically(versesList);

  if (currentId) {
    const currIndex = sorted.findIndex(v => v.id === currentId);
    if (currIndex !== -1) {
      for (let i = currIndex + 1; i < sorted.length; i++) {
        if ((sorted[i].masteryLevel || 0) < 100) {
          return sorted[i];
        }
      }
    }
  }

  const firstUnmastered = sorted.find(v => (v.masteryLevel || 0) < 100);
  return firstUnmastered || sorted[0] || null;
};

// Helper to find the first un-completed stage for an unmastered verse, or Stage 4 for a mastered verse
const getFirstUncompletedStage = (verse) => {
  if (!verse) return 1;
  const level = verse.masteryLevel || 0;

  // Mastered verse: default to Stage 4 (Pure Blind stage) for review testing
  if (level >= 100) return 4;

  // Un-mastered verse: default strictly based on masteryLevel (0% -> Stage 1, 25% -> Stage 2, 50% -> Stage 3, 75% -> Stage 4)
  if (level >= 75) return 4;
  if (level >= 50) return 3;
  if (level >= 25) return 2;
  return 1;
};

export default function VerseMemoryView({ initialVerse, savedVerses = [], onUpdateProgress }) {
  const sortedSaved = sortVersesAlphabetically(savedVerses);
  
  const [selectedVerseId, setSelectedVerseId] = useState(() => {
    try {
      const savedVerseId = localStorage.getItem('esv_current_memory_verse_id');
      if (savedVerseId && savedVerses.some(v => v.id === savedVerseId)) {
        return savedVerseId;
      }
    } catch (e) {}
    if (initialVerse && initialVerse.id) return initialVerse.id;
    const defaultNext = findNextUnmasteredVerse(savedVerses);
    return defaultNext ? defaultNext.id : (sortedSaved[0]?.id || null);
  });

  // Save selectedVerseId when changed
  useEffect(() => {
    if (selectedVerseId) {
      try {
        localStorage.setItem('esv_current_memory_verse_id', selectedVerseId);
      } catch (e) {}
    }
  }, [selectedVerseId]);

  // Derive the active selected verse in real-time from updated savedVerses prop
  const selectedVerse = savedVerses.find(v => v.id === selectedVerseId) || initialVerse || sortedSaved[0] || null;

  // Stage Completion Popup Modal State
  const [showStageCompletionModal, setShowStageCompletionModal] = useState(false);
  const [completedStageNumber, setCompletedStageNumber] = useState(1);

  // Quick Reference Jump Typing State
  const [jumpQuery, setJumpQuery] = useState('');
  const [showJumpDropdown, setShowJumpDropdown] = useState(false);

  // Exact verse-by-verse data array from Bible Gateway / ESV.json
  const [fetchedVerses, setFetchedVerses] = useState([]);
  const [loadingVerses, setLoadingVerses] = useState(false);

  // Memorization Mode: 'full' or 'verse-by-verse'
  const [memoryMode, setMemoryMode] = useState('full');
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  // Practice Stage: 1=Full, 2=Alternate, 3=Letter Count, 4=Pure Blind
  const [stage, setStage] = useState(() => getFirstUncompletedStage(selectedVerse));

  // Typing options (Default: ignoreSpaces=true, ignoreCaps=false, ignorePunctuation=false, includeReference=true, autoCompleteAtEnd=false)
  const [ignoreCaps, setIgnoreCaps] = useState(false);
  const [ignorePunctuation, setIgnorePunctuation] = useState(false);
  const ignoreSpaces = true; // Always ignore extra spaces under the hood
  const [includeReference, setIncludeReference] = useState(true);
  const [autoCompleteAtEnd, setAutoCompleteAtEnd] = useState(false);

  // User typewriter input text
  const [userInput, setUserInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState(0);

  // Granular Hint States
  const [hintExtraCount, setHintExtraCount] = useState(0); // Extra revealed chars via 1 letter / 1 word
  const [showFullPassageHint, setShowFullPassageHint] = useState(false);

  // Track completed verses in Verse-by-Verse mode
  const [completedSubVerses, setCompletedSubVerses] = useState({});

  // Input textarea reference for auto-focus
  const inputRef = useRef(null);
  const jumpSearchRef = useRef(null);

  // Close jump search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (jumpSearchRef.current && !jumpSearchRef.current.contains(e.target)) {
        setShowJumpDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keydown autofocus to typewriter input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        (activeEl.tagName === 'INPUT' && activeEl.type !== 'checkbox') || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      );
      if (isInput && activeEl !== inputRef.current) {
        return;
      }

      // 2. Ignore modifier key combinations (Ctrl, Cmd, Alt)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // 3. Ignore non-printable keys
      if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter' && e.key !== 'Spacebar' && e.key !== ' ') {
        return;
      }

      // 4. Focus the typewriter textarea
      if (inputRef.current && activeEl !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (initialVerse && initialVerse.id) {
      setSelectedVerseId(initialVerse.id);
    }
  }, [initialVerse]);

  // Fetch exact verse breakdown and auto-set stage when selectedVerseId changes
  useEffect(() => {
    let isMounted = true;
    if (selectedVerse && selectedVerse.reference) {
      setLoadingVerses(true);

      // Auto-set target stage: Stage 4 for Mastered verses, or first uncompleted stage for Un-Mastered verses
      const targetStage = getFirstUncompletedStage(selectedVerse);
      setStage(targetStage);

      // Fetch from Embedded ESV Bank for instant offline verse-by-verse data
      fetchPassage(selectedVerse.reference, '', true).then(data => {
        if (isMounted) {
          if (data && data.verses && data.verses.length > 0) {
            setFetchedVerses(data.verses);
          } else {
            const clean = cleanScriptureText(selectedVerse.text);
            const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
            setFetchedVerses(sentences.map((s, idx) => ({ verseNum: (idx + 1).toString(), text: s })));
          }
          setLoadingVerses(false);
          setCompletedSubVerses({});
          setUserInput('');
          setIsCompleted(false);
          setAccuracyScore(0);
          setHintExtraCount(0);
          setShowFullPassageHint(false);
        }
      });
    }
    return () => { isMounted = false; };
  }, [selectedVerse?.id]);

  useEffect(() => {
    setCompletedSubVerses({});
    resetPracticeState();
  }, [stage, memoryMode]);

  const resetPracticeState = () => {
    setUserInput('');
    setIsCompleted(false);
    setAccuracyScore(0);
    setHintExtraCount(0);
    setShowFullPassageHint(false);
    setShowStageCompletionModal(false);
  };

  const activeVerseItem = (memoryMode === 'verse-by-verse' && fetchedVerses.length > 1)
    ? fetchedVerses[currentVerseIndex]
    : { verseNum: "Full", text: cleanScriptureText(selectedVerse?.text || "") };

  const rawScriptureText = cleanScriptureText(activeVerseItem?.text || "");

  let activeVerseRef = selectedVerse?.reference || '';
  if (memoryMode === 'verse-by-verse' && fetchedVerses.length > 1 && activeVerseItem?.verseNum && activeVerseItem?.verseNum !== "Full") {
    const bookAndChapterMatch = (selectedVerse?.reference || '').match(/^((?:\d\s+)?[A-Za-z\s]+?\s+\d+)/);
    if (bookAndChapterMatch) {
      activeVerseRef = `${bookAndChapterMatch[1]}:${activeVerseItem.verseNum}`;
    }
  }

  const activeScriptureText = (includeReference && activeVerseRef)
    ? `${activeVerseRef} ${rawScriptureText} ${activeVerseRef}`
    : rawScriptureText;

  // Pre-calculate word indices for Stage 2 (Alternate Words) using useMemo for high performance on long texts
  const wordIndices = useMemo(() => {
    const target = activeScriptureText;
    let wordIdx = 0;
    let inWord = false;
    const indices = new Array(target.length);
    for (let w = 0; w < target.length; w++) {
      const isAlpha = /[a-zA-Z0-9]/.test(target[w]);
      if (isAlpha) {
        if (!inWord) {
          wordIdx++;
          inWord = true;
        }
        indices[w] = wordIdx;
      } else {
        inWord = false;
        indices[w] = 0;
      }
    }
    return indices;
  }, [activeScriptureText]);

  // Handle Typewriter input change
  const handleInputChange = (e) => {
    const val = e.target.value;
    setUserInput(val);

    const validation = validateVerseInput(val, activeScriptureText, {
      ignoreCaps,
      ignorePunctuation,
      ignoreSpaces
    });

    setAccuracyScore(validation.accuracy);

    // Trigger completion modal if exact match OR if autoCompleteAtEnd toggle is enabled and typing reaches the end!
    const reachedEnd = autoCompleteAtEnd && val.length >= activeScriptureText.length && activeScriptureText.length > 0;
    if (validation.isExactMatch || reachedEnd) {
      setIsCompleted(true);

      if (memoryMode === 'verse-by-verse' && fetchedVerses.length > 1) {
        const updatedSubVerses = { ...completedSubVerses, [currentVerseIndex]: true };
        setCompletedSubVerses(updatedSubVerses);

        const completedCount = Object.keys(updatedSubVerses).filter(k => updatedSubVerses[k]).length;
        const totalCount = fetchedVerses.length;
        const partialFraction = completedCount / totalCount;

        if (onUpdateProgress && selectedVerse) {
          onUpdateProgress(selectedVerse.id, stage, partialFraction);
        }

        // Only trigger stage completion popup modal when ALL sub-verses have been completed for this stage!
        if (completedCount >= totalCount) {
          setCompletedStageNumber(stage);
          setShowStageCompletionModal(true);
        }
      } else {
        setCompletedStageNumber(stage);
        setShowStageCompletionModal(true);
        if (onUpdateProgress && selectedVerse) {
          onUpdateProgress(selectedVerse.id, stage, 1);
        }
      }
    }
  };

  // Symmetric Show/Hide Hint Handlers
  const handleToggleOneLetter = () => {
    if (hintExtraCount > 0) {
      setHintExtraCount(prev => Math.max(0, prev - 1));
    } else {
      setHintExtraCount(1);
    }
    if (inputRef.current) inputRef.current.focus();
  };

  const handleToggleOneWord = () => {
    if (hintExtraCount > 0) {
      const revealed = activeScriptureText.slice(userInput.length, userInput.length + hintExtraCount);
      const match = revealed.match(/\S+\s*$/);
      const lastWordLen = match ? match[0].length : 1;
      setHintExtraCount(prev => Math.max(0, prev - lastWordLen));
    } else {
      const remainingText = activeScriptureText.slice(userInput.length + hintExtraCount);
      const match = remainingText.match(/^\s*\S+/);
      const wordLen = match ? match[0].length : 1;
      setHintExtraCount(prev => prev + wordLen);
    }
    if (inputRef.current) inputRef.current.focus();
  };

  const handleToggleWholePassage = () => {
    setShowFullPassageHint(!showFullPassageHint);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleNextSubVerse = () => {
    if (currentVerseIndex < fetchedVerses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
      resetPracticeState();
    }
  };

  const getMasteryBadge = (level = 0) => {
    if (level >= 100) return { label: 'Mastered 🏆', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (level >= 50) return { label: 'Memorizing ⚡', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    return { label: 'New Target 📖', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
  };

  const completedVerseCount = Object.keys(completedSubVerses).length;
  const verseProgressPercent = fetchedVerses.length > 0
    ? Math.round((completedVerseCount / fetchedVerses.length) * 100)
    : 0;

  // Filter verses for Type-to-Jump Search using smart matchesReference
  const matchingJumpVerses = sortedSaved.filter(v => {
    if (!jumpQuery || jumpQuery.trim().length === 0) return true;
    return matchesReference(v.reference, jumpQuery) || cleanScriptureText(v.text).toLowerCase().includes(jumpQuery.toLowerCase().trim());
  });

  /**
   * Unified Interactive Text Renderer
   * Renders typed characters in Green/Amber, wrong characters in RED, active cursor position, and 4 refined Stage rules!
   * Optimizes performance for long passages (e.g. Matthew 5 with 5,250 chars) via a 600-char sliding window.
   */
  const renderUnifiedText = () => {
    const target = activeScriptureText;
    const typed = userInput;
    const elements = [];

    const totalRevealedByHint = typed.length + hintExtraCount;

    // Viewport windowing: for long passages (>600 chars), focus rendering on a 600-char window around cursor
    // This reduces DOM elements from ~5,250 down to ~600, eliminating typing lag completely!
    const MAX_VISIBLE_WINDOW = 600;
    let renderStart = 0;
    let renderEnd = target.length;

    if (target.length > MAX_VISIBLE_WINDOW && !showFullPassageHint) {
      const lookback = 200; // characters to keep visible behind cursor
      const lookahead = 400; // characters to render ahead of cursor
      renderStart = Math.max(0, typed.length - lookback);
      renderEnd = Math.min(target.length, typed.length + lookahead);

      if (renderEnd - renderStart < MAX_VISIBLE_WINDOW && target.length >= MAX_VISIBLE_WINDOW) {
        if (renderStart === 0) {
          renderEnd = Math.min(target.length, MAX_VISIBLE_WINDOW);
        } else if (renderEnd === target.length) {
          renderStart = Math.max(0, target.length - MAX_VISIBLE_WINDOW);
        }
      }
    }

    if (renderStart > 0) {
      elements.push(
        <div key="viewport-top-indicator" className="w-full text-center py-1.5 my-1 text-[11px] font-mono text-slate-500 bg-slate-900/60 rounded-lg border border-slate-800/60 select-none">
          ▲ {renderStart} characters completed above (scrolling window) ▲
        </div>
      );
    }

    for (let i = renderStart; i < renderEnd; i++) {
      if (!isCompleted && i === typed.length) {
        elements.push(
          <span
            key="active-typing-cursor"
            className="inline-block w-[3px] h-5 mx-[1px] bg-amber-400 animate-pulse align-middle rounded-full ring-2 ring-amber-400/50 shadow-md shadow-amber-500/50"
          />
        );
      }

      const targetChar = target[i];

      if (i < typed.length) {
        const typedChar = typed[i];

        let isMatch = typedChar === targetChar;
        if (ignoreCaps) {
          isMatch = typedChar.toLowerCase() === targetChar.toLowerCase();
        }
        if (ignorePunctuation && /[.,/#!$%^&*;:{}=\-_`~()'"“”‘’?—]/.test(typedChar) && /[.,/#!$%^&*;:{}=\-_`~()'"“”‘’?—]/.test(targetChar)) {
          isMatch = true;
        }

        if (isMatch) {
          elements.push(
            <span key={i} className="text-emerald-400 font-bold">
              {typedChar}
            </span>
          );
        } else {
          elements.push(
            <span
              key={i}
              className="text-rose-300 bg-rose-950/90 font-bold underline decoration-rose-500 px-0.5 rounded shadow-sm shadow-rose-500/30 animate-pulse"
              title={`Expected '${targetChar}', but typed '${typedChar}'`}
            >
              {typedChar}
            </span>
          );
        }
      } else if (showFullPassageHint || i < totalRevealedByHint) {
        elements.push(
          <span key={i} className="text-amber-300/90 bg-amber-500/10 px-0.5 rounded underline decoration-amber-500/40">
            {targetChar}
          </span>
        );
      } else {
        if (stage === 1) {
          elements.push(
            <span key={i} className="text-slate-600">
              {targetChar}
            </span>
          );
        } else if (stage === 2) {
          const wNum = wordIndices[i];
          if (wNum > 0 && wNum % 2 === 1) {
            elements.push(
              <span key={i} className="text-slate-400 font-semibold">
                {targetChar}
              </span>
            );
          } else {
            elements.push(
              <span key={i} className="text-slate-600 font-mono">
                {/[a-zA-Z0-9]/.test(targetChar) ? '_' : targetChar}
              </span>
            );
          }
        } else if (stage === 3) {
          elements.push(
            <span key={i} className="text-slate-600 font-mono">
              {/[a-zA-Z0-9]/.test(targetChar) ? '_' : targetChar}
            </span>
          );
        } else {
          // Stage 4: Pure Blind Mode (No text, no underscores visible)
          elements.push(
            <span key={i} className="text-slate-800/40">
              {/[a-zA-Z0-9]/.test(targetChar) ? '' : targetChar}
            </span>
          );
        }
      }
    }

    if (renderEnd < target.length) {
      elements.push(
        <div key="viewport-bottom-indicator" className="w-full text-center py-1.5 my-1 text-[11px] font-mono text-slate-500 bg-slate-900/60 rounded-lg border border-slate-800/60 select-none">
          ▼ {target.length - renderEnd} characters remaining below ▼
        </div>
      );
    }

    if (!isCompleted && typed.length >= target.length) {
      elements.push(
        <span
          key="end-typing-cursor"
          className="inline-block w-[3px] h-5 mx-[1px] bg-amber-400 animate-pulse align-middle rounded-full ring-2 ring-amber-400/50 shadow-md shadow-amber-500/50"
        />
      );
    }

    if (typed.length > target.length) {
      for (let i = target.length; i < typed.length; i++) {
        elements.push(
          <span key={`extra-${i}`} className="text-rose-400 bg-rose-950/90 font-bold underline px-0.5 rounded">
            {typed[i]}
          </span>
        );
      }
    }

    return elements;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-30">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Typewriter Scripture Memorization</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-100">Interactive Verse Memory Workspace</h2>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Type directly into the unified passage workspace. Completing Stage 4 (Pure Blind) marks verse as <strong>Mastered 🏆 (100%)</strong>!
          </p>
        </div>

        {/* Quick Type-to-Jump Search Input & Autocomplete Menu */}
        <div ref={jumpSearchRef} className="w-full md:w-[480px] relative z-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Type to jump e.g. Mat 5, Gen 1, Ps 23..."
              value={jumpQuery}
              onFocus={() => setShowJumpDropdown(true)}
              onChange={(e) => {
                setJumpQuery(e.target.value);
                setShowJumpDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowJumpDropdown(false);
                } else if (e.key === 'Enter' && matchingJumpVerses.length > 0) {
                  const target = matchingJumpVerses[0];
                  setSelectedVerseId(target.id);
                  setJumpQuery(target.reference);
                  setShowJumpDropdown(false);
                  if (inputRef.current) inputRef.current.focus();
                }
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 shadow-inner placeholder-slate-500 font-sans"
            />
          </div>

          {/* Autocomplete Dropdown Menu Floating ABOVE all typewriter components (100% Solid Opaque) */}
          {showJumpDropdown && (
            <div className="absolute right-0 top-full mt-2 w-full md:w-[540px] max-h-[70vh] overflow-y-auto bg-[#090d16] border-2 border-amber-500/50 rounded-2xl shadow-2xl shadow-black z-[100] divide-y divide-slate-800 animate-fadeIn">
              {matchingJumpVerses.length > 0 ? (
                matchingJumpVerses.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVerseId(v.id);
                      setJumpQuery(v.reference);
                      setShowJumpDropdown(false);
                      if (inputRef.current) inputRef.current.focus();
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center justify-between gap-3 ${
                      selectedVerse?.id === v.id ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-200 text-xs'
                    }`}
                  >
                    <div className="font-serif font-bold text-sm text-amber-300 shrink-0">{v.reference}</div>
                    <div className="text-xs text-slate-300 font-sans truncate max-w-[340px]">
                      {cleanScriptureText(v.text)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-xs text-slate-400 text-center font-sans">No matching saved verses</div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedVerse ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Practice Workspace (Left 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passage Reference Title & Mode Selector */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif font-bold text-2xl text-amber-300">
                      {selectedVerse.reference}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMasteryBadge(selectedVerse.masteryLevel).color}`}>
                      {getMasteryBadge(selectedVerse.masteryLevel).label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Reviewed: {selectedVerse.reviewCount || 0}x
                    </span>
                  </div>
                  {selectedVerse.note && (
                    <p className="text-xs text-slate-400 font-sans mt-1">Note: {selectedVerse.note}</p>
                  )}
                </div>

                {/* Mode Selector: Full vs Verse-by-Verse */}
                {fetchedVerses.length > 1 && (
                  <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                    <button
                      onClick={() => { setMemoryMode('full'); resetPracticeState(); }}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        memoryMode === 'full'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Whole Passage ({fetchedVerses.length} Verses)
                    </button>
                    <button
                      onClick={() => { setMemoryMode('verse-by-verse'); setCurrentVerseIndex(0); resetPracticeState(); }}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        memoryMode === 'verse-by-verse'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Verse by Verse
                    </button>
                  </div>
                )}
              </div>

              {/* Verse-by-Verse Sub-Navigator Bar */}
              {memoryMode === 'verse-by-verse' && fetchedVerses.length > 1 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-amber-300">
                      Verse {currentVerseIndex + 1} of {fetchedVerses.length}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400 font-sans">
                      Progress: {completedVerseCount} / {fetchedVerses.length} ({verseProgressPercent}%)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (currentVerseIndex > 0) {
                          setCurrentVerseIndex(currentVerseIndex - 1);
                          resetPracticeState();
                        }
                      }}
                      disabled={currentVerseIndex === 0}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      onClick={handleNextSubVerse}
                      disabled={currentVerseIndex >= fetchedVerses.length - 1}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold disabled:opacity-40"
                    >
                      Next Verse
                    </button>
                  </div>
                </div>
              )}

              {/* Stage Selection Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { num: 1, name: "Stage 1: Full", desc: "Full text visible" },
                  { num: 2, name: "Stage 2: Alternate", desc: "Every 2nd word masked" },
                  { num: 3, name: "Stage 3: Lengths", desc: "Exact letter count _ _" },
                  { num: 4, name: "Stage 4: Pure Blind", desc: "100% Mastered recall 🏆" }
                ].map(stg => (
                  <button
                    key={stg.num}
                    onClick={() => {
                      setStage(stg.num);
                      resetPracticeState();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      stage === stg.num
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-serif font-bold text-xs">{stg.name}</div>
                    <div className="text-[10px] text-slate-500 font-sans mt-0.5">{stg.desc}</div>
                  </button>
                ))}
              </div>

              {/* Unified Typewriter Visual Workspace */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold px-1">
                  <div className="flex items-center space-x-2 text-amber-300">
                    <Type className="w-4 h-4 text-amber-400" />
                    <span>Typewriter Workspace</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span>Accuracy: <strong className="text-amber-300">{accuracyScore}%</strong></span>
                    <span>Progress: <strong className="text-emerald-400">{userInput.length} / {activeScriptureText.length} chars</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(true);
                        setCompletedStageNumber(stage);
                        setShowStageCompletionModal(true);
                        if (onUpdateProgress && selectedVerse) {
                          onUpdateProgress(selectedVerse.id, stage);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all flex items-center space-x-1"
                      title="Trigger stage completion popup modal"
                    >
                      <span>Complete Stage {stage} →</span>
                    </button>
                  </div>
                </div>

                {/* Main Interactive Typewriter Display Box */}
                <div
                  onClick={() => { if (inputRef.current) inputRef.current.focus(); }}
                  className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 font-serif text-lg leading-relaxed tracking-wide min-h-[160px] cursor-text shadow-inner transition-all hover:border-amber-500/50 whitespace-pre-wrap select-text relative"
                >
                  {renderUnifiedText()}

                  {/* Invisible Focus/Typing Textarea Overlay */}
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={handleInputChange}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-text resize-none bg-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {/* Symmetric 2-Way Hint Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleOneLetter}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      hintExtraCount > 0
                        ? 'bg-amber-500/30 border-amber-500 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{hintExtraCount > 0 ? 'Hide 1 Letter' : 'Show 1 Letter'}</span>
                  </button>

                  <button
                    onClick={handleToggleOneWord}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      hintExtraCount > 0
                        ? 'bg-amber-500/30 border-amber-500 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{hintExtraCount > 0 ? 'Hide 1 Word' : 'Show 1 Word'}</span>
                  </button>

                  <button
                    onClick={handleToggleWholePassage}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      showFullPassageHint
                        ? 'bg-purple-500/30 border-purple-500 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-purple-300'
                    }`}
                  >
                    {showFullPassageHint ? <EyeOff className="w-3.5 h-3.5 text-purple-400" /> : <Eye className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{showFullPassageHint ? 'Hide Whole Passage' : 'Show Whole Passage'}</span>
                  </button>
                </div>

                <button
                  onClick={resetPracticeState}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear & Reset</span>
                </button>
              </div>

              {/* Victory Banner */}
              {isCompleted && (() => {
                let firstUnfinishedPrevIndex = -1;
                let firstUnfinishedNextIndex = -1;
                if (memoryMode === 'verse-by-verse' && fetchedVerses.length > 1) {
                  for (let i = currentVerseIndex - 1; i >= 0; i--) {
                    if (!completedSubVerses[i]) {
                      firstUnfinishedPrevIndex = i;
                      break;
                    }
                  }
                  for (let i = currentVerseIndex + 1; i < fetchedVerses.length; i++) {
                    if (!completedSubVerses[i]) {
                      firstUnfinishedNextIndex = i;
                      break;
                    }
                  }
                }

                const isPartialVerseMode = memoryMode === 'verse-by-verse' && fetchedVerses.length > 1 && Object.keys(completedSubVerses).length < fetchedVerses.length;

                return (
                  <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 shrink-0 text-emerald-400" />
                      <div>
                        <div className="text-sm font-serif font-bold text-emerald-200">
                          {isPartialVerseMode
                            ? `Amen! Verse ${activeVerseItem?.verseNum} Recalled! 🎉`
                            : "Amen! Perfect Typewriter Recall! 🎉"}
                        </div>
                        <div>
                          {isPartialVerseMode
                            ? `Progress: ${Object.keys(completedSubVerses).length} of ${fetchedVerses.length} verses completed for Stage ${stage}. Type remaining verses to finish Stage ${stage}!`
                            : stage === 4
                              ? `Congratulations! You mastered Stage 4 (Pure Blind) for ${selectedVerse?.reference}! Marked as Mastered 🏆 (100%).`
                              : `You have successfully completed Stage ${stage} of ${selectedVerse?.reference}!`}
                        </div>
                      </div>
                    </div>

                    {isPartialVerseMode ? (
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                        {firstUnfinishedPrevIndex !== -1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentVerseIndex(firstUnfinishedPrevIndex);
                              resetPracticeState();
                            }}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shrink-0 transition-all flex items-center space-x-1"
                          >
                            <span>← Unfinished Verse ({fetchedVerses[firstUnfinishedPrevIndex]?.verseNum || (firstUnfinishedPrevIndex + 1)})</span>
                          </button>
                        )}
                        {firstUnfinishedNextIndex !== -1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentVerseIndex(firstUnfinishedNextIndex);
                              resetPracticeState();
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1"
                          >
                            <span>Unfinished Verse ({fetchedVerses[firstUnfinishedNextIndex]?.verseNum || (firstUnfinishedNextIndex + 1)}) →</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedStageNumber(stage);
                          setShowStageCompletionModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5 self-end sm:self-center"
                      >
                        <span>{stage === 4 ? "Jump to Next Un-Mastered Verse →" : `Advance to Stage ${stage + 1} →`}</span>
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Typing Toggles & Settings Sidebar (Right 1 Col) */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="font-serif font-bold text-base text-slate-100 border-b border-slate-800 pb-2">
                Typewriter Match Rules
              </h4>

              <div className="space-y-3">
                {/* Include Verse Reference */}
                <label className={`flex items-center justify-between cursor-pointer p-2.5 rounded-xl border transition-all ${
                  includeReference 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-350 hover:border-slate-700'
                }`}>
                  <div className="flex flex-col pr-2">
                    <span className={`text-xs ${includeReference ? 'font-bold text-amber-300' : 'font-semibold text-slate-200'}`}>Include Verse Reference</span>
                    <span className="text-[10px] text-slate-400 font-sans">Type ref before & after passage</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeReference}
                    onChange={(e) => {
                      setIncludeReference(e.target.checked);
                      resetPracticeState();
                    }}
                    className="w-4 h-4 accent-amber-500 rounded shrink-0 cursor-pointer"
                  />
                </label>

                {/* Auto-Complete at End */}
                <label className={`flex items-center justify-between cursor-pointer p-2.5 rounded-xl border transition-all ${
                  autoCompleteAtEnd 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-350 hover:border-slate-700'
                }`}>
                  <div className="flex flex-col pr-2">
                    <span className={`text-xs ${autoCompleteAtEnd ? 'font-bold text-amber-300' : 'font-semibold text-slate-200'}`}>Auto-Complete at End</span>
                    <span className="text-[10px] text-slate-400 font-sans">If off, requires 100% strict match</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCompleteAtEnd}
                    onChange={(e) => setAutoCompleteAtEnd(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded shrink-0 cursor-pointer"
                  />
                </label>

                {/* Ignore Capitalization */}
                <label className={`flex items-center justify-between cursor-pointer p-2.5 rounded-xl border transition-all ${
                  ignoreCaps 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-350 hover:border-slate-700'
                }`}>
                  <span className={`text-xs ${ignoreCaps ? 'font-bold text-amber-300' : 'font-semibold text-slate-200'}`}>Ignore Capitalization</span>
                  <input
                    type="checkbox"
                    checked={ignoreCaps}
                    onChange={(e) => setIgnoreCaps(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                {/* Ignore Punctuation */}
                <label className={`flex items-center justify-between cursor-pointer p-2.5 rounded-xl border transition-all ${
                  ignorePunctuation 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-355 hover:border-slate-700'
                }`}>
                  <span className={`text-xs ${ignorePunctuation ? 'font-bold text-amber-300' : 'font-semibold text-slate-200'}`}>Ignore Punctuation (. , ! ?)</span>
                  <input
                    type="checkbox"
                    checked={ignorePunctuation}
                    onChange={(e) => setIgnorePunctuation(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Quick Memory Stats & Overall Treasury Progress */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 font-serif font-bold text-sm">
                <Award className="w-4 h-4" />
                <span>Verse Memory Stats</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Verse Mastery:</span>
                  <span className="font-bold text-amber-300">{selectedVerse?.masteryLevel || 0}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-400 h-full transition-all duration-500"
                    style={{ width: `${selectedVerse?.masteryLevel || 0}%` }}
                  />
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                  <span>Times Reviewed:</span>
                  <span className="font-bold text-emerald-400">{selectedVerse?.reviewCount || 0} Times</span>
                </div>

                {savedVerses.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-sans">Overall Treasury Mastery:</span>
                      <span className="font-bold text-emerald-300">
                        {Math.round(savedVerses.reduce((acc, v) => acc + (v.masteryLevel || 0), 0) / savedVerses.length)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                        style={{ width: `${Math.round(savedVerses.reduce((acc, v) => acc + (v.masteryLevel || 0), 0) / savedVerses.length)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-serif font-bold text-slate-300">No Scripture Verses Saved Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Go to the Saved Verses Treasury tab to add custom verses or choose verses from the ESV bank!
          </p>
        </div>
      )}

      {/* Stage Completion Popup Modal (High Priority z-[9999] Overlay) */}
      {showStageCompletionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-text">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-amber-500/50 space-y-4 shadow-2xl text-center bg-slate-950/95">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              {completedStageNumber === 4 ? <Award className="w-6 h-6 text-amber-400" /> : <Sparkles className="w-6 h-6 text-amber-400" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-slate-100">
                {completedStageNumber === 4
                  ? `Verse Mastered 🏆 (100%)`
                  : `Stage ${completedStageNumber} Completed! 🎉`}
              </h3>
              <p className="text-xs text-amber-300 font-serif font-semibold">
                {selectedVerse?.reference}
              </p>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {completedStageNumber === 4
                ? `Amen! You have completed Stage 4 (Pure Blind Mode) for ${selectedVerse?.reference}! Ready to jump to your next un-Mastered verse?`
                : `Amen! You completed Stage ${completedStageNumber}. Would you like to advance to Stage ${completedStageNumber + 1}?`}
            </p>

            <div className="pt-2 flex flex-col space-y-2">
              {completedStageNumber < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStage(completedStageNumber + 1);
                    resetPracticeState();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5"
                >
                  <span>Advance to Stage {completedStageNumber + 1}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const nextTarget = findNextUnmasteredVerse(savedVerses, selectedVerse?.id);
                    resetPracticeState();
                    if (nextTarget && nextTarget.id !== selectedVerse?.id) {
                      setSelectedVerseId(nextTarget.id);
                      setJumpQuery(nextTarget.reference);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5"
                >
                  <span>Jump to Next Un-Mastered Verse</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowStageCompletionModal(false)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
              >
                {completedStageNumber === 4 ? "Stay on Current Verse" : `Stay on Stage ${completedStageNumber}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
