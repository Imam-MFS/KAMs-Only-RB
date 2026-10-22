import React from 'react';
import {
  Sparkles,
  FileSpreadsheet,
  Moon,
  Sun,
  Building,
  Calendar,
  DownloadCloud,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  Lock
} from 'lucide-react';
import bkashLogo from '../assets/logo.png';

export default function Header({
  isDark,
  onToggleTheme,
  onOpenUpload,
  timeframeLabel,
  scopeCount,
  totalCount,
  onExportCsv,
  activeTab,
  onSelectTab,
  onLockPortal
}) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'filters', label: 'Filters & Cohorts' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'directory', label: 'Directory' }
  ];

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all">
      <div className="max-w-[1720px] mx-auto glass-panel-elevated rounded-2xl px-4 sm:px-6 transition-all duration-300">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Brand & Glass Logo */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group flex-shrink-0">
              <img
                src={bkashLogo}
                alt="bKash"
                className="w-10 h-10 object-contain drop-shadow-[0_4px_12px_rgba(226,19,110,0.45)] transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-[#070A12]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Regional Business Portal</span>
                </h1>
                <span className="bg-gradient-to-r from-[#E2136E]/20 to-pink-500/20 text-[#E2136E] dark:text-pink-300 border border-[#E2136E]/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs">
                  SaaS Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                bKash Commercial & Regional Operations | Territory Sales Intelligence System
              </p>
            </div>
          </div>

          {/* Center: SaaS Section Nav Dock */}
          <nav className="hidden xl:flex items-center bg-slate-200/50 dark:bg-black/40 p-1 rounded-xl border border-slate-300/40 dark:border-white/[0.08] backdrop-blur-md text-xs font-semibold">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-white/10 text-[#E2136E] dark:text-white shadow-sm border border-slate-200 dark:border-white/10 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Center Indicator: Running Window & Active Scope */}
          <div className="hidden lg:flex items-center space-x-2.5">
            <div className="flex items-center space-x-2 bg-slate-100/70 dark:bg-white/[0.04] border border-slate-300/60 dark:border-white/[0.08] backdrop-blur-md rounded-full px-3 py-1 text-xs shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Cycle: <span className="text-slate-900 dark:text-white font-bold">{timeframeLabel}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-100/70 dark:bg-white/[0.04] border border-slate-300/60 dark:border-white/[0.08] backdrop-blur-md rounded-full px-3 py-1 text-xs shadow-xs">
              <Building className="w-3.5 h-3.5 text-[#E2136E]" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Scope:{' '}
                {totalCount > 0 ? (
                  <span className="text-slate-900 dark:text-white font-bold">
                    {scopeCount} / {totalCount}
                  </span>
                ) : (
                  <span className="text-amber-500 font-bold">No Sheet Loaded</span>
                )}
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Quick Export Button */}
            <button
              onClick={onExportCsv}
              className="hidden sm:flex items-center space-x-1.5 bg-slate-100/80 dark:bg-white/[0.05] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] px-3 py-1.5 rounded-xl text-xs font-semibold transition backdrop-blur-md cursor-pointer"
              title="Export Current View to Excel/CSV"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] backdrop-blur-md transition cursor-pointer"
              title={isDark ? "Switch to Pearl Glass Light Mode" : "Switch to Obsidian Glass Dark Mode"}
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-600" />
              )}
            </button>

            {/* Upload Excel Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-emerald-500/20 backdrop-blur-md cursor-pointer active:scale-95 border border-emerald-400/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Sheet</span>
            </button>

            {/* Lock Portal Button */}
            <button
              onClick={onLockPortal}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-white/[0.08] hover:border-rose-300 dark:hover:border-rose-900/40 backdrop-blur-md transition cursor-pointer"
              title="Lock Portal (Sign Out)"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
