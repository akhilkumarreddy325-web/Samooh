import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkles, Truck, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OrderProcessing() {
  const { theme, t, activeInvoice } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    // Step 1 -> Step 2
    const t1 = setTimeout(() => {
      setStep(2);
      setProgress(55);
    }, 900);

    // Step 2 -> Step 3
    const t2 = setTimeout(() => {
      setStep(3);
      setProgress(85);
    }, 1800);

    // Step 3 -> Step 4 (Order Placed Successfully)
    const t3 = setTimeout(() => {
      setStep(4);
      setProgress(100);
    }, 2700);

    // Step 4 -> Redirect to Invoice Page
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
    <div className="min-h-[80vh] flex items-center justify-center p-6 max-w-2xl mx-auto">
      <div className={`glass-card rounded-3xl p-8 border w-full text-center space-y-6 shadow-2xl transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
          : 'bg-[#131A2A] border-slate-700/80 text-white'
      }`}>
        {/* Top Animated Icon Header */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {step < 4 ? (
            <>
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Layers className="w-10 h-10 text-white animate-bounce" />
              </div>
            </>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Title & Status Message */}
        <div>
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-flex items-center space-x-1.5 ${
            step === 4
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-blue-500/10 text-blue-600 dark:text-accentBlue border-blue-500/30'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{step === 4 ? 'Order Placed Successfully!' : 'Processing Group Order'}</span>
          </span>

          <h2 className={`text-2xl font-extrabold mt-3 tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {step === 1 && 'Aggregating Kirana Store Demand...'}
            {step === 2 && 'Unlocking Wholesale Bulk Tier...'}
            {step === 3 && 'Consolidating Cluster Logistics...'}
            {step === 4 && '🎉 Order Placed & Pool Locked!'}
          </h2>

          <p className={`text-xs mt-1.5 max-w-md mx-auto ${
            theme === 'light' ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {step === 4 
              ? 'Your group order has been confirmed. Redirecting to your official savings bill...'
              : 'Matching your store demand with 4 neighboring Kirana stores in the Hyderabad cluster.'}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
              AI Optimization Progress
            </span>
            <span className="text-blue-600 dark:text-accentBlue font-extrabold">{progress}%</span>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
            theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                step === 4 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Animated Timeline Steps List */}
        <div className={`p-4 rounded-2xl border text-left space-y-3 text-xs ${
          theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              {step >= 1 ? '✓' : '1'}
            </div>
            <span className={step >= 1 ? (theme === 'light' ? 'text-slate-900 font-bold' : 'text-white font-bold') : 'text-slate-400'}>
              Cluster Kirana Demand Aggregated
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              {step >= 2 ? '✓' : '2'}
            </div>
            <span className={step >= 2 ? (theme === 'light' ? 'text-slate-900 font-bold' : 'text-white font-bold') : 'text-slate-400'}>
              Deccan Supplier Minimum Wholesale Met
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              {step >= 3 ? '✓' : '3'}
            </div>
            <span className={step >= 3 ? (theme === 'light' ? 'text-slate-900 font-bold' : 'text-white font-bold') : 'text-slate-400'}>
              Logistics Dispatch Assigned (#HYD-42)
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 4 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              {step >= 4 ? '✓' : '4'}
            </div>
            <span className={step >= 4 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
              Order Confirmed & Savings Invoice Generated
            </span>
          </div>
        </div>

        {/* Manual Redirect Button Option */}
        {step === 4 && (
          <button
            onClick={() => navigate('/invoice')}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 animate-bounce"
          >
            <span>View Official Group Savings Bill</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
