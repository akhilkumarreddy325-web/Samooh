import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function KPICard({ title, value, change, isPositive = true, icon: Icon, accentColor = 'blue', subtitle }) {
  const { theme } = useApp();

  const accentClasses = {
    blue: theme === 'light' ? 'text-blue-600 bg-blue-50' : 'text-accentBlue bg-accentBlue/10',
    purple: theme === 'light' ? 'text-purple-600 bg-purple-50' : 'text-accentPurple bg-accentPurple/10',
    green: theme === 'light' ? 'text-emerald-600 bg-emerald-50' : 'text-accentGreen bg-accentGreen/10',
    amber: theme === 'light' ? 'text-amber-600 bg-amber-50' : 'text-amber-500 bg-amber-500/10'
  };

  const borderAccent = {
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    green: 'border-l-emerald-500',
    amber: 'border-l-amber-500'
  };

  return (
    <div className={`glass-card rounded-2xl p-5 border-l-4 transition-all duration-200 ${borderAccent[accentColor]} ${
      theme === 'light'
        ? 'bg-white/80 border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.1)]'
        : 'border-slate-800/80'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wider ${
          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
        }`}>{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${accentClasses[accentColor]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className={`text-2xl font-extrabold tracking-tight ${
          theme === 'light' ? 'text-slate-900' : 'text-white'
        }`}>{value}</h3>
        {change && (
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
            isPositive 
              ? theme === 'light' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-emerald-500/10 text-emerald-400'
              : theme === 'light' ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className={`mt-2 text-xs ${
          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
        }`}>{subtitle}</p>
      )}
    </div>
  );
}
