import React, { useState } from 'react';
import {
  Table,
  Download,
  FilterX,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { formatBDT, formatNumber } from '../utils/formatters';

export default function MerchantTable({
  merchants,
  getMerchantMetrics,
  onSelectMerchant,
  onExportCsv,
  showToast
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortColumn, setSortColumn] = useState('periodPA');
  const [sortDirection, setSortDirection] = useState('desc');
  const [copiedWallet, setCopiedWallet] = useState(null);

  const sorted = [...merchants].sort((a, b) => {
    const metA = getMerchantMetrics(a);
    const metB = getMerchantMetrics(b);
    let valA, valB;

    if (sortColumn === 'periodPA') {
      valA = metA.pa;
      valB = metB.pa;
    } else if (sortColumn === 'periodPC') {
      valA = metA.pc;
      valB = metB.pc;
    } else if (sortColumn === 'periodHealth') {
      valA = metA.health;
      valB = metB.health;
    } else if (sortColumn === 'regDate') {
      valA = a.regDate;
      valB = b.regDate;
    } else {
      valA = (a[sortColumn] || '').toString().toLowerCase();
      valB = (b[sortColumn] || '').toString().toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const pagedData = sorted.slice(startIndex, startIndex + pageSize);

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (col) => {
    if (sortColumn !== col) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#E2136E] ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#E2136E] ml-1 inline" />
    );
  };

  const handleCopyWallet = (e, wallet) => {
    e.stopPropagation();
    navigator.clipboard.writeText(wallet);
    setCopiedWallet(wallet);
    showToast(`Copied wallet ${wallet} to clipboard!`, 'success');
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
      
      {/* Table Top Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#E2136E]/20 to-pink-500/10 text-[#E2136E] dark:text-pink-400 border border-[#E2136E]/30 backdrop-blur-md">
              <Table className="w-4 h-4" />
            </div>
            <span>Granular Merchant Accounts Directory</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any merchant row to launch the comprehensive branch dossier and historical trajectory
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onExportCsv}
            className="flex items-center space-x-1.5 bg-slate-200/60 dark:bg-white/[0.05] hover:bg-slate-300/60 dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border border-slate-300/60 dark:border-white/[0.08] backdrop-blur-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 font-medium pl-1">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="glass-input rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Scroll Area with Frosted Header & Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-100/60 dark:bg-black/30 border-b border-slate-200/60 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 font-black uppercase text-[11px] tracking-wider select-none backdrop-blur-md">
            <tr>
              <th
                onClick={() => handleSort('wallet')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Wallet No {renderSortIcon('wallet')}
              </th>
              <th
                onClick={() => handleSort('brand')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Brand / Branch {renderSortIcon('brand')}
              </th>
              <th
                onClick={() => handleSort('district')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                District {renderSortIcon('district')}
              </th>
              <th
                onClick={() => handleSort('thana')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Thana {renderSortIcon('thana')}
              </th>
              <th
                onClick={() => handleSort('category')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Category {renderSortIcon('category')}
              </th>
              <th
                onClick={() => handleSort('subCategory')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Sub Category {renderSortIcon('subCategory')}
              </th>
              <th
                onClick={() => handleSort('kam')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                KAM {renderSortIcon('kam')}
              </th>
              <th
                onClick={() => handleSort('rbKam')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                RB KAM {renderSortIcon('rbKam')}
              </th>
              <th
                onClick={() => handleSort('periodPA')}
                className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Volume (PA) {renderSortIcon('periodPA')}
              </th>
              <th
                onClick={() => handleSort('periodPC')}
                className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Payments (PC) {renderSortIcon('periodPC')}
              </th>
              <th
                onClick={() => handleSort('periodHealth')}
                className="py-3 px-3.5 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Health {renderSortIcon('periodHealth')}
              </th>
              <th
                onClick={() => handleSort('regDate')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Reg Date {renderSortIcon('regDate')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/40 dark:divide-white/[0.04]">
            {pagedData.map((m) => {
              const met = getMerchantMetrics(m);
              return (
                <tr
                  key={m.id || m.wallet}
                  onClick={() => onSelectMerchant(m)}
                  className="hover:bg-pink-500/[0.04] dark:hover:bg-white/[0.04] transition cursor-pointer group"
                >
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <span>{m.wallet}</span>
                      <button
                        onClick={(e) => handleCopyWallet(e, m.wallet)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-[#E2136E] transition cursor-pointer"
                        title="Copy Wallet Number"
                      >
                        {copiedWallet === m.wallet ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 font-black text-slate-900 dark:text-white">
                    <div className="flex items-center space-x-1.5">
                      <span className="group-hover:text-[#E2136E] transition-colors">{m.brand}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px] font-medium">
                      {m.merchant}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 font-semibold">
                    {m.district}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                    {m.thana}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                    {m.category}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 dark:text-slate-400">
                    {m.subCategory}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-700 dark:text-slate-300">
                    {m.kam}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                    {m.rbKam}
                  </td>
                  <td className="py-3 px-3.5 text-right font-black text-slate-900 dark:text-white">
                    {formatBDT(met.pa)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-slate-800 dark:text-slate-200">
                    {formatNumber(met.pc)}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    {met.health === 'Green' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                        Green
                      </span>
                    ) : met.health === 'Amber' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
                        Amber
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 backdrop-blur-md shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1" />
                        Red
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {m.regDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* No Data State */}
      {sorted.length === 0 && (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <FilterX className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No merchant outlets match your criteria
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try clearing filters or selecting "All Statuses" on the wallet health command hub.
          </p>
        </div>
      )}

      {/* Pagination Footer with Glass Buttons */}
      {sorted.length > 0 && (
        <div className="p-4 border-t border-slate-200/60 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sorted.length)} of{' '}
            <strong className="text-slate-900 dark:text-white font-black">{sorted.length}</strong> merchants
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-xl bg-slate-200/60 dark:bg-white/[0.05] hover:bg-slate-300/60 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer border border-slate-300/40 dark:border-white/[0.08]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  (p >= validCurrentPage - 1 && p <= validCurrentPage + 1)
              )
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && (
                      <span className="px-1 text-slate-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition ${
                        validCurrentPage === p
                          ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-md shadow-[#E2136E]/30 border border-white/20'
                          : 'bg-slate-200/60 dark:bg-white/[0.05] hover:bg-slate-300/60 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-white/[0.08]'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-xl bg-slate-200/60 dark:bg-white/[0.05] hover:bg-slate-300/60 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer border border-slate-300/40 dark:border-white/[0.08]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
