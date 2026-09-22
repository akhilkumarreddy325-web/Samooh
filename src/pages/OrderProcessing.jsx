import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OrderProcessing() {
  const { theme } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStep(2);
      setProgress(55);
    }, 900);

    const t2 = setTimeout(() => {
      setStep(3);
      setProgress(85);
    }, 1800);

    const t3 = setTimeout(() => {
      setStep(4);
      setProgress(100);
    }, 2700);

    const t4 = setTimeout(() => {
      navigate('/invoice');
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 max-w-xl mx-auto">
      <div className="rounded-lg p-6 border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 w-full text-center space-y-5 shadow-sm">
        {/* Top Icon Header */}
        <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-lg bg-emerald-800 text-white">
          {step < 4 ? (
            <Layers className="w-7 h-7" />
          ) : (
            <CheckCircle2 className="w-7 h-7" />
          )}
        </div>

        {/* Title & Status Message */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 inline-block">
            {step === 4 ? 'Order Confirmed' : 'Processing Procurement Order'}
          </span>

          <h2 className="text-xl font-bold mt-2 tracking-tight text-slate-900 dark:text-white">
            {step === 1 && 'Aggregating Kirana Store Demand...'}
            {step === 2 && 'Validating Wholesale Bulk Tier...'}
            {step === 3 && 'Consolidating Cluster Logistics...'}
            {step === 4 && 'Order Confirmed & Allocation Locked'}
          </h2>

          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {step === 4 
              ? 'Your wholesale order has been confirmed. Redirecting to invoice...'
              : 'Matching demand with regional Kirana stores in your hub cluster.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500">
            <span>Processing Status</span>
            <span className="font-semibold text-slate-900 dark:text-white">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div 
              className="h-full rounded bg-emerald-800 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timeline Steps List */}
        <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-left space-y-2 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 1 ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step >= 1 ? '✓' : '1'}
            </div>
            <span className={step >= 1 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-400'}>
              Cluster Kirana Demand Aggregated
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 2 ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step >= 2 ? '✓' : '2'}
            </div>
            <span className={step >= 2 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-400'}>
              Supplier Wholesale Threshold Satisfied
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 3 ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step >= 3 ? '✓' : '3'}
            </div>
            <span className={step >= 3 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-400'}>
              Fleet Dispatch & Route Consolidation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
