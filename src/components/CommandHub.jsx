import React from 'react';
import {
  Layers,
  Activity,
  CircleDollarSign,
  Clock,
  RotateCcw,
  Sparkles,
  Flame,
  Zap,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function CommandHub({
  healthPreset,
  setHealthPreset,
  revenuePreset,
  setRevenuePreset,
  onboardingPreset,
  setOnboardingPreset,
  counts = {}
}) {
  const isAnyFilterActive =
    healthPreset !== 'ALL' || revenuePreset !== 'ALL' || onboardingPreset !== 'ALL';

  const handleResetAllCohorts = () => {
    setHealthPreset('ALL');
    setRevenuePreset('ALL');
    setOnboardingPreset('ALL');
  };

  return (
    <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 space-y-5 border border-white/10 dark:border-white/[0.08] shadow-2xl relative overflow-hidden transition-all duration-300">
      
      {/* 1. Header Bar with Reset Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E2136E] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-[#E2136E]/25 flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Executive Lifecycle & Velocity Cohorts
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E2136E]/15 text-[#E2136E] dark:text-pink-300 border border-[#E2136E]/30">
                1-Click Isolation
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Precision merchant clusters across transaction health, revenue velocity, and onboarding curves
            </p>
          </div>
        </div>

        {/* Reset Cohort Presets Button */}
        {isAnyFilterActive && (
          <button
            onClick={handleResetAllCohorts}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition cursor-pointer flex items-center space-x-1.5 active:scale-95 animate-fade-in"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Cohort Filters</span>
          </button>
        )}
      </div>

      {/* 2. Structured 3-Column Luxury Cohort Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* Stream 1: Health Archetypes */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 border border-white/10 dark:border-white/[0.06] relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-white/[0.04]">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Health Archetypes
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md">
              Activity State
            </span>
          </div>

          {/* Symmetrical 2-Column Grid (6 Buttons) */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            
            {/* 1. All Statuses */}
            <button
              onClick={() => setHealthPreset('ALL')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                healthPreset === 'ALL'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-100/70 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <Activity className={`w-3.5 h-3.5 ${healthPreset === 'ALL' ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <span className="truncate">All Statuses</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                healthPreset === 'ALL' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
              }`}>
                {formatNumber(counts.hAll)}
              </span>
            </button>

            {/* 2. Transacting (Green) */}
            <button
              onClick={() => setHealthPreset('GREEN')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                healthPreset === 'GREEN'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
                </div>
                <span className="truncate">Transacting</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                healthPreset === 'GREEN' ? 'bg-white/25 text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}>
                {formatNumber(counts.hGreen)}
              </span>
            </button>

            {/* 3. Active (PC > 0) */}
            <button
              onClick={() => setHealthPreset('ACTIVE_OUTLETS')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                healthPreset === 'ACTIVE_OUTLETS'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-teal-500/40 hover:bg-teal-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${healthPreset === 'ACTIVE_OUTLETS' ? 'text-white' : 'text-teal-500'}`} />
                </div>
                <span className="truncate">Active (Txn &gt; 0)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                healthPreset === 'ACTIVE_OUTLETS' ? 'bg-white/25 text-white' : 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
              }`}>
                {formatNumber(counts.hActive)}
              </span>
            </button>

            {/* 4. Low Trx (Amber) */}
            <button
              onClick={() => setHealthPreset('AMBER')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                healthPreset === 'AMBER'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-amber-500/40 hover:bg-amber-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                </div>
                <span className="truncate">Low Trx</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                healthPreset === 'AMBER' ? 'bg-white/25 text-white' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}>
                {formatNumber(counts.hAmber)}
              </span>
            </button>

            {/* 5. At-Risk (Amber+Red) */}
            <button
              onClick={() => setHealthPreset('NON_TRANSACTING')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                healthPreset === 'NON_TRANSACTING'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-purple-500/40 hover:bg-purple-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className={`w-3.5 h-3.5 ${healthPreset === 'NON_TRANSACTING' ? 'text-white' : 'text-purple-400'}`} />
                </div>
                <span className="truncate">At-Risk (Non-Green)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                healthPreset === 'NON_TRANSACTING' ? 'bg-white/25 text-white' : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
              }`}>
                {formatNumber(counts.hNonTrx)}
              </span>
            </button>

            {/* 6. Dormant (0 Trx) */}
            <button
              onClick={() => setHealthPreset('RED')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                healthPreset === 'RED'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                </div>
                <span className="truncate">Dormant (0 Trx)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                healthPreset === 'RED' ? 'bg-white/25 text-white' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}>
                {formatNumber(counts.hRed)}
              </span>
            </button>

          </div>
        </div>

        {/* Stream 2: Revenue Velocity */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 border border-white/10 dark:border-white/[0.06] relative overflow-hidden transition-all duration-300 hover:border-[#E2136E]/30">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-white/[0.04]">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#E2136E]/15 text-[#E2136E]">
                <CircleDollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Revenue Velocity
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md">
              Volume Brackets
            </span>
          </div>

          {/* Symmetrical 2-Column Grid (6 Buttons) */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            
            {/* 1. All Volumes */}
            <button
              onClick={() => setRevenuePreset('ALL')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                revenuePreset === 'ALL'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-100/70 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <CircleDollarSign className={`w-3.5 h-3.5 ${revenuePreset === 'ALL' ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <span className="truncate">All Volumes</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                revenuePreset === 'ALL' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
              }`}>
                {formatNumber(counts.rAll)}
              </span>
            </button>

            {/* 2. High Vol (> 50K) */}
            <button
              onClick={() => setRevenuePreset('OVER_50K')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                revenuePreset === 'OVER_50K' || revenuePreset === 'ABOVE_50K'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className={`w-3.5 h-3.5 ${revenuePreset === 'OVER_50K' || revenuePreset === 'ABOVE_50K' ? 'text-white' : 'text-cyan-500'}`} />
                </div>
                <span className="truncate">High Vol (&gt; 50K)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                revenuePreset === 'OVER_50K' || revenuePreset === 'ABOVE_50K' ? 'bg-white/25 text-white' : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
              }`}>
                {formatNumber(counts.rOver50)}
              </span>
            </button>

            {/* 3. Generating Revenue (PA > 0) */}
            <button
              onClick={() => setRevenuePreset('ACTIVE_VOL')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                revenuePreset === 'ACTIVE_VOL'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <Sparkles className={`w-3.5 h-3.5 ${revenuePreset === 'ACTIVE_VOL' ? 'text-white' : 'text-emerald-500'}`} />
                </div>
                <span className="truncate">Active (PA &gt; 0)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                revenuePreset === 'ACTIVE_VOL' ? 'bg-white/25 text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}>
                {formatNumber(counts.rActiveVol)}
              </span>
            </button>

            {/* 4. Mid Vol (25K - 50K) */}
            <button
              onClick={() => setRevenuePreset('MID_VOL')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                revenuePreset === 'MID_VOL'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <Zap className={`w-3.5 h-3.5 ${revenuePreset === 'MID_VOL' ? 'text-white' : 'text-indigo-400'}`} />
                </div>
                <span className="truncate">Mid Vol (25K-50K)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                revenuePreset === 'MID_VOL' ? 'bg-white/25 text-white' : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
              }`}>
                {formatNumber(counts.rMidVol)}
              </span>
            </button>

            {/* 5. Under 25K */}
            <button
              onClick={() => setRevenuePreset('UNDER_25K')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                revenuePreset === 'UNDER_25K'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-purple-500/40 hover:bg-purple-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <Flame className={`w-3.5 h-3.5 ${revenuePreset === 'UNDER_25K' ? 'text-white' : 'text-purple-400'}`} />
                </div>
                <span className="truncate">Under 25K</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                revenuePreset === 'UNDER_25K' ? 'bg-white/25 text-white' : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
              }`}>
                {formatNumber(counts.rUnder25)}
              </span>
            </button>

            {/* 6. Zero Vol (PA = 0) */}
            <button
              onClick={() => setRevenuePreset('ZERO_VOL')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                revenuePreset === 'ZERO_VOL' || revenuePreset === 'ZERO_PA'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                </div>
                <span className="truncate">Zero Vol (PA=0)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                revenuePreset === 'ZERO_VOL' || revenuePreset === 'ZERO_PA' ? 'bg-white/25 text-white' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}>
                {formatNumber(counts.rZero)}
              </span>
            </button>

          </div>
        </div>

        {/* Stream 3: Onboarding Drop-off */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 border border-white/10 dark:border-white/[0.06] relative overflow-hidden transition-all duration-300 hover:border-amber-500/30">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-white/[0.04]">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Onboarding Drop-off
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md">
              Post-Reg Lag
            </span>
          </div>

          {/* Symmetrical 2-Column Grid (6 Buttons) */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            
            {/* 1. All Reg Cycles */}
            <button
              onClick={() => setOnboardingPreset('ALL')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                onboardingPreset === 'ALL'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-100/70 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <Clock className={`w-3.5 h-3.5 ${onboardingPreset === 'ALL' ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <span className="truncate">All Reg Cycles</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                onboardingPreset === 'ALL' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
              }`}>
                {formatNumber(counts.oAll)}
              </span>
            </button>

            {/* 2. Active Early in M1 */}
            <button
              onClick={() => setOnboardingPreset('EARLY_ACTIVE')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                onboardingPreset === 'EARLY_ACTIVE'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${onboardingPreset === 'EARLY_ACTIVE' ? 'text-white' : 'text-emerald-500'}`} />
                </div>
                <span className="truncate">Active Early (M1)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                onboardingPreset === 'EARLY_ACTIVE' ? 'bg-white/25 text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}>
                {formatNumber(counts.oEarlyActive)}
              </span>
            </button>

            {/* 3. No Trx 1M Post-Reg */}
            <button
              onClick={() => setOnboardingPreset('NO_TRX_1M')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                onboardingPreset === 'NO_TRX_1M' || onboardingPreset === 'DROP_1M'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-amber-500/40 hover:bg-amber-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                </div>
                <span className="truncate">No Trx 1M Lag</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                onboardingPreset === 'NO_TRX_1M' || onboardingPreset === 'DROP_1M' ? 'bg-white/25 text-white' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}>
                {formatNumber(counts.o1m)}
              </span>
            </button>

            {/* 4. No Trx 3M Post-Reg */}
            <button
              onClick={() => setOnboardingPreset('NO_TRX_3M')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                onboardingPreset === 'NO_TRX_3M' || onboardingPreset === 'DROP_3M'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-orange-500/40 hover:bg-orange-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className={`w-3.5 h-3.5 ${onboardingPreset === 'NO_TRX_3M' || onboardingPreset === 'DROP_3M' ? 'text-white' : 'text-orange-400'}`} />
                </div>
                <span className="truncate">No Trx 3M Lag</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                onboardingPreset === 'NO_TRX_3M' || onboardingPreset === 'DROP_3M' ? 'bg-white/25 text-white' : 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
              }`}>
                {formatNumber(counts.o3m)}
              </span>
            </button>

            {/* 5. No Trx 5M Post-Reg */}
            <button
              onClick={() => setOnboardingPreset('NO_TRX_5M')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                onboardingPreset === 'NO_TRX_5M' || onboardingPreset === 'DROP_5M'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <AlertOctagon className={`w-3.5 h-3.5 ${onboardingPreset === 'NO_TRX_5M' || onboardingPreset === 'DROP_5M' ? 'text-white' : 'text-rose-500'}`} />
                </div>
                <span className="truncate">No Trx 5M Lag</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                onboardingPreset === 'NO_TRX_5M' || onboardingPreset === 'DROP_5M' ? 'bg-white/25 text-white' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}>
                {formatNumber(counts.o5m)}
              </span>
            </button>

            {/* 6. Chronic Dormancy Since Registration */}
            <button
              onClick={() => setOnboardingPreset('CHRONIC_ZERO')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border min-h-[42px] ${
                onboardingPreset === 'CHRONIC_ZERO'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-transparent font-bold shadow-md shadow-[#E2136E]/25'
                  : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/5 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                </div>
                <span className="truncate">Never Trx (Dead)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1.5 tabular-nums ${
                onboardingPreset === 'CHRONIC_ZERO' ? 'bg-white/25 text-white' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}>
                {formatNumber(counts.oChronicZero)}
              </span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
