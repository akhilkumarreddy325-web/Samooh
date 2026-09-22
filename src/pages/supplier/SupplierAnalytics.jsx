import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, PackageCheck, 
  Tag, Percent, RefreshCw, BarChart3, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupplierAnalytics } from '../../services/api';

export default function SupplierAnalytics() {
  const { currentSupplier } = useApp();
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
          <div className="w-7 h-7 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-500">Loading analytics...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Net Revenue', value: `₹${Number(data?.final_revenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, sub: 'Realized revenue' },
    { label: 'Gross Wholesale Volume', value: `₹${Number(data?.gross_sales || 0).toLocaleString('en-IN')}`, icon: TrendingUp, sub: 'Before volume discounts' },
    { label: 'Volume Discounts Granted', value: `₹${Number(data?.discounts_given || 0).toLocaleString('en-IN')}`, icon: Percent, sub: 'Passed to Kirana pools' },
    { label: 'Total Volume Supplied', value: `${Number(data?.total_quantity_supplied || 0).toLocaleString('en-IN')} units`, icon: PackageCheck, sub: 'Physical throughput' },
  ];

  const maxMonthRev = Math.max(1, ...(data?.monthly_trends || []).map(m => m.revenue));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Commercial Reports
            </span>
            <span className="text-xs text-slate-500 font-normal">
              {currentSupplier?.name || 'Wholesale Partner'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Revenue & Supply Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time tracking of gross sales, volume discounts unlocked by Kirana pools, and product-wise revenue performance.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center space-x-1.5 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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
              className="p-4 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
                <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold mt-2 tracking-tight text-slate-900 dark:text-white">
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
        <div className="lg:col-span-7 p-5 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>Monthly Wholesale Volume Trends</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly fulfilled demand and net revenue growth</p>
            </div>
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>+24.6% QoQ</span>
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {(data?.monthly_trends || []).map((m, idx) => {
              const pct = Math.round((m.revenue / maxMonthRev) * 100);
              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{m.month}</span>
                    <div className="space-x-3 text-right">
                      <span className="text-slate-500">{m.orders} orders ({m.quantity} units)</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{m.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div 
                      className="h-full rounded bg-emerald-800 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product-Wise Sales Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Tag className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>Product Sales Share</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Wholesale demand distribution across your catalog</p>
          </div>

          <div className="space-y-2 pt-1">
            {(data?.product_wise_sales || []).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No product-wise sales history recorded yet.
              </div>
            ) : (
              data.product_wise_sales.map((p, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{p.product_name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {p.orders_count} orders • {p.quantity} units supplied
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
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
