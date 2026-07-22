import React, { useState } from 'react';
import { CheckCircle2, Circle, BookOpen, ExternalLink, Calendar, Filter, Sparkles, Check, AlertCircle, BookCheck, Trophy, BrainCircuit, Play, ArrowRight } from 'lucide-react';
import { isDatePast, isDateToday, getTodayBeijingMonthDay, getTodayBeijingMD, getTodayBeijingDate, getUserTimezone } from '../utils/dateUtils';
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

const TROPHIES = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete 1 reading day',
    icon: '🌱',
    type: 'reading_count',
    targetValue: 1,
    color: 'bg-emerald-500/10 text-emerald-350 border-emerald-500/30',
    check: (streak, completedDays, mastered) => completedDays >= 1
  },
  {
    id: 'daily_devotee',
    name: 'Daily Devotee',
    description: 'Reach a 5-day reading streak',
    icon: '🔥',
    type: 'reading_streak',
    targetValue: 5,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    check: (streak, completedDays, mastered) => streak >= 5
  },
  {
    id: 'scripture_sower',
    name: 'Scripture Sower',
    description: 'Master at least 1 memory verse',
    icon: '🌾',
    type: 'memory_count',
    targetValue: 1,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    check: (streak, completedDays, mastered) => mastered >= 1
  },
  {
    id: 'word_guardian',
    name: 'Word Guardian',
    description: 'Master 5 memory verses',
    icon: '🛡️',
    type: 'memory_count',
    targetValue: 5,
    color: 'bg-rose-500/10 text-rose-450 border-rose-500/30',
    check: (streak, completedDays, mastered) => mastered >= 5
  },
  {
    id: 'scripture_explorer',
    name: 'Scripture Explorer',
    description: 'Reach a 15-day reading streak',
    icon: '🧭',
    type: 'reading_streak',
    targetValue: 15,
    color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    check: (streak, completedDays, mastered) => streak >= 15
  },
  {
    id: 'scripture_champion',
    name: 'Scripture Champion',
    description: 'Master 15 memory verses',
    icon: '🏆',
    type: 'memory_count',
    targetValue: 15,
    color: 'bg-yellow-500/10 text-yellow-450 border-yellow-500/30',
    check: (streak, completedDays, mastered) => mastered >= 15
  },
  {
    id: 'daily_bread',
    name: 'Daily Bread',
    description: 'Complete 25 reading days',
    icon: '🍞',
    type: 'reading_count',
    targetValue: 25,
    color: 'bg-amber-500/10 text-amber-350 border-amber-500/30',
    check: (streak, completedDays, mastered) => completedDays >= 25
  },
  {
    id: 'light_bearer',
    name: 'Light Bearer',
    description: 'Reach a 30-day reading streak',
    icon: '✨',
    type: 'reading_streak',
    targetValue: 30,
    color: 'bg-amber-500/10 text-amber-450 border-amber-500/30',
    check: (streak, completedDays, mastered) => streak >= 30
  },
  {
    id: 'wisdom_king',
    name: 'Wisdom King',
    description: 'Master 30 memory verses',
    icon: '👑',
    type: 'memory_count',
    targetValue: 30,
    color: 'bg-yellow-550/10 text-yellow-550 border-yellow-550/30',
    check: (streak, completedDays, mastered) => mastered >= 30
  },
  {
    id: 'constant_reader',
    name: 'Constant Reader',
    description: 'Complete 50 reading days',
    icon: '📖',
    type: 'reading_count',
    targetValue: 50,
    color: 'bg-sky-500/10 text-sky-350 border-sky-500/30',
    check: (streak, completedDays, mastered) => completedDays >= 50
  },
  {
    id: 'covenant_streak',
    name: 'Covenant Streak',
    description: 'Reach a 50-day reading streak',
    icon: '🔥',
    type: 'reading_streak',
    targetValue: 50,
    color: 'bg-orange-550/10 text-orange-550 border-orange-550/30',
    check: (streak, completedDays, mastered) => streak >= 50
  },
  {
    id: 'word_vault',
    name: 'Word Vault',
    description: 'Master 50 memory verses',
    icon: '💎',
    type: 'memory_count',
    targetValue: 50,
    color: 'bg-sky-500/10 text-sky-455 border-sky-500/30',
    check: (streak, completedDays, mastered) => mastered >= 50
  },
  {
    id: 'scroll_keeper',
    name: 'Scroll Keeper',
    description: 'Master 75 memory verses',
    icon: '📜',
    type: 'memory_count',
    targetValue: 75,
    color: 'bg-purple-500/10 text-purple-450 border-purple-500/30',
    check: (streak, completedDays, mastered) => mastered >= 75
  },
  {
    id: 'covenant_keeper',
    name: 'Covenant Keeper',
    description: 'Complete 100 reading days',
    icon: '🛡️',
    type: 'reading_count',
    targetValue: 100,
    color: 'bg-emerald-500/10 text-emerald-455 border-emerald-500/30',
    check: (streak, completedDays, mastered) => completedDays >= 100
  },
  {
    id: 'century_streak',
    name: 'Century Streak',
    description: 'Reach a 100-day reading streak',
    icon: '🔥',
    type: 'reading_streak',
    targetValue: 100,
    color: 'bg-red-500/10 text-red-400 border-red-500/30',
    check: (streak, completedDays, mastered) => streak >= 100
  },
  {
    id: 'temple_pillar',
    name: 'Temple Pillar',
    description: 'Master 100 memory verses',
    icon: '🏛️',
    type: 'memory_count',
    targetValue: 100,
    color: 'bg-amber-550/10 text-amber-550 border-amber-550/30',
    check: (streak, completedDays, mastered) => mastered >= 100
  },
  {
    id: 'eternal_flame',
    name: 'Eternal Flame',
    description: 'Master 150 memory verses',
    icon: '🔥',
    type: 'memory_count',
    targetValue: 150,
    color: 'bg-orange-500/10 text-orange-455 border-orange-500/30',
    check: (streak, completedDays, mastered) => mastered >= 150
  },
  {
    id: 'sanctuary_pillar',
    name: 'Sanctuary Pillar',
    description: 'Master 175 memory verses',
    icon: '🏛️',
    type: 'memory_count',
    targetValue: 175,
    color: 'bg-purple-550/10 text-purple-550 border-purple-550/30',
    check: (streak, completedDays, mastered) => mastered >= 175
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Complete 200 reading days',
    icon: '🏃',
    type: 'reading_count',
    targetValue: 200,
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    check: (streak, completedDays, mastered) => completedDays >= 200
  },
  {
    id: 'scripture_master',
    name: 'Scripture Master',
    description: 'Complete 260 days & master all treasury verses',
    icon: '👑',
    type: 'ultimate',
    targetValue: 260,
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    check: (streak, completedDays, mastered, totalVerses) => completedDays >= 260 && mastered >= (totalVerses || 195)
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
  const [showTrophyModal, setShowTrophyModal] = useState(false);

  const todayMonthDayStr = getTodayBeijingMonthDay();
  const todayBeijingMD = getTodayBeijingMD();

  const safePlan = Array.isArray(planData) ? planData : [];

  const completedDaysCount = safePlan.filter(item => item.completed).length;
  const totalDaysCount = safePlan.length || 260;
  const readingProgressPercent = Math.round((completedDaysCount / totalDaysCount) * 100) || 0;
  
  let savedVerses = [];
  try {
    savedVerses = JSON.parse(localStorage.getItem('esv_saved_verses') || '[]');
  } catch(e) {}
  const savedVersesCount = savedVerses.length;
  const masteredCount = savedVerses.filter(v => (v.masteryLevel || 0) === 100).length;
  const avgMastery = savedVersesCount > 0 
    ? Math.round(savedVerses.reduce((acc, v) => acc + (v.masteryLevel || 0), 0) / savedVersesCount) 
    : 0;

  // Sort unique reading completion dates to compute actual reading streak
  const completionDates = safePlan
    .map(item => item.completionDate)
    .filter(d => !!d)
    .sort();

  let activeReadingStreak = 0;
  if (completionDates.length > 0) {
    const uniqueDates = Array.from(new Set(completionDates)).sort((a, b) => new Date(a) - new Date(b));
    
    // Check if the streak is currently active (last completion must be today or yesterday)
    const todayStr = getTodayBeijingDate();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tz = getUserTimezone();
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    const yesterdayStr = formatter.format(yesterday);
    
    let lastDateStr = uniqueDates[uniqueDates.length - 1];
    
    if (lastDateStr === todayStr || lastDateStr === yesterdayStr) {
      activeReadingStreak = 1;
      let current = new Date(lastDateStr);
      
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const prev = new Date(uniqueDates[i]);
        const diffTime = Math.abs(current - prev);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          activeReadingStreak++;
          current = prev;
        } else if (diffDays > 1) {
          break;
        }
      }
    }
  }

  // Sort unique memory review dates to compute memory review streak
  const reviewDates = savedVerses
    .map(v => v.lastReviewed)
    .filter(d => !!d)
    .sort();

  let activeMemoryStreak = 0;
  if (reviewDates.length > 0) {
    const uniqueDates = Array.from(new Set(reviewDates)).sort((a, b) => new Date(a) - new Date(b));
    
    // Check if the streak is currently active (last review must be today or yesterday)
    const todayStr = getTodayBeijingDate(); // YYYY-MM-DD in active timezone
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tz = getUserTimezone();
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    const yesterdayStr = formatter.format(yesterday);
    
    let lastDateStr = uniqueDates[uniqueDates.length - 1];
    
    if (lastDateStr === todayStr || lastDateStr === yesterdayStr) {
      activeMemoryStreak = 1;
      let current = new Date(lastDateStr);
      
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const prev = new Date(uniqueDates[i]);
        const diffTime = Math.abs(current - prev);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          activeMemoryStreak++;
          current = prev;
        } else if (diffDays > 1) {
          break;
        }
      }
    }
  }

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
    <div className={`p-8 w-full max-w-7xl mx-auto flex flex-col gap-6 ${filter === 'today' ? 'h-full flex-1 min-h-0 pb-6' : 'pb-24'}`}>
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
      </div>      {filter === 'today' ? (
        <div className="flex-1 flex flex-col min-h-0 gap-6">
          {/* Upper Section: 3-Column Grid (1 col Today Schedule, 2 cols Stats/Next Steps) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch shrink-0">
            
            {/* Left: Today's Schedule Card (Col-span 1, identical width to plan list cards) */}
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
                    className={`col-span-1 glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
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
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
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

                              {/* Per-Passage Actions */}
                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  onClick={() => onOpenPassage(passage)}
                                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                                  title={`Read ${passage}`}
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>Read</span>
                                </button>

                                <button
                                  onClick={() => onOpenCommentary(passage)}
                                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-300 border border-slate-700 text-[11px] transition-all"
                                  title={`Commentaries`}
                                >
                                  <ExternalLink className="w-3 h-3 text-sky-400" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Toggle Whole Day Completed */}
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
              <div className="col-span-1 glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center text-center space-y-3">
                <Calendar className="w-8 h-8 text-amber-550/80 animate-pulse" />
                <h4 className="text-sm font-serif font-bold text-slate-200">Rest Day</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  No readings scheduled for today. Take this time to catch up on missed days or review memory verses!
                </p>
              </div>
            )}

            {/* Right: Progress, Streaks & Next Steps Panel (Col-span 2) */}
            <div className="col-span-1 md:col-span-2">
              {(() => {


                // Dynamic Reading Milestone
                let readingMilestoneText = "";
                const nextReadingStreakTrophy = TROPHIES.find(t => t.type === 'reading_streak' && !t.check(activeReadingStreak, completedDaysCount, masteredCount, savedVersesCount));
                const nextReadingCountTrophy = TROPHIES.find(t => t.type === 'reading_count' && !t.check(activeReadingStreak, completedDaysCount, masteredCount, savedVersesCount));
                
                if (nextReadingStreakTrophy) {
                  readingMilestoneText = `Reach ${nextReadingStreakTrophy.targetValue}-day streak to unlock '${nextReadingStreakTrophy.name}'! (Need ${nextReadingStreakTrophy.targetValue - activeReadingStreak} more)`;
                } else if (nextReadingCountTrophy) {
                  readingMilestoneText = `Complete ${nextReadingCountTrophy.targetValue} reading days to unlock '${nextReadingCountTrophy.name}'! (Need ${nextReadingCountTrophy.targetValue - completedDaysCount} more)`;
                } else {
                  readingMilestoneText = "All reading plan trophies unlocked! 👑";
                }

                // Dynamic Memory Milestone
                let memoryMilestoneText = "";
                const nextMemoryTrophy = TROPHIES.find(t => t.type === 'memory_count' && !t.check(activeReadingStreak, completedDaysCount, masteredCount, savedVersesCount));
                const nextUltimateTrophy = TROPHIES.find(t => t.type === 'ultimate' && !t.check(activeReadingStreak, completedDaysCount, masteredCount, savedVersesCount));

                if (nextMemoryTrophy) {
                  memoryMilestoneText = `Master ${nextMemoryTrophy.targetValue} verses to earn '${nextMemoryTrophy.name}'! (Need ${nextMemoryTrophy.targetValue - masteredCount} more)`;
                } else if (nextUltimateTrophy) {
                  memoryMilestoneText = `Master all ${savedVersesCount} verses & complete plan to unlock '${nextUltimateTrophy.name}'! (Need ${savedVersesCount - masteredCount} more)`;
                } else {
                  memoryMilestoneText = "All memory trophies unlocked! 👑";
                }

                return (
                  <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/20 flex flex-col justify-between h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-1 w-full">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center space-x-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Progress & Streaks Dashboard</span>
                      </h4>
                      <span className="text-[9px] font-bold text-slate-450 uppercase">Active Stats</span>
                    </div>

                    {/* Compact Stats Row (4-column grid for streaks & progress) */}
                    <div className="flex items-center justify-around py-4 px-2 bg-slate-950/40 rounded-xl border border-slate-800/50 my-1 text-[10px] font-sans w-full">
                      <div className="text-center flex-1">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Read Streak</span>
                        <span className="font-serif font-black text-orange-400 text-xl block mt-0.5">📖 {activeReadingStreak}d</span>
                      </div>
                      <div className="w-px h-10 bg-slate-800/60" />
                      <div className="text-center flex-1">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Mem Streak</span>
                        <span className="font-serif font-black text-sky-400 text-xl block mt-0.5">💡 {activeMemoryStreak}d</span>
                      </div>
                      <div className="w-px h-10 bg-slate-800/60" />
                      <div className="text-center flex-1">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Mastered</span>
                        <span className="font-serif font-black text-purple-400 text-xl block mt-0.5">🏆 {masteredCount}/{savedVersesCount}</span>
                      </div>
                      <div className="w-px h-10 bg-slate-800/60" />
                      <div className="text-center flex-1">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Read Plan</span>
                        <span className="font-serif font-black text-amber-400 text-xl block mt-0.5">📈 {readingProgressPercent}%</span>
                      </div>
                    </div>

                    {/* Next Milestones Motivational Box */}
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1.5 text-left text-[11px] mt-1 w-full">
                      <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-1.5 mb-0.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Milestone Unlock Targets</span>
                      </div>
                      <p className="text-slate-300 leading-normal font-sans flex items-start space-x-1.5">
                        <span>📖</span>
                        <span className="font-semibold text-slate-200">{readingMilestoneText}</span>
                      </p>
                      <p className="text-slate-300 leading-normal font-sans flex items-start space-x-1.5 pb-1 border-b border-amber-500/10">
                        <span>💡</span>
                        <span className="font-semibold text-slate-200">{memoryMilestoneText}</span>
                      </p>
                      <div className="pt-1.5 text-center">
                        <button
                          onClick={() => setShowTrophyModal(true)}
                          className="text-[10.5px] font-bold text-amber-400 hover:text-amber-300 hover:underline transition-all inline-flex items-center space-x-1 cursor-pointer font-sans"
                        >
                          <span>🏆 View your unlocked rewards in the Trophy Case</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

          {/* Lower Section: Verse of the Day (Full-width, fills the rest of screen) */}
          <div className="flex-1 relative today-verse-card rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl p-8 text-center flex flex-col justify-center">
            {/* Background image overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
              style={{ backgroundImage: `url(${todayVerseBg})` }}
            />
            {/* Dark vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent pointer-events-none today-verse-vignette" />

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
        <div className="col-span-full text-center py-16 px-6 glass-card rounded-2xl border border-slate-800/40 bg-slate-950/20 max-w-md mx-auto my-6 font-sans">
          {(() => {
            if (searchQuery) {
              return (
                <div className="space-y-1.5">
                  <span className="text-2xl block mb-2">🔍</span>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">No Results Found</h4>
                  <p className="text-xs text-slate-400">No reading items match your search for &ldquo;{searchQuery}&rdquo;.</p>
                </div>
              );
            }
            if (filter === 'missed') {
              return (
                <div className="space-y-1.5">
                  <span className="text-3xl block mb-2 animate-bounce">🎉</span>
                  <h4 className="text-xs font-bold text-emerald-450 uppercase tracking-wider">All Caught Up!</h4>
                  <p className="text-xs text-slate-350 font-medium">You have no missed reading passages. Keep up the amazing consistency!</p>
                </div>
              );
            }
            if (filter === 'completed') {
              return (
                <div className="space-y-1.5">
                  <span className="text-3xl block mb-2">📖</span>
                  <h4 className="text-xs font-bold text-amber-450 uppercase tracking-wider">Start Your Journey</h4>
                  <p className="text-xs text-slate-350 font-medium">Your completed reading passages will appear here. Check off today&rsquo;s readings to see your progress bloom!</p>
                </div>
              );
            }
            return (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Readings</h4>
                <p className="text-xs text-slate-400">No reading items match your current selection.</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Scripture Trophy Case Modal Overlay (Always in DOM for instant rendering, toggled by opacity/pointer-events) */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-200 ${
        showTrophyModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-700 space-y-4 max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${
          showTrophyModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-serif font-bold text-slate-100">Scripture Honor Trophy Case</h3>
            </div>
            <button
              onClick={() => setShowTrophyModal(false)}
              className="px-3 py-1 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer border border-transparent hover:border-slate-800 bg-slate-900/60 transition-all"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Complete your daily reading plans and master verses in the typewriter deck to unlock special achievements and progress medals!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {TROPHIES.map(trophy => {
              const isUnlocked = trophy.check(activeReadingStreak, completedDaysCount, masteredCount, savedVersesCount);
              return (
                <div
                  key={trophy.id}
                  className={`p-4 rounded-xl border flex items-center space-x-4 transition-all ${
                    isUnlocked
                      ? 'bg-slate-900/80 border-amber-500/30 shadow-md shadow-amber-500/5'
                      : 'bg-slate-950/40 border-slate-900 grayscale opacity-45 select-none'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-900 border border-slate-850'
                  }`}>
                    {trophy.icon}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold font-serif ${isUnlocked ? 'text-amber-300' : 'text-slate-500'}`}>
                        {trophy.name}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[9px] uppercase font-extrabold tracking-widest text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-350 font-sans leading-snug">{trophy.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-sans">
            <span>Your Stats: 📖 {activeReadingStreak}d Read Streak | 💡 {activeMemoryStreak}d Mem Streak | 🏆 {masteredCount}/{savedVersesCount} Mastered</span>
            <button
              onClick={() => setShowTrophyModal(false)}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Awesome
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
