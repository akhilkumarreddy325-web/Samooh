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
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      (o.order_no && o.order_no.toLowerCase().includes(term)) ||
      (o.id && o.id.toLowerCase().includes(term)) ||
      (o.product_name && o.product_name.toLowerCase().includes(term)) ||
      (o.category && o.category.toLowerCase().includes(term)) ||
      (o.delivery_cluster && o.delivery_cluster.toLowerCase().includes(term)) ||
      (o.status && o.status.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
              theme === 'light' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              Procurement Fulfillment
            </span>
            <span className="text-xs text-slate-400">
              {orders.length} Orders Total
            </span>
          </div>
          <h1 className={`text-xl font-bold tracking-tight mt-1.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Wholesale Orders Management
          </h1>
          <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Review incoming Kirana group orders, validate inventory availability, lock commercial snapshots, and track dispatch status.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition flex items-center space-x-1.5 shadow-sm ${
            theme === 'light' 
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
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
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-800 dark:border-emerald-800'
                    : theme === 'light'
                      ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
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
            className={`w-full border rounded-md pl-8 pr-3 py-1.5 text-xs transition focus:outline-none ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                : 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-500'
            }`}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className={`rounded-lg border overflow-hidden ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-700'
      }`}>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-500">Loading Orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-500">
            No orders found matching the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-semibold tracking-normal uppercase ${
                  theme === 'light' ? 'border-slate-200 text-slate-500 bg-slate-50/80' : 'border-slate-700 text-slate-400 bg-slate-900/60'
                }`}>
                  <th className="py-3 px-4">Order / Date</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-center">Stores</th>
                  <th className="py-3 px-4 text-right">Pooled Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4 text-center">MOQ</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((ord) => {
                  return (
                    <tr 
                      key={ord.id} 
                      onClick={() => setSelectedOrder(ord)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                          {ord.order_no || ord.id}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(ord.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{ord.product_name}</div>
                        <div className="text-[11px] text-slate-400">{ord.delivery_cluster}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          theme === 'light' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {ord.retailer_count}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {ord.pooled_quantity} {ord.unit}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {ord.total_weight_kg || ord.pooled_quantity} kg
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          ₹{ord.final_unit_price}/{ord.unit}
                        </div>
                        {ord.discount_pct > 0 && (
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            {ord.discount_pct}% off
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-medium">
                        <div className="text-slate-900 dark:text-slate-100 font-semibold">
                          ₹{Number(ord.final_order_value || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          ord.moq_status === 'SATISFIED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40' 
                            : 'bg-amber-50 text-amber-800 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40'
                        }`}>
                          {ord.moq_status === 'SATISFIED' ? 'Satisfied' : 'Deficit'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          ord.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          ord.status === 'ACCEPTED' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                          ord.status === 'PROCESSING' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          ord.status === 'READY_FOR_DISPATCH' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          ord.status === 'DISPATCHED' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                          ord.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold' :
                          'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(ord);
                          }}
                          className={`px-2.5 py-1 rounded border text-xs font-medium transition flex items-center space-x-1 ml-auto ${
                            theme === 'light'
                              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
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
