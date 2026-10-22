import React, { useState } from 'react';
import {
  LayoutDashboard,
  GitCompare,
  Settings,
  LogOut,
  Moon,
  Sun,
  Database,
  Building,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Target
} from 'lucide-react';
import bkashLogo from '../assets/logo.png';

export default function Sidebar({
  activeNav = 'dashboard',
  onSelectNav,
  onLockPortal,
  merchantCount = 0,
  isDark,
  onToggleTheme
}) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'comparison',
      label: 'Comparison',
      icon: GitCompare,
      badge: 'PRO'
    },
    {
      id: 'kpi',
      label: 'KPI Target & Metrics',
      icon: Target,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside
      className={`relative z-40 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-200/60 dark:border-white/[0.08] glass-panel-elevated select-none shrink-0 ${
        collapsed ? 'w-[78px]' : 'w-[260px]'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="p-4 space-y-6">
        
        {/* Brand Lockup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="relative group shrink-0">
              <img
                src={bkashLogo}
                alt="bKash"
                className="w-10 h-10 object-contain drop-shadow-[0_4px_14px_rgba(226,19,110,0.45)] transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-[#0B0F19]" />
              </span>
            </div>

            {!collapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white truncate">
                    Regional Portal
                  </h1>
                </div>
                <p className="text-[10px] text-slate-400 truncate font-semibold uppercase tracking-wider">
                  bKash Commercial
                </p>
              </div>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white shadow-md shadow-[#E2136E]/30 font-extrabold border border-white/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/30 text-white'
                        : 'bg-[#E2136E]/15 text-[#E2136E] dark:text-pink-300 border border-[#E2136E]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Footer Controls */}
      <div className="p-4 space-y-3 border-t border-slate-200/60 dark:border-white/[0.08]">
        
        {/* Active Dataset Status Widget */}
        {!collapsed && (
          <div className="bg-slate-100/80 dark:bg-white/[0.03] p-3 rounded-2xl border border-slate-200 dark:border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-[#E2136E]" />
                <span>Dataset Scope</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 neon-dot-emerald" />
            </div>
            <div className="text-xs font-black font-mono text-slate-800 dark:text-white">
              {merchantCount > 0 ? `${merchantCount} Outlets Loaded` : 'No Sheet Ingested'}
            </div>
          </div>
        )}

        {/* Actions: Theme Toggle & Logout */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center justify-center p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] transition cursor-pointer ${
              collapsed ? 'w-full' : 'flex-1'
            }`}
            title={isDark ? 'Switch to Pearl Light' : 'Switch to Obsidian Dark'}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-600" />
            )}
            {!collapsed && (
              <span className="ml-2 text-xs font-bold">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
            )}
          </button>

          {/* Logout / Lock Button */}
          <button
            onClick={onLockPortal}
            className={`p-2 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/40 transition cursor-pointer flex items-center justify-center ${
              collapsed ? 'w-full mt-2' : ''
            }`}
            title="Lock Portal (Logout)"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-1.5 text-xs font-bold">Lock</span>}
          </button>

        </div>

      </div>

    </aside>
  );
}
