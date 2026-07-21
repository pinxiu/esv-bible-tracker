import React, { useState, useEffect } from 'react';
import { generateStageDisplay, validateVerseInput } from '../utils/textNormalizer';
import { BrainCircuit, CheckCircle, Sparkles, RefreshCw, SlidersHorizontal, ChevronRight, Award, Trophy } from 'lucide-react';

export default function MemoryVersesView({
  savedVerses,
  activeMemoryVerse,
  setActiveMemoryVerse,
  onUpdateMastery,
  settings,
  onUpdateSettings
}) {
  const [stage, setStage] = useState(1); // 1: Full, 2: Every Other, 3: First Letter, 4: Blind
  const [userInput, setUserInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [validation, setValidation] = useState({ isExactMatch: false, isPartialMatch: true, accuracy: 0 });

  // Currently practicing verse
  const verse = activeMemoryVerse || savedVerses[0] || {
    id: "default-1",
    reference: "Genesis 1:1",
    text: "In the beginning, God created the heavens and the earth.",
    masteryLevel: 50
  };

  useEffect(() => {
    setUserInput('');
    setIsCompleted(false);
  }, [verse.id, stage]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setUserInput(val);

    const res = validateVerseInput(val, verse.text, {
      ignoreCaps: settings.ignoreCaps,
      ignorePunctuation: settings.ignorePunctuation,
      ignoreSpaces: settings.ignoreSpaces
    });

    setValidation(res);

    if (res.isExactMatch) {
      setIsCompleted(true);
      const newMastery = Math.min(100, (verse.masteryLevel || 0) + 15);
      onUpdateMastery(verse.id, newMastery);
    }
  };

  const handleNextStage = () => {
    if (stage < 4) {
      setStage(stage + 1);
    } else {
      setStage(1);
    }
    setUserInput('');
    setIsCompleted(false);
  };

  const maskedHint = generateStageDisplay(verse.text, stage);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Typewriter Memory Platform</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-100">Scripture Memorization</h2>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Typewrite verses through 4 progressive stages to build deep memorization recall.
          </p>
        </div>

        {/* Verse Selector Dropdown */}
        <select
          value={verse.id}
          onChange={(e) => {
            const selected = savedVerses.find(v => v.id === e.target.value);
            if (selected) setActiveMemoryVerse(selected);
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
        >
          {savedVerses.map((v) => (
            <option key={v.id} value={v.id}>
              {v.reference} - {v.text.substring(0, 30)}...
            </option>
          ))}
        </select>
      </div>

      {/* Stage Progression Bar & Toggles */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* 4 Stages Selector */}
        <div className="flex items-center space-x-2">
          {[
            { id: 1, name: "Stage 1", desc: "Full Text" },
            { id: 2, name: "Stage 2", desc: "Every Other Word" },
            { id: 3, name: "Stage 3", desc: "First Letter Only" },
            { id: 4, name: "Stage 4", desc: "Blind Memory" }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStage(s.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                stage === s.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              <div>{s.name}</div>
              <div className="text-[10px] opacity-80">{s.desc}</div>
            </button>
          ))}
        </div>

        {/* Tolerances & Toggles */}
        <div className="flex items-center space-x-3 text-xs bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1" />

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={settings.ignoreCaps}
              onChange={(e) => onUpdateSettings({ ...settings, ignoreCaps: e.target.checked })}
              className="accent-amber-500 rounded"
            />
            <span>Ignore Caps</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={settings.ignorePunctuation}
              onChange={(e) => onUpdateSettings({ ...settings, ignorePunctuation: e.target.checked })}
              className="accent-amber-500 rounded"
            />
            <span>Ignore Punctuation</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={settings.ignoreSpaces}
              onChange={(e) => onUpdateSettings({ ...settings, ignoreSpaces: e.target.checked })}
              className="accent-amber-500 rounded"
            />
            <span>Ignore Spaces</span>
          </label>
        </div>
      </div>

      {/* Main Practice Workspace */}
      <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
        {/* Reference Title & Mastery */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="font-serif font-bold text-2xl text-amber-400">{verse.reference}</h3>
          <div className="flex items-center space-x-2 text-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Mastery Level:</span>
            <span className="font-bold text-amber-300">{verse.masteryLevel || 0}%</span>
          </div>
        </div>

        {/* Visual Prompt / Masked Hint Area */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 min-h-[120px] flex items-center">
          <p className="font-serif text-xl leading-relaxed text-slate-300 tracking-wide select-none">
            {maskedHint}
          </p>
        </div>

        {/* Typewriter Input Field */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-sans text-slate-400">
            <span>Typewrite the verse below:</span>
            <span>Accuracy: <strong className="text-amber-400">{validation.accuracy}%</strong></span>
          </div>

          <textarea
            rows={4}
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing the verse here..."
            disabled={isCompleted}
            className={`w-full p-4 rounded-xl font-serif text-lg leading-relaxed bg-slate-900 border transition-all focus:outline-none ${
              isCompleted
                ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                : validation.isPartialMatch
                ? 'border-amber-500/50 text-slate-100 focus:border-amber-400'
                : 'border-rose-500/60 bg-rose-950/10 text-rose-200'
            }`}
          />
        </div>

        {/* Completed Celebration & Next Stage Action */}
        {isCompleted && (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-lg">Stage {stage} Complete! Perfect Match!</h4>
                <p className="text-xs text-emerald-200/80 font-sans">
                  Great job! Your mastery score increased for {verse.reference}.
                </p>
              </div>
            </div>

            <button
              onClick={handleNextStage}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              <span>{stage < 4 ? `Advance to Stage ${stage + 1}` : 'Restart Practice'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
