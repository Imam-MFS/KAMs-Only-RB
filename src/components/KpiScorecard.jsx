import React from 'react';
import {
  CircleDollarSign,
  Activity,
  Store,
  AlertOctagon,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { formatBDT, formatNumber } from '../utils/formatters';

export default function KpiScorecard({
  totalPA,
  totalPC,
  activeCount,
  totalOutlets,
  redCount,
  aov,
  periodSubtitle
}) {
  const activeRate = totalOutlets > 0 ? (activeCount / totalOutlets) * 100 : 0;
  const redRate = totalOutlets > 0 ? (redCount / totalOutlets) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      
      {/* 1. Total Volume (PA) */}
      <div className="kpi-card rounded-2xl p-4 sm:p-5 relative group border border-white/10 dark:border-white/[0.08]">
        {/* Top neon hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E2136E] via-[#FF2E88] to-purple-500" />
        
        {/* Soft radial glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#E2136E]/20 rounded-full blur-2xl pointer-events-none group-hover:bg-[#E2136E]/30 transition-all duration-300" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2136E] neon-dot-pink" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Total Volume (PA)
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E2136E]/20 to-pink-500/10 text-[#E2136E] dark:text-pink-400 border border-[#E2136E]/30 flex items-center justify-center shadow-xs">
            <CircleDollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 relative z-10">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            {formatBDT(totalPA)}
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
              {periodSubtitle} GMV
            </span>
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px]">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.8%
            </span>
          </div>
        </div>

        {/* Micro Sparkline Curve Graphic */}
        <div className="mt-3 h-6 w-full opacity-60 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradPA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E2136E" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#E2136E" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,18 Q20,12 35,16 T70,8 T100,4 L100,24 L0,24 Z" fill="url(#gradPA)" />
            <path d="M0,18 Q20,12 35,16 T70,8 T100,4" fill="none" stroke="#E2136E" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 2. Completed Transactions (PC) */}
      <div className="kpi-card rounded-2xl p-4 sm:p-5 relative group border border-white/10 dark:border-white/[0.08]">
        {/* Top neon hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
        
        {/* Soft radial glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/30 transition-all duration-300" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 neon-dot-blue" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Transactions (PC)
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500/20 to-sky-500/10 text-blue-500 dark:text-blue-400 border border-blue-400/30 flex items-center justify-center shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 relative z-10">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            {formatNumber(totalPC)}
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
              Completed txns
            </span>
            <span className="inline-flex items-center text-sky-600 dark:text-sky-400 font-bold bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-full text-[10px]">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +8.2%
            </span>
          </div>
        </div>

        {/* Micro Sparkline Curve Graphic */}
        <div className="mt-3 h-6 w-full opacity-60 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradPC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,20 Q25,10 50,14 T80,6 T100,2 L100,24 L0,24 Z" fill="url(#gradPC)" />
            <path d="M0,20 Q25,10 50,14 T80,6 T100,2" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 3. Active Outlets (Green & Amber) */}
      <div className="kpi-card rounded-2xl p-4 sm:p-5 relative group border border-white/10 dark:border-white/[0.08]">
        {/* Top neon hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        
        {/* Soft radial glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-300" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 neon-dot-emerald" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Active Outlets
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-400/30 flex items-center justify-center shadow-xs">
            <Store className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 relative z-10 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            {formatNumber(activeCount)}
            <span className="text-xs font-mono font-medium text-slate-400 ml-1">/{totalOutlets}</span>
          </div>
          <div className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shadow-xs">
            {activeRate.toFixed(1)}%
          </div>
        </div>

        {/* Dynamic Glowing Progress Line */}
        <div className="mt-4 w-full bg-slate-200/60 dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden p-0.2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out shadow-sm shadow-emerald-500/40 relative"
            style={{ width: `${Math.min(100, Math.max(0, activeRate))}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full shadow-xs shadow-white" />
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
          <span>Active penetration</span>
          <span className="text-emerald-500 font-bold">Healthy base</span>
        </div>
      </div>

      {/* 4. Dormant Outlets (Red) */}
      <div className="kpi-card rounded-2xl p-4 sm:p-5 relative group border border-white/10 dark:border-white/[0.08]">
        {/* Top neon hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-pink-600 to-red-500" />
        
        {/* Soft radial glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/30 transition-all duration-300" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 neon-dot-rose" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 dark:text-rose-400">
              Dormant Outlets
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500/20 to-pink-500/10 text-rose-500 dark:text-rose-400 border border-rose-400/30 flex items-center justify-center shadow-xs">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 relative z-10 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-600 dark:text-rose-400">
            {formatNumber(redCount)}
          </div>
          <div className="text-xs font-black font-mono text-rose-600 dark:text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full shadow-xs">
            {redRate.toFixed(1)}%
          </div>
        </div>

        {/* Dynamic Glowing Progress Line */}
        <div className="mt-4 w-full bg-slate-200/60 dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden p-0.2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 transition-all duration-700 ease-out shadow-sm shadow-rose-500/40 relative"
            style={{ width: `${Math.min(100, Math.max(0, redRate))}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full shadow-xs shadow-white" />
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
          <span>Non-transacting 0 Trx</span>
          <span className="text-rose-500 font-bold">Needs Revival</span>
        </div>
      </div>

      {/* 5. Ticket Size (AOV) */}
      <div className="kpi-card rounded-2xl p-4 sm:p-5 relative group border border-white/10 dark:border-white/[0.08]">
        {/* Top neon hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400" />
        
        {/* Soft radial glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/30 transition-all duration-300" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 neon-dot-amber" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Ticket Size (AOV)
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 text-amber-500 dark:text-amber-400 border border-amber-400/30 flex items-center justify-center shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 relative z-10">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            {formatBDT(aov)}
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
              Average per ticket
            </span>
            <span className="inline-flex items-center text-amber-600 dark:text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px]">
              <Zap className="w-3 h-3 mr-0.5 text-amber-400" /> Optimal
            </span>
          </div>
        </div>

        {/* Micro Sparkline Curve Graphic */}
        <div className="mt-3 h-6 w-full opacity-60 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradAOV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,16 Q30,18 55,10 T85,12 T100,6 L100,24 L0,24 Z" fill="url(#gradAOV)" />
            <path d="M0,16 Q30,18 55,10 T85,12 T100,6" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

    </div>
  );
}
