import React from 'react';
import {
  Calendar,
  ChevronDown,
  Clock,
  Activity,
  Database,
  Trash2
} from 'lucide-react';
import { HISTORICAL_MONTHS, QUARTERS, HALF_YEARS } from '../data/timeline';

export default function TimeframeSelector({
  tfMode,
  setTfMode,
  period,
  setPeriod,
  activePeriodLabel,
  totalCount,
  onClearData
}) {
  const isRunningCycle = period.includes("Q4'26") || period.includes("H2'26");

  let periodOptions = [];
  if (tfMode === 'MONTH') {
    periodOptions = [...HISTORICAL_MONTHS].reverse();
  } else if (tfMode === 'QUARTER') {
    periodOptions = Object.keys(QUARTERS);
  } else if (tfMode === 'HALFYEAR') {
    periodOptions = Object.keys(HALF_YEARS);
  }

  const handleModeChange = (newMode) => {
    setTfMode(newMode);
    if (newMode === 'MTD') {
      setPeriod('Live MTD');
    } else if (newMode === 'MONTH') {
      setPeriod(HISTORICAL_MONTHS[HISTORICAL_MONTHS.length - 1]);
    } else if (newMode === 'QUARTER') {
      setPeriod("Q4'26 (Running Quarter)");
    } else if (newMode === 'HALFYEAR') {
      setPeriod("H2'26 (Running Half)");
    }
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-3 sm:p-4 border border-white/10 dark:border-white/[0.08] shadow-xl transition-all duration-300">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-3.5">
        
        {/* Left: Mode Tabs & Period Selector */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          <div className="flex items-center space-x-2 shrink-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-[#E2136E]/20 to-pink-500/10 text-[#E2136E] dark:text-pink-400 border border-[#E2136E]/30 shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Operating Window
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                Reporting Cycle
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-300/60 dark:bg-white/10 hidden md:block mx-1" />

          {/* Segmented Mode Tabs */}
          <div className="flex flex-wrap sm:inline-flex bg-slate-200/60 dark:bg-black/50 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300/40 dark:border-white/[0.08] shadow-inner max-w-full">
            <button
              onClick={() => handleModeChange('MTD')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-200 font-bold cursor-pointer text-center text-[11px] sm:text-xs ${
                tfMode === 'MTD'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-sm font-black'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Live MTD
            </button>
            <button
              onClick={() => handleModeChange('MONTH')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-200 font-bold cursor-pointer text-center text-[11px] sm:text-xs ${
                tfMode === 'MONTH'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-sm font-black'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthwise
            </button>
            <button
              onClick={() => handleModeChange('QUARTER')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-200 font-bold cursor-pointer text-center text-[11px] sm:text-xs ${
                tfMode === 'QUARTER'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-sm font-black'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Quarterwise
            </button>
            <button
              onClick={() => handleModeChange('HALFYEAR')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-200 font-bold cursor-pointer text-center text-[11px] sm:text-xs ${
                tfMode === 'HALFYEAR'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-sm font-black'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Half-Yearly
            </button>
          </div>

          {/* Period Dropdown */}
          <div className="relative w-full sm:w-auto min-w-[180px] sm:min-w-[200px]">
            {tfMode === 'MTD' ? (
              <div className="w-full glass-input rounded-xl py-1.5 pl-3 pr-8 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-white/[0.03]">
                Live MTD (October 2026)
              </div>
            ) : (
              <>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full glass-input rounded-xl py-1.5 pl-3 pr-8 text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm"
                >
                  {periodOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white">
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
              </>
            )}
          </div>

          {isRunningCycle && (
            <span className="inline-flex items-center space-x-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full animate-pulse">
              <Activity className="w-3 h-3" />
              <span>Running Cycle Actuals</span>
            </span>
          )}

        </div>

        {/* Right: Active Cycle Badge + Dataset Status & Clear Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          
          <div className="bg-gradient-to-r from-[#E2136E]/15 to-purple-500/15 border border-[#E2136E]/30 text-[#E2136E] dark:text-pink-300 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black flex items-center space-x-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{activePeriodLabel}</span>
          </div>

          {totalCount !== undefined && (
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-100/80 dark:bg-white/[0.04] px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-[11px] sm:text-xs">
              <Database className="w-3.5 h-3.5 text-[#E2136E]" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Active: <strong className="text-slate-900 dark:text-white font-mono font-bold">{totalCount}</strong>
              </span>
            </div>
          )}

          {onClearData && (
            <button
              onClick={onClearData}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-rose-50/80 dark:hover:bg-rose-950/40 transition border border-rose-300/40 dark:border-rose-900/40 cursor-pointer backdrop-blur-md active:scale-95"
              title="Clear current sheet and upload new file"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Sheet</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
