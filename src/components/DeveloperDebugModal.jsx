import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, Bug, ShieldAlert, Download, RefreshCw, X, Database, Cpu, HardDrive, Bell } from 'lucide-react';
import { esvDb } from '../services/esvDatabase';

/**
 * Global Log Store for capturing app runtime events & errors
 */
export const debugLogger = {
  logs: [],
  listeners: new Set(),

  addLog(type, message, details = null) {
    const entry = {
      id: Date.now() + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      fullDate: new Date().toISOString(),
      type, // 'error' | 'warn' | 'info' | 'system'
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      details: details ? (typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)) : null
    };
    this.logs.unshift(entry);
    if (this.logs.length > 100) this.logs.pop();
    this.notify();
  },

  clear() {
    this.logs = [];
    this.notify();
  },

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  notify() {
    this.listeners.forEach(l => l([...this.logs]));
  }
};

// Global Error & Promise Rejection Handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    debugLogger.addLog('error', `Runtime Error: ${event.message}`, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : null
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    debugLogger.addLog('error', `Unhandled Promise Rejection: ${event.reason}`, {
      reason: event.reason ? (event.reason.stack || event.reason) : 'Unknown'
    });
  });
}

import { getUserTimezone } from '../utils/dateUtils';

export default function DeveloperDebugModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState(debugLogger.logs);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'env' | 'storage'
  const [appVersion, setAppVersion] = useState('1.0.8');

  useEffect(() => {
    if (window.electronAPI?.getAppInfo) {
      window.electronAPI.getAppInfo().then(info => {
        if (info && info.version) setAppVersion(info.version);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const unsubscribe = debugLogger.subscribe(setLogs);
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  // Calculate LocalStorage Stats
  const storageStats = () => {
    let totalBytes = 0;
    const items = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key) || '';
        const size = (key.length + value.length) * 2; // approx bytes
        totalBytes += size;
        items.push({ key, size: (size / 1024).toFixed(2) + ' KB', length: value.length });
      }
    } catch (e) {}
    return { totalKB: (totalBytes / 1024).toFixed(2), items };
  };

  const stats = storageStats();

  const triggerNotification = async (title, body) => {
    if (window.electronAPI?.sendNotification) {
      try {
        debugLogger.addLog('info', `Invoking send-notification IPC: "${title}"`);
        const result = await window.electronAPI.sendNotification({ title, body });
        if (result && result.success) {
          debugLogger.addLog('info', `Successfully dispatched notification: "${title}"`);
        } else {
          debugLogger.addLog('error', `Notification dispatch rejected: ${result ? result.reason : 'Unknown reason'}`);
          alert(`Notification rejected by OS: ${result ? result.reason : 'Unknown reason'}`);
        }
      } catch (err) {
        debugLogger.addLog('error', `Notification dispatch threw error`, err.message);
        alert(`Notification error: ${err.message}`);
      }
    } else {
      alert('Native notifications trigger sent! (Running in web or desktop mode)');
    }
  };

  const generateMarkdownReport = () => {
    const report = [
      `# ESV Bible Tracker - Developer Diagnostic Report`,
      `Generated At: ${new Date().toISOString()}`,
      `App Version: v${appVersion}`,
      `User Agent: ${navigator.userAgent}`,
      `Screen Resolution: ${window.innerWidth}x${window.innerHeight}`,
      `Offline ESV Bank Verses: ${esvDb.getVerseCount()}`,
      `LocalStorage Size: ${stats.totalKB} KB (${stats.items.length} keys)`,
      ``,
      `## Recent Error & System Logs (${logs.length} entries)`,
      `\`\`\`json`,
      JSON.stringify(logs.slice(0, 25), null, 2),
      `\`\`\``
    ].join('\n');
    return report;
  };

  const handleCopyReport = () => {
    const report = generateMarkdownReport();
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLog = () => {
    const report = generateMarkdownReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esv_tracker_crash_log_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateCrash = () => {
    try {
      throw new Error("Simulated Test Crash triggered via Developer Backdoor Console!");
    } catch (err) {
      debugLogger.addLog('error', err.message, err.stack);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-text">
      <div className="w-full max-w-3xl glass-panel rounded-3xl p-6 border border-rose-500/40 shadow-2xl relative space-y-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center space-x-2">
                <span>Developer Debug Backdoor Console</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  SECRET ACCESS
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">Live runtime diagnostics, error interceptor, & storage inspector</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'logs' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Error & Console Stream ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'env' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Environment Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'storage' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>LocalStorage Inspector ({stats.totalKB} KB)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 font-mono text-xs p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
          {activeTab === 'logs' && (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-sans">
                  No errors or crash events logged in this session. App is running cleanly!
                </div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border space-y-1 ${
                      log.type === 'error'
                        ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                        : log.type === 'warn'
                        ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-wider">{log.type}</span>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                    <div className="font-semibold leading-relaxed break-words">{log.message}</div>
                    {log.details && (
                      <pre className="mt-1.5 p-2 rounded-lg bg-black/60 text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap break-all border border-slate-900">
                        {log.details}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px]">Application Version</span>
                  <div className="font-mono font-bold text-amber-400 text-sm">v{appVersion}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px]">Offline ESV Database</span>
                  <div className="font-mono font-bold text-emerald-400 text-sm">{esvDb.getVerseCount()} Verses</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px]">Platform / OS</span>
                  <div className="font-mono font-semibold text-slate-200 break-words text-[11px]">{navigator.platform}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px]">Timezone</span>
                  <div className="font-mono font-semibold text-amber-300">{getUserTimezone()}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">User Agent</span>
                <div className="font-mono text-[10px] text-slate-300 break-all">{navigator.userAgent}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[11px] font-semibold flex items-center space-x-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Notifications & Reminders</span>
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Trigger native desktop notifications for different system reminder channels to verify system permissions and appearance.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => triggerNotification('📖 Daily Reading Reminder', "Don't forget to read today's passages (Genesis 1-2)!")}
                    className="py-1.5 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10px] font-semibold transition-all cursor-pointer text-left"
                  >
                    📖 Daily Reading
                  </button>

                  <button
                    onClick={() => triggerNotification('💡 Memory Review Reminder', 'Time to practice your Treasury verses! You have 3 verses waiting for review.')}
                    className="py-1.5 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10px] font-semibold transition-all cursor-pointer text-left"
                  >
                    💡 Memory Review
                  </button>

                  <button
                    onClick={() => triggerNotification('🔥 Reading Streak Milestone!', "Fantastic! You've achieved a 7-day reading streak. Keep up the momentum!")}
                    className="py-1.5 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10px] font-semibold transition-all cursor-pointer text-left"
                  >
                    🔥 Streak Milestone
                  </button>

                  <button
                    onClick={() => triggerNotification('✨ Welcome to ESV Bible Tracker!', 'Ready to start your 52-week plan? Open the app to begin.')}
                    className="py-1.5 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10px] font-semibold transition-all cursor-pointer text-left"
                  >
                    ✨ Welcome Greeting
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem('lastNotificationPromptTime');
                      localStorage.removeItem('blockNotificationPrompt');
                      if (window.debugLogger) {
                        window.debugLogger.addLog('system', 'Reset notification prompt states & block bypass configurations.');
                      }
                      alert('Notification prompt settings have been reset! Relaunch the app to trigger it.');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-amber-400 border border-slate-850 hover:border-slate-800 text-[10px] font-semibold transition-all cursor-pointer text-left col-span-2 flex items-center justify-center space-x-1.5"
                  >
                    <span>🔄 Reset Notification Prompts (For Testing)</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[11px] font-semibold flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>Updater & Relaunch Simulation</span>
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Tests the Electron application quit, reload, and relaunch cycle immediately. This verifies system execution permissions and that the relaunch handler fires correctly.
                </p>
                <button
                  onClick={() => {
                    if (window.electronAPI && window.electronAPI.simulateRestartUpdate) {
                      window.electronAPI.simulateRestartUpdate();
                    } else {
                      alert('Simulation requires a native running Electron framework instance.');
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  🚀 Test Application Relaunch Cycle
                </button>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-2 font-sans text-xs">
              <div className="text-slate-400 font-mono text-[11px] pb-1 border-b border-slate-800 flex justify-between">
                <span>LocalStorage Key</span>
                <span>Size</span>
              </div>
              {stats.items.map(item => (
                <div key={item.key} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-amber-300 font-semibold">{item.key}</span>
                  <span className="text-slate-400">{item.size} ({item.length} chars)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSimulateCrash}
              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center space-x-1"
              title="Test crash logger"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Simulate Test Error</span>
            </button>

            <button
              onClick={() => debugLogger.clear()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition-all flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadLog}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Log (.md)</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-rose-500/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Report Copied!" : "Copy Full Debug Report"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
