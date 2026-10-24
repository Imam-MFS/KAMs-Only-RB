import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { PieChart, TrendingUp, BarChart3 } from 'lucide-react';
import { formatBDT } from '../utils/formatters';
import { HISTORICAL_MONTHS } from '../data/timeline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsCharts({
  filteredMerchants,
  getMerchantMetrics,
  isDark
}) {
  const [breakdownMode, setBreakdownMode] = useState('DISTRICT'); // 'DISTRICT' | 'CATEGORY' | 'RB_KAM'

  const textColor = isDark ? '#94A3B8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // 1. Leaderboard Data
  const groupMap = {};
  filteredMerchants.forEach((m) => {
    let key = 'Other';
    if (breakdownMode === 'DISTRICT') key = m.district || 'Unassigned';
    else if (breakdownMode === 'CATEGORY') key = m.category || 'General';
    else if (breakdownMode === 'RB_KAM') key = m.rbKam || 'Unassigned';

    const met = getMerchantMetrics(m);
    groupMap[key] = (groupMap[key] || 0) + met.pa;
  });

  const sortedBreakdown = Object.entries(groupMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const breakdownLabels = sortedBreakdown.map((i) => i[0]);
  const breakdownValues = sortedBreakdown.map((i) => i[1]);

  const barChartData = {
    labels: breakdownLabels.length ? breakdownLabels : ['No Data'],
    datasets: [
      {
        label: 'Volume (PA BDT)',
        data: breakdownValues.length ? breakdownValues : [0],
        backgroundColor: '#E2136E',
        hoverBackgroundColor: '#FF2E88',
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(11, 17, 32, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#FFFFFF' : '#0F172A',
        bodyColor: isDark ? '#CBD5E1' : '#334155',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: (ctx) => ' Volume: ' + formatBDT(ctx.raw)
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          callback: (v) =>
            v >= 10000000
              ? v / 10000000 + 'Cr'
              : v >= 100000
              ? v / 100000 + 'L'
              : v >= 1000
              ? v / 1000 + 'K'
              : v,
          font: { size: 9 }
        },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: textColor, font: { size: 9 } },
        grid: { display: false }
      }
    }
  };

  // 2. Health Donut Chart Data
  let greenCnt = 0;
  let amberCnt = 0;
  let redCnt = 0;

  filteredMerchants.forEach((m) => {
    const met = getMerchantMetrics(m);
    if (met.health === 'Green') greenCnt++;
    else if (met.health === 'Amber') amberCnt++;
    else redCnt++;
  });

  const donutChartData = {
    labels: ['Green (High)', 'Amber (Low)', 'Red (Dormant)'],
    datasets: [
      {
        data: [greenCnt, amberCnt, redCnt],
        backgroundColor: ['#10B981', '#F59E0B', '#F43F5E'],
        borderColor: isDark ? 'rgba(11, 17, 32, 0.8)' : '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 6
      }
    ]
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          boxWidth: 10,
          font: { size: 10, weight: 'bold' },
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(11, 17, 32, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#FFFFFF' : '#0F172A',
        bodyColor: isDark ? '#CBD5E1' : '#334155',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw} outlets`
        }
      }
    },
    cutout: '72%'
  };

  // 3. Historical Volume Progression (Past 12 Months)
  const past12 = HISTORICAL_MONTHS.slice(-12);
  const aggMonthly = past12.map((mStr) => {
    let sum = 0;
    filteredMerchants.forEach((m) => {
      sum += m.history?.[mStr]?.pa || 0;
    });
    return sum;
  });

  const lineChartData = {
    labels: past12,
    datasets: [
      {
        label: 'Scope GMV (BDT)',
        data: aggMonthly,
        borderColor: '#FF2E88',
        backgroundColor: isDark
          ? 'rgba(255, 46, 136, 0.15)'
          : 'rgba(226, 19, 110, 0.08)',
        fill: true,
        tension: 0.38,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FF2E88',
        borderWidth: 2.5
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(11, 17, 32, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#FFFFFF' : '#0F172A',
        bodyColor: isDark ? '#CBD5E1' : '#334155',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ' Monthly Scope: ' + formatBDT(ctx.raw)
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          callback: (v) =>
            v >= 10000000
              ? v / 10000000 + 'Cr'
              : v >= 100000
              ? v / 100000 + 'L'
              : v >= 1000
              ? v / 1000 + 'K'
              : v,
          font: { size: 9 }
        },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: textColor, font: { size: 8 } },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      
      {/* Chart 1: Territory Leaderboard */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-white/[0.08]">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#E2136E]" />
              <span>Volume Leaderboard</span>
            </h3>

            {/* Breakdown Toggle */}
            <div className="inline-flex bg-slate-200/60 dark:bg-black/40 p-0.5 rounded-lg text-[10px] font-bold border border-slate-300/40 dark:border-white/[0.08] backdrop-blur-md">
              <button
                onClick={() => setBreakdownMode('DISTRICT')}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  breakdownMode === 'DISTRICT'
                    ? 'bg-white dark:bg-white/15 text-[#E2136E] dark:text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                District
              </button>
              <button
                onClick={() => setBreakdownMode('CATEGORY')}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  breakdownMode === 'CATEGORY'
                    ? 'bg-white dark:bg-white/15 text-[#E2136E] dark:text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Category
              </button>
              <button
                onClick={() => setBreakdownMode('RB_KAM')}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  breakdownMode === 'RB_KAM'
                    ? 'bg-white dark:bg-white/15 text-[#E2136E] dark:text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                RB KAM
              </button>
            </div>
          </div>
        </div>

        <div className="h-60 relative flex items-center justify-center">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Chart 2: Account Health Split */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-white/[0.08]">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-[#E2136E]" />
              <span>Outlet Health Distribution</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              Green / Amber / Red
            </span>
          </div>
        </div>

        <div className="h-60 relative flex items-center justify-center">
          <Doughnut data={donutChartData} options={donutChartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {filteredMerchants.length}
            </span>
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
              Total Outlets
            </span>
          </div>
        </div>
      </div>

      {/* Chart 3: Historical Volume Progression Line */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 md:col-span-2 xl:col-span-1">
        <div>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-white/[0.08]">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#E2136E]" />
              <span>Volume Trajectory (12 Months)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              Scope PA (BDT)
            </span>
          </div>
        </div>

        <div className="h-60 relative flex items-center justify-center">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

    </div>
  );
}
