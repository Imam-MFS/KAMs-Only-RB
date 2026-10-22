import React, { useState, useMemo, useEffect } from 'react';
import {
  GitCompare,
  ArrowRightLeft,
  Calendar,
  Layers,
  MapPin,
  UserCheck,
  User,
  Building,
  Briefcase,
  Store,
  Tag,
  TrendingUp,
  TrendingDown,
  Activity,
  CircleDollarSign,
  Sparkles,
  Clock,
  Shuffle,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { formatBDT, formatNumber } from '../utils/formatters';
import {
  HISTORICAL_MONTHS,
  QUARTERS,
  HALF_YEARS,
  getMerchantPeriodMetrics
} from '../data/timeline';

export const ALL_COMPARISON_DIMENSIONS = [
  // 1. Timeframe (Period vs Period)
  {
    id: 'monthVsMonth',
    category: 'TIMEFRAME',
    label: 'Month vs Month',
    badge: 'Monthly',
    subLabel: "Jan'24 - Sep'26",
    icon: Calendar,
    tfType: 'MONTH'
  },
  {
    id: 'quarterVsQuarter',
    category: 'TIMEFRAME',
    badge: 'Quarterly',
    label: 'Quarter vs Quarter',
    subLabel: "Q1'24 - Q4'26",
    icon: Layers,
    tfType: 'QUARTER'
  },
  {
    id: 'halfYearVsHalfYear',
    category: 'TIMEFRAME',
    badge: 'Half-Year',
    label: 'Half Year vs Half Year',
    subLabel: "H1'24 - H2'26",
    icon: Clock,
    tfType: 'HALFYEAR'
  },
  {
    id: 'yearVsYear',
    category: 'TIMEFRAME',
    badge: 'Annual',
    label: 'Year vs Year',
    subLabel: '2024 vs 2025 vs 2026',
    icon: TrendingUp,
    tfType: 'YEAR'
  },

  // 2. Territory & Sales Hierarchy
  {
    id: 'rbKamLead',
    category: 'HIERARCHY',
    badge: 'Cluster',
    label: 'RB KAM Lead vs RB KAM Lead',
    subLabel: 'Regional Cluster Leads',
    field: 'rbKamLead',
    icon: UserCheck
  },
  {
    id: 'rbKam',
    category: 'HIERARCHY',
    badge: 'Officer',
    label: 'RB KAM (Officer) vs RB KAM (Officer)',
    subLabel: 'Field Execution Officers',
    field: 'rbKam',
    icon: User
  },
  {
    id: 'district',
    category: 'HIERARCHY',
    badge: 'District',
    label: 'Present District vs Present District',
    subLabel: '64 Administrative Districts',
    field: 'district',
    icon: MapPin
  },
  {
    id: 'thana',
    category: 'HIERARCHY',
    badge: 'Thana',
    label: 'Present Thana vs Present Thana',
    subLabel: 'Sub-District Hubs',
    field: 'thana',
    icon: Building
  },
  {
    id: 'catLead',
    category: 'HIERARCHY',
    badge: 'Category',
    label: 'Category Lead vs Category Lead',
    subLabel: 'Industry Vertical Leads',
    field: 'catLead',
    icon: Briefcase
  },
  {
    id: 'kam',
    category: 'HIERARCHY',
    badge: 'KAM',
    label: 'Key Account Mgr vs Key Account Mgr',
    subLabel: 'Corporate KAM Accounts',
    field: 'kam',
    icon: Store
  },
  {
    id: 'category',
    category: 'HIERARCHY',
    badge: 'Industry',
    label: 'Category vs Category',
    subLabel: 'Core Business Sectors',
    field: 'category',
    icon: Layers
  },
  {
    id: 'subCategory',
    category: 'HIERARCHY',
    badge: 'Segment',
    label: 'Sub-Category vs Sub-Category',
    subLabel: 'Niche Merchant Segments',
    field: 'subCategory',
    icon: Tag
  }
];

export const YEARS = ['2026', '2025', '2024'];

export function detectPeriodMode(periodVal) {
  if (!periodVal || periodVal === 'Live MTD' || periodVal === 'MTD') return 'MTD';
  if (periodVal === '2026' || periodVal === '2025' || periodVal === '2024') return 'YEAR';
  if (periodVal.startsWith('Q') || QUARTERS[periodVal]) return 'QUARTER';
  if (periodVal.startsWith('H') || HALF_YEARS[periodVal]) return 'HALFYEAR';
  return 'MONTH';
}

export const ALL_TIMEFRAME_DROPDOWN = [
  { group: 'Active Cycle', options: [{ val: 'Live MTD', label: 'Live MTD (Oct 2026)' }] },
  {
    group: 'Historical Months',
    options: HISTORICAL_MONTHS.slice().reverse().map((m) => ({ val: m, label: m }))
  },
  {
    group: 'Quarterly Cycles',
    options: Object.keys(QUARTERS).map((q) => ({ val: q, label: q }))
  },
  {
    group: 'Half-Year Cycles',
    options: Object.keys(HALF_YEARS).map((h) => ({ val: h, label: h }))
  },
  {
    group: 'Annual Cycles',
    options: [
      { val: '2026', label: 'Full Year 2026 (MTD + 9 Months)' },
      { val: '2025', label: 'Full Year 2025 (12 Months)' },
      { val: '2024', label: 'Full Year 2024 (12 Months)' }
    ]
  }
];

export default function ComparisonView({ allMerchants = [], isDark = true }) {
  // 1. Filter Category for Dimension Selection: 'ALL' | 'TIMEFRAME' | 'HIERARCHY'
  const [filterCategory, setFilterCategory] = useState('ALL');

  // 2. Active Selected Dimension (Defaults to rbKam or monthVsMonth)
  const [selectedDimId, setSelectedDimId] = useState('rbKam');

  // 3. Hierarchy Target State
  const [entityA, setEntityA] = useState('');
  const [entityB, setEntityB] = useState('');

  // 4. Hierarchy Timeframe Controls
  // isCrossTimeframe = true allows comparing Target A (in Period A) vs Target B (in Period B)!
  const [isCrossTimeframe, setIsCrossTimeframe] = useState(false);
  const [unifiedHierarchyPeriod, setUnifiedHierarchyPeriod] = useState('Live MTD');
  const [hierarchyPeriodA, setHierarchyPeriodA] = useState('Live MTD');
  const [hierarchyPeriodB, setHierarchyPeriodB] = useState("Sep'26");

  // 5. Standalone Timeframe Comparison State
  const [timeframeA, setTimeframeA] = useState("Sep'26");
  const [timeframeB, setTimeframeB] = useState("Aug'26");
  const [timeframeTerritoryScope, setTimeframeTerritoryScope] = useState('ALL');

  // Current active dimension object
  const currentDim = useMemo(() => {
    return (
      ALL_COMPARISON_DIMENSIONS.find((d) => d.id === selectedDimId) ||
      ALL_COMPARISON_DIMENSIONS[0]
    );
  }, [selectedDimId]);

  const isTimeframeMode = currentDim.category === 'TIMEFRAME';

  // Extract all distinct options for the selected hierarchy dimension
  const dimensionOptions = useMemo(() => {
    if (isTimeframeMode) return [];
    const field = currentDim.field || 'rbKamLead';
    const counts = {};
    allMerchants.forEach((m) => {
      const val = m[field];
      if (val) counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([val, count]) => ({ val, count }));
  }, [allMerchants, currentDim, isTimeframeMode]);

  // Set default targets when dimension options change
  useEffect(() => {
    if (dimensionOptions.length > 0) {
      if (!entityA || !dimensionOptions.some((o) => o.val === entityA)) {
        setEntityA(dimensionOptions[0].val);
      }
      if (!entityB || !dimensionOptions.some((o) => o.val === entityB)) {
        setEntityB(dimensionOptions[1]?.val || dimensionOptions[0].val);
      }
    }
  }, [dimensionOptions]);

  // Helper to calculate aggregate metrics for a list of merchants in a given period
  const calculateAggregate = (merchants, periodVal) => {
    const tfMode = detectPeriodMode(periodVal);
    let pa = 0;
    let pc = 0;
    let cc = 0;
    let activeCount = 0;
    let redCount = 0;

    // Handle Year aggregation
    if (tfMode === 'YEAR') {
      const yr = periodVal; // '2024', '2025', '2026'
      merchants.forEach((m) => {
        let mPA = 0;
        let mPC = 0;
        let mCC = 0;
        HISTORICAL_MONTHS.forEach((mStr) => {
          if (mStr.includes(`'${yr.slice(2)}`)) {
            const h = m.history?.[mStr];
            if (h) {
              mPA += h.pa || 0;
              mPC += h.pc || 0;
              mCC += h.cc || 0;
            }
          }
        });
        if (yr === '2026') {
          mPA += m.mtdPA || 0;
          mPC += m.mtdPC || 0;
          mCC += m.mtdCC || 0;
        }

        pa += mPA;
        pc += mPC;
        cc += mCC;
        if (mPC >= 35) activeCount++;
        else redCount++;
      });

      const totalOutlets = merchants.length;
      const aov = pc > 0 ? pa / pc : 0;
      const activeRate = totalOutlets > 0 ? (activeCount / totalOutlets) * 100 : 0;
      return { pa, pc, cc, activeCount, redCount, totalOutlets, aov, activeRate };
    }

    // Standard period calculation
    merchants.forEach((m) => {
      const met = getMerchantPeriodMetrics(m, tfMode, periodVal);
      pa += met.pa;
      pc += met.pc;
      cc += met.cc;
      if (met.health === 'Green' || met.health === 'Amber') activeCount++;
      if (met.health === 'Red') redCount++;
    });

    const totalOutlets = merchants.length;
    const aov = pc > 0 ? pa / pc : 0;
    const activeRate = totalOutlets > 0 ? (activeCount / totalOutlets) * 100 : 0;
    return { pa, pc, cc, activeCount, redCount, totalOutlets, aov, activeRate };
  };

  // Compute metrics for Side A and Side B based on current mode
  const { metricsA, metricsB, labelA, labelB, periodTagA, periodTagB } = useMemo(() => {
    if (!isTimeframeMode) {
      // Hierarchy Comparison
      const field = currentDim.field || 'rbKamLead';
      const merchantsA = allMerchants.filter((m) => m[field] === entityA);
      const merchantsB = allMerchants.filter((m) => m[field] === entityB);

      const pA = isCrossTimeframe ? hierarchyPeriodA : unifiedHierarchyPeriod;
      const pB = isCrossTimeframe ? hierarchyPeriodB : unifiedHierarchyPeriod;

      return {
        metricsA: calculateAggregate(merchantsA, pA),
        metricsB: calculateAggregate(merchantsB, pB),
        labelA: entityA || 'Side A',
        labelB: entityB || 'Side B',
        periodTagA: pA,
        periodTagB: pB
      };
    } else {
      // Timeframe Comparison (Month vs Month, Quarter vs Quarter, etc.)
      let scopedMerchants = allMerchants;
      if (timeframeTerritoryScope !== 'ALL') {
        scopedMerchants = allMerchants.filter(
          (m) =>
            m.district === timeframeTerritoryScope ||
            m.rbKamLead === timeframeTerritoryScope
        );
      }

      return {
        metricsA: calculateAggregate(scopedMerchants, timeframeA),
        metricsB: calculateAggregate(scopedMerchants, timeframeB),
        labelA: timeframeA,
        labelB: timeframeB,
        periodTagA: timeframeA,
        periodTagB: timeframeB
      };
    }
  }, [
    isTimeframeMode,
    currentDim,
    entityA,
    entityB,
    isCrossTimeframe,
    unifiedHierarchyPeriod,
    hierarchyPeriodA,
    hierarchyPeriodB,
    timeframeA,
    timeframeB,
    timeframeTerritoryScope,
    allMerchants
  ]);

  // Compute Variances
  const paDelta = metricsB.pa > 0 ? ((metricsA.pa - metricsB.pa) / metricsB.pa) * 100 : 0;
  const pcDelta = metricsB.pc > 0 ? ((metricsA.pc - metricsB.pc) / metricsB.pc) * 100 : 0;
  const aovDelta = metricsB.aov > 0 ? ((metricsA.aov - metricsB.aov) / metricsB.aov) * 100 : 0;
  const activeRateDelta = metricsA.activeRate - metricsB.activeRate;

  // Chart data for head-to-head comparison
  const chartData = {
    labels: [
      'Total Volume (PA in Lakh)',
      'Transactions (in 100s)',
      'Active Outlets',
      'Dormant Outlets'
    ],
    datasets: [
      {
        label: isCrossTimeframe ? `${labelA} (${periodTagA})` : labelA,
        data: [
          Math.round(metricsA.pa / 100000),
          Math.round(metricsA.pc / 100),
          metricsA.activeCount,
          metricsA.redCount
        ],
        backgroundColor: '#E2136E',
        borderRadius: 8
      },
      {
        label: isCrossTimeframe ? `${labelB} (${periodTagB})` : labelB,
        data: [
          Math.round(metricsB.pa / 100000),
          Math.round(metricsB.pc / 100),
          metricsB.activeCount,
          metricsB.redCount
        ],
        backgroundColor: '#38BDF8',
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? '#E2E8F0' : '#1E293B',
          font: { weight: 'bold', size: 11 }
        }
      }
    },
    scales: {
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: isDark ? '#94A3B8' : '#64748B' }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94A3B8' : '#64748B', font: { weight: 'bold' } }
      }
    }
  };

  // Distinct districts for optional timeframe scope filter
  const distinctDistricts = useMemo(() => {
    const set = new Set();
    allMerchants.forEach((m) => {
      if (m.district) set.add(m.district);
    });
    return Array.from(set).sort();
  }, [allMerchants]);

  // When switching temporal dimension type, automatically update period defaults
  const handleSelectDimension = (dim) => {
    setSelectedDimId(dim.id);
    if (dim.category === 'TIMEFRAME') {
      if (dim.tfType === 'MONTH') {
        setTimeframeA("Sep'26");
        setTimeframeB("Aug'26");
      } else if (dim.tfType === 'QUARTER') {
        setTimeframeA("Q3'26");
        setTimeframeB("Q2'26");
      } else if (dim.tfType === 'HALFYEAR') {
        setTimeframeA("H1'26");
        setTimeframeB("H2'25");
      } else if (dim.tfType === 'YEAR') {
        setTimeframeA('2025');
        setTimeframeB('2024');
      }
    }
  };

  const visibleDimensions = useMemo(() => {
    if (filterCategory === 'ALL') return ALL_COMPARISON_DIMENSIONS;
    return ALL_COMPARISON_DIMENSIONS.filter((d) => d.category === filterCategory);
  }, [filterCategory]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Comparison Control Station */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-white/10 dark:border-white/[0.08] shadow-xl space-y-4">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/60 dark:border-white/[0.06]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#E2136E]/20 to-purple-600/15 text-[#E2136E] dark:text-pink-400 border border-[#E2136E]/30 shadow-xs">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Executive Comparison & Benchmarking Engine</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E2136E]/15 text-[#E2136E] border border-[#E2136E]/30">
                  Head-to-Head
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Comprehensive variance analytics across territory hierarchy, sales leaders, and historical timeframes
              </p>
            </div>
          </div>

          {/* Dimension Category Segmented Filter */}
          <div className="inline-flex bg-slate-200/60 dark:bg-black/50 p-1 rounded-xl text-xs font-semibold border border-slate-300/40 dark:border-white/[0.08] self-start sm:self-auto">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer flex items-center space-x-1.5 ${
                filterCategory === 'ALL'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>All Dimensions (12)</span>
            </button>
            <button
              onClick={() => {
                setFilterCategory('TIMEFRAME');
                if (!isTimeframeMode) handleSelectDimension(ALL_COMPARISON_DIMENSIONS[0]);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer flex items-center space-x-1.5 ${
                filterCategory === 'TIMEFRAME'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeframe (Period vs Period)</span>
            </button>
            <button
              onClick={() => {
                setFilterCategory('HIERARCHY');
                if (isTimeframeMode) handleSelectDimension(ALL_COMPARISON_DIMENSIONS[5]);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer flex items-center space-x-1.5 ${
                filterCategory === 'HIERARCHY'
                  ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Territory & Hierarchy</span>
            </button>
          </div>
        </div>

        {/* 2. Full Unified Dimension Cards Grid (All 12 Dimensions) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Select Dimension to Compare</span>
              <span className="text-[10px] text-[#E2136E] dark:text-pink-400 font-mono">
                ({currentDim.label})
              </span>
            </label>
            <span className="text-[10px] font-bold text-slate-400">
              {isTimeframeMode ? 'Temporal Analysis' : 'Organizational Hierarchy'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2">
            {visibleDimensions.map((dim) => {
              const Icon = dim.icon;
              const isSel = selectedDimId === dim.id;
              const isTf = dim.category === 'TIMEFRAME';

              return (
                <button
                  key={dim.id}
                  onClick={() => handleSelectDimension(dim)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-1 relative group overflow-hidden ${
                    isSel
                      ? 'border-[#E2136E] bg-[#E2136E]/12 text-[#E2136E] dark:text-pink-300 font-bold ring-1 ring-[#E2136E]/40 shadow-sm'
                      : 'border-slate-200 dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-[#E2136E]' : 'text-slate-400 group-hover:text-[#E2136E]'}`} />
                    <span
                      className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded font-mono ${
                        isTf
                          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {dim.badge}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold truncate leading-tight mt-1">
                    {dim.label.split(' vs ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Operational Target & Timeframe Controls */}
        {!isTimeframeMode ? (
          /* HIERARCHY COMPARISON CONTROLS */
          <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-white/[0.05]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
              
              {/* SIDE A: Target Selector */}
              <div className="md:col-span-4 glass-card p-3.5 rounded-xl space-y-2 border border-[#E2136E]/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-[#E2136E] tracking-wider">
                      Side A (Primary Target)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {dimensionOptions.length} available
                    </span>
                  </div>
                  <select
                    value={entityA}
                    onChange={(e) => setEntityA(e.target.value)}
                    className="w-full glass-input rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {dimensionOptions.map((opt) => (
                      <option key={opt.val} value={opt.val} className="bg-white dark:bg-[#0B0F19]">
                        {opt.val} ({opt.count} Outlets)
                      </option>
                    ))}
                  </select>
                </div>

                {/* If Cross-Timeframe is ON: Side A Timeframe Selector */}
                {isCrossTimeframe && (
                  <div className="pt-2 border-t border-slate-200/50 dark:border-white/[0.06] animate-fade-in">
                    <span className="text-[10px] font-extrabold uppercase text-[#E2136E] tracking-wider block mb-1">
                      Side A Timeframe
                    </span>
                    <select
                      value={hierarchyPeriodA}
                      onChange={(e) => setHierarchyPeriodA(e.target.value)}
                      className="w-full glass-input rounded-xl py-1.5 px-2.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {ALL_TIMEFRAME_DROPDOWN.map((grp) => (
                        <optgroup key={grp.group} label={grp.group} className="bg-white dark:bg-[#0B0F19]">
                          {grp.options.map((opt) => (
                            <option key={opt.val} value={opt.val}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* CENTER: Operating Timeframe Control Center */}
              <div className="md:col-span-4 glass-card p-3.5 rounded-xl space-y-2 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#E2136E]" />
                    <span>Operating Timeframe</span>
                  </span>

                  {/* Toggle: Same Timeframe vs Period vs Period */}
                  <div className="inline-flex bg-slate-200/60 dark:bg-black/50 p-0.5 rounded-lg text-[10px] font-bold border border-slate-300/40 dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setIsCrossTimeframe(false)}
                      className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                        !isCrossTimeframe
                          ? 'bg-[#E2136E] text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Same Period
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCrossTimeframe(true)}
                      className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                        isCrossTimeframe
                          ? 'bg-[#E2136E] text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Period vs Period
                    </button>
                  </div>
                </div>

                {!isCrossTimeframe ? (
                  <div>
                    <select
                      value={unifiedHierarchyPeriod}
                      onChange={(e) => setUnifiedHierarchyPeriod(e.target.value)}
                      className="w-full glass-input rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {ALL_TIMEFRAME_DROPDOWN.map((grp) => (
                        <optgroup key={grp.group} label={grp.group} className="bg-white dark:bg-[#0B0F19]">
                          {grp.options.map((opt) => (
                            <option key={opt.val} value={opt.val}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Applied uniformly to both Side A & Side B
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#E2136E]/10 rounded-xl p-2 border border-[#E2136E]/20 text-[11px] space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#E2136E] dark:text-pink-300">
                      <span>Cross-Cycle Benchmarking</span>
                      <Shuffle className="w-3 h-3" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Side A & Side B operate on independent periods. You can also benchmark Target A against itself across cycles.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEntityB(entityA)}
                      className="text-[10px] font-black underline text-[#E2136E] dark:text-pink-400 cursor-pointer hover:opacity-80"
                    >
                      Set Target B = Target A (Self MoM/QoQ Analysis)
                    </button>
                  </div>
                )}
              </div>

              {/* SIDE B: Target Selector */}
              <div className="md:col-span-4 glass-card p-3.5 rounded-xl space-y-2 border border-sky-400/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-sky-400 tracking-wider">
                      Side B (Benchmark Competitor)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {dimensionOptions.length} available
                    </span>
                  </div>
                  <select
                    value={entityB}
                    onChange={(e) => setEntityB(e.target.value)}
                    className="w-full glass-input rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {dimensionOptions.map((opt) => (
                      <option key={opt.val} value={opt.val} className="bg-white dark:bg-[#0B0F19]">
                        {opt.val} ({opt.count} Outlets)
                      </option>
                    ))}
                  </select>
                </div>

                {/* If Cross-Timeframe is ON: Side B Timeframe Selector */}
                {isCrossTimeframe && (
                  <div className="pt-2 border-t border-slate-200/50 dark:border-white/[0.06] animate-fade-in">
                    <span className="text-[10px] font-extrabold uppercase text-sky-400 tracking-wider block mb-1">
                      Side B Timeframe
                    </span>
                    <select
                      value={hierarchyPeriodB}
                      onChange={(e) => setHierarchyPeriodB(e.target.value)}
                      className="w-full glass-input rounded-xl py-1.5 px-2.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {ALL_TIMEFRAME_DROPDOWN.map((grp) => (
                        <optgroup key={grp.group} label={grp.group} className="bg-white dark:bg-[#0B0F19]">
                          {grp.options.map((opt) => (
                            <option key={opt.val} value={opt.val}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* TIMEFRAME COMPARISON CONTROLS (Month vs Month, Quarter vs Quarter, etc.) */
          <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-white/[0.05]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
              
              {/* Period A */}
              <div className="md:col-span-5 glass-card p-3.5 rounded-xl space-y-1.5 border border-[#E2136E]/30">
                <span className="text-[10px] font-extrabold uppercase text-[#E2136E] tracking-wider block">
                  Period A ({currentDim.label.split(' vs ')[0]})
                </span>
                <select
                  value={timeframeA}
                  onChange={(e) => setTimeframeA(e.target.value)}
                  className="w-full glass-input rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {currentDim.tfType === 'MONTH' &&
                    HISTORICAL_MONTHS.slice().reverse().map((m) => (
                      <option key={m} value={m} className="bg-white dark:bg-[#0B0F19]">{m}</option>
                    ))}
                  {currentDim.tfType === 'QUARTER' &&
                    Object.keys(QUARTERS).map((q) => (
                      <option key={q} value={q} className="bg-white dark:bg-[#0B0F19]">{q}</option>
                    ))}
                  {currentDim.tfType === 'HALFYEAR' &&
                    Object.keys(HALF_YEARS).map((h) => (
                      <option key={h} value={h} className="bg-white dark:bg-[#0B0F19]">{h}</option>
                    ))}
                  {currentDim.tfType === 'YEAR' &&
                    YEARS.map((y) => (
                      <option key={y} value={y} className="bg-white dark:bg-[#0B0F19]">{y}</option>
                    ))}
                </select>
              </div>

              {/* Territory Scope Filter */}
              <div className="md:col-span-2 glass-card p-3.5 rounded-xl space-y-1 border border-white/5 text-center flex flex-col justify-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  Territory Scope
                </span>
                <select
                  value={timeframeTerritoryScope}
                  onChange={(e) => setTimeframeTerritoryScope(e.target.value)}
                  className="w-full glass-input rounded-xl py-1.5 px-2 text-[11px] font-bold text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Bangladesh</option>
                  {distinctDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period B */}
              <div className="md:col-span-5 glass-card p-3.5 rounded-xl space-y-1.5 border border-sky-400/30">
                <span className="text-[10px] font-extrabold uppercase text-sky-400 tracking-wider block">
                  Period B ({currentDim.label.split(' vs ')[1] || 'Benchmark'})
                </span>
                <select
                  value={timeframeB}
                  onChange={(e) => setTimeframeB(e.target.value)}
                  className="w-full glass-input rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {currentDim.tfType === 'MONTH' &&
                    HISTORICAL_MONTHS.slice().reverse().map((m) => (
                      <option key={m} value={m} className="bg-white dark:bg-[#0B0F19]">{m}</option>
                    ))}
                  {currentDim.tfType === 'QUARTER' &&
                    Object.keys(QUARTERS).map((q) => (
                      <option key={q} value={q} className="bg-white dark:bg-[#0B0F19]">{q}</option>
                    ))}
                  {currentDim.tfType === 'HALFYEAR' &&
                    Object.keys(HALF_YEARS).map((h) => (
                      <option key={h} value={h} className="bg-white dark:bg-[#0B0F19]">{h}</option>
                    ))}
                  {currentDim.tfType === 'YEAR' &&
                    YEARS.map((y) => (
                      <option key={y} value={y} className="bg-white dark:bg-[#0B0F19]">{y}</option>
                    ))}
                </select>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 4. Head-to-Head Luxury Dossier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-stretch">
        
        {/* Left Dossier Card: Target A */}
        <div className="lg:col-span-3 kpi-card rounded-2xl p-5 border border-[#E2136E]/30 relative overflow-hidden bg-gradient-to-b from-[#E2136E]/10 to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#E2136E]" />
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2136E] neon-dot-pink" />
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[220px]">
                  {labelA}
                </h3>
                {isCrossTimeframe && (
                  <span className="text-[10px] font-mono font-bold text-[#E2136E] dark:text-pink-300 block">
                    Cycle: {periodTagA}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E2136E]/20 text-[#E2136E] dark:text-pink-300">
              {metricsA.totalOutlets} Outlets
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Volume (PA)</span>
              <div className="text-2xl font-black font-mono text-[#E2136E] dark:text-pink-400">
                {formatBDT(metricsA.pa)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/40 dark:border-white/[0.04]">
              <div>
                <span className="text-[10px] text-slate-400 block">Completed Txns (PC)</span>
                <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">
                  {formatNumber(metricsA.pc)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Ticket Size (AOV)</span>
                <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">
                  {formatBDT(metricsA.aov)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/40 dark:border-white/[0.04]">
              <div>
                <span className="text-[10px] text-slate-400 block">Active Outlets</span>
                <span className="text-sm font-bold font-mono text-emerald-500">
                  {metricsA.activeCount} ({metricsA.activeRate.toFixed(1)}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Dormant Outlets</span>
                <span className="text-sm font-bold font-mono text-rose-500">
                  {metricsA.redCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Variance Pill & Lead Badge */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 border border-white/10">
          <div className="p-2.5 rounded-full bg-slate-200/60 dark:bg-white/10">
            <ArrowRightLeft className="w-5 h-5 text-slate-400" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Volume Delta</span>
            <div
              className={`text-base font-black font-mono flex items-center justify-center ${
                paDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {paDelta >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{Math.abs(paDelta).toFixed(1)}%</span>
            </div>
            <span className="text-[9px] text-slate-400">
              {paDelta >= 0 ? 'Side A leads' : 'Side B leads'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/10 w-full">
            <span className="text-[10px] text-slate-400 block">Txn Gap</span>
            <span
              className={`text-xs font-bold font-mono ${
                pcDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {pcDelta >= 0 ? '+' : ''}{pcDelta.toFixed(1)}%
            </span>
          </div>

          <div className="pt-1 w-full">
            <span className="text-[10px] text-slate-400 block">AOV Variance</span>
            <span
              className={`text-xs font-bold font-mono ${
                aovDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {aovDelta >= 0 ? '+' : ''}{aovDelta.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right Dossier Card: Target B */}
        <div className="lg:col-span-3 kpi-card rounded-2xl p-5 border border-sky-400/30 relative overflow-hidden bg-gradient-to-b from-sky-500/10 to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-400" />
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 neon-dot-blue" />
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[220px]">
                  {labelB}
                </h3>
                {isCrossTimeframe && (
                  <span className="text-[10px] font-mono font-bold text-sky-500 dark:text-sky-300 block">
                    Cycle: {periodTagB}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300">
              {metricsB.totalOutlets} Outlets
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Volume (PA)</span>
              <div className="text-2xl font-black font-mono text-sky-500 dark:text-sky-400">
                {formatBDT(metricsB.pa)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/40 dark:border-white/[0.04]">
              <div>
                <span className="text-[10px] text-slate-400 block">Completed Txns (PC)</span>
                <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">
                  {formatNumber(metricsB.pc)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Ticket Size (AOV)</span>
                <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">
                  {formatBDT(metricsB.aov)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/40 dark:border-white/[0.04]">
              <div>
                <span className="text-[10px] text-slate-400 block">Active Outlets</span>
                <span className="text-sm font-bold font-mono text-emerald-500">
                  {metricsB.activeCount} ({metricsB.activeRate.toFixed(1)}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Dormant Outlets</span>
                <span className="text-sm font-bold font-mono text-rose-500">
                  {metricsB.redCount}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Comparative Bar Chart Visualization */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 dark:border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#E2136E]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Head-to-Head Normalized Metric Benchmark
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Direct Comparative Ratio
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

    </div>
  );
}
