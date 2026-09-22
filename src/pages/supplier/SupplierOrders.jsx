import React, { useState, useEffect } from 'react';
import { 
  PackageCheck, Search, Filter, RefreshCw, Eye, 
  Clock, CheckCircle2, Truck, AlertCircle, Ban
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupplierOrders } from '../../services/api';
import SupplierOrderDetailModal from './SupplierOrderDetailModal';

export default function SupplierOrders() {
  const { theme, currentSupplier } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const supId = currentSupplier?.id || 'sup_01';

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getSupplierOrders(supId, statusFilter);
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [supId, statusFilter]);

  const tabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PENDING', label: 'Pending Review' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'READY_FOR_DISPATCH', label: 'Ready' },
    { key: 'DISPATCHED', label: 'Dispatched' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (o.order_no && o.order_no.toLowerCase().includes(term)) ||
                          (o.product_name && o.product_name.toLowerCase().includes(term)) ||
                          (o.delivery_cluster && o.delivery_cluster.toLowerCase().includes(term));
    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Procurement Fulfillment
            </span>
            <span className="text-xs text-slate-400">
              {orders.length} Total Orders Assigned
            </span>
          </div>
          <h1 className={`text-2xl font-black tracking-tight mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Wholesale Orders Management
          </h1>
          <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Review incoming Kirana group orders, validate inventory availability, lock commercial snapshots, and track dispatch status.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
            theme === 'light' 
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
              : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm'
                    : theme === 'light'
                      ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-[#131A2A] border border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Product, Cluster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs transition focus:outline-none ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-800 focus:border-amber-500'
                : 'bg-[#131A2A] border-slate-800 text-slate-200 focus:border-amber-500'
            }`}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className={`rounded-3xl border overflow-hidden ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131A2A] border-slate-800'
      }`}>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400">Loading Orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No orders found matching the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[10px] uppercase font-bold tracking-wider ${
                  theme === 'light' ? 'border-slate-200 text-slate-400 bg-slate-50/50' : 'border-slate-800 text-slate-500 bg-slate-900/50'
                }`}>
                  <th className="py-3.5 px-4">Order / Placed</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4 text-center">Stores Pooled</th>
                  <th className="py-3.5 px-4 text-right">Pooled Demand</th>
                  <th className="py-3.5 px-4 text-right">Unit Price</th>
                  <th className="py-3.5 px-4 text-right">Total Order Value</th>
                  <th className="py-3.5 px-4 text-center">MOQ Check</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredOrders.map((ord) => {
                  return (
                    <tr 
                      key={ord.id} 
                      onClick={() => setSelectedOrder(ord)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {ord.order_no || ord.id}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(ord.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{ord.product_name}</div>
                        <div className="text-[10px] text-slate-400">{ord.delivery_cluster}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {ord.retailer_count} Stores
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {ord.pooled_quantity} {ord.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ord.total_weight_kg || ord.pooled_quantity} kg load
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          ₹{ord.final_unit_price}/{ord.unit}
                        </div>
                        {ord.discount_pct > 0 && (
                          <div className="text-[10px] text-emerald-500">
                            {ord.discount_pct}% off
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{Number(ord.final_order_value || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.moq_status === 'SATISFIED' 
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        }`}>
                          {ord.moq_status === 'SATISFIED' ? '✓ Satisfied' : '⚠ Deficit'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          ord.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          ord.status === 'ACCEPTED' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          ord.status === 'PROCESSING' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                          ord.status === 'READY_FOR_DISPATCH' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                          ord.status === 'DISPATCHED' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          ord.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                          {ord.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(ord);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold transition flex items-center space-x-1 ml-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <SupplierOrderDetailModal
          order={selectedOrder}
          supplierId={supId}
          theme={theme}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={loadOrders}
        />
      )}
    </div>
  );
}
