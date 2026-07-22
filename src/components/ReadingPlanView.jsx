import React, { useState } from 'react';
import { CheckCircle2, Circle, BookOpen, ExternalLink, Calendar, Filter, Sparkles, Check, AlertCircle, BookCheck, Trophy, BrainCircuit, Play, ArrowRight } from 'lucide-react';
import { isDatePast, isDateToday, getTodayBeijingMonthDay, getTodayBeijingMD } from '../utils/dateUtils';
import todayVerseBg from '../assets/today_verse_bg.jpg';

const DAILY_VERSES = [
  {
    ref: "Psalm 119:105",
    text: "Your word is a lamp to my feet and a light to my path."
  },
  {
    ref: "Joshua 1:9",
    text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go."
  },
  {
    ref: "Isaiah 40:8",
    text: "The grass withers, the flower fades, but the word of our God will stand forever."
  },
  {
    ref: "Romans 15:4",
    text: "For whatever was written in former days was written for our instruction, that through endurance and through the encouragement of the Scriptures we might have hope."
  },
  {
    ref: "Proverbs 3:5-6",
    text: "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths."
  },
  {
    ref: "Psalm 19:7",
    text: "The law of the LORD is perfect, reviving the soul; the testimony of the LORD is sure, making wise the simple;"
  },
  {
    ref: "Matthew 4:4",
    text: "But he answered, \" It is written, \"'Man shall not live by bread alone, but by every word that comes from the mouth of God.'\"\""
  },
  {
    ref: "Colossians 3:16",
    text: "Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom, singing psalms and hymns and spiritual songs, with thankfulness in your hearts to God."
  },
  {
    ref: "2 Timothy 3:16",
    text: "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness,"
  },
  {
    ref: "Psalm 119:11",
    text: "I have stored up your word in my heart, that I might not sin against you."
  },
  {
    ref: "Hebrews 4:12",
    text: "For the word of God is living and active, sharper than any two-edged sword, piercing to the division of soul and of spirit, of joints and of marrow, and discerning the thoughts and intentions of the heart."
  },
  {
    ref: "James 1:22",
    text: "But be doers of the word, and not hearers only, deceiving yourselves."
  }
];

function getDailyVerse() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

