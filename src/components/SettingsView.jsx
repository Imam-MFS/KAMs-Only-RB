import React from 'react';
import {
  Settings,
  ShieldCheck,
  Lock,
  Moon,
  Sun,
  Database,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  KeyRound,
  Sparkles
} from 'lucide-react';

export default function SettingsView({
  isDark,
  onToggleTheme,
  merchantCount,
  onClearData,
  onLockPortal,
  onOpenUpload
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-2">
      
      {/* Top Banner */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 dark:border-white/[0.08] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E2136E] via-[#FF2E88] to-purple-600" />
        
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#E2136E]/20 to-purple-600/15 text-[#E2136E] dark:text-pink-400 border border-[#E2136E]/30 shadow-xs">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              System Settings & Portal Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              bKash Commercial Operations | Regional Business Portal Administration
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Setting Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* 1. Security & Authentication */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-[#E2136E]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Access Security
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Passcode Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05]">
              <div>
                <div className="font-bold text-slate-800 dark:text-white">Gate Passcode</div>
                <div className="text-[11px] text-slate-400">Current system entry password</div>
              </div>
              <code className="bg-[#E2136E]/15 text-[#E2136E] dark:text-pink-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-[#E2136E]/30">
                •••••••• (Protected)
              </code>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05]">
              <div>
                <div className="font-bold text-slate-800 dark:text-white">Session Security</div>
                <div className="text-[11px] text-slate-400">Auto-lock on tab close or manual sign out</div>
              </div>
              <button
                onClick={onLockPortal}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300/50 dark:border-rose-900/40 px-3 py-1.5 rounded-xl cursor-pointer transition active:scale-95"
              >
                Lock Portal Now
              </button>
            </div>
          </div>
        </div>

        {/* 2. Appearance & Aesthetics */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Appearance & Theme
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              Glassmorphism
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05]">
              <div>
                <div className="font-bold text-slate-800 dark:text-white">Active Theme Mode</div>
                <div className="text-[11px] text-slate-400">
                  {isDark ? 'Obsidian Glass Dark Mode' : 'Pearl Glass Light Mode'}
                </div>
              </div>
              <button
                onClick={onToggleTheme}
                className="flex items-center space-x-1.5 bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer transition"
              >
                {isDark ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-600" />}
                <span>{isDark ? 'Dark' : 'Light'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] space-y-1">
              <div className="font-bold text-slate-800 dark:text-white">Typography & Accents</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Plus Jakarta Sans for executive hierarchy • JetBrains Mono for financial figures • bKash Magenta (#E2136E) accents
              </p>
            </div>
          </div>
        </div>

        {/* 3. Ingestion & Dataset Diagnostics */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#E2136E]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Data Storage & Workbook Status
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#E2136E] dark:text-pink-400">
              {merchantCount} Merchants Ingested
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05]">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Storage Model</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">Client-Side In-Memory</span>
              <p className="text-[10px] text-slate-400 mt-1">100% private. Data never leaves your browser.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05]">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Hierarchy Engine</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">8 Faceted Dimensions</span>
              <p className="text-[10px] text-slate-400 mt-1">RB KAM Leads, Officers, Districts, Thanas, KAMs, Categories</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05]">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Longitudinal Trends</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">33 Historical Months</span>
              <p className="text-[10px] text-slate-400 mt-1">Jan'24 to Sep'26 actuals + Live Oct'26 MTD stream</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.06]">
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Upload Fresh Excel Sheet</span>
            </button>

            <button
              onClick={onClearData}
              className="flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold px-3.5 py-2 rounded-xl hover:bg-rose-50/80 dark:hover:bg-rose-950/40 transition border border-rose-300/40 dark:border-rose-900/40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Active Records</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
