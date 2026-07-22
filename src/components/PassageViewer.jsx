import React, { useState, useEffect, useRef } from 'react';
import { fetchPassage } from '../services/bibleApi';
import { BookOpen, ExternalLink, BookmarkPlus, Type, MessageSquarePlus, Check, Sparkles, RefreshCw, ArrowLeft, Zap, BrainCircuit, Highlighter, Database, Globe, Search, X, ArrowUp } from 'lucide-react';

export default function PassageViewer({
  currentPassage,
  onSelectPassage,
  onOpenCommentary,
  onSaveVerse,
  esvApiKey,
  savedScrollPos,
  onUpdateScrollPos
}) {
  const [passageData, setPassageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    try {
      return localStorage.getItem('esv_reader_font_size') || '1.125rem';
    } catch (e) {
      return '1.125rem';
    }
  });

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    try {
      localStorage.setItem('esv_reader_font_size', size);
    } catch (e) {}
  };
  const [selectedText, setSelectedText] = useState('');
  const [popoverPos, setPopoverPos] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteField, setShowNoteField] = useState(false);
  const [isMemoryVerse, setIsMemoryVerse] = useState(false);
  const [highlightColor, setHighlightColor] = useState('gold');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Toggle Source: Default to Bible Gateway (online), optional toggle to use Embedded ESV Bank
  const [useEmbeddedBank, setUseEmbeddedBank] = useState(false);
  const [showBankTooltip, setShowBankTooltip] = useState(false);

  // Network online status detection
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveUseEmbeddedBank = !isOnline || useEmbeddedBank;

  // Custom passage input query
  const [inputQuery, setInputQuery] = useState('');

  // Active Footnote Modal State
  const [activeFootnote, setActiveFootnote] = useState(null);

  // Container Ref for scroll persistence & return to top
  const containerRef = useRef(null);
  const [showPassageScrollTop, setShowPassageScrollTop] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (currentPassage) {
      setLoading(true);
      fetchPassage(currentPassage, esvApiKey, effectiveUseEmbeddedBank).then(data => {
        if (isMounted) {
          setPassageData(data);
          setLoading(false);
          if (data && (data.source === 'Embedded ESV Bank' || data.source === 'Fallback')) {
            // Check if network fetch failed
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
              setIsOnline(false);
            }
          }
          setTimeout(() => {
            if (containerRef.current) {
              const targetScroll = (typeof savedScrollPos === 'number') ? savedScrollPos : 0;
              containerRef.current.scrollTop = targetScroll;
            }
          }, 100);
        }
      });
    }
    return () => { isMounted = false; };
  }, [currentPassage, esvApiKey, effectiveUseEmbeddedBank]);

  // Handle scroll persistence per passage & floating return-to-top button
  const handleScroll = () => {
    if (containerRef.current) {
      const st = containerRef.current.scrollTop;
      setShowPassageScrollTop(st > 250);
      if (onUpdateScrollPos) {
        onUpdateScrollPos(currentPassage, st);
      }
    }
  };

  // Global click listener for interactive footnote markers [a], [b], [c]
  const handlePassageClick = (e) => {
    const fnBadge = e.target.closest('.esv-fn-badge') || e.target.closest('.esv-fn-marker');
    if (fnBadge) {
      e.preventDefault();
      const letter = fnBadge.getAttribute('data-fn-letter') || 'note';
      const rawText = fnBadge.getAttribute('data-fn-text');
      const fnRef = fnBadge.getAttribute('data-fn-ref') || currentPassage;
      const text = rawText ? decodeURIComponent(rawText) : "ESV Translation Note";

      setActiveFootnote({
        letter,
        ref: fnRef,
        text
      });
    }
  };

  // Handle text selection in passage reader
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    if (text && text.length > 2) {
      setSelectedText(text);
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPopoverPos({
          top: Math.max(100, Math.min(window.innerHeight - 250, rect.top + window.scrollY - 100)),
          left: Math.max(20, Math.min(window.innerWidth - 340, rect.left + rect.width / 2 - 160))
        });
      } catch (err) {
        setPopoverPos({ top: 180, left: 300 });
      }
    }
  };

  const handleSaveHighlight = () => {
    if (!selectedText) return;

    onSaveVerse({
      reference: currentPassage || 'Custom Highlight',
      text: selectedText,
      color: highlightColor,
      note: noteInput,
      tags: isMemoryVerse ? ["Memory Verse", currentPassage] : ["Highlight", currentPassage],
      dateAdded: new Date().toISOString().split('T')[0],
      masteryLevel: 0,
      stageProgress: 1
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setPopoverPos(null);
      setSelectedText('');
      setNoteInput('');
      setShowNoteField(false);
      setIsMemoryVerse(false);
    }, 1200);
  };

  const handleSearchPassage = (e) => {
    e.preventDefault();
    if (!inputQuery || inputQuery.trim().length < 2) return;
    onSelectPassage(inputQuery.trim());
    setInputQuery('');
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="p-8 max-w-5xl mx-auto space-y-6 relative h-full overflow-y-auto pb-24"
      onMouseUp={handleTextSelection}
    >
      {/* TOP PASSAGE NAVIGATOR SEARCH BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Full-width Search Form */}
        <form onSubmit={handleSearchPassage} className="flex items-center space-x-2 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Gn 1:1-3, Ps 1..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400 placeholder-slate-500 font-sans shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Load Passage</span>
          </button>
        </form>

        {/* Font Size & Bank Source Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Toggle Source: Bible Gateway (default) vs Embedded Bank */}
          <div className="relative inline-block">
            <button
              onClick={() => {
                if (isOnline) {
                  setUseEmbeddedBank(!useEmbeddedBank);
                } else {
                  setShowBankTooltip(true);
                  setTimeout(() => setShowBankTooltip(false), 2500);
                }
              }}
              onMouseEnter={() => setShowBankTooltip(true)}
              onMouseLeave={() => setShowBankTooltip(false)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                !isOnline
                  ? 'bg-slate-900/40 text-slate-500 border-slate-800/60 opacity-50 cursor-not-allowed'
                  : useEmbeddedBank
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-slate-100 hover:border-slate-700'
              }`}
            >
              {effectiveUseEmbeddedBank ? (
                <Database className={`w-3.5 h-3.5 ${!isOnline ? 'text-slate-500' : 'text-purple-400'}`} />
              ) : (
                <Globe className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span>{useEmbeddedBank ? 'Bank: Embedded' : 'Bank: Gateway'}</span>
            </button>

            {/* Instant White Text Tooltip on 0ms Hover or Click */}
            {showBankTooltip && (
              <div className="absolute top-full right-0 mt-2 z-50 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-slate-700/80 text-xs text-slate-100 font-sans shadow-2xl animate-fadeIn pointer-events-none whitespace-nowrap">
                {!isOnline
                  ? "Bible Gateway is unavailable offline. Using Embedded ESV Bank."
                  : useEmbeddedBank
                    ? "Currently using Embedded ESV Bank (Offline). Click to switch to Bible Gateway"
                    : "Currently using Bible Gateway (Default). Click to switch to Embedded ESV Bank"}
              </div>
            )}
          </div>

          {/* Quick Highlight Full Passage Button */}
          <button
            onClick={() => {
              const textToHighlight = passageData ? (passageData.text || passageData.reference) : currentPassage;
              setSelectedText(textToHighlight);
              setPopoverPos({ top: 180, left: 300 });
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all"
            title="Highlight & Save Verse"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-400" />
            <span>Highlight Verse</span>
          </button>

          {/* Font Size Selector */}
          <div className="flex items-center space-x-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            <Type className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {[
              { label: 'S', size: '0.95rem' },
              { label: 'M', size: '1.125rem' },
              { label: 'L', size: '1.35rem' },
              { label: 'XL', size: '1.65rem' }
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => handleFontSizeChange(f.size)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  fontSize === f.size ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* External Commentary Action Button */}
          <button
            onClick={() => onOpenCommentary(currentPassage)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all hover:text-amber-300"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Commentaries</span>
          </button>
        </div>
      </div>

      {/* Floating Highlight / Verse Memory Action Popover */}
      {popoverPos && selectedText && (
        <div
          style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
          className="fixed z-50 p-4 rounded-2xl glass-card border border-amber-500/40 shadow-2xl w-80 space-y-3 animate-fadeIn bg-slate-950/95"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
              <Highlighter className="w-3.5 h-3.5" />
              <span>Highlight Verse</span>
            </span>
            <button
              onClick={() => setPopoverPos(null)}
              className="text-slate-500 hover:text-slate-300 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 font-serif italic line-clamp-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            "{selectedText}"
          </p>

          {/* Highlight Color Options */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-400 font-semibold">Color:</span>
            {[
              { id: 'gold', bg: 'bg-amber-400' },
              { id: 'emerald', bg: 'bg-emerald-400' },
              { id: 'sky', bg: 'bg-sky-400' },
              { id: 'purple', bg: 'bg-purple-400' },
              { id: 'rose', bg: 'bg-rose-400' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setHighlightColor(c.id)}
                className={`w-5 h-5 rounded-full ${c.bg} transition-all ${
                  highlightColor === c.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          {/* Personal Reflection Note Toggle */}
          {!showNoteField ? (
            <button
              onClick={() => setShowNoteField(true)}
              className="text-xs text-slate-400 hover:text-amber-300 flex items-center space-x-1 font-semibold"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Personal Note</span>
            </button>
          ) : (
            <textarea
              rows={2}
              placeholder="Write personal reflection notes..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 placeholder-slate-500"
            />
          )}

          {/* Add to Verse Memory Deck Checkbox */}
          <label className="flex items-center space-x-2 cursor-pointer pt-1 border-t border-slate-800/60">
            <input
              type="checkbox"
              checked={isMemoryVerse}
              onChange={(e) => setIsMemoryVerse(e.target.checked)}
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
            <span className="text-xs text-slate-300 font-semibold flex items-center space-x-1">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              <span>Add to Verse Memory Deck</span>
            </span>
          </label>

          {/* Save Action Button */}
          <button
            onClick={handleSaveHighlight}
            disabled={savedSuccess}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              savedSuccess
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to Highlights & Memory Deck!</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4" />
                <span>Save Highlight & Reflection</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Passage Content Area */}
      <div className="glass-card p-8 rounded-2xl border border-slate-800 min-h-[500px] relative shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-serif text-slate-400">Loading ESV Scripture passage...</p>
          </div>
        ) : passageData ? (
          <div className="space-y-6">
            {/* Render formatted Bible Gateway / ESV HTML with Footnote event handler */}
            <div
              onClick={handlePassageClick}
              style={{ fontSize: fontSize }}
              className="esv-passage-content font-serif leading-relaxed text-slate-200"
            >
              {passageData.html ? (
                <div dangerouslySetInnerHTML={{ __html: passageData.html }} />
              ) : (
                <>
                  <h2 className="passage-display font-serif font-bold text-amber-400 mb-4 tracking-tight">
                    {passageData.reference || currentPassage} (ESV)
                  </h2>
                  <p className="whitespace-pre-line leading-relaxed font-serif text-slate-200">{passageData.text}</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-28 text-slate-400 font-serif">
            Select a reading plan passage or type any reference above to load ESV text.
          </div>
        )}
      </div>

      {/* Interactive Footnote Popover Modal */}
      {activeFootnote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-amber-500/40 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveFootnote(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-all"
              title="Close Note"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-serif text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                Footnote [{activeFootnote.letter ? activeFootnote.letter.trim() : ''}]
              </span>
              <span className="text-xs text-slate-400 font-sans font-semibold">
                {activeFootnote.ref}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-sm font-serif text-slate-200 leading-relaxed">
              {activeFootnote.text}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveFootnote(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                Close Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Return to Top Button for ESV Reader */}
      {showPassageScrollTop && (
        <button
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-2xl flex items-center space-x-2 border border-amber-400/50 transition-all animate-fadeIn"
          title="Return to Top"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="text-xs font-sans">Top</span>
        </button>
      )}
    </div>
  );
}
