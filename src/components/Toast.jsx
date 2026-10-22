import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        let bgStyle = 'bg-slate-900 dark:bg-slate-800 text-white border-slate-700';
        let Icon = Info;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-600 text-white border-amber-500 shadow-amber-500/20';
          Icon = AlertTriangle;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20';
          Icon = AlertOctagon;
        }

        return (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-xl border shadow-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-300 pointer-events-auto ${bgStyle}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
