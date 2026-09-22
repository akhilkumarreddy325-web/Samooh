import React, { useState, useEffect } from 'react';
import { 
  LineChart, TrendingUp, DollarSign, PackageCheck, 
  Tag, Percent, RefreshCw, BarChart3, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupplierAnalytics } from '../../services/api';

export default function SupplierAnalytics() {
  const { theme, currentSupplier } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const supId = currentSupplier?.id || 'sup_01';

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getSupplierAnalytics(supId);
      setData(res);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [supId]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Net Revenue', value: `₹${Number(data?.final_revenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'emerald', sub: 'Realized revenue' },
    { label: 'Gross Wholesale Volume', value: `₹${Number(data?.gross_sales || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'blue', sub: 'Before volume discounts' },
    { label: 'Volume Discounts Granted', value: `₹${Number(data?.discounts_given || 0).toLocaleString('en-IN')}`, icon: Percent, color: 'purple', sub: 'Passed to Kirana pools' },
    { label: 'Total Volume Supplied', value: `${Number(data?.total_quantity_supplied || 0).toLocaleString('en-IN')} units`, icon: PackageCheck, color: 'amber', sub: 'Physical throughput' },
  ];

  const maxMonthRev = Math.max(1, ...(data?.monthly_trends || []).map(m => m.revenue));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Supply Intelligence
            </span>
            <span className="text-xs text-slate-400">
              {currentSupplier?.name || 'Wholesale Partner'}
            </span>
          </div>
          <h1 className={`text-2xl font-black tracking-tight mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Wholesale Revenue & Supply Analytics
          </h1>
          <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Real-time tracking of gross sales, volume discounts unlocked by Kirana pools, and product-wise revenue performance.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
            theme === 'light' 
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
              : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl border transition hover:shadow-md ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131A2A] border-slate-800 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{stat.label}</span>
                <div className={`p-2 rounded-xl ${
                  stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                  stat.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                  stat.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black mt-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {stat.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Order & Revenue Trends (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border space-y-4 ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131A2A] border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>Monthly Wholesale Volume Trends</span>
              </h3>
              <p className="text-xs text-slate-400">Monthly fulfilled demand and net revenue growth</p>
            </div>
            <span className="text-xs font-bold text-emerald-500 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-0.5" />
              <span>+24.6% vs last quarter</span>
            </span>
          </div>

          <div className="space-y-4 pt-4">
            {(data?.monthly_trends || []).map((m, idx) => {
              const pct = Math.round((m.revenue / maxMonthRev) * 100);
              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{m.month}</span>
                    <div className="space-x-3 text-right">
                      <span className="text-slate-400">{m.orders} orders ({m.quantity} units)</span>
                      <span className="text-amber-500 font-black">₹{m.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product-Wise Sales Breakdown (5 cols) */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border space-y-4 ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131A2A] border-slate-800 text-white'
        }`}>
          <div>
            <h3 className="text-base font-black flex items-center space-x-2">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Product-Wise Sales Share</span>
            </h3>
            <p className="text-xs text-slate-400">Wholesale demand distribution across your catalog</p>
          </div>

          <div className="space-y-3 pt-2">
            {(data?.product_wise_sales || []).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No product-wise sales history recorded yet.
              </div>
            ) : (
              data.product_wise_sales.map((p, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                    theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-[#0B1020] border-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{p.product_name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {p.orders_count} orders • {p.quantity} units supplied
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-500 text-sm">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
