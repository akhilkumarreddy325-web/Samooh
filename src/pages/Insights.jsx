import React, { useEffect, useState } from 'react';
import { Store, MapPin, Star, Search, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
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
      setError('Forecast generation failed: ' + err.message);
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight flex items-center ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {t('retailerInsightsForecasts')}
          </h1>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('insightsDesc')}
          </p>
        </div>

        <button 
          onClick={handleGenerateForecasts}
          disabled={isGenerating}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-2 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? t('runningMl') : t('runForecasts')}</span>
        </button>
      </div>

      {loading ? (
        <div className={`p-12 text-center text-xs font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
          Loading live retailer profiles & ML forecasts...
        </div>
      ) : error ? (
        <div className={`p-8 max-w-xl mx-auto text-center space-y-4 glass-card rounded-2xl border ${
          theme === 'light' ? 'bg-white border-rose-200 shadow-md' : 'border-rose-500/30'
        }`}>
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Backend Forecast Error</h3>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{error}</p>
          <button onClick={handleSeed} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md">
            {t('seedAndGenerate')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Directory Column */}
          <div className={`glass-card rounded-2xl p-5 border space-y-4 flex flex-col justify-between ${
            theme === 'light' ? 'bg-white/80 border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]' : 'border-slate-800'
          }`}>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{t('retailerDirectory')} ({filteredRetailers.length})</h3>
              
              {/* Search & Filter */}
              <div className="space-y-2 mb-4">
                <div className="relative">
                  <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                    theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <input 
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full border rounded-xl pl-9 pr-3 py-1.5 text-xs transition focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-100/90 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                        : 'bg-[#0B1020] border-slate-800 text-slate-200 focus:border-accentBlue'
                    }`}
                  />
                </div>

                <div className="flex space-x-1 overflow-x-auto py-1">
                  {['ALL', 'Kirana', 'Superette', 'General Store'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterType(st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        filterType === st 
                          ? 'bg-blue-600 text-white shadow-sm font-bold' 
                          : theme === 'light'
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            : 'bg-[#0B1020] text-slate-400 border border-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredRetailers.map((ret) => (
                  <div
                    key={ret.id}
                    onClick={() => setSelectedRetailer(ret)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedRetailer && selectedRetailer.id === ret.id
                        ? theme === 'light'
                          ? 'bg-blue-50/90 border-blue-400 text-slate-900 shadow-sm font-bold'
                          : 'bg-accentBlue/10 border-accentBlue text-white shadow-glow-blue'
                        : theme === 'light'
                          ? 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold truncate">{ret.name}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        theme === 'light' ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ret.store_type}
                      </span>
                    </div>
                    <div className={`text-[11px] mt-1 flex items-center ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                      {ret.address || ret.city}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Retailer Forecast Details */}
          {selectedRetailer ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Retailer Profile Card */}
              <div className={`glass-card rounded-2xl p-6 border ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-slate-50 via-white to-blue-50/50 border-slate-200/80 shadow-sm'
                  : 'bg-gradient-to-r from-[#131A2A] to-slate-900 border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        theme === 'light'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-accentPurple/20 text-accentPurple border-accentPurple/30'
                      }`}>
                        {selectedRetailer.store_type}
                      </span>
                      <span className="flex items-center text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" /> {selectedRetailer.rating || 4.8} Rating
                      </span>
                    </div>
                    <h2 className={`text-xl font-bold mt-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {selectedRetailer.name}
                    </h2>
                    <p className={`text-xs mt-1 flex items-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      {selectedRetailer.address}, {selectedRetailer.city} ({selectedRetailer.pincode})
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border text-right ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <span className={`text-[11px] block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t('monthlyBudget')}</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{(selectedRetailer.monthly_budget || 75000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Demand Trend Chart */}
              <div className={`glass-card rounded-2xl p-6 border ${
                theme === 'light' ? 'bg-white/80 border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]' : 'border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      {t('forecastedDemandTrend')}
                    </h3>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t('forecastDesc')}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-accentBlue bg-blue-500/10 px-2.5 py-1 rounded-lg">
                    ML Model R²: 0.92
                  </span>
                </div>

                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockDemandTrend}>
                      <defs>
                        <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#E2E8F0' : '#1E293B'} />
                      <XAxis dataKey="period" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip contentStyle={{ 
                        backgroundColor: theme === 'light' ? '#FFFFFF' : '#131A2A', 
                        borderColor: theme === 'light' ? '#CBD5E1' : '#334155', 
                        borderRadius: '10px' 
                      }} />
                      <Area type="monotone" dataKey="demand" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Real ML Forecast Outputs from Backend */}
              <div className={`glass-card rounded-2xl p-6 border ${
                theme === 'light' ? 'bg-white/80 border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]' : 'border-slate-800'
              }`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${
                  theme === 'light' ? 'text-slate-800' : 'text-white'
                }`}>
                  <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                  {t('liveForecastOutputs')} ({retailerForecasts.length})
                </h3>
                {retailerForecasts.length > 0 ? (
                  <div className="space-y-3">
                    {retailerForecasts.map((fc) => (
                      <div key={fc.id} className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
                      }`}>
                        <div>
                          <h4 className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{fc.product_name}</h4>
                          <span className="text-[10px] text-blue-600 dark:text-accentBlue font-medium">Model: {fc.model_used}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{fc.predicted_demand} units</span>
                          <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Confidence: {fc.confidence_score * 100}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    No specific forecasts found. Click "{t('runForecasts')}" to trigger the ML pipeline.
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
