import React, { useState } from 'react';
import { Calendar, BookOpen, BrainCircuit, Bookmark, Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2, Award, Search, BarChart2, RefreshCw } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      id: 1,
      title: "Welcome to ESV Bible Tracker",
      subtitle: "Your desktop companion for 52-week Bible reading & Scripture memorization.",
      icon: Sparkles,
      color: "text-amber-400 bg-amber-500/20 border-amber-500/30",
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed font-sans">
          <p>
            Welcome! This application is designed to guide you through your <strong>52-Week Chronological Bible Reading Plan</strong> while providing a powerful <strong>Typewriter Scripture Memory Workspace</strong>.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-amber-300">✨ Key App Features:</div>
            <div>• <strong>52-Week Reading Plan:</strong> Chronological reading with Catch-Up Assistant</div>
            <div>• <strong>Typewriter Memorization:</strong> 4 stages, reference typing & real-time stats</div>
            <div>• <strong>Scripture Treasury:</strong> Edit, tag, auto-fetch & organize memory verses</div>
            <div>• <strong>Developer Debug Console:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">Ctrl+Shift+D</kbd> for live logs & diagnostic tools</div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Reading Plan, Smart Defaults & Catch-Up",
      subtitle: "Never lose momentum — defaults to your next unread passage automatically.",
      icon: Calendar,
      color: "text-sky-400 bg-sky-500/20 border-sky-500/30",
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed font-sans">
          <p>
            The ESV Reader automatically defaults to your <strong>next unread passage</strong> in the reading plan if no passage is loaded. If you fall behind:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <strong>1. Sequential Catch-Up:</strong> Instantly jumps to your oldest uncompleted reading date.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <strong>2. Start from Today:</strong> Jumps straight to today's reading while preserving past progress.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "ESV Reader, Multi-Chapter Ranges & Instant Tooltips",
      subtitle: "Read passage ranges, view footnotes & instant online/offline bank tooltips.",
      icon: BookOpen,
      color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed font-sans">
          <p>
            Type single passages or multi-chapter ranges (e.g. <span className="text-amber-300 font-semibold">Gen 16-18</span>, <span className="text-amber-300 font-semibold">2 Timothy 1</span>) to read with authentic ESV formatting.
          </p>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="text-emerald-300 font-semibold">🔍 Interactive Reader Highlights:</div>
            <div>• <strong>Multi-Chapter Ranges:</strong> Automatically fetches and formats ranges like <em>Gen 16-18</em></div>
            <div>• <strong>Instant Bank Tooltips:</strong> Instant 0ms white-text tooltips for Bible Gateway vs Embedded ESV Bank</div>
            <div>• <strong>Offline Detection:</strong> Gateway toggle greys out offline with instant status info</div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Scripture Treasury & Real-Time Verse Editing",
      subtitle: "Save, edit, auto-fetch & track real-time mastery & review counts.",
      icon: Bookmark,
      color: "text-rose-400 bg-rose-500/20 border-rose-500/30",
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed font-sans">
          <p>
            Save verses directly from the Reader or add custom verses. Your Treasury is automatically sorted <strong>alphabetically by reference</strong>!
          </p>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="text-rose-300 font-semibold">✏️ Treasury & Editing Highlights:</div>
            <div>• <strong>Edit Verses:</strong> Click the Pencil icon to edit reference, text, note, or color</div>
            <div>• <strong>Auto-Fetch in Edit:</strong> Re-fetches clean ESV text automatically when updating references</div>
            <div>• <strong>Real-Time Stats:</strong> Verse mastery % and review counters update instantly upon practice</div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Typewriter & Verse-by-Verse Memorization",
      subtitle: "Embedded ESV loading, proportional stage progress & smart verse navigation!",
      icon: BrainCircuit,
      color: "text-purple-400 bg-purple-500/20 border-purple-500/30",
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed font-sans">
          <p>
            Practice memorization with green letter matches, smart stage defaults, and instant offline Embedded ESV loading.
          </p>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="text-purple-300 font-semibold">⚡ Verse-by-Verse & Typewriter Highlights:</div>
            <div>• <strong>Embedded ESV Data:</strong> Verse-by-verse mode pulls directly from embedded ESV data 100% offline</div>
            <div>• <strong>High-Performance Viewport:</strong> 600-char sliding window renders long passages like Matthew 5 instantly</div>
            <div>• <strong>Proportional Progress:</strong> Partial verse completion updates mastery % proportionally</div>
            <div>• <strong>Smart Verse Navigation:</strong> Dynamic buttons jump to previous or next unfinished verses</div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];
  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-panel rounded-3xl p-7 border border-amber-500/30 shadow-2xl relative space-y-6">
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 text-xs flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 transition-all"
        >
          <span>Dismiss / Don't Show Again</span>
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center space-x-1.5">
          {steps.map(s => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s.id === step ? 'w-8 bg-amber-400' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
          <span className="text-[10px] text-slate-400 font-sans ml-2 font-semibold">
            Step {step} of 5
          </span>
        </div>

        {/* Step Header */}
        <div className="flex items-center space-x-4">
          <div className={`p-3.5 rounded-2xl border ${currentStep.color}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-100">{currentStep.title}</h3>
            <p className="text-xs text-amber-400 font-sans mt-0.5">{currentStep.subtitle}</p>
          </div>
        </div>

        {/* Step Body Content */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 min-h-[145px] flex items-center">
          {currentStep.content}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Get Started!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
