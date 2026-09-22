import React, { useEffect, useState } from 'react';
import { MapPin, Star, Search, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRetailers, getForecasts, generateForecasts, seedData } from '../services/api';
import { useApp } from '../context/AppContext';

export default function Insights() {
  const { theme, t } = useApp();
  const [retailers, setRetailers] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadInsightsData();
  }, []);

  async function loadInsightsData() {
    setLoading(true);
    setError(null);
    try {
      const [retRes, fcRes] = await Promise.all([
        getRetailers(),
        getForecasts()
      ]);
      const retList = retRes.data || [];
      const fcList = fcRes.data || [];
      setRetailers(retList);
      setForecasts(fcList);
      if (retList.length > 0) setSelectedRetailer(retList[0]);
    } catch (err) {
      setError(err.message || 'Failed to fetch retailer insights');
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateForecasts = async () => {
    setIsGenerating(true);
    try {
      await generateForecasts(30);
      await loadInsightsData();
    } catch (err) {
      setError('Forecast calculation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSeed = async () => {
    setIsGenerating(true);
    try {
      await seedData();
      await loadInsightsData();
    } catch (err) {
      setError('Seeding failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredRetailers = retailers.filter(r => {
    const matchesType = filterType === 'ALL' || r.store_type === filterType;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const retailerForecasts = selectedRetailer 
    ? forecasts.filter(f => f.retailer_id === selectedRetailer.id)
    : [];

  const mockDemandTrend = [
    { period: 'Week 1', demand: 18, baseline: 15 },
    { period: 'Week 2', demand: 26, baseline: 20 },
    { period: 'Week 3', demand: 34, baseline: 25 },
    { period: 'Week 4', demand: 42, baseline: 30 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            {t('retailerInsightsForecasts')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('insightsDesc')}
          </p>
        </div>

        <button 
          onClick={handleGenerateForecasts}
          disabled={isGenerating}
          className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium shadow-sm transition flex items-center space-x-1.5 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? t('runningMl') : t('runForecasts')}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-medium text-slate-500">
          Loading retailer profiles and demand forecasts...
        </div>
      ) : error ? (
        <div className="p-6 max-w-xl mx-auto text-center space-y-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Forecast Connection Notice</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <button onClick={handleSeed} className="px-3.5 py-1.5 rounded-md bg-emerald-800 text-white text-xs font-medium shadow-sm">
            {t('seedAndGenerate')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Directory Column */}
          <div className="rounded-lg p-4 border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 text-slate-800 dark:text-white">
                {t('retailerDirectory')} ({filteredRetailers.length})
              </h3>
              
              {/* Search & Filter */}
              <div className="space-y-2 mb-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search store name or area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                  {['ALL', 'Kirana', 'Supermarket', 'Wholesale'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition whitespace-nowrap ${
                        filterType === type
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Retailer Cards List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredRetailers.map((ret) => (
                  <div
                    key={ret.id}
                    onClick={() => setSelectedRetailer(ret)}
                    className={`p-3 rounded-md border text-xs cursor-pointer transition ${
                      selectedRetailer?.id === ret.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">
                        {ret.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {ret.store_type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                      {ret.address || ret.city}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Retailer Forecast Details */}
          {selectedRetailer ? (
            <div className="lg:col-span-2 space-y-5">
              {/* Retailer Profile Card */}
              <div className="rounded-lg p-5 border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {selectedRetailer.store_type}
                      </span>
                      <span className="flex items-center text-xs font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" /> {selectedRetailer.rating || 4.8}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold mt-1 text-slate-900 dark:text-white">
                      {selectedRetailer.name}
                    </h2>
                    <p className="text-xs mt-0.5 flex items-center text-slate-500">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {selectedRetailer.address}, {selectedRetailer.city} ({selectedRetailer.pincode})
                    </p>
                  </div>

                  <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-right">
                    <span className="text-[11px] text-slate-500 block">{t('monthlyBudget')}</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      ₹{(selectedRetailer.monthly_budget || 75000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Demand Trend Chart */}
              <div className="rounded-lg p-5 border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-white">
                      {t('forecastedDemandTrend')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('forecastDesc')}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    R²: 0.92
                  </span>
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockDemandTrend}>
                      <defs>
                        <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#166534" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#166534" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#F1F5F9' : '#1E293B'} />
                      <XAxis dataKey="period" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip contentStyle={{ 
                        backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', 
                        borderColor: '#CBD5E1', 
                        borderRadius: '6px' 
                      }} />
                      <Area type="monotone" dataKey="demand" stroke="#166534" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Forecast Outputs from Backend */}
              <div className="rounded-lg p-5 border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                  <BarChart2 className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 mr-1.5" />
                  {t('liveForecastOutputs')} ({retailerForecasts.length})
                </h3>
                {retailerForecasts.length > 0 ? (
                  <div className="space-y-2">
                    {retailerForecasts.map((fc) => (
                      <div key={fc.id} className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{fc.product_name}</h4>
                          <span className="text-[11px] text-slate-500">Model: {fc.model_used}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white">{fc.predicted_demand} units</span>
                          <span className="block text-[10px] text-slate-500">Confidence: {fc.confidence_score * 100}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No specific forecasts found. Click "{t('runForecasts')}" to evaluate demand patterns.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
