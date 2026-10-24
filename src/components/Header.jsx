import React from 'react';
import {
  FileSpreadsheet,
  Moon,
  Sun,
  Building,
  DownloadCloud,
  Lock,
  Menu
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
  onLockPortal,
  onToggleMobileMenu
}) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'filters', label: 'Filters & Cohorts' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'directory', label: 'Directory' }
  ];

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 lg:px-8 pt-2.5 pb-2 transition-all">
      <div className="max-w-[1720px] mx-auto glass-panel-elevated rounded-2xl px-3 sm:px-6 transition-all duration-300">
        <div className="flex items-center justify-between min-h-[56px] sm:h-16 gap-2 sm:gap-3 py-1.5 sm:py-0">
          
          {/* Left: Mobile Hamburger & Brand Lockup */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 overflow-hidden">
            {/* Hamburger for Mobile & Tablet (< lg) */}
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800 dark:text-white" />
            </button>

            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 overflow-hidden">
              <div className="relative group flex-shrink-0">
                <img
                  src={bkashLogo}
                  alt="bKash"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_4px_12px_rgba(226,19,110,0.45)] transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500 border-2 border-white dark:border-[#070A12]" />
                </span>
              </div>

              <div className="overflow-hidden">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                    Regional Business Portal
                  </h1>
                  <span className="hidden xs:inline-flex bg-gradient-to-r from-[#E2136E]/20 to-pink-500/20 text-[#E2136E] dark:text-pink-300 border border-[#E2136E]/40 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs shrink-0">
                    SaaS Pro
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  bKash Commercial & Regional Operations | Territory Sales Intelligence System
                </p>
              </div>
            </div>
          </div>

          {/* Center: SaaS Section Nav Dock (Desktop only) */}
          <nav className="hidden 2xl:flex items-center bg-slate-200/50 dark:bg-black/40 p-1 rounded-xl border border-slate-300/40 dark:border-white/[0.08] backdrop-blur-md text-xs font-semibold shrink-0">
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

          {/* Center Indicator: Running Window & Active Scope (Large Screens) */}
          <div className="hidden xl:flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-2 bg-slate-100/70 dark:bg-white/[0.04] border border-slate-300/60 dark:border-white/[0.08] backdrop-blur-md rounded-full px-3 py-1 text-xs shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Quick Export Button (Hidden on Mobile) */}
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
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] backdrop-blur-md transition cursor-pointer"
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
              className="flex items-center space-x-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-emerald-500/20 backdrop-blur-md cursor-pointer active:scale-95 border border-emerald-400/30"
              title="Upload Sales Excel Workbook"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Upload Sheet</span>
            </button>

            {/* Lock Portal Button */}
            <button
              onClick={onLockPortal}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-white/[0.08] hover:border-rose-300 dark:hover:border-rose-900/40 backdrop-blur-md transition cursor-pointer"
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
