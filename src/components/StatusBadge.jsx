import React from 'react';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function StatusBadge({ status }) {
  let badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
  let icon = <Clock className="w-3.5 h-3.5 mr-1" />;
  let label = status;

  if (status === 'ACHIEVED') {
    badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />;
    label = "Threshold Achieved";
  } else if (status === 'NEAR_THRESHOLD') {
    badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    icon = <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />;
    label = "Near Threshold";
  } else if (status === 'IN_PROGRESS') {
    badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/30";
    icon = <Clock className="w-3.5 h-3.5 mr-1 text-blue-400" />;
    label = "In Progress";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      {icon}
      {label}
    </span>
  );
}
