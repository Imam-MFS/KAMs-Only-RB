import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { formatBDT, formatNumber } from '../utils/formatters';
import { HISTORICAL_MONTHS } from '../data/timeline';

export default function MerchantDrawer({
  merchant,
  onClose,
  getMerchantMetrics,
  timeframeLabel,
  isDark,
  showToast
}) {
  const [copied, setCopied] = useState(false);

  if (!merchant) return null;

  const met = getMerchantMetrics(merchant);

  const handleCopy = () => {
    navigator.clipboard.writeText(merchant.wallet);
    setCopied(true);
    showToast(`Copied wallet ${merchant.wallet} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const past12 = HISTORICAL_MONTHS.slice(-12);
  const values = past12.map((m) => merchant.history?.[m]?.pa || 0);

  const historyChartData = {
    labels: past12,
    datasets: [
      {
        label: 'Volume (BDT)',
        data: values,
        borderColor: '#E2136E',
        backgroundColor: isDark
          ? 'rgba(226, 19, 110, 0.15)'
          : 'rgba(226, 19, 110, 0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 2.5,
        pointBackgroundColor: '#E2136E',
        borderWidth: 2
      }
    ]
  };

  const historyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ' ' + formatBDT(ctx.raw)
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDark ? '#94A3B8' : '#64748B',
          callback: (v) => (v >= 100000 ? v / 100000 + 'L' : v >= 1000 ? v / 1000 + 'K' : v),
          font: { size: 9 }
        },
        grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }
      },
      x: {
        ticks: { color: isDark ? '#94A3B8' : '#64748B', font: { size: 8 } },
        grid: { display: false }
      }
    }
  };

  let directiveText = '';
  if (met.health === 'Red') {
    directiveText = `CRITICAL DORMANT OUTLET: Assigned RB KAM (${merchant.rbKam}) must conduct an on-site visit within 48 hours to inspect POS QR standee presence, test customer scan flow, and re-train counter cashier.`;
  } else if (met.health === 'Amber') {
    directiveText = `VELOCITY UPLIFT CANDIDATE: Outlet produced only ${met.pc} payments. Deploy consumer cashback acrylic standees and launch cashier incentive target to elevate to Green tier.`;
  } else {
    directiveText = `HIGH VALUE KEY ACCOUNT: Outstanding performance (${formatBDT(met.pa)}). Maintain executive alignment with store manager, propose seasonal co-promotions, and audit terminal uptime.`;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Frosted Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#070A10]/75 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Slide-over Drawer Glass Panel */}
      <div className="relative w-full sm:max-w-lg glass-panel-elevated z-50 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-out shadow-2xl border-l border-white/10 dark:border-white/[0.12]">
        <div className="space-y-5">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-200/60 dark:border-white/[0.08]">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#E2136E]">
                Branch Intelligence Profile
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                {merchant.brand}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {merchant.merchant}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wallet Number & Status Card */}
          <div className="flex items-center justify-between glass-card p-4 rounded-xl">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Merchant Wallet Number
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                  {merchant.wallet}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-[#E2136E] transition p-1 cursor-pointer"
                  title="Copy Wallet Number"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              {met.health === 'Green' ? (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-xs">
                  🟢 Green (Active)
                </span>
              ) : met.health === 'Amber' ? (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-xs">
                  🟡 Amber (Low Trx)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 backdrop-blur-md shadow-xs">
                  🔴 Red (Dormant)
                </span>
              )}
            </div>
          </div>

          {/* Period Performance Grid */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Performance in <span className="text-slate-900 dark:text-white font-bold">{timeframeLabel}</span>:
            </div>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="glass-card p-3 rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Volume (PA)</span>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {formatBDT(met.pa)}
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Payments (PC)</span>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {formatNumber(met.pc)} txns
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Customers (CC)</span>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {formatNumber(met.cc)} users
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding & Activation Lag Tracker */}
          <div className="glass-card p-4 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Onboarding & Activation Lag
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                Reg: {merchant.regDate}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div
                className={`p-2 rounded-lg border text-center ${
                  merchant.noTxn1m
                    ? 'bg-rose-500/15 border-rose-500/30'
                    : 'bg-emerald-500/15 border-emerald-500/30'
                }`}
              >
                <div className="text-[10px] text-slate-500 dark:text-slate-400">1 Month Post-Reg</div>
                <div
                  className={`font-black text-xs mt-0.5 ${
                    merchant.noTxn1m
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {merchant.noTxn1m ? 'No Trx' : 'Transacted'}
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border text-center ${
                  merchant.noTxn3m
                    ? 'bg-rose-500/15 border-rose-500/30'
                    : 'bg-emerald-500/15 border-emerald-500/30'
                }`}
              >
                <div className="text-[10px] text-slate-500 dark:text-slate-400">3 Months Post-Reg</div>
                <div
                  className={`font-black text-xs mt-0.5 ${
                    merchant.noTxn3m
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {merchant.noTxn3m ? 'No Trx' : 'Transacted'}
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border text-center ${
                  merchant.noTxn5m
                    ? 'bg-rose-500/15 border-rose-500/30'
                    : 'bg-emerald-500/15 border-emerald-500/30'
                }`}
              >
                <div className="text-[10px] text-slate-500 dark:text-slate-400">5 Months Post-Reg</div>
                <div
                  className={`font-black text-xs mt-0.5 ${
                    merchant.noTxn5m
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {merchant.noTxn5m ? 'No Trx' : 'Transacted'}
                </div>
              </div>
            </div>
          </div>

          {/* 12-Month Sparkline Chart */}
          <div className="glass-card rounded-xl p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span>Historical Monthly Volume Trend</span>
              <span className="text-[10px] text-slate-400">Past 12 Months</span>
            </div>
            <div className="h-32 relative">
              <Line data={historyChartData} options={historyChartOptions} />
            </div>
          </div>

          {/* Organizational Hierarchy Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">RB KAM Lead</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {merchant.rbKamLead || 'Unassigned'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">RB KAM</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {merchant.rbKam || 'Unassigned'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Category Lead</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {merchant.catLead || 'Unassigned'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Key Account Manager (KAM)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {merchant.kam || 'Unassigned'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Active Status (DV)</span>
              <span className={`font-bold ${merchant.activeMerchantDV === 'Active' || (!merchant.activeMerchantDV && (merchant.mtdPC > 0 || merchant.mtdPA > 0)) ? 'text-emerald-500' : 'text-rose-500'}`}>
                {merchant.activeMerchantDV || ((merchant.mtdPC > 0 || merchant.mtdPA > 0) ? 'Active' : 'Non-Active')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Address / Location</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-right max-w-[200px] truncate" title={merchant.address || `${merchant.thana}, ${merchant.district}`}>
                {merchant.address || `${merchant.thana}, ${merchant.district}`}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Category / Sub Category</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {merchant.category} • {merchant.subCategory}
              </span>
            </div>
          </div>

          {/* Action Directive */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1 backdrop-blur-md">
            <div className="font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Field Operation Directive:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
              {directiveText}
            </p>
          </div>

        </div>

        {/* Bottom Close Button */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-white/[0.08]">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer border border-white/10 backdrop-blur-md"
          >
            Close Profile Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