export default function ReadingPlanView({
  planData = [],
  onTogglePassage,
  onToggleDay,
  onOpenPassage,
  onOpenCommentary,
  todayDateStr,
  missedDaysCount = 0,
  onCatchUpOldest,
  onCatchUpToday,
  setActiveTab
}) {
  const [filter, setFilter] = useState('today'); // 'today', 'all', 'missed', 'completed'
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
            { id: 'today', label: `Today (${todayMonthDayStr})` },
            { id: 'all', label: 'All 52 Weeks' },
            { id: 'missed', label: `Missed (${missedDaysCount})` },
            { id: 'completed', label: 'Completed' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                setFilter(btn.id);
                if (btn.id !== 'all') {
                  setSearchQuery('');
                }
              }}
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
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            if (val && filter !== 'all') {
              setFilter('all');
            }
          }}
          className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-sans"
        />
      </div>

      {/* Reading Plan Grid / List or Today Dashboard */}
      {filter === 'today' ? (
        <div className="space-y-6">
          {/* Upper Section: Side-by-Side (Schedule & Stats/Next Steps) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Today's Schedule Card */}
            {filteredPlan.length > 0 ? (
              filteredPlan.map(item => {
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
              })
            ) : (
              <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center text-center min-h-[220px] space-y-3">
                <Calendar className="w-8 h-8 text-amber-550/80 animate-pulse" />
                <h4 className="text-sm font-serif font-bold text-slate-200">Rest Day</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  No readings scheduled for today. Take this time to catch up on missed days or review memory verses!
                </p>
              </div>
            )}

            {/* Right: Stats, Badges & Next Steps Panel */}
            {(() => {
              const completedDaysCount = planData.filter(item => item.completed).length;
              const totalDaysCount = planData.length || 260;
              const readingProgressPercent = Math.round((completedDaysCount / totalDaysCount) * 100) || 0;
              const savedVerses = JSON.parse(localStorage.getItem('esv_saved_verses') || '[]');
              const savedVersesCount = savedVerses.length;

              // Generate badges dynamically
              const badges = [];
              if (savedVersesCount > 0) badges.push({ text: "📖 Word Guardian", color: "bg-purple-500/10 text-purple-300 border-purple-500/30" });
              if (missedDaysCount === 0 && completedDaysCount > 0) badges.push({ text: "🔥 Consistent", color: "bg-orange-500/10 text-orange-300 border-orange-500/30" });
              if (readingProgressPercent > 5) badges.push({ text: "🚀 On Track", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" });
              if (badges.length === 0) badges.push({ text: "🌱 Beginner", color: "bg-sky-500/10 text-sky-300 border-sky-500/30" });

              return (
                <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/20 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center space-x-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Progress & Next Steps</span>
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {badges.map((badge, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                          >
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">Reading Plan</div>
                        <div className="text-sm font-serif font-bold text-amber-450 mt-0.5">
                          {readingProgressPercent}% <span className="text-[10px] text-slate-500 font-sans font-normal">({completedDaysCount}/{totalDaysCount})</span>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">Memory Verses</div>
                        <div className="text-sm font-serif font-bold text-sky-450 mt-0.5">
                          {savedVersesCount} <span className="text-[10px] text-slate-500 font-sans font-normal">saved</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Items / Next Steps */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Action Items</h5>
                      
                      {/* Catch Up Action */}
                      {missedDaysCount > 0 && (
                        <div className="p-2.5 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-2 min-w-0">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-450 shrink-0" />
                            <span className="text-xs text-rose-300 font-semibold truncate">
                              Catch up on {missedDaysCount} missed day{missedDaysCount > 1 ? 's' : ''}
                            </span>
                          </div>
                          <button
                            onClick={onCatchUpOldest}
                            className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 text-[10px] font-bold shadow transition-all shrink-0 flex items-center space-x-1"
                          >
                            <span>Start</span>
                            <Play className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
                          </button>
                        </div>
                      )}

                      {/* Memory Practice Action */}
                      <div className="p-2.5 bg-sky-500/5 border border-sky-500/20 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 min-w-0">
                          <BrainCircuit className="w-3.5 h-3.5 text-sky-455 shrink-0" />
                          <span className="text-xs text-sky-300 font-semibold truncate">
                            Practice your scripture memorization
                          </span>
                        </div>
                        {setActiveTab && (
                          <button
                            onClick={() => setActiveTab('memory')}
                            className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-bold shadow transition-all shrink-0 flex items-center space-x-1"
                          >
                            <span>Practice</span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-950" />
                          </button>
                        )}
                      </div>

                      {/* Browse All Plan Action */}
                      <div className="p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 min-w-0">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-xs text-amber-300 font-semibold truncate">
                            Explore full reading schedule
                          </span>
                        </div>
                        <button
                          onClick={() => setFilter('all')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold shadow transition-all shrink-0 flex items-center space-x-1"
                        >
                          <span>Browse</span>
                          <ArrowRight className="w-2.5 h-2.5 text-slate-950" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Lower Section: Verse of the Day (Full-width, fills the rest of screen) */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl p-8 text-center min-h-[220px] flex flex-col justify-center">
            {/* Background image overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
              style={{ backgroundImage: `url(${todayVerseBg})` }}
            />
            {/* Dark vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-2xl mx-auto flex flex-col justify-center">
              <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400/90 bg-amber-400/10 px-2.5 py-0.5 rounded-full w-max mx-auto border border-amber-400/20">
                Verse of the Day
              </span>
              
              <div className="space-y-3">
                <blockquote className="text-base sm:text-lg lg:text-xl font-serif italic text-slate-100 leading-relaxed font-semibold">
                  “{getDailyVerse().text}”
                </blockquote>
                <cite className="block text-xs font-sans font-bold tracking-wider text-amber-300 uppercase not-italic">
                  — {getDailyVerse().ref}
                </cite>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
      )}

      {/* Empty State for other filters (search / missed / completed empty lists) */}
      {filteredPlan.length === 0 && filter !== 'today' && (
        <div className="col-span-full text-center py-12 text-slate-500 font-sans">
          No reading items match your current filter selection.
        </div>
      )}
    </div>
  );
}
