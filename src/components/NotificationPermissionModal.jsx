import React, { useState } from 'react';
import { Bell, X, ArrowLeft, Clock, Calendar, CalendarDays } from 'lucide-react';

export default function NotificationPermissionModal({ isOpen, onClose }) {
  const [showLaterOptions, setShowLaterOptions] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = () => {
    try {
      localStorage.setItem('esv_notifications_enabled', 'true');
      localStorage.removeItem('blockNotificationPrompt');
      localStorage.setItem('lastNotificationPromptTime', String(Date.now()));
      
      // Trigger a silent/quick notification so macOS registers the app under System Settings
      if (window.electronAPI?.sendNotification) {
        window.electronAPI.sendNotification({
          title: '📖 ESV Bible Tracker',
          body: 'Reading reminders and milestone alerts successfully enabled!'
        });
      }

      // Open OS notification preferences panel directly
      if (window.electronAPI?.openSystemNotifications) {
        window.electronAPI.openSystemNotifications();
      }
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  const handlePostpone = (ms) => {
    try {
      const targetTime = Date.now() + ms;
      localStorage.setItem('nextNotificationPromptTime', String(targetTime));
      localStorage.setItem('lastNotificationPromptTime', String(Date.now()));
      if (window.debugLogger) {
        window.debugLogger.addLog('info', `Notification prompt postponed for ${ms / 1000}s (Target: ${new Date(targetTime).toLocaleTimeString()})`);
      }
    } catch (e) {
      console.error(e);
    }
    setShowLaterOptions(false);
    onClose();
  };

  const handlePermanentlyDisable = () => {
    localStorage.setItem('blockNotificationPrompt', 'true');
    localStorage.removeItem('esv_notifications_enabled');
    if (window.debugLogger) {
      window.debugLogger.addLog('info', 'Permanently disabled notification permission prompt.');
    }
    setShowLaterOptions(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden flex flex-col space-y-4">
        {/* Decorative backdrop glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

        {/* Close button */}
        <button
          onClick={() => handlePostpone(60 * 60 * 1000)} // Default to 1 hour if closed via 'X'
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-all p-1 hover:bg-slate-800/80 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header content */}
        <div className="flex items-center space-x-3 pt-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-100">
              {showLaterOptions ? 'Postpone Reminder' : 'Enable Reading Reminders'}
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Stay on track with your Bible plan</p>
          </div>
        </div>

        {/* Description body */}
        <div className="text-sm font-sans text-slate-300 leading-relaxed pt-1 min-h-[64px]">
          {!showLaterOptions ? (
            <p>
              To help you stay on track with your 52-week plan, ESV Bible Tracker can send you daily reading reminders and streak milestones directly to your desktop.
            </p>
          ) : (
            <p>
              Select how long you'd like to wait before being reminded to configure daily reading notifications:
            </p>
          )}
        </div>

        {/* Control actions */}
        <div className="flex flex-col space-y-3 pt-2">
          {!showLaterOptions ? (
            <>
              <div className="flex items-center space-x-3 w-full">
                <button
                  onClick={() => setShowLaterOptions(true)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold transition-all cursor-pointer text-center"
                >
                  Later
                </button>
                <button
                  onClick={handleRequestPermission}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer text-center flex items-center justify-center space-x-1"
                >
                  <span>Enable Reminders</span>
                </button>
              </div>
              <button
                onClick={handlePermanentlyDisable}
                className="w-full text-center text-[10px] text-slate-500 hover:text-slate-300 underline font-sans transition-all cursor-pointer"
              >
                Don't show this again
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 w-full">
                <button
                  onClick={() => handlePostpone(1 * 60 * 60 * 1000)} // 1 Hour
                  className="py-3 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center space-y-1"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>1 Hour</span>
                </button>

                <button
                  onClick={() => handlePostpone(24 * 60 * 60 * 1000)} // 1 Day
                  className="py-3 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center space-y-1"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>1 Day</span>
                </button>

                <button
                  onClick={() => handlePostpone(7 * 24 * 60 * 60 * 1000)} // 1 Week
                  className="py-3 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center space-y-1"
                >
                  <CalendarDays className="w-4 h-4 text-amber-400" />
                  <span>1 Week</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowLaterOptions(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center space-x-1 py-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
