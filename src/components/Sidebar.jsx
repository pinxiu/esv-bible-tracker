import React from 'react';
import { Calendar, BookOpen, BrainCircuit, Bookmark, Settings, Layers } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, missedCount = 0 }) {
  const navItems = [
    { id: 'plan', label: 'Reading Plan', icon: Calendar, badge: missedCount > 0 ? missedCount : null },
    { id: 'reader', label: 'ESV Reader', icon: BookOpen },
    { id: 'memory', label: 'Memory Verses', icon: BrainCircuit },
    { id: 'saved', label: 'Saved & Highlights', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 glass-panel flex flex-col justify-between p-4 select-none shrink-0">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 shadow-md shadow-amber-900/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center space-x-2 text-slate-300 font-medium mb-1">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Today: July 20</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          Gen 16-18; Mark 6 scheduled for today.
        </p>
      </div>
    </aside>
  );
}
