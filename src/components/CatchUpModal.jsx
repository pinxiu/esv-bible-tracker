import React from 'react';
import { AlertTriangle, Play, Calendar, CheckCircle2, X } from 'lucide-react';

export default function CatchUpModal({ isOpen, onClose, missedList, onSelectCatchUp, onSelectToday }) {
  if (!isOpen || !missedList || missedList.length === 0) return null;

  const oldestMissed = missedList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 border border-amber-500/30 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-100">Catch Up on Bible Readings</h3>
            <p className="text-xs text-amber-400 font-sans">You have {missedList.length} uncompleted days prior to today (July 20)</p>
          </div>
        </div>

        {/* Missed Readings Preview */}
        <div className="my-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>Earliest Missed Reading:</span>
            <span className="font-semibold text-amber-300">Week {oldestMissed.week} ({oldestMissed.date})</span>
          </div>
          <p className="font-serif text-sm font-semibold text-slate-200">{oldestMissed.text}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              onSelectCatchUp(oldestMissed);
              onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Catch Up from {oldestMissed.date} (Sequential)</span>
          </button>

          <button
            onClick={() => {
              onSelectToday();
              onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Start from Today (July 20)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
