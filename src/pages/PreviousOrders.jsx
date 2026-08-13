import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageCheck, Calendar, MapPin, Building, ArrowRight, ShieldCheck, Tag, Search, Filter, CheckCircle2, Truck, Clock, Sparkles, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PreviousOrders() {
  const { theme, t, user, orderHistory, setActiveInvoice } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders for active user persona
  const userOrders = orderHistory.filter(ord => 
    ord.userId === user?.id || ord.storeName === user?.storeName
  );

  const filteredOrders = userOrders.filter(ord => {
    const matchesStatus = statusFilter === 'All' || ord.status === statusFilter;
    const matchesSearch = ord.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ord.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate user aggregate metrics
  const totalOrdersCount = userOrders.length;
  const totalUserSavings = userOrders.reduce((sum, o) => sum + (o.totalSavings || 0), 0);
  const totalItemsProcured = userOrders.reduce((sum, o) => sum + (o.itemsCount || 0), 0);

  const handleViewInvoice = (order) => {
    setActiveInvoice(order);
    navigate('/invoice');
  };

  const handleExportAllCSV = () => {
    const headers = ["Order ID", "Invoice No", "Date", "Store Name", "Cluster Hub", "Status", "Items Count", "Total Retail Cost", "Total Wholesale Cost", "Total Savings (INR)", "Savings Pct", "Final Payable"];
    const rows = userOrders.map(o => [
      `"${o.id}"`,
      `"${o.invoiceNo}"`,
      `"${o.date}"`,
      `"${o.storeName}"`,
      `"${o.clusterHub}"`,
      `"${o.status}"`,
      o.itemsCount,
      o.totalRetailCost,
      o.totalWholesaleCost,
      o.totalSavings,
      `"${o.overallSavingsPct}%"`,
      o.finalPayable
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Samooh_Order_History_${user?.storeName || 'Store'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            <PackageCheck className="w-6 h-6 text-purple-600 dark:text-accentPurple mr-2.5 flex-shrink-0" />
            {t('previousOrders')}
            <span className="ml-3 text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-accentPurple border border-purple-500/20">
              {totalOrdersCount} Orders Found
            </span>
          </h1>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('ordersDesc')}
          </p>
        </div>

        <button
          onClick={handleExportAllCSV}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-2 shadow-sm w-fit active:scale-95 ${
            theme === 'light'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          }`}
          title="Export All Past Orders to CSV File for Bookkeeping"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <span>Export Order History CSV</span>
        </button>
      </div>

      {/* Overview Stat Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-[#131A2A] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('totalOrders')}
            </span>
            <PackageCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
            {totalOrdersCount}
          </p>
          <span className="text-[10px] text-blue-600 dark:text-accentBlue font-bold block mt-0.5">
            Active Store Account
          </span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'light'
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-emerald-950/20 border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {t('lifetimeSavings')}
            </span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
            ₹{totalUserSavings.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold block mt-0.5">
            Unlocked via Samooh Wholesale Arbitrage
          </span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-[#131A2A] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Total Items Procured
            </span>
            <Tag className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-purple-600 dark:text-accentPurple">
            {totalItemsProcured} Units
          </p>
          <span className={`text-[10px] block mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Consolidated Cluster Orders
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Badges */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Delivered', 'In Transit', 'Processing'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : theme === 'light'
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-[#131A2A] border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-1.5 text-xs transition focus:outline-none ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
                : 'bg-[#131A2A] border-slate-800 text-slate-200 focus:border-accentBlue'
            }`}
          />
        </div>
      </div>

      {/* Orders List / Cards Grid */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isDelivered = order.status === 'Delivered';
            const isInTransit = order.status === 'In Transit';

            return (
              <div
                key={order.id}
                className={`glass-card rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg ${
                  theme === 'light'
                    ? 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
                    : 'bg-[#131A2A] border-slate-800 text-white'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  {/* Order ID & Date */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-black text-blue-600 dark:text-accentBlue">
                        {order.invoiceNo}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
                        isDelivered
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : isInTransit
                            ? 'bg-blue-500/10 text-blue-600 dark:text-accentBlue border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}>
                        {isDelivered ? <CheckCircle2 className="w-3 h-3" /> : isInTransit ? <Truck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{order.status}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-purple-500" />
                        {order.date}
                      </span>
                      <span className="flex items-center">
                        <Building className="w-3.5 h-3.5 mr-1 text-blue-500" />
                        {order.clusterHub}
                      </span>
                    </div>
                  </div>

                  {/* Financial & Items Summary */}
                  <div className="flex items-center space-x-6 text-xs">
                    <div>
                      <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Total Items</span>
                      <span className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{order.itemsCount} Units</span>
                    </div>

                    <div>
                      <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Single Retail Cost</span>
                      <span className="line-through text-slate-400">₹{(order.totalRetailCost || 0).toLocaleString()}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Samooh Group Price</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">₹{(order.totalWholesaleCost || 0).toLocaleString()}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Saved</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">₹{(order.totalSavings || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Items Preview Chips & View Invoice Action */}
                <div className="mt-4 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 overflow-x-auto py-1">
                    {order.items && order.items.slice(0, 3).map((it, idx) => (
                      <span
                        key={idx}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border whitespace-nowrap ${
                          theme === 'light'
                            ? 'bg-slate-100 border-slate-200 text-slate-700'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {it.name} ({it.qty}x)
                      </span>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        theme === 'light' ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                      }`}>
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleViewInvoice(order)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 active:scale-95"
                  >
                    <span>{t('viewInvoice')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className={`p-12 text-center rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#131A2A] border-slate-800'
          }`}>
            <PackageCheck className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
              {t('noPastOrders')}
            </h3>
            <p className={`text-xs mt-1 max-w-md mx-auto ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Build custom demand in the Demand Builder or accept active wholesale opportunities to start saving.
            </p>
            <button
              onClick={() => navigate('/builder')}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition"
            >
              Go to Custom Demand Builder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
