import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  X,
  ChevronDown,
  MapPin,
  Building,
  UserCheck,
  User,
  Briefcase,
  Layers,
  Tag,
  Navigation,
  Sparkles
} from 'lucide-react';

export const FILTER_CONFIG = [
  { id: 'rbKamLead', field: 'rbKamLead', label: 'RB KAM Lead', plural: 'RB Leads', icon: UserCheck },
  { id: 'rbKam', field: 'rbKam', label: 'RB KAM (Officer)', plural: 'RB KAMs', icon: User },
  { id: 'district', field: 'district', label: 'Present District', plural: 'Districts', icon: MapPin },
  { id: 'thana', field: 'thana', label: 'Present Thana', plural: 'Thanas', icon: Navigation },
  { id: 'catLead', field: 'catLead', label: 'Category Lead', plural: 'Cat Leads', icon: Briefcase },
  { id: 'kam', field: 'kam', label: 'Key Account Mgr', plural: 'KAMs', icon: Building },
  { id: 'category', field: 'category', label: 'Industry Category', plural: 'Categories', icon: Layers },
  { id: 'subCategory', field: 'subCategory', label: 'Sub-Category', plural: 'Sub Categories', icon: Tag }
];

export default function FacetedFilterMatrix({
  filters,
  onFilterChange,
  facetedOptions,
  matchingCount,
  onResetFilters,
  searchTerm,
  onSearchChange,
  hasActiveFilters
}) {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 border border-white/10 dark:border-white/[0.08] shadow-xl relative overflow-hidden transition-all duration-300">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#E2136E]/10 to-transparent pointer-events-none blur-3xl" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-white/[0.06] relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[#E2136E]/20 to-pink-500/10 text-[#E2136E] dark:text-pink-400 border border-[#E2136E]/30 backdrop-blur-md shadow-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span>Territory & Sales Hierarchy Matrix</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#E2136E] neon-dot-pink" />
              )}
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Interdependent cascading filter engine with dynamic real-time recalculation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 text-xs bg-slate-100/80 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-inner backdrop-blur-md">
            <span className="text-[11px] text-slate-400 font-medium">Matching Outlets:</span>
            <span className="text-[#E2136E] dark:text-pink-400 font-mono font-black text-sm">{matchingCount}</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100/80 dark:hover:bg-rose-950/60 transition border border-rose-300/50 dark:border-rose-900/40 shadow-xs cursor-pointer backdrop-blur-md active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 4x2 Responsive Grid for High-Density Precision */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs relative z-10">
        {FILTER_CONFIG.map(({ id, field, label, plural, icon: Icon }) => {
          const currentVal = filters[field] || 'ALL';
          const options = facetedOptions[field] || [];
          const isActive = currentVal !== 'ALL';

          return (
            <div
              key={id}
              className={`p-2.5 rounded-xl transition-all duration-200 border ${
                isActive
                  ? 'bg-[#E2136E]/[0.08] border-[#E2136E]/40 shadow-xs ring-1 ring-[#E2136E]/20'
                  : 'bg-white/40 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E2136E]' : 'text-slate-400'}`} />
                  <span className="truncate">{label}</span>
                </div>
                {isActive && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#E2136E] text-white">
                    Active
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  value={currentVal}
                  onChange={(e) => onFilterChange(field, e.target.value)}
                  className={`faceted-filter w-full glass-input rounded-lg py-1.5 px-2.5 text-xs font-semibold appearance-none truncate pr-7 cursor-pointer transition ${
                    isActive
                      ? 'border-[#E2136E] text-[#E2136E] dark:text-pink-300 font-bold bg-[#E2136E]/10'
                      : 'text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-white/20'
                  }`}
                >
                  <option value="ALL" className="bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200">
                    All {plural} ({matchingCount})
                  </option>
                  {options.map((opt) => (
                    <option
                      key={opt.val}
                      value={opt.val}
                      className="bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200"
                    >
                      {opt.val} ({opt.count})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Glass Text Search Bar */}
      <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Wallet Number, Brand Name, Merchant Branch, Thana, District, KAM..."
            className="w-full glass-input rounded-xl pl-10 pr-9 py-2 text-xs font-medium placeholder-slate-400 focus:ring-1 focus:ring-[#E2136E]"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
