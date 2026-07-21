import React, { useState, useEffect } from 'react';
import { Clock, Settings, Sun, Moon, Download, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import logoIcon from '../assets/icon.png';
import { getUserTimezone } from '../utils/dateUtils';
import { debugLogger } from './DeveloperDebugModal';

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
        if (data.status === 'error') {
          debugLogger.addLog('error', 'Auto-updater reported check error', data.error);
        } else if (data.status === 'checking') {
          debugLogger.addLog('info', 'Checking for OTA updates...');
        } else if (data.status === 'available') {
          debugLogger.addLog('info', 'New update version found!', data.info);
        } else if (data.status === 'not-available') {
          debugLogger.addLog('info', 'App is up to date.');
        } else if (data.status === 'downloading') {
          debugLogger.addLog('info', `Downloading update: ${Math.round(data.progress?.percent || 0)}%`);
        } else if (data.status === 'downloaded') {
          debugLogger.addLog('info', 'Update downloaded and ready to install.');
        }
      });
      return cleanup;
    }
  }, []);

  // Auto-reset update status to idle after 3 seconds for transient states (error, not-available)
  useEffect(() => {
    if (updateState.status === 'error' || updateState.status === 'not-available') {
      const timer = setTimeout(() => {
        setUpdateState({ status: 'idle' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateState.status]);

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

  const getVersionText = () => {
    switch (updateState.status) {
      case 'checking':
        return `v${appVersion} (checking...)`;
      case 'available':
        return `v${appVersion} (update ready - click to download)`;
      case 'downloading':
        const pct = Math.round(updateState.progress?.percent || 0);
        return `v${appVersion} (downloading: ${pct}%)`;
      case 'downloaded':
        return `v${appVersion} (click to restart & install)`;
      case 'error':
        return `v${appVersion} (error)`;
      case 'not-available':
        return `v${appVersion} (latest)`;
      default:
        return `v${appVersion}`;
    }
  };

  const handleVersionClick = (e) => {
    e.preventDefault();
    if (updateState.status === 'available') {
      handleStartDownload();
    } else if (updateState.status === 'downloaded') {
      handleQuitAndInstall();
    } else if (updateState.status === 'downloading') {
      // do nothing
    } else {
      handleCheckUpdates();
    }
  };

  return (
    <header className="h-16 titlebar-drag border-b border-slate-800/80 glass-panel px-6 flex items-center justify-between select-none z-20 w-full cursor-grab active:cursor-grabbing">
      {/* Title & App Brand (Draggable space with inset traffic lights) */}
      <div className="flex items-center space-x-3 pl-16 titlebar-drag">
        <div className="flex items-center space-x-2 titlebar-no-drag cursor-pointer" onClick={() => setActiveTab('plan')}>
          <img src={logoIcon} alt="ESV Bible Tracker" className="w-8 h-8 rounded-xl shadow-md object-cover border border-amber-500/30 shrink-0" />
          <div>
            <h1 className="font-serif font-bold text-sm text-slate-100 flex items-center select-none">
              <span>ESV Bible Tracker</span>
              <button
                onClick={handleVersionClick}
                className="align-super text-[9px] font-sans font-semibold text-amber-400 hover:text-amber-300 transition-all hover:underline cursor-pointer ml-1 select-none whitespace-nowrap shrink-0"
                title="Click to check or manage updates"
              >
                <sup>{getVersionText()}</sup>
              </button>
            </h1>
            <p className="text-[9px] text-slate-400 font-sans">52-Week Reading & Memory Plan</p>
          </div>
        </div>
      </div>

      {/* Center Navigation Tabs (Non-draggable interactive buttons) */}
      <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 titlebar-no-drag">
        {[
          { id: 'plan', label: 'Plan' },
          { id: 'reader', label: 'Reader' },
          { id: 'saved', label: 'Treasury' },
          { id: 'memory', label: 'Memory' }
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

      {/* Right: Active Timezone Clock & Settings */}
      <div className="flex items-center space-x-3 titlebar-no-drag">
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
