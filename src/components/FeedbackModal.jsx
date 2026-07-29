import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, MessageSquare, Paperclip, Send, Trash2, X } from 'lucide-react';
import { submitAppFeedback } from '../services/appApi';

const readFileAsDataUrl = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

export default function FeedbackModal({ isOpen, onClose, activePage }) {
  const fileInputRef = useRef(null);
  const captureImageRef = useRef(null);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureDataUrl, setCaptureDataUrl] = useState('');
  const [selection, setSelection] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('');
      setCaptureDataUrl('');
      setSelection(null);
      setDragStart(null);
    }
  }, [isOpen]);

  if (!isOpen || isCapturing) return null;

  const addFiles = async files => {
    setStatus('');
    try {
      const next = await Promise.all(Array.from(files).map(async file => ({
        name: file.name,
        data: await readFileAsDataUrl(file),
        isImage: file.type.startsWith('image/')
      })));
      setAttachments(previous => [...previous, ...next]);
    } catch (error) {
      setStatus(`Could not attach that file: ${error.message}`);
    }
  };

  const captureApp = async () => {
    setStatus('');
    setIsCapturing(true);
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 120)));
    const result = await window.electronAPI?.captureApp?.();
    setIsCapturing(false);
    if (result?.success) {
      setCaptureDataUrl(result.dataUrl);
      setSelection(null);
    } else {
      setStatus(result?.error || 'App capture is only available in the desktop app.');
    }
  };

  const attachCapture = async useWholeApp => {
    if (!captureDataUrl) return;
    let data = captureDataUrl;
    let name = `ESV-Bible-Tracker-${Date.now()}.png`;

    if (!useWholeApp) {
      const image = captureImageRef.current;
      if (!image || !selection || selection.width < 8 || selection.height < 8) {
        setStatus('Drag over the app preview to select a section first.');
        return;
      }
      const scaleX = image.naturalWidth / image.clientWidth;
      const scaleY = image.naturalHeight / image.clientHeight;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(selection.width * scaleX));
      canvas.height = Math.max(1, Math.round(selection.height * scaleY));
      const context = canvas.getContext('2d');
      context.drawImage(
        image,
        selection.x * scaleX,
        selection.y * scaleY,
        selection.width * scaleX,
        selection.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
      data = canvas.toDataURL('image/png');
      name = `ESV-Bible-Tracker-Section-${Date.now()}.png`;
    }

    setAttachments(previous => [...previous, { name, data, isImage: true }]);
    setCaptureDataUrl('');
    setSelection(null);
    setStatus('');
  };

  const getImagePoint = event => {
    const image = captureImageRef.current;
    if (!image) return null;
    const rect = image.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, event.clientY - rect.top))
    };
  };

  const updateSelection = event => {
    if (!dragStart) return;
    const point = getImagePoint(event);
    if (!point) return;
    setSelection({
      x: Math.min(dragStart.x, point.x),
      y: Math.min(dragStart.y, point.y),
      width: Math.abs(point.x - dragStart.x),
      height: Math.abs(point.y - dragStart.y)
    });
  };

  const submit = async () => {
    if (!message.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setStatus('');
    const title = `ESV Bible Tracker Feedback: ${message.trim().slice(0, 60)}`;
    const body = `### Feedback\n\n${message.trim()}\n\n---\n*Submitted from ESV Bible Tracker*\n*Page: ${activePage}*`;
    try {
      const result = await submitAppFeedback(title, body, attachments);
      if (!result?.success) throw new Error(result?.error || 'Feedback upload is unavailable.');
      setMessage('');
      setAttachments([]);
      setStatus(`Feedback uploaded successfully: ${result.url}`);
    } catch (error) {
      setStatus(`Feedback was not sent: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg space-y-4 rounded-2xl border border-amber-500/30 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-400" />
            <h3 className="font-serif text-lg font-bold text-slate-100">Send Feedback</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200" aria-label="Close feedback">
            <X className="h-4 w-4" />
          </button>
        </div>
        {captureDataUrl ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Drag across the preview to select a section, or attach the whole app window.</p>
            <div
              className="relative max-h-[55vh] overflow-hidden rounded-xl border border-slate-700 bg-black"
              onMouseDown={event => {
                const point = getImagePoint(event);
                setDragStart(point);
                setSelection(point ? { ...point, width: 0, height: 0 } : null);
              }}
              onMouseMove={updateSelection}
              onMouseUp={event => {
                updateSelection(event);
                setDragStart(null);
              }}
              onMouseLeave={() => setDragStart(null)}
            >
              <img ref={captureImageRef} src={captureDataUrl} alt="Captured app preview" draggable={false} className="mx-auto block max-h-[55vh] max-w-full select-none object-contain" />
              {selection && (
                <div
                  className="pointer-events-none absolute border-2 border-amber-400 bg-amber-300/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]"
                  style={{
                    left: selection.x + (captureImageRef.current?.offsetLeft || 0),
                    top: selection.y + (captureImageRef.current?.offsetTop || 0),
                    width: selection.width,
                    height: selection.height
                  }}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => attachCapture(true)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:text-amber-300">Use Whole App</button>
              <button type="button" onClick={() => attachCapture(false)} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400">Attach Selected Area</button>
            </div>
          </div>
        ) : (
        <>
        <textarea
          rows={6}
          value={message}
          onChange={event => setMessage(event.target.value)}
          placeholder="Found a bug or have a suggestion?"
          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200 outline-none focus:border-amber-500/50"
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300">
            <Paperclip className="h-4 w-4" /> Attach Files
          </button>
          <button type="button" onClick={captureApp} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300">
            <Camera className="h-4 w-4" /> Capture App
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={event => addFiles(event.target.files)} />
        </div>
        {attachments.length > 0 && (
          <div className="max-h-28 space-y-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-2">
            {attachments.map((attachment, index) => (
              <div key={`${attachment.name}-${index}`} className="flex items-center justify-between gap-2 text-xs text-slate-300">
                <span className="truncate">{attachment.name}</span>
                <button type="button" onClick={() => setAttachments(items => items.filter((_, itemIndex) => itemIndex !== index))} className="text-slate-500 hover:text-rose-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {status && <p className={`break-words text-xs ${status.startsWith('Feedback uploaded') ? 'text-emerald-300' : 'text-rose-300'}`}>{status}</p>}
        <button type="button" onClick={submit} disabled={!message.trim() || isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isSubmitting ? 'Uploading…' : 'Send Feedback'}
        </button>
        </>
        )}
      </div>
    </div>
  );
}
