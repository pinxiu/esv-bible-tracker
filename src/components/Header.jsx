import React, { useState, useEffect } from 'react';
import { Clock, Settings, Sun, Moon, Download, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import logoIcon from '../assets/icon.png';
import { getUserTimezone } from '../utils/dateUtils';

export default function Header({
  activeTab,
  setActiveTab,
  progressPercent = 0,
  completedDays = 0,
  totalDays = 0,
  onOpenSettings,
  theme = 'dark',
  onToggleTheme
}) {
  const [activeTimeStr, setActiveTimeStr] = useState('');
  const [tzLabel, setTzLabel] = useState('Time');
  const [updateState, setUpdateState] = useState({ status: 'idle' });

  useEffect(() => {
    const updateTime = () => {
      const tz = getUserTimezone();
      const options = {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const timeFormatter = new Intl.DateTimeFormat('en-US', options);
      setActiveTimeStr(timeFormatter.format(new Date()));

      try {
        const parts = tz.split('/');
        const label = parts[parts.length - 1].replace(/_/g, ' ');
        setTzLabel(label);
      } catch (e) {
        setTzLabel('Time');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [appVersion, setAppVersion] = useState('1.0.0');

  useEffect(() => {
    if (window.electronAPI?.getAppInfo) {
      window.electronAPI.getAppInfo().then(info => {
        if (info && info.version) setAppVersion(info.version);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI?.onUpdateMessage) {
      const cleanup = window.electronAPI.onUpdateMessage((data) => {
        setUpdateState(data);
      });
      return cleanup;
    }
  }, []);

  const handleCheckUpdates = () => {
    if (window.electronAPI?.checkForUpdates) {
      setUpdateState({ status: 'checking' });
      window.electronAPI.checkForUpdates();
    } else {
      setUpdateState({ status: 'not-available' });
      setTimeout(() => setUpdateState({ status: 'idle' }), 3000);
    }
  };

  const handleStartDownload = () => {
    if (window.electronAPI?.startDownloadUpdate) {
      window.electronAPI.startDownloadUpdate();
    }
  };

  const handleQuitAndInstall = () => {
    if (window.electronAPI?.quitAndInstall) {
      window.electronAPI.quitAndInstall();
    }
  };

  return (
    <header className="h-16 titlebar-drag border-b border-slate-800/80 glass-panel px-6 flex items-center justify-between select-none z-20 w-full cursor-grab active:cursor-grabbing">
      {/* Title & App Brand (Draggable space with inset traffic lights) */}
      <div className="flex items-center space-x-3 pl-16 titlebar-drag">
        <div className="flex items-center space-x-2 titlebar-no-drag cursor-pointer" onClick={() => setActiveTab('plan')}>
          <img src={logoIcon} alt="ESV Bible Tracker" className="w-8 h-8 rounded-xl shadow-md object-cover border border-amber-500/30 shrink-0" />
          <div>
            <h1 className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-1.5">
              <span>ESV Bible Tracker</span>
              <button
                onClick={handleCheckUpdates}
                className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                title="Click to check for OTA updates"
              >
                v{appVersion}
              </button>
            </h1>
            <p className="text-[10px] text-slate-400 font-sans">52-Week Reading & Memory</p>
          </div>
        </div>
      </div>

      {/* Center Navigation Tabs (Non-draggable interactive buttons) */}
      <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 titlebar-no-drag">
        {[
          { id: 'plan', label: '52-Week Plan' },
          { id: 'reader', label: 'ESV Reader' },
          { id: 'saved', label: 'Scripture Treasury' },
          { id: 'memory', label: 'Verse Memorization' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right: Beijing Time Clock, OTA Update Indicator & Settings */}
      <div className="flex items-center space-x-3 titlebar-no-drag">
        {/* OTA Update Status Button / Badge */}
        {updateState.status === 'checking' && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-semibold animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Checking for updates...</span>
          </div>
        )}

        {updateState.status === 'not-available' && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>App Up to Date (v{appVersion})</span>
          </div>
        )}

        {updateState.status === 'available' && (
          <button
            onClick={handleStartDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all animate-pulse"
            title="Click to download OTA update"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Update {updateState.info?.version || ''} Ready — Download</span>
          </button>
        )}

        {updateState.status === 'downloading' && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-xs text-sky-300 font-semibold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>Downloading... {Math.round(updateState.progress?.percent || 0)}%</span>
          </div>
        )}

        {updateState.status === 'downloaded' && (
          <button
            onClick={handleQuitAndInstall}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            title="Click to restart and complete update"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Restart to Update</span>
          </button>
        )}

        {/* Active Timezone Clock */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-amber-200 font-semibold">{activeTimeStr || 'Time'}</span>
          <span className="text-[9px] text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded font-sans max-w-[80px] truncate" title={tzLabel}>
            {tzLabel}
          </span>
        </div>

        {/* Progress Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <span className="text-slate-400">Plan:</span>
          <span className="font-bold text-amber-400">{progressPercent}%</span>
        </div>

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 transition-all flex items-center justify-center"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 transition-all"
          title="Settings & Onboarding Tour"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
