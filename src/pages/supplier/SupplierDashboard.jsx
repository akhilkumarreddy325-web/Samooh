import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PackageCheck, Clock, CheckCircle2, DollarSign, 
  AlertTriangle, Truck, Tag, TrendingUp, ArrowRight,
  RefreshCw, Check, X, ShieldAlert, Eye, Store
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupplierDashboard, updateSupplierOrderStatus } from '../../services/api';

export default function SupplierDashboard() {
  const { theme, t, currentSupplier } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  const supId = currentSupplier?.id || 'sup_01';

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await getSupplierDashboard(supId);
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [supId]);

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      await updateSupplierOrderStatus(supId, orderId, newStatus);
      setNotification(`Order ${orderId} marked as ${newStatus}!`);
      setTimeout(() => setNotification(null), 3000);
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Failed to update order");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400">Loading Supplier Dashboard...</span>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Orders', value: data?.total_orders || 0, icon: PackageCheck, color: 'blue', sub: 'Assigned procurement pools' },
    { label: 'Pending Review', value: data?.pending_orders || 0, icon: Clock, color: 'amber', sub: 'Requires supplier action' },
    { label: 'Accepted Orders', value: data?.accepted_orders || 0, icon: CheckCircle2, color: 'emerald', sub: 'Committed to fulfill' },
    { label: 'Completed Orders', value: data?.completed_orders || 0, icon: Truck, color: 'indigo', sub: 'Delivered to cluster hubs' },
    { label: 'Gross Sales Value', value: `₹${(data?.total_sales_value || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'emerald', sub: 'Total order volume' },
    { label: 'Quantity Supplied', value: `${(data?.total_quantity_supplied || 0).toLocaleString('en-IN')} units`, icon: TrendingUp, color: 'purple', sub: 'Fulfilled physical volume' },
    { label: 'Active Catalog', value: `${data?.active_products || 0} / ${data?.total_products || 0}`, icon: Tag, color: 'blue', sub: 'Products open for pooling' },
    { label: 'Stock Alerts', value: data?.inventory_alerts_count || 0, icon: AlertTriangle, color: data?.inventory_alerts_count > 0 ? 'rose' : 'slate', sub: 'Shortages or low stock' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Wholesale Supply Grid
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {currentSupplier?.address || 'Hyderabad Logistics Hub'}
            </span>
          </div>
          <h1 className={`text-2xl font-black tracking-tight mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {currentSupplier?.name || 'Deccan Wholesale Grains & Pulses'}
          </h1>
          <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Manage wholesale catalog, configure volume pricing tiers, validate MOQ thresholds, and fulfill pooled Kirana orders.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadDashboard}
            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
              theme === 'light' 
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => navigate('/supplier/pricing')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
          >
            <Tag className="w-4 h-4" />
            <span>Configure Pricing & MOQ</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Inventory Stock Alerts Banner */}
      {data?.inventory_alerts && data.inventory_alerts.length > 0 && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
          <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Critical Inventory & Stock Shortage Alerts ({data.inventory_alerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {data.inventory_alerts.map((alert, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  theme === 'light' ? 'bg-white/80 border-rose-200' : 'bg-[#131A2A] border-rose-900/40'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{alert.product_name}</div>
                  <div className="text-[11px] text-rose-500 font-medium mt-0.5">{alert.message}</div>
                </div>
                <button
                  onClick={() => navigate('/supplier/products')}
                  className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold transition"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                theme === 'light'
                  ? 'bg-white/90 border-slate-200 shadow-sm'
                  : 'bg-[#131A2A]/90 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {kpi.label}
                </span>
                <div className={`p-2 rounded-xl ${
                  kpi.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                  kpi.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                  kpi.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                  kpi.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-500' :
                  kpi.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                  kpi.color === 'rose' ? 'bg-rose-500/10 text-rose-500' :
                  'bg-slate-500/10 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-xl sm:text-2xl font-black mt-2 tracking-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {kpi.value}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {kpi.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className={`p-5 rounded-2xl border ${
        theme === 'light' ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-[#131A2A]/90 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-base font-bold flex items-center space-x-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              <PackageCheck className="w-5 h-5 text-amber-500" />
              <span>Incoming Procurement Pool Orders</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review pooled demand formed by Samooh Kirana cluster networks
            </p>
          </div>

          <button
            onClick={() => navigate('/supplier/orders')}
            className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(!data?.recent_orders || data.recent_orders.length === 0) ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No active procurement orders currently assigned to your account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[10px] uppercase font-bold tracking-wider ${
                  theme === 'light' ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-500'
                }`}>
                  <th className="pb-3 px-3">Order / Date</th>
                  <th className="pb-3 px-3">Product</th>
                  <th className="pb-3 px-3 text-center">Stores Pooled</th>
                  <th className="pb-3 px-3 text-right">Pooled Demand</th>
                  <th className="pb-3 px-3 text-right">Wholesale Value</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {data.recent_orders.map((ord) => {
                  const isPending = ord.status === 'PENDING';
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{ord.order_no || ord.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(ord.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{ord.product_name}</div>
                        <div className="text-[10px] text-slate-400">{ord.delivery_cluster}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {ord.retailer_count} Kiranas
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {ord.pooled_quantity} {ord.unit || 'units'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          MOQ: {ord.supplier_moq} {ord.unit || 'units'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(ord.final_order_value || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          @ ₹{ord.final_unit_price}/{ord.unit}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          ord.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          ord.status === 'ACCEPTED' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          ord.status === 'PROCESSING' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                          ord.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isPending && (
                            <>
                              <button
                                disabled={actionLoading === ord.id}
                                onClick={() => handleQuickStatusUpdate(ord.id, 'ACCEPTED')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition shadow-sm flex items-center space-x-1"
                                title="Accept Order & Decrement Stock"
                              >
                                <Check className="w-3 h-3" />
                                <span>Accept</span>
                              </button>
                              <button
                                disabled={actionLoading === ord.id}
                                onClick={() => handleQuickStatusUpdate(ord.id, 'REJECTED')}
                                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-[11px] font-bold transition"
                                title="Reject Order"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate('/supplier/orders')}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
