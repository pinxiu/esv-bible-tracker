import React, { useState, useEffect, useRef } from 'react';
import { fetchPassage, fetchEsvAudio, searchEsv, normalizePassageRef } from '../services/bibleApi';
import { ExternalLink, BookmarkPlus, Type, MessageSquarePlus, Check, BrainCircuit, Highlighter, Search, X, ArrowUp, SlidersHorizontal, Volume2, WifiOff } from 'lucide-react';
import { INTERNET_REQUIRED_TITLE } from '../hooks/useOnlineStatus';

export default function PassageViewer({
  currentPassage,
  onSelectPassage,
  onOpenCommentary,
  onSaveVerse,
  isOnline = true,
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
  const [audioUrl, setAudioUrl] = useState('');
  const [audioError, setAudioError] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const [showHighlightPrompt, setShowHighlightPrompt] = useState(() => {
    try {
      return localStorage.getItem('esv_reader_highlight_prompt_seen') !== 'true';
    } catch {
      return true;
    }
  });
  const [displayOptions, setDisplayOptions] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('esv_reader_display_options'));
      return saved ? {
        verseNumbers: saved.verseNumbers !== false,
        headings: saved.headings !== false,
        footnotes: saved.footnotes ?? saved.footer ?? true
      } : { verseNumbers: true, headings: true, footnotes: true };
    } catch {
      return { verseNumbers: true, headings: true, footnotes: true };
    }
  });

  // Network online status detection
  const [showOfflineNotice, setShowOfflineNotice] = useState(
    !isOnline
  );

  useEffect(() => {
    setShowOfflineNotice(!isOnline);
  }, [isOnline]);

  const effectiveUseEmbeddedBank = !isOnline;

  // Custom passage input query
  const [inputQuery, setInputQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('esv_reader_display_options', JSON.stringify(displayOptions));
  }, [displayOptions]);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  // Active Footnote Modal State
  const [activeFootnote, setActiveFootnote] = useState(null);

  // Container Ref for scroll persistence & return to top
  const containerRef = useRef(null);
  const passageContentRef = useRef(null);
  const displayMenuRef = useRef(null);
  const [showPassageScrollTop, setShowPassageScrollTop] = useState(false);

  useEffect(() => {
    if (!showDisplayMenu) return undefined;

    const closeDisplayMenu = (event) => {
      if (!displayMenuRef.current?.contains(event.target)) {
        setShowDisplayMenu(false);
      }
    };

    document.addEventListener('mousedown', closeDisplayMenu);
    return () => document.removeEventListener('mousedown', closeDisplayMenu);
  }, [showDisplayMenu]);

  useEffect(() => {
    let isMounted = true;
    if (currentPassage) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
      setAudioError('');
      setLoading(true);
      fetchPassage(currentPassage, effectiveUseEmbeddedBank).then(data => {
        if (isMounted) {
          setPassageData(data);
          setLoading(false);
          if (data && (data.source === 'Embedded ESV Bank' || data.source === 'Fallback')) {
            setShowOfflineNotice(true);
            // Check if network fetch failed
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
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
  }, [currentPassage, effectiveUseEmbeddedBank]);

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
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const passageNode = passageContentRef.current;
    if (!passageNode || !passageNode.contains(range.commonAncestorContainer)) return;

    const elementForNode = (node) => (
      node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement
    );
    const footnoteSelector = '.esv-fn-badge, .esv-fn-marker, .footnote, .crossreference';
    const startFootnote = elementForNode(range.startContainer)?.closest(footnoteSelector);
    const endFootnote = elementForNode(range.endContainer)?.closest(footnoteSelector);
    if (startFootnote && startFootnote === endFootnote) {
      setSelectedText('');
      setPopoverPos(null);
      selection.removeAllRanges();
      return;
    }

    const text = selection ? selection.toString().trim() : '';
    // A chapter/verse marker by itself is navigation metadata, not highlightable Scripture.
    if (!text || !/[A-Za-z]/.test(text)) return;
    if (text && text.length > 2) {
      setSelectedText(text);
      try {
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

  const handleSearchPassage = async (e) => {
    e.preventDefault();
    if (!inputQuery || inputQuery.trim().length < 2) return;
    const query = inputQuery.trim();
    const normalizedQuery = normalizePassageRef(query);
    const looksLikeReference = /\d/.test(query) || normalizedQuery !== query;
    if (looksLikeReference) {
      setSearchResults([]);
      onSelectPassage(normalizedQuery);
      return;
    }
    setLoading(true);
    setSearchError('');
    try {
      const data = await searchEsv(query);
      setSearchResults(data.results || []);
    } catch (error) {
      setSearchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const trimmedQuery = inputQuery.trim();
  const normalizedInputQuery = normalizePassageRef(trimmedQuery);
  const searchRequiresInternet = trimmedQuery.length >= 2
    && !(/\d/.test(trimmedQuery) || normalizedInputQuery !== trimmedQuery);

  const toggleDisplayOption = (key) => {
    setDisplayOptions(current => ({ ...current, [key]: !current[key] }));
  };

  const dismissHighlightPrompt = () => {
    try {
      localStorage.setItem('esv_reader_highlight_prompt_seen', 'true');
    } catch {}
    setShowHighlightPrompt(false);
  };

  const handleLoadAudio = async () => {
    setAudioError('');
    setAudioLoading(true);
    try {
      const nextUrl = await fetchEsvAudio(currentPassage);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(nextUrl);
    } catch (error) {
      setAudioError(error.message);
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="p-8 max-w-5xl mx-auto space-y-6 relative h-full overflow-y-auto pb-6"
    >
      {/* TOP PASSAGE NAVIGATOR SEARCH BAR */}
      <div className="glass-panel relative z-40 overflow-visible p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
        {/* Full-width Search Form */}
        <form onSubmit={handleSearchPassage} className="flex items-center gap-2 w-full sm:w-1/2 sm:flex-none">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder='e.g. Jn3:16, Ps 1, "love"'
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400 placeholder-slate-500 font-sans shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={!isOnline && searchRequiresInternet}
            data-internet-tooltip={!isOnline && searchRequiresInternet ? INTERNET_REQUIRED_TITLE : undefined}
            title={!isOnline && searchRequiresInternet ? undefined : 'Search by Bible reference, abbreviated book name, whole book, or words contained in Scripture.'}
            className="internet-tooltip px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Font Size & Bank Source Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
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

          <div ref={displayMenuRef} className="relative z-[100]">
            <button
              onClick={() => setShowDisplayMenu(value => !value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-semibold hover:border-slate-700"
              aria-expanded={showDisplayMenu}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              Display
            </button>
            {showDisplayMenu && (
              <div className="absolute right-0 top-full mt-2 z-[110] w-52 p-2 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl">
                {[
                  ['verseNumbers', 'Verse numbers'],
                  ['headings', 'Headings'],
                  ['footnotes', 'Footnotes']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-900 cursor-pointer text-xs text-slate-200">
                    <span>{label}</span>
                    <input type="checkbox" checked={displayOptions[key]} onChange={() => toggleDisplayOption(key)} className="accent-amber-500" />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* External Commentary Action Button */}
          <button
            onClick={() => onOpenCommentary(currentPassage)}
            disabled={!isOnline}
            data-internet-tooltip={!isOnline ? INTERNET_REQUIRED_TITLE : undefined}
            title={isOnline ? 'Open online commentaries' : undefined}
            className="internet-tooltip flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Commentaries</span>
          </button>
        </div>
      </div>

      {showHighlightPrompt && (
        <div
          role="dialog"
          aria-label="Reader highlighting tip"
          className="fixed top-24 right-6 z-[115] w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-amber-500/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur"
        >
          <button
            type="button"
            onClick={dismissHighlightPrompt}
            className="absolute right-2.5 top-2.5 rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Dismiss highlighting tip"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-start gap-3 pr-5">
            <div className="rounded-lg bg-amber-500/15 p-2 text-amber-300">
              <Highlighter className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Highlight while you read</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Select Scripture text to choose a color, add a note, or save it to your memory deck.
              </p>
              <button
                type="button"
                onClick={dismissHighlightPrompt}
                className="mt-2 text-[11px] font-bold text-amber-300 hover:text-amber-200"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showOfflineNotice && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-purple-500/40 shadow-2xl p-6 text-center space-y-4">
            <div className="mx-auto w-11 h-11 rounded-full bg-purple-500/15 text-purple-300 flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-100">Using offline Scripture</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                The online ESV source is unavailable, so the Reader has switched automatically to the embedded offline version.
              </p>
            </div>
            <button
              onClick={() => setShowOfflineNotice(false)}
              className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold"
            >
              Continue reading
            </button>
          </div>
        </div>
      )}

      {searchError && <p className="text-xs text-rose-300">{searchError}</p>}
      {searchResults.length > 0 && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 text-xs font-bold text-amber-300 border-b border-slate-800">
            ESV search results for “{inputQuery.trim()}”
          </div>
          {searchResults.map((result, index) => (
            <button
              key={`${result.reference}-${index}`}
              onClick={() => { onSelectPassage(result.reference); setSearchResults([]); }}
              className="block w-full text-left px-4 py-3 border-b border-slate-800/60 hover:bg-slate-900"
            >
              <span className="block text-xs font-bold text-amber-300">{result.reference}</span>
              <span className="block mt-1 text-sm text-slate-300 font-serif">{result.content}</span>
            </button>
          ))}
        </div>
      )}

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
      <div className="glass-card z-0 p-8 rounded-2xl border border-slate-800 min-h-[500px] relative shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-serif text-slate-400">Loading ESV Scripture passage...</p>
          </div>
        ) : passageData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <span className="text-[10px] text-slate-500">{passageData.source}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold font-serif text-amber-400">
                {passageData.reference || currentPassage} (ESV)
              </h2>
              <button
                onClick={() => {
                  if (!audioUrl && !audioLoading) handleLoadAudio();
                }}
                disabled={!passageData.esvAvailable || effectiveUseEmbeddedBank}
                data-internet-tooltip={!isOnline ? INTERNET_REQUIRED_TITLE : undefined}
                title={!isOnline ? undefined : (passageData.esvAvailable ? 'Listen while continuing to read the passage.' : 'Audio is unavailable for this fallback source.')}
                className="internet-tooltip p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/40 disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                aria-label="Listen to passage"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
            {(audioLoading || audioUrl || audioError) && (
              <div className="rounded-xl border border-amber-500/20 bg-slate-950/60 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Volume2 className="w-4 h-4" />
                  <span>{audioLoading ? 'Loading audio…' : 'Listen while you read'}</span>
                </div>
                {audioUrl && <audio controls autoPlay src={audioUrl} className="w-full h-9" />}
                {audioError && <p className="text-xs text-rose-300">{audioError}</p>}
              </div>
            )}
            {/* Render formatted Bible Gateway / ESV HTML with Footnote event handler */}
            <div
              ref={passageContentRef}
              onClick={handlePassageClick}
              onMouseUp={handleTextSelection}
              style={{ fontSize: fontSize }}
              className={`esv-passage-content reader-managed-title font-serif leading-relaxed text-slate-200 ${!displayOptions.verseNumbers ? 'hide-verse-numbers' : ''} ${!displayOptions.headings ? 'hide-reader-headings' : ''} ${!displayOptions.footnotes ? 'hide-reader-footnotes' : ''}`}
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
          className="fixed bottom-20 right-6 z-40 p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-2xl flex items-center space-x-2 border border-amber-400/50 transition-all animate-fadeIn"
          title="Return to Top"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="text-xs font-sans">Top</span>
        </button>
      )}
    </div>
  );
}
