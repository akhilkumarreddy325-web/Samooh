import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, 
  Search, RefreshCw, X, ShieldAlert, Sparkles, Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupplierProducts, addSupplierProduct, updateSupplierProduct } from '../../services/api';

export default function SupplierProducts() {
  const { theme, currentSupplier } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const supId = currentSupplier?.id || 'sup_01';

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getSupplierProducts(supId);
      setProducts(data);
    } catch (err) {
      console.error("Error loading supplier products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [supId]);

  const handleToggleAvailability = async (prod) => {
    const updatedStatus = !prod.is_available;
    try {
      await updateSupplierProduct(supId, prod.id, { is_available: updatedStatus });
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, is_available: updatedStatus } : p));
      setNotification(`${prod.name} marked as ${updatedStatus ? 'Available' : 'Unavailable'}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      alert("Failed to toggle availability: " + err.message);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      category: formData.get('category'),
      unit_of_measure: formData.get('unit_of_measure'),
      unit_weight_kg: parseFloat(formData.get('unit_weight_kg') || 1),
      retail_price: parseFloat(formData.get('retail_price') || 0),
      wholesale_price: parseFloat(formData.get('wholesale_price') || 0),
      min_wholesale_quantity: parseFloat(formData.get('min_wholesale_quantity') || 10),
      available_quantity: parseFloat(formData.get('available_quantity') || 0),
      max_order_quantity: formData.get('max_order_quantity') ? parseFloat(formData.get('max_order_quantity')) : null,
      service_radius_km: parseFloat(formData.get('service_radius_km') || 50),
      lead_time_days: parseInt(formData.get('lead_time_days') || 2),
      discount_pct: parseFloat(formData.get('discount_pct') || 0),
      is_available: formData.get('is_available') === 'on'
    };

    try {
      if (editingProduct) {
        await updateSupplierProduct(supId, editingProduct.id, payload);
        setNotification(`Product "${payload.name}" updated successfully!`);
        setEditingProduct(null);
      } else {
        await addSupplierProduct(supId, payload);
        setNotification(`Product "${payload.name}" added to wholesale catalog!`);
        setIsAddModalOpen(false);
      }
      setTimeout(() => setNotification(null), 3000);
      await loadProducts();
    } catch (err) {
      alert("Failed to save product: " + err.message);
    }
  };

  const categories = ['ALL', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Wholesale Catalog
            </span>
            <span className="text-xs text-slate-400">
              {products.length} Products Configured
            </span>
          </div>
          <h1 className={`text-2xl font-black tracking-tight mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Product & Inventory Management
          </h1>
          <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Define commercial terms, configure minimum wholesale order thresholds (MOQ), and monitor warehouse stock levels.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadProducts}
            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
              theme === 'light' 
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs transition focus:outline-none ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-800 focus:border-amber-500'
                : 'bg-[#131A2A] border-slate-800 text-slate-200 focus:border-amber-500'
            }`}
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-sm'
                  : theme === 'light'
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-[#131A2A] text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border text-slate-400 text-xs ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#131A2A] border-slate-800'
        }`}>
          No products found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prod) => {
            const avail = prod.available_quantity || 0;
            const moq = prod.min_wholesale_quantity || 0;
            const isLowStock = avail < (moq * 1.5);
            const isCritical = avail < moq;

            return (
              <div
                key={prod.id}
                className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between ${
                  !prod.is_available
                    ? 'opacity-60 bg-slate-100/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-800'
                    : theme === 'light'
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-[#131A2A] border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {prod.category}
                    </span>
                    <button
                      onClick={() => handleToggleAvailability(prod)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                        prod.is_available
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20'
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-emerald-500/10 hover:text-emerald-600'
                      }`}
                      title="Click to toggle availability"
                    >
                      {prod.is_available ? '● Active' : '○ Disabled'}
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className={`text-sm font-black tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {prod.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Unit: {prod.unit_of_measure} ({prod.unit_weight_kg || 1} kg/unit) • Radius {prod.service_radius_km || 50} km
                    </div>
                  </div>

                  {/* Pricing Comparison */}
                  <div className={`p-3 rounded-xl border text-xs grid grid-cols-2 gap-2 ${
                    theme === 'light' ? 'bg-slate-50/80 border-slate-100' : 'bg-slate-900/40 border-slate-800'
                  }`}>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Wholesale Price</div>
                      <div className="text-sm font-black text-amber-500">₹{prod.wholesale_price}/{prod.unit_of_measure}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Configured MOQ</div>
                      <div className="text-sm font-black text-slate-700 dark:text-slate-300">{moq} {prod.unit_of_measure}</div>
                    </div>
                  </div>

                  {/* Warehouse Inventory Stock Level Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">Warehouse Inventory:</span>
                      <span className={`font-black ${
                        isCritical ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {avail} {prod.unit_of_measure}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isCritical ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (avail / Math.max(1, moq * 3)) * 100)}%` }}
                      />
                    </div>
                    {isCritical && (
                      <div className="text-[10px] text-rose-500 font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>Inventory is below MOQ threshold ({moq})!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400">
                    Lead time: {prod.lead_time_days || 2} days
                  </div>
                  <button
                    onClick={() => setEditingProduct(prod)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Terms</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-xl rounded-3xl border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#131A2A] border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black flex items-center space-x-2">
                <Tag className="w-4 h-4 text-amber-500" />
                <span>{editingProduct ? 'Edit Commercial Terms' : 'Add New Wholesale Product'}</span>
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Product Name</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingProduct?.name || ''}
                    placeholder="e.g. Sona Masoori Rice (25kg)"
                    className={`w-full border rounded-xl px-3 py-2 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'Grains'}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  >
                    <option value="Grains">Grains & Pulses</option>
                    <option value="Oils">Oils & Dairy</option>
                    <option value="Spices">Spices & Condiments</option>
                    <option value="Beverages">Beverages & Snacks</option>
                    <option value="Personal Care">Personal Care & Household</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Unit of Measure</label>
                  <input
                    name="unit_of_measure"
                    required
                    defaultValue={editingProduct?.unit_of_measure || 'bag'}
                    placeholder="bag, tin, carton"
                    className={`w-full border rounded-xl px-3 py-2 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Unit Weight (kg)</label>
                  <input
                    name="unit_weight_kg"
                    type="number"
                    step="0.1"
                    defaultValue={editingProduct?.unit_weight_kg || 25.0}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Single Retail Price (₹)</label>
                  <input
                    name="retail_price"
                    type="number"
                    step="0.5"
                    defaultValue={editingProduct?.retail_price || 1450}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-500 mb-1">Wholesale Base Price (₹)</label>
                  <input
                    name="wholesale_price"
                    type="number"
                    step="0.5"
                    required
                    defaultValue={editingProduct?.wholesale_price || 1180}
                    className={`w-full border rounded-xl px-3 py-2 font-bold ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-500 mb-1">Supplier MOQ</label>
                  <input
                    name="min_wholesale_quantity"
                    type="number"
                    step="1"
                    required
                    defaultValue={editingProduct?.min_wholesale_quantity || 40}
                    className={`w-full border rounded-xl px-3 py-2 font-bold ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Available Inventory</label>
                  <input
                    name="available_quantity"
                    type="number"
                    step="1"
                    required
                    defaultValue={editingProduct?.available_quantity || 500}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Max Order Qty (Optional)</label>
                  <input
                    name="max_order_quantity"
                    type="number"
                    step="1"
                    defaultValue={editingProduct?.max_order_quantity || ''}
                    placeholder="e.g. 1500"
                    className={`w-full border rounded-xl px-3 py-2 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Service Radius (km)</label>
                  <input
                    name="service_radius_km"
                    type="number"
                    step="1"
                    defaultValue={editingProduct?.service_radius_km || 50}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Lead Time (days)</label>
                  <input
                    name="lead_time_days"
                    type="number"
                    step="1"
                    defaultValue={editingProduct?.lead_time_days || 2}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  defaultChecked={editingProduct ? editingProduct.is_available : true}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="is_available" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Product is currently active & open for Kirana group pooling
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition shadow-md"
                >
                  {editingProduct ? 'Save Commercial Terms' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
