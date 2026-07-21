import React from 'react';
import { getCommentaryLinks } from '../data/commentaryUrls';
import { ExternalLink, BookOpen, X, Sparkles } from 'lucide-react';

export default function CommentaryModal({ onClose, passageRef }) {
  if (!passageRef) return null;

  const links = getCommentaryLinks(passageRef);

  const handleOpenExternal = (e, url) => {
    e.preventDefault();
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-panel rounded-2xl p-6 border border-amber-500/30 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-100">Bible Commentaries & Study Tools</h3>
            <p className="text-xs text-amber-400 font-sans">
              Pre-populated search query for: <span className="font-bold underline">{passageRef}</span>
            </p>
          </div>
        </div>

        {/* Commentary Options List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              onClick={(e) => handleOpenExternal(e, link.url)}
              className={`block p-4 rounded-xl bg-gradient-to-r ${link.color} border border-slate-800 hover:border-amber-500/40 hover:scale-[1.01] transition-all duration-200 group cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                  {link.name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700 text-amber-400">
                  {link.tag}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed mb-2">{link.description}</p>
              <div className="flex items-center space-x-1 text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <span>Open Commentary in Browser ({link.name})</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
