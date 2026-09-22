import React, { useState, useEffect } from 'react';
import { 
  X, Check, AlertTriangle, Truck, Clock, 
  DollarSign, PackageCheck, ShieldCheck, MapPin, 
  CheckCircle2, ArrowRight, Ban, RefreshCw
} from 'lucide-react';
import { updateSupplierOrderStatus, validateOrderInventory } from '../../services/api';

export default function SupplierOrderDetailModal({ order, supplierId, theme, onClose, onOrderUpdated }) {
  const [loading, setLoading] = useState(false);
  const [invStatus, setInvStatus] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    async function checkInv() {
      if (order?.id && supplierId) {
        const res = await validateOrderInventory(supplierId, order.id);
        setInvStatus(res);
      }
    }
    checkInv();
  }, [order?.id, supplierId]);

  if (!order) return null;

  const handleStatusChange = async (newStatus, reason = null) => {
    setLoading(true);
    try {
      await updateSupplierOrderStatus(supplierId, order.id, newStatus, reason);
      if (onOrderUpdated) onOrderUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const isPending = order.status === 'PENDING';
  const isAccepted = order.status === 'ACCEPTED';
  const isProcessing = order.status === 'PROCESSING';
  const isReady = order.status === 'READY_FOR_DISPATCH';
  const isDispatched = order.status === 'DISPATCHED';
  const isDelivered = order.status === 'DELIVERED';
  const isRejected = order.status === 'REJECTED';

  const isStockInsufficient = invStatus && !invStatus.is_sufficient;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#131A2A] border-slate-800 text-white'
      }`}>
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-amber-500">{order.order_no || order.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                order.status === 'ACCEPTED' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                order.status === 'PROCESSING' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                'bg-rose-500/10 text-rose-600 border-rose-500/20'
              }`}>
                {order.status}
              </span>
            </div>
            <h2 className="text-lg font-black mt-0.5">{order.product_name}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Inventory Validation Check */}
        {isPending && invStatus && (
          <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-3 ${
            isStockInsufficient 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isStockInsufficient ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-black text-sm">
                {isStockInsufficient ? 'INSUFFICIENT INVENTORY' : 'Warehouse Stock Verified'}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {isStockInsufficient 
                  ? `Shortage of ${invStatus.shortage} ${order.unit || 'units'}! (Warehouse Available: ${invStatus.available_quantity}, Requested: ${invStatus.requested_quantity}). Order cannot be accepted until stock is replenished.`
                  : `Warehouse has ${invStatus.available_quantity} ${order.unit || 'units'} in stock to satisfy this ${order.pooled_quantity} ${order.unit || 'units'} order.`
                }
              </div>
            </div>
          </div>
        )}

        {/* Commercial Breakdown Cards */}
        <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
          theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-[#0B1020] border-slate-800'
        }`}>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Commercial & Pricing Terms Breakdown
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="text-[10px] text-slate-400 block">Pooled Demand</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                {order.pooled_quantity} {order.unit}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="text-[10px] text-slate-400 block">Retailers Grouped</span>
              <span className="text-sm font-black text-blue-500">{order.retailer_count} Kiranas</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="text-[10px] text-slate-400 block">Final Unit Price</span>
              <span className="text-sm font-black text-amber-500">₹{order.final_unit_price}/{order.unit}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="text-[10px] text-slate-400 block">Total Order Value</span>
              <span className="text-sm font-black text-emerald-500">₹{Number(order.final_order_value || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Base Wholesale Price:</span>
              <span>₹{order.base_wholesale_price}/{order.unit}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Quantity Tier Applied:</span>
              <span>₹{order.quantity_tier_price}/{order.unit}</span>
            </div>
            {order.discount_pct > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Volume Discount ({order.discount_pct}%):</span>
                <span>-₹{order.additional_discount}/{order.unit} (Saved ₹{order.discount_amount})</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Configured MOQ at Pooling:</span>
              <span>{order.supplier_moq} {order.unit} ({order.moq_status})</span>
            </div>
            {order.moq_at_acceptance && (
              <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400">
                <span>Frozen MOQ Snapshot at Acceptance:</span>
                <span>{order.moq_at_acceptance} {order.unit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Transport Plan Linkage */}
        {order.transport_info && (
          <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
            theme === 'light' ? 'bg-blue-50/50 border-blue-200' : 'bg-blue-500/5 border-blue-500/20'
          }`}>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
              <Truck className="w-4 h-4" />
              <span>Recommended Transport Plan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Vehicle Model</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {order.transport_info.recommended_vehicle}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Load & Capacity</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {order.total_weight_kg || order.transport_info.total_load_kg} kg ({order.transport_info.capacity_utilization_pct || order.transport_info.capacity_utilization}% load)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Delivery Cluster</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {order.delivery_cluster} ({order.delivery_distance_km} km)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Status Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Order Lifecycle Audit Trail
            </span>
            <div className="space-y-2 text-xs">
              {order.timeline.map((evt, idx) => (
                <div key={idx} className="flex items-start space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{evt.status}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(evt.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejection Prompt */}
        {rejecting && (
          <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
            <span className="text-xs font-bold text-rose-500 block">
              Reason for rejecting order:
            </span>
            <input
              type="text"
              placeholder="e.g. Insufficient warehouse stock or outside delivery radius"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs ${
                theme === 'light' ? 'bg-white border-rose-200' : 'bg-slate-900 border-rose-900'
              }`}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejecting(false)}
                className="px-3 py-1.5 rounded-lg border text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('REJECTED', rejectReason || 'Supplier unable to fulfill')}
                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            {isPending && !rejecting && (
              <>
                <button
                  onClick={() => setRejecting(true)}
                  disabled={loading}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold transition flex items-center space-x-1"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleStatusChange('ACCEPTED')}
                  disabled={loading || isStockInsufficient}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5 ${
                    isStockInsufficient 
                      ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                  title={isStockInsufficient ? 'Cannot accept: Insufficient warehouse inventory' : 'Accept order'}
                >
                  <Check className="w-4 h-4" />
                  <span>{loading ? 'Processing...' : 'Accept Order & Lock Terms'}</span>
                </button>
              </>
            )}

            {isAccepted && (
              <button
                onClick={() => handleStatusChange('PROCESSING')}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Mark Processing</span>
              </button>
            )}

            {isProcessing && (
              <button
                onClick={() => handleStatusChange('READY_FOR_DISPATCH')}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Ready for Dispatch</span>
              </button>
            )}

            {isReady && (
              <button
                onClick={() => handleStatusChange('DISPATCHED')}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Mark Dispatched</span>
              </button>
            )}

            {isDispatched && (
              <button
                onClick={() => handleStatusChange('DELIVERED')}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Delivered</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
