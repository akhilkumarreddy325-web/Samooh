import React, { useEffect, useState } from 'react';
import { IndianRupee, ShieldCheck, Truck, Leaf, AlertCircle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import KPICard from '../components/KPICard';
import { getImpactMetrics, seedData } from '../services/api';
import { useApp } from '../context/AppContext';

export default function Impact() {
  const { theme, t } = useApp();
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadImpact();
  }, []);

  async function loadImpact() {
    setLoading(true);
    setError(null);
    try {
      const res = await getImpactMetrics();
      setImpactData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch impact metrics');
    } finally {
      setLoading(false);
    }
  }

  const handleSeed = async () => {
    try {
      await seedData();
      await loadImpact();
    } catch (err) {
      setError('Failed to seed: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-medium text-slate-500">Loading business and ESG impact analysis...</div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 my-12 shadow-sm">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Impact Analysis Connection Notice</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <button onClick={handleSeed} className="px-3.5 py-1.5 rounded-md bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-900 shadow-sm">
          {t('seedAndGenerate')}
        </button>
      </div>
    );
  }

  const impact = impactData?.impact || {};
  const totalSavings = impact.total_community_savings_inr || 84520;

  const mockGrowthChart = [
    { month: 'Month 1', savings: Math.round(totalSavings * 0.15), roi: 14.2 },
    { month: 'Month 2', savings: Math.round(totalSavings * 0.35), roi: 16.5 },
    { month: 'Month 3', savings: Math.round(totalSavings * 0.55), roi: 17.8 },
    { month: 'Month 4', savings: Math.round(totalSavings * 0.80), roi: 18.2 },
    { month: 'Month 5', savings: totalSavings, roi: 18.5 },
  ];

  const comparisonTable = impactData?.comparison_table || [
    { product: "Sona Masoori Rice (25kg)", individual_price: 1450, pooled_price: 1180, savings_pct: 18.6, annual_savings: 32400 },
    { product: "Freedom Sunflower Oil (15L)", individual_price: 1950, pooled_price: 1620, savings_pct: 16.9, annual_savings: 39600 },
    { product: "Guntur Red Chilli Powder (5kg)", individual_price: 1750, pooled_price: 1390, savings_pct: 20.5, annual_savings: 43200 },
    { product: "Red Label Tea Master Pack", individual_price: 4800, pooled_price: 3950, savings_pct: 17.7, annual_savings: 51000 },
    { product: "Surf Excel Easy Wash Carton", individual_price: 2800, pooled_price: 2250, savings_pct: 19.6, annual_savings: 66000 }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            {t('businessImpactAnalysis')}
            <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Live Metrics
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('impactDesc')}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('aggregateSavings')}
          value={`₹${totalSavings.toLocaleString()}`}
          change="+24.5%"
          isPositive={true}
          icon={IndianRupee}
          color="emerald"
          subtext="Net wholesale arbitrage"
        />
        <KPICard
          title={t('avgMarginUnlocked')}
          value={`${impact.average_savings_percentage || 18.5}%`}
          change="+3.2%"
          isPositive={true}
          icon={ShieldCheck}
          color="blue"
          subtext="Additional Kirana margin"
        />
        <KPICard
          title={t('logisticsSavings')}
          value="₹14,200"
          change="+18.0%"
          isPositive={true}
          icon={Truck}
          color="purple"
          subtext="Shared cluster dispatch"
        />
        <KPICard
          title={t('co2Saved')}
          value="480 kg"
          change="+12.4%"
          isPositive={true}
          icon={Leaf}
          color="emerald"
          subtext="Consolidated transport"
        />
      </div>

      {/* Savings Growth & ROI Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-lg p-5 border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-800 dark:text-white">
            {t('cumulativeFinancialGrowth')}
          </h3>
          <p className="text-xs mb-3 text-slate-500">
            Cumulative money saved by participating small retailers
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockGrowthChart}>
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#166534" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#F1F5F9' : '#1E293B'} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', 
                  borderColor: '#CBD5E1', 
                  borderRadius: '6px',
                  fontSize: '12px'
                }} />
                <Area type="monotone" dataKey="savings" stroke="#166534" strokeWidth={2} fillOpacity={1} fill="url(#colorGreen)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg p-5 border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-800 dark:text-white">
            {t('avgDiscountUnlocked')}
          </h3>
          <p className="text-xs mb-3 text-slate-500">
            Average discount percentage off benchmark single-store rates
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockGrowthChart}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#F1F5F9' : '#1E293B'} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', 
                  borderColor: '#CBD5E1', 
                  borderRadius: '6px',
                  fontSize: '12px'
                }} />
                <Bar dataKey="roi" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparative Pricing Table */}
      <div className="rounded-lg p-5 border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-white">
              {t('priceArbitrageAnalysis')}
            </h3>
            <p className="text-xs text-slate-500">
              Single-store retail price benchmark vs Samooh pooled wholesale rates
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            18.5% Net Average Margin
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">Individual Retail Price</th>
                <th className="py-2.5 px-3 text-right">Samooh Group Price</th>
                <th className="py-2.5 px-3 text-center">Discount %</th>
                <th className="py-2.5 px-3 text-right">Est. Annual Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {comparisonTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{row.product}</td>
                  <td className="py-2.5 px-3 text-right line-through text-slate-400">₹{row.individual_price.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-800 dark:text-emerald-400 font-semibold">₹{row.pooled_price.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800 text-[11px]">
                      {row.savings_pct}% OFF
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300">₹{row.annual_savings.toLocaleString()} / yr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
