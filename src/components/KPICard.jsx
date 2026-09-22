import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function KPICard({ title, value, change, isPositive = true, icon: Icon, subtitle }) {
  const { theme } = useApp();

  return (
    <div className={`p-4 sm:p-5 rounded-lg border transition-colors ${
      theme === 'light'
        ? 'bg-white border-slate-200/90 shadow-sm'
        : 'bg-[#1E293B] border-slate-700/80 text-white'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${
          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
        }`}>{title}</span>
        {Icon && (
          <div className={`p-2 rounded-md ${
            theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className={`text-2xl font-semibold tracking-tight ${
          theme === 'light' ? 'text-slate-900' : 'text-white'
        }`}>{value}</div>
        {change && (
          <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${
            isPositive 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40' 
              : 'bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className={`mt-1.5 text-xs ${
          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
        }`}>{subtitle}</p>
      )}
    </div>
  );
}
