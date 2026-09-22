import React from 'react';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function StatusBadge({ status }) {
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  let icon = <Clock className="w-3 h-3 mr-1 text-slate-500" />;
  let label = status;

  if (status === 'ACHIEVED') {
    badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    icon = <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />;
    label = "Threshold Achieved";
  } else if (status === 'NEAR_THRESHOLD') {
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    icon = <AlertTriangle className="w-3 h-3 mr-1 text-amber-700" />;
    label = "Near Threshold";
  } else if (status === 'IN_PROGRESS') {
    badgeStyle = "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600";
    icon = <Clock className="w-3 h-3 mr-1 text-slate-600" />;
    label = "In Progress";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${badgeStyle}`}>
      {icon}
      {label}
    </span>
  );
}
