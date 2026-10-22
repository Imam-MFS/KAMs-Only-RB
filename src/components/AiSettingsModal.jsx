import React, { useState } from 'react';
import { Sparkles, X, Key, ShieldCheck, Trash2 } from 'lucide-react';

export default function AiSettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  onClearKey
}) {
  const [inputVal, setInputVal] = useState(apiKey || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(inputVal.trim());
    onClose();
  };

  const handleClear = () => {
    setInputVal('');
    onClearKey();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#070A10]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Google AI Studio Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Provide your <strong>Google AI Studio Gemini API Key</strong> to generate real-time territory strategy directives powered by <strong>Gemini 2.5 Flash</strong> over your active filtered slice.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#E2136E] focus:outline-none"
            />
          </div>

          <div className="flex items-start space-x-2 bg-slate-50 dark:bg-[#070A10] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>
              Your API key is saved exclusively in your browser's local storage and is never uploaded to any intermediary servers.
            </span>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {apiKey && (
            <button
              onClick={handleClear}
              className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Key</span>
            </button>
          )}

          <button
            onClick={handleSave}
            className="bg-[#E2136E] hover:bg-pink-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-[#E2136E]/30 cursor-pointer"
          >
            Save Key
          </button>
        </div>

      </div>
    </div>
  );
}
