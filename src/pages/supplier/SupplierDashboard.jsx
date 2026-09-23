import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PackageCheck, 
  Clock, 
  CheckCircle2, 
  Truck, 
  IndianRupee, 
  TrendingUp, 
  Tag, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Check,
  X,
  ShieldAlert,
  ArrowRight,
  Eye,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupplierDashboard, updateSupplierOrderStatus } from '../../services/api';
import { formatINR } from '../../utils/currency';

export default function SupplierDashboard() {
  const { theme, currentSupplier } = useApp();
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
      setNotification(`Order ${orderId} marked as ${newStatus}`);
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
          <div className="w-7 h-7 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-500">Loading supplier dashboard...</span>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Orders', value: data?.total_orders || 0, icon: PackageCheck, sub: 'Assigned procurement pools' },
    { label: 'Pending Review', value: data?.pending_orders || 0, icon: Clock, sub: 'Requires supplier confirmation' },
    { label: 'Accepted Orders', value: data?.accepted_orders || 0, icon: CheckCircle2, sub: 'Committed to fulfill' },
    { label: 'Completed Orders', value: data?.completed_orders || 0, icon: Truck, sub: 'Delivered to hubs' },
    { label: 'Gross Sales Value', value: formatINR(data?.total_sales_value || 0), icon: IndianRupee, sub: 'Total order volume' },
    { label: 'Quantity Supplied', value: `${(data?.total_quantity_supplied || 0).toLocaleString('en-IN')} units`, icon: TrendingUp, sub: 'Fulfilled physical volume' },
    { label: 'Active Catalog', value: `${data?.active_products || 0} / ${data?.total_products || 0}`, icon: Tag, sub: 'Products open for pooling' },
    { label: 'Stock Alerts', value: data?.inventory_alerts_count || 0, icon: AlertTriangle, alert: data?.inventory_alerts_count > 0, sub: 'Shortages or low stock' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Wholesale Portal
            </span>
            <span className="text-xs text-slate-500 font-normal">
              {currentSupplier?.address || currentSupplier?.location || 'Wholesale Logistics Hub'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {currentSupplier?.name || 'Wholesale Supplier Hub'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage wholesale catalog, volume pricing tiers, MOQ thresholds, and pooled Kirana cluster orders.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/supplier/nearby-retailers')}
            className="px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
            title="View Nearby Retailers Map"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Nearby Retailers</span>
          </button>

          <button
            onClick={loadDashboard}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center space-x-1.5 shadow-sm"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => navigate('/supplier/pricing')}
            className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Pricing & MOQ Tiers</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
          <span>{notification}</span>
        </div>
      )}

      {/* Inventory Stock Alerts Banner */}
      {data?.inventory_alerts && data.inventory_alerts.length > 0 && (
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/50 space-y-2.5">
          <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-300 font-semibold text-xs tracking-tight">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Inventory & Stock Shortage Alerts ({data.inventory_alerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {data.inventory_alerts.map((alert, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-md border border-amber-200/80 bg-white dark:bg-slate-800 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{alert.product_name}</div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">{alert.message}</div>
                </div>
                <button
                  onClick={() => navigate('/supplier/products')}
                  className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 text-[11px] font-medium transition ml-2"
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
              className="p-4 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-md ${
                  kpi.alert 
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold mt-2 tracking-tight text-slate-900 dark:text-white">
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {kpi.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Nearby Retailers Interactive Map Quick Access Banner */}
      <div className="p-4 sm:p-5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-lg bg-blue-700 text-white flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Nearby Retailers Map
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                MapLibre + OpenStreetMap + ORS
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Explore local Kirana stores with verified GPS locations within your delivery radius ({currentSupplier?.serviceRadiusKm || 50} km), and calculate live road driving routes with turn metrics.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/supplier/nearby-retailers')}
          className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition shadow-sm flex items-center space-x-1.5 flex-shrink-0"
        >
          <span>Open Nearby Retailers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>Incoming Procurement Orders</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review and fulfill pooled demand submitted by regional Kirana clusters
            </p>
          </div>

          <button
            onClick={() => navigate('/supplier/orders')}
            className="text-xs font-medium text-emerald-800 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(!data?.recent_orders || data.recent_orders.length === 0) ? (
          <div className="text-center py-10 text-xs text-slate-500">
            No active procurement orders currently assigned to your account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Order / Date</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4 text-center">Stores Pooled</th>
                  <th className="py-2.5 px-4 text-right">Pooled Demand</th>
                  <th className="py-2.5 px-4 text-right">Wholesale Value</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {data.recent_orders.map((ord) => {
                  const isPending = ord.status === 'PENDING';
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{ord.order_no || ord.id}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(ord.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{ord.product_name}</div>
                        <div className="text-[11px] text-slate-400">{ord.delivery_cluster}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {ord.retailer_count} Kiranas
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {ord.pooled_quantity} {ord.unit || 'units'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          MOQ: {ord.supplier_moq} {ord.unit || 'units'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatINR(ord.final_order_value || 0)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          @ {formatINR(ord.final_unit_price)}/{ord.unit}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          ord.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' :
                          ord.status === 'ACCEPTED' ? 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600' :
                          ord.status === 'PROCESSING' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
                          ord.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700' :
                          'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isPending && (
                            <>
                              <button
                                disabled={actionLoading === ord.id}
                                onClick={() => handleQuickStatusUpdate(ord.id, 'ACCEPTED')}
                                className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-medium transition shadow-sm flex items-center space-x-1"
                                title="Accept Order & Commit Stock"
                              >
                                <Check className="w-3 h-3" />
                                <span>Accept</span>
                              </button>
                              <button
                                disabled={actionLoading === ord.id}
                                onClick={() => handleQuickStatusUpdate(ord.id, 'REJECTED')}
                                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-700 dark:text-rose-400 text-[11px] font-medium transition"
                                title="Reject Order"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate('/supplier/orders')}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
