import React, { useState, useEffect, useRef } from 'react';
import { fetchPassage } from '../services/bibleApi';
import { cleanScriptureText, canonicalizeReference, sortVersesAlphabetically } from '../utils/textNormalizer';
import { esvDb } from '../services/esvDatabase';
import { Bookmark, Plus, Trash2, BrainCircuit, Search, Tag, MessageSquare, Sparkles, RefreshCw, Check, Zap, Database, Award, BarChart2, Edit3, X } from 'lucide-react';

export default function SavedVersesView({ savedVerses = [], onAddVerse, onUpdateVerse, onDeleteVerse, onPracticeVerse }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New verse form state
  const [newRef, setNewRef] = useState('');
  const [newText, setNewText] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newColor, setNewColor] = useState('gold');

  // Edit verse modal state
  const [editingVerse, setEditingVerse] = useState(null);
  const [editRef, setEditRef] = useState('');
  const [editText, setEditText] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editColor, setEditColor] = useState('gold');
  const [fetchingEditText, setFetchingEditText] = useState(false);
  const [editFetchSource, setEditFetchSource] = useState(null);

  // Auto-fetch loading & source state
  const [fetchingText, setFetchingText] = useState(false);
  const [fetchSource, setFetchSource] = useState(null);

  const debounceTimer = useRef(null);
  const editDebounceTimer = useRef(null);
  const dbCount = esvDb.getVerseCount();

  // Filter verses
  const filteredVerses = savedVerses.filter(v => {
    if (selectedColor !== 'all' && v.color !== selectedColor) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.reference.toLowerCase().includes(q) || v.text.toLowerCase().includes(q) || (v.note && v.note.toLowerCase().includes(q));
    }
    return true;
  });

  // Always Sort Verses Alphabetically by Reference
  const sortedFilteredVerses = sortVersesAlphabetically(filteredVerses);

  // Overall Memorization Stats
  const totalVerses = savedVerses.length;
  const avgMastery = totalVerses > 0
    ? Math.round(savedVerses.reduce((sum, v) => sum + (v.masteryLevel || 0), 0) / totalVerses)
    : 0;
  const masteredCount = savedVerses.filter(v => (v.masteryLevel || 0) >= 100).length;
  const totalReviews = savedVerses.reduce((sum, v) => sum + (v.reviewCount || 0), 0);

  // Real-time Auto-Fetch ESV text from embedded dataset or Bible Gateway
  const handleAutoFetchText = async (refToFetch) => {
    const rawTarget = refToFetch || newRef;
    if (!rawTarget || rawTarget.trim().length < 2) return;

    const canonicalRef = canonicalizeReference(rawTarget);

    setFetchingText(true);
    setFetchSource(null);

    try {
      // Default to Embedded ESV Bank for instant local lookup in Verse Memory!
      const result = await fetchPassage(canonicalRef, '', true);
      if (result && (result.text || result.html)) {
        let plainText = "";

        if (result.text) {
          plainText = result.text;
        } else if (result.html) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = result.html;
          tempDiv.querySelectorAll('.footnote, .crossreference, .footnotes, .crossrefs, .versenum, .chapternum, .full-chap-link, .passage-scroller, h1, h2, h3, h4, h5, h6').forEach(el => el.remove());
          plainText = tempDiv.textContent || tempDiv.innerText || "";
        }

        plainText = cleanScriptureText(plainText);

        if (plainText && plainText.length > 3) {
          setNewText(plainText);
          setFetchSource(result.source || 'Embedded ESV Bank');
        }
      }
    } catch (e) {
      console.warn('Auto-fetch verse failed:', e);
    } finally {
      setFetchingText(false);
    }
  };

  // Trigger real-time auto-fetch as the user types reference (ALLOW SPACES NATURALLY)
  const handleRefInputChange = (e) => {
    const val = e.target.value;
    setNewRef(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (val.trim().length >= 2) {
      debounceTimer.current = setTimeout(() => {
        handleAutoFetchText(val);
      }, 400);
    }
  };

  const handleCreateVerse = (e) => {
    e.preventDefault();
    if (!newRef || !newText) return;

    const canonicalRef = canonicalizeReference(newRef);
    const cleanedContent = cleanScriptureText(newText);

    onAddVerse({
      id: `custom-${Date.now()}`,
      reference: canonicalRef,
      text: cleanedContent,
      note: newNote || "Custom Scripture",
      color: newColor,
      tags: ["Custom", canonicalRef.split(' ')[0]],
      dateAdded: new Date().toISOString().split('T')[0],
      masteryLevel: 0,
      stageProgress: 1,
      reviewCount: 0
    });
    setNewRef('');
    setNewText('');
    setNewNote('');
    setFetchSource(null);
    setShowAddModal(false);
  };

  // Open Edit Modal for a given verse
  const handleStartEditVerse = (verse) => {
    setEditingVerse(verse);
    setEditRef(verse.reference);
    setEditText(verse.text);
    setEditNote(verse.note || '');
    setEditColor(verse.color || 'gold');
    setEditFetchSource(null);
  };

  const handleSaveEditedVerse = (e) => {
    e.preventDefault();
    if (!editingVerse || !editRef || !editText) return;

    const canonicalRef = canonicalizeReference(editRef);
    const cleanedContent = cleanScriptureText(editText);

    if (onUpdateVerse) {
      onUpdateVerse({
        ...editingVerse,
        reference: canonicalRef,
        text: cleanedContent,
        note: editNote || "Custom Scripture",
        color: editColor
      });
    }

    setEditingVerse(null);
  };

  const handleAutoFetchEditText = async (refToFetch) => {
    const rawTarget = refToFetch || editRef;
    if (!rawTarget || rawTarget.trim().length < 2) return;

    const canonicalRef = canonicalizeReference(rawTarget);
    setFetchingEditText(true);
    setEditFetchSource(null);

    try {
      const result = await fetchPassage(canonicalRef, '', true);
      if (result && (result.text || result.html)) {
        let plainText = "";
        if (result.text) {
          plainText = result.text;
        } else if (result.html) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = result.html;
          tempDiv.querySelectorAll('.footnote, .crossreference, .footnotes, .crossrefs, .versenum, .chapternum, .full-chap-link, .passage-scroller, h1, h2, h3, h4, h5, h6').forEach(el => el.remove());
          plainText = tempDiv.textContent || tempDiv.innerText || "";
        }

        plainText = cleanScriptureText(plainText);
        if (plainText && plainText.length > 3) {
          setEditText(plainText);
          setEditFetchSource(result.source || 'Embedded ESV Bank');
        }
      }
    } catch (e) {
      console.warn('Auto-fetch edit verse failed:', e);
    } finally {
      setFetchingEditText(false);
    }
  };

  const handleEditRefInputChange = (e) => {
    const val = e.target.value;
    setEditRef(val);

    if (editDebounceTimer.current) clearTimeout(editDebounceTimer.current);

    if (val.trim().length >= 2) {
      editDebounceTimer.current = setTimeout(() => {
        handleAutoFetchEditText(val);
      }, 400);
    }
  };

  const getColorStyle = (color) => {
    switch (color) {
      case 'emerald': return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
      case 'cyan': return 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300';
      case 'rose': return 'border-rose-500/40 bg-rose-950/20 text-rose-300';
      case 'purple': return 'border-purple-500/40 bg-purple-950/20 text-purple-300';
      default: return 'border-amber-500/40 bg-amber-950/20 text-amber-300';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Treasury ({savedVerses.length} Saved Items)</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-100">Saved Verses & Embedded ESV Bank</h2>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Sorted <strong>alphabetically by reference</strong>. Pre-loaded with <strong>{dbCount.toLocaleString()} embedded ESV verses</strong> in memory!
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Verse</span>
          </button>
        </div>
      </div>

      {/* Overall Memorization Progress Stats Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/40 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>Overall Treasury Memorization Progress</span>
            </span>
            <span className="text-emerald-400 font-bold text-sm">{avgMastery}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${avgMastery}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 border-l border-slate-800/80 pl-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-sans">Mastered (100%)</div>
            <div className="text-lg font-serif font-bold text-amber-300">{masteredCount} / {totalVerses} Verses</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 border-l border-slate-800/80 pl-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-sans">Total Reviews Tracked</div>
            <div className="text-lg font-serif font-bold text-emerald-300">{totalReviews} Times</div>
          </div>
        </div>
      </div>

      {/* Search & Color Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search memory verses or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-sans"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Filter by Color:</span>
          {['all', 'gold', 'emerald', 'cyan', 'rose', 'purple'].map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedColor === color
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Verses Grid sorted Alphabetically */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedFilteredVerses.map((verse) => (
          <div
            key={verse.id}
            className={`glass-card p-6 rounded-2xl border ${getColorStyle(verse.color)} flex flex-col justify-between h-[320px] max-h-[320px] overflow-hidden shadow-xl transition-all hover:border-amber-500/50`}
          >
            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <span className="font-serif font-bold text-lg text-amber-300 truncate max-w-[70%]">{verse.reference}</span>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-sans">{verse.dateAdded}</span>
                  <button
                    onClick={() => handleStartEditVerse(verse)}
                    className="p-1 rounded text-slate-500 hover:text-amber-300 hover:bg-slate-900"
                    title="Edit verse reference, text, note, or color"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteVerse(verse.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900"
                    title="Delete saved verse"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Passage Container for Long Passages */}
              <div className="flex-1 overflow-y-auto pr-2 my-1 min-h-0 border-y border-slate-800/40 py-2">
                <p className="font-serif text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  "{cleanScriptureText(verse.text)}"
                </p>
              </div>

              {verse.note && (
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2 shrink-0 mt-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="truncate">{verse.note}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between shrink-0 mt-2">
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <div>Mastery: <span className="font-bold text-amber-400">{verse.masteryLevel || 0}%</span></div>
                <div className="text-[11px] text-slate-400 font-sans">Reviewed: <span className="font-bold text-emerald-300">{verse.reviewCount || 0}x</span></div>
              </div>

              <button
                onClick={() => onPracticeVerse(verse)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Practice Memorizing</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Verse Modal with Real-Time Auto-Population */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-xl font-serif font-bold text-slate-100">Add Verse or Chapter to Memorize</h3>
            <p className="text-xs text-slate-400 font-sans">
              Type any reference (e.g. <span className="text-amber-300 font-semibold">2 cor 4</span>, <span className="text-amber-300 font-semibold">Genesis 1</span>, <span className="text-amber-300 font-semibold">Proverbs 3:5-6</span>) and text populates instantly!
            </p>

            <form onSubmit={handleCreateVerse} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Passage Reference</label>
                  {fetchSource && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Populated from: {fetchSource}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type reference e.g. 2 cor 4, gen 1, isaiah 40:28-31"
                    value={newRef}
                    onChange={handleRefInputChange}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-serif font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoFetchText(newRef)}
                    disabled={fetchingText || !newRef}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {fetchingText ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{fetchingText ? 'Fetching...' : 'Auto-Fetch'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scripture Text (Clean ESV Text)
                </label>
                <textarea
                  rows={5}
                  placeholder="Scripture populates automatically here as you type the reference above..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-serif leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Note / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter Target, Comfort"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Save to Memory Treasury
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Treasury Verse Modal */}
      {editingVerse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-text">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-amber-500/40 space-y-4 shadow-2xl bg-slate-950/95">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-slate-100 flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Edit Treasury Verse</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {editingVerse.reference}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingVerse(null)}
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                  title="Close without saving (Discard changes)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Update passage reference, text, note, or color. Changes update in real-time across your local app!
            </p>

            <form onSubmit={handleSaveEditedVerse} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Passage Reference</label>
                  {editFetchSource && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Populated from: {editFetchSource}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type reference e.g. 2 cor 4, gen 1, isaiah 40:28-31"
                    value={editRef}
                    onChange={handleEditRefInputChange}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-serif font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoFetchEditText(editRef)}
                    disabled={fetchingEditText || !editRef}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {fetchingEditText ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{fetchingEditText ? 'Fetching...' : 'Re-Fetch'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scripture Text (Clean ESV Text)
                </label>
                <textarea
                  rows={5}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-serif leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Note / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter Target, Comfort"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-medium">Color:</span>
                  {['gold', 'emerald', 'cyan', 'rose', 'purple'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditColor(color)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize transition-all ${
                        editColor === color
                          ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400/50'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
