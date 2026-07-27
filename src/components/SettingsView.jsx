import React, { useState, useEffect } from 'react';
import { Settings, Bell, RotateCcw, Check } from 'lucide-react';

export default function SettingsView({ settings, onSaveSettings, onResetProgress, onShowTutorial, onCancel }) {
  const [notifyUnread, setNotifyUnread] = useState(settings.notifyUnread ?? true);
  const [notificationTime, setNotificationTime] = useState(settings.notificationTime || '08:00');
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(settings.autoUpdateEnabled ?? true);
  const [savedStatus, setSavedStatus] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.8');
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('esv_tracker_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai';
  });

  useEffect(() => {
    if (window.electronAPI?.getAppInfo) {
      window.electronAPI.getAppInfo().then(info => {
        if (info && info.version) setAppVersion(info.version);
      }).catch(() => {});
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('esv_tracker_timezone', timezone);
    onSaveSettings({
      ...settings,
      esvApiKey: settings.esvApiKey || '',
      notifyUnread,
      notificationTime,
      timezone,
      autoUpdateEnabled
    });
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      // Reload page to apply timezone shift across components seamlessly
      window.location.reload();
    }, 1000);
  };

  const handleTestNotification = async () => {
    if (window.electronAPI && window.electronAPI.sendNotification) {
      await window.electronAPI.sendNotification({
        title: 'ESV Bible Reading Plan',
        body: 'Reminder: You have scheduled Scripture readings for today (July 20, Beijing Time).'
      });
    } else {
      alert('Native notifications trigger sent! (Running in web or desktop mode)');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Preferences & Integration</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-100">Application Settings</h2>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Configure reading reminders, timezone, updates, and app guidance.
          </p>
        </div>
        <button
          type="button"
          onClick={onShowTutorial}
          title="View the app tutorial again"
          aria-label="View app tutorial"
          className="shrink-0 rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-400 transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300"
        >
          <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center text-2xl font-semibold leading-none">?</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reading, Timezone & Updates */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
            <Bell className="w-4 h-4" />
            <span>Reading, Timezone & Updates</span>
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-slate-200">Daily Reading Reminders</div>
              <div className="text-[11px] text-slate-400">Show notification if daily reading is not completed</div>
            </div>
            <input
              type="checkbox"
              checked={notifyUnread}
              onChange={(e) => setNotifyUnread(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {notifyUnread && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Notification Settings</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                >
                  Test Notification
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.electronAPI?.openSystemNotifications) {
                      window.electronAPI.openSystemNotifications();
                    } else {
                      alert('Mac notification settings link is only available in desktop mode.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all cursor-pointer"
                >
                  ⚙️ Open Mac Settings
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-200">Active Timezone</div>
              <div className="text-[11px] text-slate-400">Used for plan headers and Catch-Up calculations</div>
            </div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value={Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'}>
                Local Time ({Intl.DateTimeFormat().resolvedOptions().timeZone || 'Detected'})
              </option>
              <option value="Asia/Shanghai">Beijing Time (Asia/Shanghai)</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="America/New_York">Eastern Time (America/New_York)</option>
              <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
              <option value="Europe/London">London Time (Europe/London)</option>
              <option value="Asia/Tokyo">Tokyo Time (Asia/Tokyo)</option>
              <option value="Asia/Singapore">Singapore Time (Asia/Singapore)</option>
            </select>
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-slate-200">Auto-Download & Install Updates</div>
              <div className="text-[11px] text-slate-400">Automatically check, download, and stage updates in background</div>
            </div>
            <input
              type="checkbox"
              checked={autoUpdateEnabled}
              onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onResetProgress}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Reading Progress</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {savedStatus ? <Check className="w-4 h-4" /> : null}
              <span>{savedStatus ? 'Settings Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Settings Modal Version Footer */}
      <div className="text-center pt-8 border-t border-slate-900 text-slate-500 text-xs font-mono">
        ESV Bible Tracker v{appVersion} • Under Active Timezone: {timezone}
      </div>
    </div>
  );
}
