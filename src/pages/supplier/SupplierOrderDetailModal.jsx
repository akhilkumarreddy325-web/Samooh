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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50">
      <div className={`w-full max-w-2xl rounded-lg border p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto ${
        theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#1E293B] border-slate-700 text-white'
      }`}>
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">{order.order_no || order.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                order.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                order.status === 'ACCEPTED' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                'bg-red-50 text-red-800 border-red-200'
              }`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-base font-bold mt-1 text-slate-900 dark:text-white">{order.product_name}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Inventory Validation Check */}
        {isPending && invStatus && (
          <div className={`p-3 rounded-md border text-xs flex items-center space-x-2.5 ${
            isStockInsufficient 
              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800/40 dark:text-red-300' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-300'
          }`}>
            {isStockInsufficient ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            )}
            <div className="flex-1">
              <div className="font-semibold text-xs">
                {isStockInsufficient ? 'Insufficient Warehouse Stock' : 'Warehouse Stock Verified'}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {isStockInsufficient 
                  ? `Shortage of ${invStatus.shortage} ${order.unit || 'units'} (Available: ${invStatus.available_quantity}, Requested: ${invStatus.requested_quantity}).`
                  : `Warehouse has ${invStatus.available_quantity} ${order.unit || 'units'} available for this ${order.pooled_quantity} ${order.unit || 'units'} order.`
                }
              </div>
            </div>
          </div>
        )}

        {/* Commercial Breakdown Cards */}
        <div className={`p-3.5 rounded-md border space-y-2.5 text-xs ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-700'
        }`}>
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Commercial & Pricing Breakdown
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 block">Pooled Demand</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {order.pooled_quantity} {order.unit}
              </span>
            </div>
            <div className="p-2 rounded border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 block">Retailers</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{order.retailer_count} Stores</span>
            </div>
            <div className="p-2 rounded border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 block">Unit Price</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">₹{order.final_unit_price}/{order.unit}</span>
            </div>
            <div className="p-2 rounded border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 block">Total Value</span>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">₹{Number(order.final_order_value || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Base Wholesale Price:</span>
              <span>₹{order.base_wholesale_price}/{order.unit}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Quantity Tier Applied:</span>
              <span>₹{order.quantity_tier_price}/{order.unit}</span>
            </div>
            {order.discount_pct > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                <span>Volume Discount ({order.discount_pct}%):</span>
                <span>-₹{order.additional_discount}/{order.unit} (Saved ₹{order.discount_amount})</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Configured MOQ at Pooling:</span>
              <span>{order.supplier_moq} {order.unit} ({order.moq_status})</span>
            </div>
            {order.moq_at_acceptance && (
              <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                <span>Frozen MOQ Snapshot at Acceptance:</span>
                <span>{order.moq_at_acceptance} {order.unit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Transport Plan Linkage */}
        {order.transport_info && (
          <div className={`p-3 rounded-md border space-y-1.5 text-xs ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700'
          }`}>
            <div className="flex items-center space-x-1.5 font-semibold text-xs text-slate-700 dark:text-slate-300">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>Transport Plan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Vehicle Model</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {order.transport_info.recommended_vehicle}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Total Load</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {order.total_weight_kg || order.transport_info.total_load_kg} kg ({order.transport_info.capacity_utilization_pct || order.transport_info.capacity_utilization}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Delivery Cluster</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {order.delivery_cluster} ({order.delivery_distance_km} km)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Prompt */}
        {rejecting && (
          <div className="p-3 rounded-md border border-red-200 bg-red-50/50 space-y-2">
            <span className="text-xs font-semibold text-red-800 block">
              Reason for rejecting order:
            </span>
            <input
              type="text"
              placeholder="e.g. Insufficient warehouse stock or outside delivery radius"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejecting(false)}
                className="px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('REJECTED', rejectReason || 'Supplier unable to fulfill')}
                className="px-2.5 py-1 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-medium"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
              theme === 'light' ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 text-slate-300'
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
                  className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition flex items-center space-x-1"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleStatusChange('ACCEPTED')}
                  disabled={loading || isStockInsufficient}
                  className={`px-4 py-1.5 rounded-md text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5 ${
                    isStockInsufficient 
                      ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                      : 'bg-emerald-800 hover:bg-emerald-900'
                  }`}
                  title={isStockInsufficient ? 'Cannot accept: Insufficient warehouse inventory' : 'Accept order'}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{loading ? 'Processing...' : 'Accept Order'}</span>
                </button>
              </>
            )}

            {isAccepted && (
              <button
                onClick={() => handleStatusChange('PROCESSING')}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Mark Processing</span>
              </button>
            )}

            {isProcessing && (
              <button
                onClick={() => handleStatusChange('READY_FOR_DISPATCH')}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Ready for Dispatch</span>
              </button>
            )}

            {isReady && (
              <button
                onClick={() => handleStatusChange('DISPATCHED')}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Mark Dispatched</span>
              </button>
            )}

            {isDispatched && (
              <button
                onClick={() => handleStatusChange('DELIVERED')}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Delivered</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
