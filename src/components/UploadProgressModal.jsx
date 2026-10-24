import React from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Database,
  Cpu,
  BarChart3,
  Loader2
} from 'lucide-react';
import bkashLogo from '../assets/logo.png';

export const INGESTION_STAGES = [
  {
    title: 'Reading Workbook Stream',
    desc: 'Validating binary structures and sheets',
    icon: FileSpreadsheet
  },
  {
    title: 'Extracting 190+ Columns & Hierarchy',
    desc: 'Mapping RB KAM Leads, RB KAM, District & Thana',
    icon: Layers
  },
  {
    title: 'Indexing 33-Month Historical Trends',
    desc: 'Synthesizing Jan\'24-Sep\'26 logs & MTD actuals',
    icon: BarChart3
  },
  {
    title: 'Calibrating Health Cohorts & AI Engine',
    desc: 'Computing Green/Amber/Red & velocity matrices',
    icon: Cpu
  }
];

export default function UploadProgressModal({
  isOpen,
  progress = 0,
  stageIndex = 0,
  fileName = 'bKash Sales Workbook.xlsx',
  fileSize = '0 MB',
  recordsCount = 0,
  isComplete = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#040711]/80 backdrop-blur-xl transition-all duration-300 overflow-y-auto">
      
      {/* Aurora Ambient Glow in Modal */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#E2136E]/30 via-purple-600/25 to-sky-500/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-5 sm:p-8 border border-white/20 dark:border-white/10 shadow-2xl space-y-5 sm:space-y-6 overflow-hidden my-auto max-h-[94vh] overflow-y-auto">
        
        {/* Animated Scanning Beam Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E2136E] to-transparent animate-pulse" />

        {/* Top Header & Spinner Visual */}
        <div className="flex flex-col items-center text-center space-y-4">
          
          {/* Futuristic Concentric Radar Ring Spinner */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            
            {/* Outer rotating dashed ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#E2136E]/60 animate-spin" style={{ animationDuration: '6s' }} />
            
            {/* Middle counter-rotating ring */}
            <div className="absolute inset-2 rounded-full border border-sky-400/40 border-t-purple-400 border-r-pink-500 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
            
            {/* Inner glowing pulse ring */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#E2136E]/30 via-[#FF2E88]/20 to-transparent blur-sm animate-pulse" />

            {/* Central emblem */}
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-[#E2136E]/40">
              {isComplete ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              ) : (
                <img
                  src={bkashLogo}
                  alt="bKash"
                  className="w-11 h-11 object-contain drop-shadow-[0_2px_10px_rgba(226,19,110,0.5)]"
                />
              )}
            </div>
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E2136E]/15 text-[#E2136E] dark:text-pink-300 border border-[#E2136E]/30 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#E2136E] animate-ping inline-block" />
              <span>{isComplete ? 'Ingestion Finished' : 'Processing Territory Data'}</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isComplete ? 'Workbook Ready!' : 'Ingesting bKash Workbook...'}
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center space-x-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{fileName}</span>
              <span>•</span>
              <span className="font-mono">{fileSize}</span>
              {recordsCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[#E2136E] dark:text-pink-400 font-bold">{recordsCount} Accounts</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Dynamic Progress Bar with Glowing Needle */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
              <Loader2 className={`w-3.5 h-3.5 text-[#E2136E] ${isComplete ? '' : 'animate-spin'}`} />
              <span>{INGESTION_STAGES[stageIndex]?.title || 'Processing pipeline...'}</span>
            </span>
            <span className="font-black text-sm text-[#E2136E] dark:text-pink-400 font-mono">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>

          <div className="relative w-full h-3 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#E2136E] via-[#FF2E88] to-purple-500 transition-all duration-300 ease-out relative"
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              {/* Shimmer light bar */}
              <div className="absolute inset-0 bg-white/30 animate-glass-shimmer" />
              {/* Right glowing tip */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-md shadow-white" />
            </div>
          </div>
        </div>

        {/* 4 Multi-Stage Verification Pipeline Steps */}
        <div className="space-y-2.5 bg-slate-500/5 dark:bg-black/25 p-3.5 rounded-2xl border border-white/10 dark:border-white/5">
          {INGESTION_STAGES.map((stg, idx) => {
            const Icon = stg.icon;
            const isDone = stageIndex > idx || isComplete;
            const isCurrent = stageIndex === idx && !isComplete;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-white/80 dark:bg-white/10 shadow-sm border border-[#E2136E]/40'
                    : isDone
                    ? 'opacity-85'
                    : 'opacity-40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                        : isCurrent
                        ? 'bg-[#E2136E] text-white shadow-md shadow-[#E2136E]/30 animate-pulse'
                        : 'bg-slate-300/40 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {stg.title}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {stg.desc}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-bold">
                  {isDone ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Done</span>
                  ) : isCurrent ? (
                    <span className="text-[#E2136E] dark:text-pink-400 font-mono animate-pulse">Live</span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Waiting</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Safety & Privacy Note */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center space-x-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local browser parsing. Zero data transmitted over the internet.</span>
        </div>

      </div>
    </div>
  );
}
