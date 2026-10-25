import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Wallet,
  CheckCircle2,
  XCircle,
  CircleDollarSign,
  Activity,
  TrendingUp,
  Zap,
  Search,
  Download,
  Filter,
  Calendar,
  MapPin,
  Building,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Store,
  Eye,
  ShieldCheck,
  RotateCcw,
  Clock
} from 'lucide-react';
import { formatBDT, formatNumber } from '../utils/formatters';
import { HISTORICAL_MONTHS } from '../data/timeline';

export default function AcquisitionView({
  allMerchants = [],
  isDark = true,
  onSelectMerchant
}) {
  // 1. Selected Key Account Manager (Default: 'ALL' or first KAM)
  const [selectedKam, setSelectedKam] = useState('ALL');

  // 2. Active Merchant (DV) Status Filter: 'ALL' | 'ACTIVE' | 'NON_ACTIVE'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // 3. Search Query (wallet, merchant name, address)
  const [searchQuery, setSearchQuery] = useState('');

  // 4. Sorting State
  const [sortBy, setSortBy] = useState('mtdPC'); // 'regDate' | 'wallet' | 'merchant' | 'last3m' | 'mtdPC' | 'totalPA'
  const [sortOrder, setSortOrder] = useState('desc');

  // 5. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Helper to determine if a merchant is Active based on Active Merchant(DV) column
  const isMerchantActiveDV = (m) => {
    const raw = String(m.activeMerchantDV || '').trim().toLowerCase();
    if (!raw) {
      // Intelligent fallback if column wasn't present
      return (m.mtdPC || 0) > 0 || (m.mtdPA || 0) > 0;
    }
    // Check for negative matches first
    if (
      raw.includes('non') ||
      raw.includes('inact') ||
      raw === 'no' ||
      raw === 'red' ||
      raw === '0' ||
      raw === 'false'
    ) {
      return false;
    }
    // Check for positive matches
    if (
      raw.includes('active') ||
      raw === 'yes' ||
      raw === 'green' ||
      raw === '1' ||
      raw === 'true'
    ) {
      return true;
    }
    return (m.mtdPC || 0) > 0;
  };

  // Helper to get normalized address
  const getMerchantAddress = (m) => {
    if (m.address && m.address !== 'undefined' && m.address.trim()) {
      return m.address;
    }
    const parts = [m.thana, m.district].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not Specified';
  };

  // Helper to compute last 3 completed months transactions & volume
  const getLast3MonthsMetrics = (m) => {
    // Last 3 months in dataset: Jul'26, Aug'26, Sep'26 (or last 3 of HISTORICAL_MONTHS)
    const last3 = HISTORICAL_MONTHS.slice(-3);
    let pcSum = 0;
    let paSum = 0;
    last3.forEach((mKey) => {
      if (m.history && m.history[mKey]) {
        pcSum += Number(m.history[mKey].pc) || 0;
        paSum += Number(m.history[mKey].pa) || 0;
      }
    });
    return { pc: pcSum, pa: paSum, monthsLabel: last3.join(' + ') };
  };

  // Helper to compute lifetime PA and CC (History + MTD)
  const getLifetimeMetrics = (m) => {
    let lifetimePA = Number(m.mtdPA) || 0;
    let lifetimeCC = Number(m.mtdCC || m.mtdPC) || 0;
    if (m.history) {
      Object.values(m.history).forEach((h) => {
        lifetimePA += Number(h.pa) || 0;
        lifetimeCC += Number(h.cc || h.pc) || 0;
      });
    }
    return { lifetimePA, lifetimeCC };
  };

  // 1. Extract All Distinct Key Account Managers with counts
  const kamListWithStats = useMemo(() => {
    const kamMap = {};
    allMerchants.forEach((m) => {
      const k = (m.kam || 'Unassigned KAM').trim();
      if (!kamMap[k]) {
        kamMap[k] = { name: k, totalWallets: 0, activeCount: 0, nonActiveCount: 0 };
      }
      kamMap[k].totalWallets += 1;
      if (isMerchantActiveDV(m)) {
        kamMap[k].activeCount += 1;
      } else {
        kamMap[k].nonActiveCount += 1;
      }
    });

    return Object.values(kamMap).sort((a, b) => b.totalWallets - a.totalWallets);
  }, [allMerchants]);

  // 2. Filter Merchants by Selected Key Account Manager
  const kamFilteredMerchants = useMemo(() => {
    if (selectedKam === 'ALL') return allMerchants;
    return allMerchants.filter((m) => (m.kam || 'Unassigned KAM').trim() === selectedKam);
  }, [allMerchants, selectedKam]);

  // 3. Compute KPI Summary Cards for Selected KAM
  const performanceKpis = useMemo(() => {
    let totalWallets = kamFilteredMerchants.length;
    let activeCount = 0;
    let nonActiveCount = 0;
    let totalPAGenerated = 0;
    let totalPAGeneratedMTD = 0;
    let totalCCGenerated = 0;
    let totalCCGeneratedMTD = 0;

    kamFilteredMerchants.forEach((m) => {
      const isActive = isMerchantActiveDV(m);
      if (isActive) activeCount++;
      else nonActiveCount++;

      const { lifetimePA, lifetimeCC } = getLifetimeMetrics(m);
      totalPAGenerated += lifetimePA;
      totalCCGenerated += lifetimeCC;

      totalPAGeneratedMTD += Number(m.mtdPA) || 0;
      totalCCGeneratedMTD += Number(m.mtdCC || m.mtdPC) || 0;
    });

    const activeRatio = totalWallets > 0 ? (activeCount / totalWallets) * 100 : 0;

    return {
      totalWallets,
      activeCount,
      nonActiveCount,
      activeRatio,
      totalPAGenerated,
      totalPAGeneratedMTD,
      totalCCGenerated,
      totalCCGeneratedMTD
    };
  }, [kamFilteredMerchants]);

  // 4. Apply Secondary Filters (Status Filter & Search Query) to Wallet Table List
  const tableFilteredWallets = useMemo(() => {
    let list = kamFilteredMerchants;

    // Status Filter (Active vs Non-Active from DV)
    if (statusFilter === 'ACTIVE') {
      list = list.filter((m) => isMerchantActiveDV(m));
    } else if (statusFilter === 'NON_ACTIVE') {
      list = list.filter((m) => !isMerchantActiveDV(m));
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((m) => {
        const walletMatch = (m.wallet || '').toLowerCase().includes(q);
        const nameMatch = (m.merchant || m.brand || '').toLowerCase().includes(q);
        const addressMatch = getMerchantAddress(m).toLowerCase().includes(q);
        const kamMatch = (m.kam || '').toLowerCase().includes(q);
        return walletMatch || nameMatch || addressMatch || kamMatch;
      });
    }

    // Sort
    return [...list].sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      if (sortBy === 'regDate') {
        aVal = new Date(a.regDate || '1970-01-01').getTime();
        bVal = new Date(b.regDate || '1970-01-01').getTime();
      } else if (sortBy === 'wallet') {
        aVal = String(a.wallet || '');
        bVal = String(b.wallet || '');
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortBy === 'merchant') {
        aVal = String(a.merchant || a.brand || '');
        bVal = String(b.merchant || b.brand || '');
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortBy === 'last3m') {
        aVal = getLast3MonthsMetrics(a).pc;
        bVal = getLast3MonthsMetrics(b).pc;
      } else if (sortBy === 'mtdPC') {
        aVal = Number(a.mtdPC) || 0;
        bVal = Number(b.mtdPC) || 0;
      } else if (sortBy === 'totalPA') {
        aVal = getLifetimeMetrics(a).lifetimePA;
        bVal = getLifetimeMetrics(b).lifetimePA;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [kamFilteredMerchants, statusFilter, searchQuery, sortBy, sortOrder]);

  // 5. Paginated Slice
  const totalPages = Math.ceil(tableFilteredWallets.length / pageSize) || 1;
  const paginatedWallets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tableFilteredWallets.slice(start, start + pageSize);
  }, [tableFilteredWallets, currentPage, pageSize]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Export KAM Acquisition Dossier to CSV
  const handleExportCsv = () => {
    if (tableFilteredWallets.length === 0) return;

    const headers = [
      'Wallet Number',
      'Merchant Name',
      'Brand Name',
      'Key Account Manager',
      'Active Status (DV)',
      'Registration Date',
      'Address',
      'District',
      'Thana',
      'Category',
      'Last 3 Months Txns (PC)',
      'Last 3 Months Volume (PA BDT)',
      'MTD Completed Txns (PC)',
      'MTD Gross Volume (PA BDT)',
      'Total Lifetime CC',
      'Total Lifetime PA (BDT)'
    ];

    const rows = tableFilteredWallets.map((m) => {
      const l3 = getLast3MonthsMetrics(m);
      const life = getLifetimeMetrics(m);
      return [
        `"${m.wallet || ''}"`,
        `"${(m.merchant || '').replace(/"/g, '""')}"`,
        `"${(m.brand || '').replace(/"/g, '""')}"`,
        `"${(m.kam || '').replace(/"/g, '""')}"`,
        isMerchantActiveDV(m) ? 'Active' : 'Non-Active',
        m.regDate || '',
        `"${getMerchantAddress(m).replace(/"/g, '""')}"`,
        `"${m.district || ''}"`,
        `"${m.thana || ''}"`,
        `"${m.category || ''}"`,
        l3.pc,
        Math.round(l3.pa),
        m.mtdPC || 0,
        Math.round(m.mtdPA || 0),
        life.lifetimeCC,
        Math.round(life.lifetimePA)
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const kamSlug = selectedKam === 'ALL' ? 'All_KAMs' : selectedKam.replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `bKash_Acquisition_Report_${kamSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header Control Station */}
      <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 border border-white/10 dark:border-white/[0.08] shadow-2xl space-y-5">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E2136E] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-[#E2136E]/30 font-black text-xl flex-shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Acquisition & KAM Performance Console
                </h2>
                <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Onboarded Portfolio
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Wallet onboarding ledger, Active/Non-Active DV validation, and revenue run-rate extracted from <strong>Key Account Manager</strong> column
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white transition cursor-pointer flex items-center space-x-1.5 active:scale-95 shadow-md shadow-[#E2136E]/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Acquisition Dossier</span>
            </button>
          </div>
        </div>

        {/* 2. Key Account Manager Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-1">
          
          {/* KAM Dropdown Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <Store className="w-3.5 h-3.5 text-[#E2136E]" />
              <span>Select Key Account Manager (KAM)</span>
            </label>
            <div className="relative">
              <select
                value={selectedKam}
                onChange={(e) => {
                  setSelectedKam(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 outline-none cursor-pointer pr-8 bg-white/70 dark:bg-black/60 shadow-xs"
              >
                <option value="ALL" className="bg-white dark:bg-[#0B0F19]">
                  🌟 ALL Key Account Managers ({allMerchants.length} Total Wallets)
                </option>
                {kamListWithStats.map((k) => (
                  <option key={k.name} value={k.name} className="bg-white dark:bg-[#0B0F19]">
                    {k.name} — {k.totalWallets} Wallets ({k.activeCount} Active, {k.nonActiveCount} Non-Active)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Status (DV) Filter Tabs */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-sky-400" />
              <span>Active Status (DV) Filter</span>
            </label>
            <div className="inline-flex w-full bg-slate-200/60 dark:bg-black/50 p-1 rounded-xl text-xs font-semibold border border-slate-300/40 dark:border-white/[0.08]">
              <button
                onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setStatusFilter('ACTIVE'); setCurrentPage(1); }}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => { setStatusFilter('NON_ACTIVE'); setCurrentPage(1); }}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'NON_ACTIVE'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
                }`}
              >
                Non-Active
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5 text-purple-400" />
              <span>Search Wallets or Outlets</span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search wallet, merchant, address..."
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs font-semibold placeholder-slate-400 border border-slate-300 dark:border-white/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* 3. Performance Scorecard for Selected KAM (6 User-Requested Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
          
          {/* Card 1: Total Wallet Count Under the KAM */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                Total Wallets
              </span>
              <Wallet className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatNumber(performanceKpis.totalWallets)}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 truncate">
              {selectedKam === 'ALL' ? 'Total Regional Outlets' : `Under ${selectedKam}`}
            </div>
          </div>

          {/* Card 2: Active vs Non-Active Merchant Count (from Active Merchant(DV) Column) */}
          <div className="glass-card rounded-2xl p-4 border border-emerald-500/25 space-y-1 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-emerald-500 tracking-wider">
                Active / Non-Active (DV)
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black font-mono flex items-center space-x-2 text-slate-900 dark:text-white">
              <span className="text-emerald-500">{formatNumber(performanceKpis.activeCount)}</span>
              <span className="text-slate-400 font-normal text-xs">/</span>
              <span className="text-rose-500">{formatNumber(performanceKpis.nonActiveCount)}</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-500 flex items-center space-x-1">
              <span>{performanceKpis.activeRatio.toFixed(1)}% Active DV Rate</span>
            </div>
          </div>

          {/* Card 3: Total PA Generated (All-Time Lifetime) */}
          <div className="glass-card rounded-2xl p-4 border border-[#E2136E]/25 space-y-1 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-[#E2136E] tracking-wider">
                Total PA Generated
              </span>
              <CircleDollarSign className="w-4 h-4 text-[#E2136E]" />
            </div>
            <div className="text-xl font-black font-mono text-[#E2136E] dark:text-pink-400 truncate">
              {formatBDT(performanceKpis.totalPAGenerated)}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Lifetime Onboarded Volume
            </div>
          </div>

          {/* Card 4: Total PA Generated MTD */}
          <div className="glass-card rounded-2xl p-4 border border-pink-400/25 space-y-1 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-pink-400 tracking-wider">
                Total PA (MTD)
              </span>
              <TrendingUp className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-xl font-black font-mono text-pink-500 dark:text-pink-300 truncate">
              {formatBDT(performanceKpis.totalPAGeneratedMTD)}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Live Month Gross Volume
            </div>
          </div>

          {/* Card 5: Total CC Generated (All-Time Lifetime) */}
          <div className="glass-card rounded-2xl p-4 border border-sky-400/25 space-y-1 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-sky-400 tracking-wider">
                Total CC Generated
              </span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-black font-mono text-sky-500 dark:text-sky-300">
              {formatNumber(performanceKpis.totalCCGenerated)}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Lifetime Completed Count
            </div>
          </div>

          {/* Card 6: Total CC Generated MTD */}
          <div className="glass-card rounded-2xl p-4 border border-purple-500/25 space-y-1 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-wider">
                Total CC (MTD)
              </span>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-black font-mono text-purple-400">
              {formatNumber(performanceKpis.totalCCGeneratedMTD)}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Live Month Completed Count
            </div>
          </div>

        </div>

      </div>

      {/* 4. Onboarded Wallets Ledger Table */}
      <div className="glass-panel rounded-3xl border border-white/10 dark:border-white/[0.08] shadow-2xl overflow-hidden">
        
        {/* Table Subheader */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-[#E2136E]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Onboarded Wallets Roster
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              ({tableFilteredWallets.length} wallets found under {selectedKam === 'ALL' ? 'All KAMs' : selectedKam})
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold hidden sm:inline">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="glass-input rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-white"
            >
              <option value={15} className="bg-white dark:bg-[#0B0F19]">15</option>
              <option value={25} className="bg-white dark:bg-[#0B0F19]">25</option>
              <option value={50} className="bg-white dark:bg-[#0B0F19]">50</option>
              <option value={100} className="bg-white dark:bg-[#0B0F19]">100</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-100/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4"># / Status (DV)</th>
                <th
                  onClick={() => handleSort('regDate')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Registration Date</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('wallet')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Wallet Number</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('merchant')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Merchant Name</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4">Address</th>
                <th
                  onClick={() => handleSort('last3m')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Last 3 Month Trnx</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('mtdPC')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>MTD Trnx (Total)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalPA')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Lifetime PA</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/[0.04]">
              {paginatedWallets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    No merchant wallets found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedWallets.map((m, idx) => {
                  const isActive = isMerchantActiveDV(m);
                  const l3 = getLast3MonthsMetrics(m);
                  const life = getLifetimeMetrics(m);
                  const rowNum = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr
                      key={m.id || m.wallet || idx}
                      className="hover:bg-slate-100/60 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => onSelectMerchant && onSelectMerchant(m)}
                    >
                      {/* # / Active Status (DV) */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-400 w-6">#{rowNum}</span>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-2.5 h-2.5 mr-0.5" />
                                <span>Non-Active</span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{m.regDate || '2024-01-01'}</span>
                        </div>
                      </td>

                      {/* Wallet Number */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-white/10">
                          {m.wallet}
                        </span>
                      </td>

                      {/* Merchant Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-[#E2136E] transition-colors">
                          {m.merchant || m.brand}
                        </div>
                        {m.brand && m.brand !== m.merchant && (
                          <div className="text-[10px] text-slate-400">{m.brand}</div>
                        )}
                        <div className="text-[10px] text-slate-400 font-medium">
                          {m.category || 'Retail'} {m.kam ? `• KAM: ${m.kam}` : ''}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[220px]">
                        <div className="flex items-start space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{getMerchantAddress(m)}</span>
                        </div>
                      </td>

                      {/* Last 3 Month Trnx in Total */}
                      <td className="py-3 px-4 text-right font-mono">
                        <div className="font-black text-slate-900 dark:text-white">
                          {formatNumber(l3.pc)} <span className="text-[10px] text-slate-400 font-normal">txns</span>
                        </div>
                        <div className="text-[10px] text-emerald-500 font-bold">
                          {formatBDT(l3.pa)}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {l3.monthsLabel}
                        </div>
                      </td>

                      {/* MTD Trnx in Total */}
                      <td className="py-3 px-4 text-right font-mono">
                        <div className="font-black text-sky-500 dark:text-sky-300">
                          {formatNumber(m.mtdPC || 0)} <span className="text-[10px] text-slate-400 font-normal">txns</span>
                        </div>
                        <div className="text-[10px] text-[#E2136E] dark:text-pink-400 font-bold">
                          {formatBDT(m.mtdPA || 0)}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          MTD CC: {formatNumber(m.mtdCC || m.mtdPC || 0)}
                        </div>
                      </td>

                      {/* Lifetime PA */}
                      <td className="py-3 px-4 text-right font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatBDT(life.lifetimePA)}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {formatNumber(life.lifetimeCC)} all-time txns
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectMerchant && onSelectMerchant(m)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/60 dark:bg-white/10 hover:bg-[#E2136E] hover:text-white text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition cursor-pointer flex items-center space-x-1 mx-auto"
                          title="Open Outlet Dossier"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/60 dark:border-white/[0.08] bg-slate-100/30 dark:bg-white/[0.01]">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-800 dark:text-white">
              {tableFilteredWallets.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong> to <strong className="text-slate-800 dark:text-white">
              {Math.min(currentPage * pageSize, tableFilteredWallets.length)}
            </strong> of <strong className="text-slate-800 dark:text-white">{tableFilteredWallets.length}</strong> wallets
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/60 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/60 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
