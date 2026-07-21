import React, { useState } from 'react';
import { CheckCircle2, Circle, BookOpen, ExternalLink, Calendar, Filter, Sparkles, Check, AlertCircle, BookCheck } from 'lucide-react';
import { isDatePast, isDateToday, getTodayBeijingMonthDay, getTodayBeijingMD } from '../utils/dateUtils';

export default function ReadingPlanView({
  planData = [],
  onTogglePassage,
  onToggleDay,
  onOpenPassage,
  onOpenCommentary,
  todayDateStr,
  missedDaysCount = 0,
  onCatchUpOldest,
  onCatchUpToday
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'missed', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  const todayMonthDayStr = getTodayBeijingMonthDay();
  const todayBeijingMD = getTodayBeijingMD();

  const safePlan = Array.isArray(planData) ? planData : [];

  const filteredPlan = safePlan.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = (item.text || '').toLowerCase().includes(q) || (item.date || '').toLowerCase().includes(q) || `week ${item.week}`.includes(q);
      if (!matchText) return false;
    }

    const isCompleted = !!item.completed;
    const isMissed = !isCompleted && isDatePast(item.date, item.year);
    const isToday = isDateToday(item.date, item.year);

    if (filter === 'today') return isToday;
    if (filter === 'missed') return isMissed;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Beijing Time Zone (UTC+8) • Today is {todayMonthDayStr} ({todayBeijingMD})</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-100">52-Week Chronological Reading Plan</h2>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Check off individual books/passages each day, catch up on past readings, and read ESV commentaries.
          </p>
        </div>

        {/* Catch-Up Assistant Alert Banner */}
        {missedDaysCount > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{missedDaysCount} Uncompleted Missed Days</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onCatchUpOldest}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all"
              >
                Catch Up (Oldest)
              </button>
              <button
                onClick={onCatchUpToday}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Start Today
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All 52 Weeks' },
            { id: 'today', label: `Today (${todayMonthDayStr})` },
            { id: 'missed', label: `Missed (${missedDaysCount})` },
            { id: 'completed', label: 'Completed' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === btn.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search passages, books, weeks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-sans"
        />
      </div>

      {/* Reading Plan Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlan.map(item => {
          const isCompleted = !!item.completed;
          const isMissed = !isCompleted && isDatePast(item.date, item.year);
          const isToday = isDateToday(item.date, item.year);

          const passagesList = item.passages && item.passages.length > 0
            ? item.passages
            : (item.text ? item.text.split(/;\s*/) : []);

          const completedPassages = item.completedPassages || {};
          const completedCount = passagesList.filter(p => completedPassages[p]).length;

          return (
            <div
              key={item.id || `${item.week}-${item.day}`}
              className={`glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isToday
                  ? 'border-amber-500/50 bg-amber-950/20 ring-1 ring-amber-500/30'
                  : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : isMissed
                      ? 'border-rose-500/30 bg-rose-950/10'
                      : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Week, Date, Status */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                      Week {item.week}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">{item.date}</span>
                    {isToday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Day Status Badge */}
                  <div className="flex items-center space-x-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {completedCount} / {passagesList.length} Read
                    </span>
                  </div>
                </div>

                {/* Individual Passages Breakdown */}
                <div className="space-y-2">
                  {passagesList.map((passage, pIdx) => {
                    const isPassageDone = !!completedPassages[passage];
                    return (
                      <div
                        key={pIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          isPassageDone
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                            : 'bg-slate-900/60 border-slate-800/90 text-slate-200 hover:border-amber-500/30'
                        }`}
                      >
                        {/* Passage Checkbox & Reference */}
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          <button
                            onClick={() => onTogglePassage(item.day || item.id, passage)}
                            className="p-0.5 rounded text-slate-400 hover:text-amber-400 transition-colors shrink-0"
                            title={isPassageDone ? `Uncheck ${passage}` : `Mark ${passage} read`}
                          >
                            {isPassageDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500 hover:text-amber-400" />
                            )}
                          </button>
                          <span className={`font-serif text-sm font-semibold truncate ${isPassageDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {passage}
                          </span>
                        </div>

                        {/* Per-Passage Read & Notes Action Buttons */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => onOpenPassage(passage)}
                            className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                            title={`Read ${passage} in ESV Reader`}
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Read</span>
                          </button>

                          <button
                            onClick={() => onOpenCommentary(passage)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-300 border border-slate-700 text-[11px] transition-all"
                            title={`Open commentaries for ${passage}`}
                          >
                            <ExternalLink className="w-3 h-3 text-sky-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Whole Day Completed Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Mark all passages:</span>
                <button
                  onClick={() => onToggleDay(item.day || item.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  <BookCheck className="w-3.5 h-3.5" />
                  <span>{isCompleted ? 'Day Completed! 🎉' : 'Complete All'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
