import React, { useState, useMemo } from 'react';
import {
  Target,
  Trophy,
  UserCheck,
  User,
  Search,
  Sliders,
  Download,
  CheckCircle2,
  RotateCcw,
  Clock,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { formatBDT, formatNumber } from '../utils/formatters';
import {
  HISTORICAL_MONTHS,
  QUARTERS,
  HALF_YEARS,
  getMerchantPeriodMetrics
} from '../data/timeline';

export default function KpiMetricsView({ allMerchants = [], isDark = true }) {
  // 1. Timeframe Selection for KPI Evaluation
  const [selectedTimeframe, setSelectedTimeframe] = useState('Live MTD');

  // 2. Hierarchy Scope: 'rbKam' (Officers) | 'rbKamLead' (Regional Leads)
  const [roleScope, setRoleScope] = useState('rbKam');

  // 3. Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubUnit, setSelectedSubUnit] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'pa' | 'pc' | 'active' | 'name'
  const [sortOrder, setSortOrder] = useState('desc');

  // 4. KPI Weights Configuration
  // STRICT USER SPECIFICATION:
  // Payment Amount = 20%
  // Payment Count = 20%
  // Active Merchant (ONLY Green; Amber & Red excluded) = 15%
  // MAU, Acquisition, QR+2 = EXCLUDED
  // Total Weight = 55%
  const [weights, setWeights] = useState(() => {
    try {
      const saved = localStorage.getItem('bkash_kpi_weights_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pa + parsed.pc + parsed.active === 55) return parsed;
      }
    } catch (e) {}
    return {
      pa: 20,
      pc: 20,
      active: 15
    };
  });

  // 5. Target Growth Multiplier (% above baseline for default target generation)
  const [targetGrowthPct, setTargetGrowthPct] = useState(10); // default +10%

  // 6. Custom Overrides for Targets (Key: Employee Name -> { targetPA, targetPC, targetActive })
  const [customTargets, setCustomTargets] = useState(() => {
    try {
      const saved = localStorage.getItem('bkash_kpi_custom_targets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // 7. Target Configuration Drawer/Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({ targetPA: '', targetPC: '', targetActive: '' });

  // Save weights to localStorage
  const handleSaveWeights = (newWeights) => {
    setWeights(newWeights);
    try {
      localStorage.setItem('bkash_kpi_weights_v2', JSON.stringify(newWeights));
    } catch (e) {}
  };

  // Save custom target for a specific employee
  const handleSaveCustomTarget = (empName, targets) => {
    const updated = {
      ...customTargets,
      [empName]: targets
    };
    setCustomTargets(updated);
    try {
      localStorage.setItem('bkash_kpi_custom_targets', JSON.stringify(updated));
    } catch (e) {}
    setEditingEmployee(null);
  };

  const handleResetTargets = () => {
    setCustomTargets({});
    try {
      localStorage.removeItem('bkash_kpi_custom_targets');
    } catch (e) {}
  };

  // Helper to detect period mode
  const detectPeriodMode = (pVal) => {
    if (!pVal || pVal === 'Live MTD') return 'MTD';
    if (pVal.startsWith('Q')) return 'QUARTER';
    if (pVal.startsWith('H')) return 'HALFYEAR';
    if (pVal === '2026' || pVal === '2025' || pVal === '2024') return 'YEAR';
    return 'MONTH';
  };

  // Calculate Employee KPI Records from Merchant Data
  const employeeKpis = useMemo(() => {
    if (!allMerchants || allMerchants.length === 0) return [];

    const pMode = detectPeriodMode(selectedTimeframe);

    // Group merchants by selected employee role
    const groups = {};
    allMerchants.forEach((m) => {
      const empName = m[roleScope] || (roleScope === 'rbKam' ? 'Unassigned Officer' : 'Commercial Lead');
      if (!groups[empName]) {
        groups[empName] = {
          name: empName,
          merchants: [],
          districts: {}
        };
      }
      groups[empName].merchants.push(m);
      if (m.district) {
        groups[empName].districts[m.district] = (groups[empName].districts[m.district] || 0) + 1;
      }
    });

    // Compute actuals and targets for each employee
    return Object.values(groups).map((grp) => {
      const empName = grp.name;
      const totalOutlets = grp.merchants.length;

      // Primary Sub Unit / District
      const topDistrict = Object.entries(grp.districts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Commercial Hub';
      const subUnit = `${topDistrict} Unit`;

      // Employee Designation based on roleScope
      const designation =
        roleScope === 'rbKam'
          ? 'RB KAM (Officer)'
          : 'RB KAM Lead';

      // Deterministic Corporate Employee ID (e.g., BK-72019)
      let hash = 0;
      for (let i = 0; i < empName.length; i++) {
        hash = (hash << 5) - hash + empName.charCodeAt(i);
        hash |= 0;
      }
      const empId = `BK-${Math.abs(hash % 90000) + 10000}`;

      // 1. Calculate Actuals for Selected Timeframe
      let actualPA = 0;
      let actualPC = 0;
      let actualActive = 0; // STRICT: ONLY Green outlets! Amber & Red are excluded!

      // Also calculate baseline to set intelligent targets
      let baselinePA = 0;
      let baselinePC = 0;

      if (pMode === 'YEAR') {
        const yr = selectedTimeframe;
        grp.merchants.forEach((m) => {
          let mPA = 0;
          let mPC = 0;
          HISTORICAL_MONTHS.forEach((mStr) => {
            if (mStr.includes(`'${yr.slice(2)}`)) {
              const h = m.history?.[mStr];
              if (h) {
                mPA += h.pa || 0;
                mPC += h.pc || 0;
              }
            }
          });
          if (yr === '2026') {
            mPA += m.mtdPA || 0;
            mPC += m.mtdPC || 0;
          }
          actualPA += mPA;
          actualPC += mPC;
          // In annual mode, green threshold is steady active run rate (>= 35 txns/month or 350+ annual)
          if (mPC >= 350) actualActive++;
        });
        baselinePA = actualPA * 0.9;
        baselinePC = actualPC * 0.9;
      } else {
        grp.merchants.forEach((m) => {
          const met = getMerchantPeriodMetrics(m, pMode, selectedTimeframe);
          actualPA += met.pa;
          actualPC += met.pc;

          // CRITICAL USER INSTRUCTION:
          // "jegulo hocche shudhu Green, segulo hocche active merchant. Amber aar Red kintu active merchant na."
          // ONLY Green outlets count as Active Merchant!
          if (met.health === 'Green') {
            actualActive++;
          }

          // Baseline from previous cycle
          const prevMet = getMerchantPeriodMetrics(m, 'MONTH', "Sep'26");
          baselinePA += prevMet.pa;
          baselinePC += prevMet.pc;
        });
      }

      // 2. Set Targets (Custom Override or Dynamic Growth Target)
      const custom = customTargets[empName];
      let targetPA = 0;
      let targetPC = 0;
      let targetActive = 0;

      if (custom) {
        targetPA = Number(custom.targetPA) || 0;
        targetPC = Number(custom.targetPC) || 0;
        targetActive = Number(custom.targetActive) || 0;
      } else {
        // Base intelligent target generation (+growth% above baseline or realistic quotas)
        const mult = 1 + targetGrowthPct / 100;
        targetPA = Math.round((baselinePA > 0 ? baselinePA : actualPA * 0.95) * mult);
        targetPC = Math.round((baselinePC > 0 ? baselinePC : actualPC * 0.95) * mult);
        // Active merchant green target: realistic benchmark (e.g. 60% of outlets maintaining Green status)
        targetActive = Math.max(1, Math.round(totalOutlets * 0.60));
      }

      // Ensure targets are never zero to avoid division by zero
      if (targetPA <= 0) targetPA = Math.max(actualPA, 100000);
      if (targetPC <= 0) targetPC = Math.max(actualPC, 100);
      if (targetActive <= 0) targetActive = Math.max(actualActive, 1);

      // 3. Calculate Achievements (%)
      const paAch = (actualPA / targetPA) * 100;
      const pcAch = (actualPC / targetPC) * 100;
      const activeAch = (actualActive / targetActive) * 100;

      // 4. Calculate Final Weighted Score out of 55%
      // PA: 20%, PC: 20%, Active Merchant: 15% -> Total 55%
      const paScore = (paAch / 100) * weights.pa; // max 20%
      const pcScore = (pcAch / 100) * weights.pc; // max 20%
      const activeScore = (activeAch / 100) * weights.active; // max 15%
      const totalEarnedScore = paScore + pcScore + activeScore; // Earned Score out of 55%

      const maxWeight = weights.pa + weights.pc + weights.active; // 55%
      const achievementRateOn55 = maxWeight > 0 ? (totalEarnedScore / maxWeight) * 100 : 0;

      // 5. Assign Performance Tier based on progress against 55% quota
      let tier = 'Critical';
      let tierColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
      let tierLabel = 'Critical (< 70%)';

      if (totalEarnedScore >= maxWeight) {
        tier = 'Star Performer';
        tierColor = 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30';
        tierLabel = 'Over-Achiever (≥ 55%)';
      } else if (achievementRateOn55 >= 85) {
        tier = 'On Track';
        tierColor = 'text-sky-500 bg-sky-500/15 border-sky-500/30';
        tierLabel = 'On Track (85% – 99%)';
      } else if (achievementRateOn55 >= 70) {
        tier = 'Needs Push';
        tierColor = 'text-amber-500 bg-amber-500/15 border-amber-500/30';
        tierLabel = 'Needs Push (70% – 84%)';
      }

      return {
        id: empId,
        name: empName,
        subUnit,
        designation,
        totalOutlets,
        targetPA,
        targetPC,
        targetActive,
        actualPA,
        actualPC,
        actualActive,
        paAch,
        pcAch,
        activeAch,
        paScore,
        pcScore,
        activeScore,
        totalEarnedScore,
        achievementRateOn55,
        tier,
        tierColor,
        tierLabel,
        isCustom: !!custom
      };
    });
  }, [allMerchants, roleScope, selectedTimeframe, weights, targetGrowthPct, customTargets]);

  // Distinct Sub Units
  const distinctSubUnits = useMemo(() => {
    const set = new Set();
    employeeKpis.forEach((e) => set.add(e.subUnit));
    return Array.from(set).sort();
  }, [employeeKpis]);

  // Filtered & Sorted Employee List
  const filteredEmployees = useMemo(() => {
    let result = employeeKpis.filter((emp) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesId = emp.id.toLowerCase().includes(q);
        const matchesSub = emp.subUnit.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesSub) return false;
      }

      // Sub Unit filter
      if (selectedSubUnit !== 'ALL' && emp.subUnit !== selectedSubUnit) {
        return false;
      }

      // Tier filter
      if (selectedTier !== 'ALL' && emp.tier !== selectedTier) {
        return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let valA = a.totalEarnedScore;
      let valB = b.totalEarnedScore;

      if (sortBy === 'pa') {
        valA = a.actualPA;
        valB = b.actualPA;
      } else if (sortBy === 'pc') {
        valA = a.actualPC;
        valB = b.actualPC;
      } else if (sortBy === 'active') {
        valA = a.actualActive;
        valB = b.actualActive;
      } else if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [employeeKpis, searchQuery, selectedSubUnit, selectedTier, sortBy, sortOrder]);

  // Macro Summary Statistics
  const macroSummary = useMemo(() => {
    const totalEmployees = employeeKpis.length;
    const maxWeight = weights.pa + weights.pc + weights.active; // 55%

    if (totalEmployees === 0) {
      return {
        totalEmployees: 0,
        totalTargetPA: 0,
        totalActualPA: 0,
        overallPaAch: 0,
        totalTargetPC: 0,
        totalActualPC: 0,
        overallPcAch: 0,
        totalTargetActive: 0,
        totalActualActive: 0,
        overallActiveAch: 0,
        avgEarnedScore: 0,
        avgAchRate: 0,
        starCount: 0,
        criticalCount: 0
      };
    }

    let totalTargetPA = 0;
    let totalActualPA = 0;
    let totalTargetPC = 0;
    let totalActualPC = 0;
    let totalTargetActive = 0;
    let totalActualActive = 0;
    let sumEarnedScore = 0;
    let starCount = 0;
    let criticalCount = 0;

    employeeKpis.forEach((e) => {
      totalTargetPA += e.targetPA;
      totalActualPA += e.actualPA;
      totalTargetPC += e.targetPC;
      totalActualPC += e.actualPC;
      totalTargetActive += e.targetActive;
      totalActualActive += e.actualActive;
      sumEarnedScore += e.totalEarnedScore;
      if (e.totalEarnedScore >= maxWeight) starCount++;
      if (e.achievementRateOn55 < 70) criticalCount++;
    });

    const avgEarnedScore = sumEarnedScore / totalEmployees;
    const avgAchRate = maxWeight > 0 ? (avgEarnedScore / maxWeight) * 100 : 0;

    return {
      totalEmployees,
      totalTargetPA,
      totalActualPA,
      overallPaAch: totalTargetPA > 0 ? (totalActualPA / totalTargetPA) * 100 : 0,
      totalTargetPC,
      totalActualPC,
      overallPcAch: totalTargetPC > 0 ? (totalActualPC / totalTargetPC) * 100 : 0,
      totalTargetActive,
      totalActualActive,
      overallActiveAch: totalTargetActive > 0 ? (totalActualActive / totalTargetActive) * 100 : 0,
      avgEarnedScore,
      avgAchRate,
      starCount,
      criticalCount
    };
  }, [employeeKpis, weights]);

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredEmployees.length === 0) return;

    const headers = [
      'Employee ID',
      'Employee Full Name',
      'Sub Unit',
      'Designation',
      'Weightage PA (%)',
      'Weightage PC (%)',
      'Weightage Active Merchant (%)',
      'Total Weightage (%)',
      'Target Payment Amount (BDT)',
      'Target Payment Count',
      'Target Active Merchant (Green Only)',
      'Actual Payment Amount (BDT)',
      'Actual Payment Count',
      'Actual Active Merchant (Green Only)',
      'PA Achievement (%)',
      'PC Achievement (%)',
      'Active Merchant Achievement (%)',
      'Earned KPI Score (out of 55%)',
      'Achievement Rate on 55% Quota (%)',
      'Performance Tier'
    ];

    const rows = filteredEmployees.map((e) => [
      e.id,
      `"${e.name}"`,
      `"${e.subUnit}"`,
      `"${e.designation}"`,
      weights.pa,
      weights.pc,
      weights.active,
      weights.pa + weights.pc + weights.active,
      Math.round(e.targetPA),
      e.targetPC,
      e.targetActive,
      Math.round(e.actualPA),
      e.actualPC,
      e.actualActive,
      e.paAch.toFixed(1),
      e.pcAch.toFixed(1),
      e.activeAch.toFixed(1),
      e.totalEarnedScore.toFixed(1),
      e.achievementRateOn55.toFixed(1),
      `"${e.tier}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bKash_KPI_55pct_Matrix_${selectedTimeframe.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalWeight = weights.pa + weights.pc + weights.active;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header Control Station */}
      <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 border border-white/10 dark:border-white/[0.08] shadow-2xl space-y-5">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E2136E] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-[#E2136E]/30 font-black text-xl flex-shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  KPI Target & Metrics Console
                </h2>
                <span className="bg-[#E2136E]/15 text-[#E2136E] dark:text-pink-300 border border-[#E2136E]/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  55% Weightage Model
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Official Commercial KPI Matrix — PA 20% + PC 20% + Active Merchant (Green Only) 15% = <strong>55% Total Weight</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timeframe Selector */}
            <div className="flex items-center space-x-1.5 bg-white/40 dark:bg-white/[0.04] p-1.5 rounded-xl border border-slate-200 dark:border-white/10">
              <Clock className="w-3.5 h-3.5 text-[#E2136E]" />
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white border-none outline-none cursor-pointer pr-2"
              >
                <option value="Live MTD" className="bg-white dark:bg-[#0B0F19]">Live MTD (Oct 2026)</option>
                {HISTORICAL_MONTHS.slice().reverse().map((m) => (
                  <option key={m} value={m} className="bg-white dark:bg-[#0B0F19]">{m}</option>
                ))}
                {Object.keys(QUARTERS).map((q) => (
                  <option key={q} value={q} className="bg-white dark:bg-[#0B0F19]">{q}</option>
                ))}
                <option value="2026" className="bg-white dark:bg-[#0B0F19]">Full Year 2026</option>
                <option value="2025" className="bg-white dark:bg-[#0B0F19]">Full Year 2025</option>
              </select>
            </div>

            {/* Target & Weights Configuration Button */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/60 dark:bg-white/[0.05] hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition cursor-pointer flex items-center space-x-1.5 active:scale-95 shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-[#E2136E]" />
              <span>Weights (55%) & Targets</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white transition cursor-pointer flex items-center space-x-1.5 active:scale-95 shadow-md shadow-[#E2136E]/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export KPI Matrix</span>
            </button>
          </div>
        </div>

        {/* 2. Top Summary KPI Cards (Based on 55% Total Model) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          {/* Card 1: Commercial Force */}
          <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Commercial Force
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {macroSummary.totalEmployees} <span className="text-xs font-normal text-slate-400">Officers</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-500 flex items-center space-x-1">
              <span>{macroSummary.starCount} Over-achievers (≥55%)</span>
            </div>
          </div>

          {/* Card 2: Payment Amount Target vs Actual (Weight: 20%) */}
          <div className="glass-card rounded-2xl p-4 border border-[#E2136E]/25 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-[#E2136E] tracking-wider">
                Payment Amount (PA)
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E2136E]/15 text-[#E2136E]">
                Weight: {weights.pa}%
              </span>
            </div>
            <div className="text-xl font-black font-mono text-[#E2136E] dark:text-pink-400">
              {formatBDT(macroSummary.totalActualPA)}
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>Target: {formatBDT(macroSummary.totalTargetPA)}</span>
              <span className={`font-mono ${macroSummary.overallPaAch >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {macroSummary.overallPaAch.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Card 3: Payment Count Target vs Actual (Weight: 20%) */}
          <div className="glass-card rounded-2xl p-4 border border-sky-400/25 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-sky-400 tracking-wider">
                Payment Count (PC)
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-500">
                Weight: {weights.pc}%
              </span>
            </div>
            <div className="text-xl font-black font-mono text-sky-500 dark:text-sky-300">
              {formatNumber(macroSummary.totalActualPC)} <span className="text-xs font-normal">Txns</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>Target: {formatNumber(macroSummary.totalTargetPC)}</span>
              <span className={`font-mono ${macroSummary.overallPcAch >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {macroSummary.overallPcAch.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Card 4: Active Merchants (Green Only) (Weight: 15%) */}
          <div className="glass-card rounded-2xl p-4 border border-emerald-500/25 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-500 tracking-wider block">
                  Active Merchants
                </span>
                <span className="text-[9px] text-emerald-400 font-semibold block leading-none">
                  Green Outlets Only
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500">
                Weight: {weights.active}%
              </span>
            </div>
            <div className="text-xl font-black font-mono text-emerald-500 dark:text-emerald-400">
              {formatNumber(macroSummary.totalActualActive)} <span className="text-xs font-normal">Green</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>Target: {formatNumber(macroSummary.totalTargetActive)}</span>
              <span className={`font-mono ${macroSummary.overallActiveAch >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {macroSummary.overallActiveAch.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Card 5: Team Weighted KPI Score out of 55% */}
          <div className="glass-card rounded-2xl p-4 border border-purple-500/25 space-y-1 bg-gradient-to-br from-purple-500/10 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-wider">
                Team KPI (out of 55%)
              </span>
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-purple-400">
              {macroSummary.avgEarnedScore.toFixed(1)}% <span className="text-xs text-slate-400 font-normal">/ 55%</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400">
              Achievement: <strong className="text-slate-200">{macroSummary.avgAchRate.toFixed(1)}%</strong> of 55% quota
            </div>
          </div>

        </div>

        {/* 3. Filter Toolbar & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          
          {/* Role Segmented Tabs */}
          <div className="inline-flex bg-slate-200/60 dark:bg-black/50 p-1 rounded-xl text-xs font-semibold border border-slate-300/40 dark:border-white/[0.08] self-start md:self-auto">
            <button
              onClick={() => setRoleScope('rbKam')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer flex items-center space-x-1.5 ${
                roleScope === 'rbKam'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>RB KAM (Officers)</span>
            </button>
            <button
              onClick={() => setRoleScope('rbKamLead')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer flex items-center space-x-1.5 ${
                roleScope === 'rbKamLead'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>RB KAM Leads</span>
            </button>
          </div>

          {/* Search & Sub-Unit & Tier Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Employee ID or Name..."
                className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold placeholder-slate-400"
              />
            </div>

            {/* Sub Unit Filter */}
            <select
              value={selectedSubUnit}
              onChange={(e) => setSelectedSubUnit(e.target.value)}
              className="glass-input rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
            >
              <option value="ALL" className="bg-white dark:bg-[#0B0F19]">All Sub Units</option>
              {distinctSubUnits.map((u) => (
                <option key={u} value={u} className="bg-white dark:bg-[#0B0F19]">{u}</option>
              ))}
            </select>

            {/* Performance Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="glass-input rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
            >
              <option value="ALL" className="bg-white dark:bg-[#0B0F19]">All Performance Tiers</option>
              <option value="Star Performer" className="bg-white dark:bg-[#0B0F19]">🌟 Over-Achievers (≥ 55%)</option>
              <option value="On Track" className="bg-white dark:bg-[#0B0F19]">🟢 On Track (85% – 99%)</option>
              <option value="Needs Push" className="bg-white dark:bg-[#0B0F19]">🟡 Needs Push (70% – 84%)</option>
              <option value="Critical" className="bg-white dark:bg-[#0B0F19]">🔴 Critical (&lt; 70%)</option>
            </select>

          </div>
        </div>

      </div>

      {/* 4. Complete KPI Table matching Sheet Structure */}
      <div className="glass-panel rounded-3xl border border-white/10 dark:border-white/[0.08] shadow-2xl overflow-hidden">
        
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#E2136E]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Commercial Operations Target & Achievement Ledger (55% Model)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              ({filteredEmployees.length} of {employeeKpis.length} evaluated)
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400">
            <span>Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === 'score') setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
                else { setSortBy('score'); setSortOrder('desc'); }
              }}
              className={`px-2 py-0.5 rounded-md cursor-pointer font-bold ${
                sortBy === 'score' ? 'bg-[#E2136E]/15 text-[#E2136E]' : 'hover:text-slate-200'
              }`}
            >
              Score (55%) {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'pa') setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
                else { setSortBy('pa'); setSortOrder('desc'); }
              }}
              className={`px-2 py-0.5 rounded-md cursor-pointer font-bold ${
                sortBy === 'pa' ? 'bg-[#E2136E]/15 text-[#E2136E]' : 'hover:text-slate-200'
              }`}
            >
              PA {sortBy === 'pa' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'pc') setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
                else { setSortBy('pc'); setSortOrder('desc'); }
              }}
              className={`px-2 py-0.5 rounded-md cursor-pointer font-bold ${
                sortBy === 'pc' ? 'bg-[#E2136E]/15 text-[#E2136E]' : 'hover:text-slate-200'
              }`}
            >
              PC {sortBy === 'pc' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            
            {/* Two-tier Table Header faithfully reflecting user's Excel structure */}
            <thead>
              {/* Row 1 Header */}
              <tr className="bg-slate-100/90 dark:bg-black/40 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-white/[0.08]">
                <th rowSpan={2} className="py-3 px-3.5 border-r border-slate-200/80 dark:border-white/[0.06] whitespace-nowrap">
                  Employee ID
                </th>
                <th rowSpan={2} className="py-3 px-3.5 border-r border-slate-200/80 dark:border-white/[0.06] whitespace-nowrap">
                  Employee Full Name
                </th>
                <th rowSpan={2} className="py-3 px-3 border-r border-slate-200/80 dark:border-white/[0.06] whitespace-nowrap">
                  Sub Unit
                </th>
                <th rowSpan={2} className="py-3 px-3 border-r border-slate-200/80 dark:border-white/[0.06] whitespace-nowrap">
                  Designation
                </th>
                
                {/* Group 1: KPI (Weightage) - Total 55% */}
                <th colSpan={4} className="py-2 px-3 text-center bg-purple-500/10 text-purple-700 dark:text-purple-300 border-r border-slate-200/80 dark:border-white/[0.06]">
                  KPI (Weightage) — 55% Total Model
                </th>

                {/* Group 2: Target */}
                <th colSpan={3} className="py-2 px-3 text-center bg-sky-500/10 text-sky-700 dark:text-sky-300 border-r border-slate-200/80 dark:border-white/[0.06]">
                  Target
                </th>

                {/* Group 3: Actual Performance */}
                <th colSpan={3} className="py-2 px-3 text-center bg-[#E2136E]/10 text-[#E2136E] dark:text-pink-300 border-r border-slate-200/80 dark:border-white/[0.06]">
                  Actual Performance ({selectedTimeframe})
                </th>

                {/* Group 4: Achievement % */}
                <th colSpan={3} className="py-2 px-3 text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-r border-slate-200/80 dark:border-white/[0.06]">
                  Achievement (%)
                </th>

                <th rowSpan={2} className="py-3 px-3 text-center border-r border-slate-200/80 dark:border-white/[0.06] whitespace-nowrap">
                  Earned Score (out of 55%)
                </th>
                <th rowSpan={2} className="py-3 px-3 text-center border-r border-slate-200/80 dark:border-white/[0.06] whitespace-nowrap">
                  Status
                </th>
                <th rowSpan={2} className="py-3 px-3 text-center whitespace-nowrap">
                  Action
                </th>
              </tr>

              {/* Row 2 Sub-Headers */}
              <tr className="bg-slate-100/60 dark:bg-black/30 text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08]">
                {/* Weightage Sub-Headers */}
                <th className="py-2.5 px-2 text-center bg-purple-500/5 whitespace-nowrap min-w-[50px]">PA</th>
                <th className="py-2.5 px-2 text-center bg-purple-500/5 whitespace-nowrap min-w-[50px]">PC</th>
                <th className="py-2.5 px-2 text-center bg-purple-500/5 whitespace-nowrap min-w-[65px]">Active</th>
                <th className="py-2.5 px-2 text-center bg-purple-500/5 border-r border-slate-200/80 dark:border-white/[0.06] font-bold text-purple-400 whitespace-nowrap min-w-[55px]">Total</th>

                {/* Target Sub-Headers */}
                <th className="py-2.5 px-3 text-right bg-sky-500/5 whitespace-nowrap min-w-[110px]">Payment Amt (PA)</th>
                <th className="py-2.5 px-3 text-right bg-sky-500/5 whitespace-nowrap min-w-[85px]">Payment Count (PC)</th>
                <th className="py-2.5 px-3 text-right bg-sky-500/5 border-r border-slate-200/80 dark:border-white/[0.06] whitespace-nowrap min-w-[90px]">Active (Green)</th>

                {/* Actuals Sub-Headers */}
                <th className="py-2.5 px-3 text-right bg-[#E2136E]/5 whitespace-nowrap min-w-[110px]">Payment Amt (PA)</th>
                <th className="py-2.5 px-3 text-right bg-[#E2136E]/5 whitespace-nowrap min-w-[85px]">Payment Count (PC)</th>
                <th className="py-2.5 px-3 text-right bg-[#E2136E]/5 border-r border-slate-200/80 dark:border-white/[0.06] whitespace-nowrap min-w-[95px] text-emerald-400">Green Outlets</th>

                {/* Achievement Sub-Headers */}
                <th className="py-2.5 px-2.5 text-right bg-emerald-500/5 whitespace-nowrap min-w-[70px]">PA Ach %</th>
                <th className="py-2.5 px-2.5 text-right bg-emerald-500/5 whitespace-nowrap min-w-[70px]">PC Ach %</th>
                <th className="py-2.5 px-2.5 text-right bg-emerald-500/5 border-r border-slate-200/80 dark:border-white/[0.06] whitespace-nowrap min-w-[70px]">Active %</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    <Target className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-50" />
                    <p className="font-bold text-sm">No employee records match your criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting search filters or upload your sales sheet.</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors font-medium group"
                  >
                    {/* Employee ID */}
                    <td className="py-3 px-3.5 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap">
                      {emp.id}
                    </td>

                    {/* Employee Full Name */}
                    <td className="py-3 px-3.5 border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {idx === 0 && <span title="Top Performer">🥇</span>}
                        {idx === 1 && <span title="Second Place">🥈</span>}
                        {idx === 2 && <span title="Third Place">🥉</span>}
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-[#E2136E] transition-colors">
                          {emp.name}
                        </span>
                        {emp.isCustom && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1 py-0.2 rounded font-mono font-bold" title="Custom Targets Applied">
                            Custom
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sub Unit */}
                    <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-slate-400 border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap">
                      {emp.subUnit}
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400 border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap">
                      {emp.designation}
                    </td>

                    {/* Weightages: 20%, 20%, 15%, Total 55% */}
                    <td className="py-3 px-2 text-center font-mono text-[11px] text-purple-600 dark:text-purple-300 bg-purple-500/[0.02] whitespace-nowrap tabular-nums">
                      {weights.pa}%
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[11px] text-purple-600 dark:text-purple-300 bg-purple-500/[0.02] whitespace-nowrap tabular-nums">
                      {weights.pc}%
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[11px] text-purple-600 dark:text-purple-300 bg-purple-500/[0.02] whitespace-nowrap tabular-nums">
                      {weights.active}%
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[11px] font-black text-purple-600 dark:text-purple-300 bg-purple-500/[0.06] border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap tabular-nums">
                      {totalWeight}%
                    </td>

                    {/* Targets */}
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-sky-600 dark:text-sky-300 bg-sky-500/[0.02] whitespace-nowrap tabular-nums">
                      {formatBDT(emp.targetPA)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-sky-600 dark:text-sky-300 bg-sky-500/[0.02] whitespace-nowrap tabular-nums">
                      {formatNumber(emp.targetPC)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-sky-600 dark:text-sky-300 bg-sky-500/[0.02] border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap tabular-nums">
                      {formatNumber(emp.targetActive)}
                    </td>

                    {/* Actuals */}
                    <td className="py-3 px-3 text-right font-mono text-[11px] font-bold text-[#E2136E] dark:text-pink-400 bg-[#E2136E]/[0.02] whitespace-nowrap tabular-nums">
                      {formatBDT(emp.actualPA)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] font-bold text-slate-800 dark:text-white bg-[#E2136E]/[0.02] whitespace-nowrap tabular-nums">
                      {formatNumber(emp.actualPC)}
                    </td>
                    {/* Active Merchant: ONLY GREEN! */}
                    <td className="py-3 px-3 text-right font-mono text-[11px] font-bold text-emerald-500 bg-[#E2136E]/[0.02] border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap tabular-nums">
                      {emp.actualActive} <span className="text-[10px] text-slate-400 font-normal">/ {emp.totalOutlets}</span>
                    </td>

                    {/* Achievements % */}
                    <td className={`py-3 px-2.5 text-right font-mono text-[11px] font-bold whitespace-nowrap tabular-nums ${emp.paAch >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {emp.paAch.toFixed(1)}%
                    </td>
                    <td className={`py-3 px-2.5 text-right font-mono text-[11px] font-bold whitespace-nowrap tabular-nums ${emp.pcAch >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {emp.pcAch.toFixed(1)}%
                    </td>
                    <td className={`py-3 px-2.5 text-right font-mono text-[11px] font-bold border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap tabular-nums ${emp.activeAch >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {emp.activeAch.toFixed(1)}%
                    </td>

                    {/* Earned KPI Score (out of 55%) */}
                    <td className="py-3 px-3 text-center border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className={`font-mono font-black text-xs whitespace-nowrap tabular-nums ${emp.totalEarnedScore >= totalWeight ? 'text-emerald-500' : emp.achievementRateOn55 >= 85 ? 'text-sky-500' : 'text-rose-500'}`}>
                          {emp.totalEarnedScore.toFixed(1)}% <span className="text-[10px] text-slate-400 font-normal">/ 55%</span>
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap tabular-nums">
                          ({emp.achievementRateOn55.toFixed(1)}% of 55)
                        </span>
                        {/* Progress meter bar */}
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${emp.totalEarnedScore >= totalWeight ? 'bg-emerald-500' : emp.achievementRateOn55 >= 85 ? 'bg-sky-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, emp.achievementRateOn55)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center border-r border-slate-200/50 dark:border-white/[0.04] whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${emp.tierColor}`}>
                        {emp.tier}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingEmployee(emp);
                          setEditForm({
                            targetPA: emp.targetPA,
                            targetPC: emp.targetPC,
                            targetActive: emp.targetActive
                          });
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-[#E2136E] transition cursor-pointer"
                        title="Edit individual target"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Active KPI Model: PA: <strong>{weights.pa}%</strong> • PC: <strong>{weights.pc}%</strong> • Active Merchant (Green Only): <strong>{weights.active}%</strong> (Total: <strong>55%</strong>)</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-500">
            ✓ Amber & Red outlets excluded from Active Count
          </span>
        </div>

      </div>

      {/* 5. Target & Weights Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-white/20 dark:border-white/10 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-[#E2136E]" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  KPI Weights (55% Model) & Targets
                </h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Weights Adjuster */}
            <div className="space-y-4">
              <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 font-medium">
                Standard Commercial Model: PA (<strong>20%</strong>) + PC (<strong>20%</strong>) + Active Merchant Green (<strong>15%</strong>) = <strong>55% Total Weight</strong>. MAU, Acquisition, and QR+2 are completely excluded.
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Payment Amount Weight:</span>
                    <span className="font-mono text-[#E2136E] font-bold">{weights.pa}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={weights.pa}
                    onChange={(e) => {
                      const newPA = Number(e.target.value);
                      handleSaveWeights({ ...weights, pa: newPA });
                    }}
                    className="w-full accent-[#E2136E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Payment Count Weight:</span>
                    <span className="font-mono text-sky-400 font-bold">{weights.pc}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={weights.pc}
                    onChange={(e) => {
                      const newPC = Number(e.target.value);
                      handleSaveWeights({ ...weights, pc: newPC });
                    }}
                    className="w-full accent-sky-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Active Merchant Weight (Green Only):</span>
                    <span className="font-mono text-emerald-400 font-bold">{weights.active}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={weights.active}
                    onChange={(e) => {
                      const newActive = Number(e.target.value);
                      handleSaveWeights({ ...weights, active: newActive });
                    }}
                    className="w-full accent-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-xs font-bold">
                  <span>Combined Total Weight:</span>
                  <span className={`font-mono text-sm ${totalWeight === 55 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {totalWeight}% {totalWeight === 55 ? '✓ (Standard 55%)' : ''}
                  </span>
                </div>
              </div>

              {/* Target Multiplier */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.08]">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Global Target Growth Multiplier
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Auto-calibrates targets across all officers above baseline run rates.
                </p>
                <div className="flex gap-2">
                  {[0, 5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTargetGrowthPct(pct)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        targetGrowthPct === pct
                          ? 'bg-[#E2136E] text-white border-[#E2136E]'
                          : 'bg-white/40 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                    >
                      {pct === 0 ? 'Baseline' : `+${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset to Standard 55% Button */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.08] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSaveWeights({ pa: 20, pc: 20, active: 15 })}
                  className="text-xs font-bold text-[#E2136E] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Standard 55% (20/20/15)</span>
                </button>

                {Object.keys(customTargets).length > 0 && (
                  <button
                    onClick={handleResetTargets}
                    className="text-xs font-bold text-rose-500 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Clear Custom Targets</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.08] flex justify-end">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E2136E] text-white hover:bg-[#d01063] transition cursor-pointer"
              >
                Apply & Save Settings
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. Edit Individual Target Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-panel-elevated rounded-3xl p-6 border border-white/20 dark:border-white/10 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/[0.08]">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Edit Target Quota
                </h3>
                <p className="text-xs text-[#E2136E] font-bold mt-0.5">
                  {editingEmployee.name} ({editingEmployee.id})
                </p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCustomTarget(editingEmployee.name, editForm);
              }}
              className="space-y-3.5 text-left"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Payment Amount (BDT) [Weight: 20%]
                </label>
                <input
                  type="number"
                  value={editForm.targetPA}
                  onChange={(e) => setEditForm({ ...editForm, targetPA: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Payment Count (Txns) [Weight: 20%]
                </label>
                <input
                  type="number"
                  value={editForm.targetPC}
                  onChange={(e) => setEditForm({ ...editForm, targetPC: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Active Merchants (Green Outlets Only) [Weight: 15%]
                </label>
                <input
                  type="number"
                  value={editForm.targetActive}
                  onChange={(e) => setEditForm({ ...editForm, targetActive: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Total assigned outlets: {editingEmployee.totalOutlets} (Amber & Red excluded)
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.08] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/40 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E2136E] text-white hover:bg-[#d01063] transition cursor-pointer"
                >
                  Save Target
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
