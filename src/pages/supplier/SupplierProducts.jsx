import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Edit3, CheckCircle2, AlertTriangle, 
  Search, RefreshCw, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupplierProducts, addSupplierProduct, updateSupplierProduct } from '../../services/api';

export default function SupplierProducts() {
  const { currentSupplier } = useApp();
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
        setNotification(`Product "${payload.name}" updated successfully`);
        setEditingProduct(null);
      } else {
        await addSupplierProduct(supId, payload);
        setNotification(`Product "${payload.name}" added to catalog`);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Wholesale Catalog
            </span>
            <span className="text-xs text-slate-500 font-normal">
              {products.length} Products Configured
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Product & Inventory Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure wholesale commercial terms, minimum wholesale order thresholds (MOQ), and monitor warehouse stock levels.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadProducts}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center space-x-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
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
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table (Clean B2B Data Layout) */}
      <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No products found matching your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Product Details</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Wholesale Price</th>
                  <th className="py-2.5 px-4 text-right">Retail Ref</th>
                  <th className="py-2.5 px-4 text-right">Configured MOQ</th>
                  <th className="py-2.5 px-4 text-right">Stock Level</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {filtered.map((prod) => {
                  const avail = prod.available_quantity || 0;
                  const moq = prod.min_wholesale_quantity || 0;
                  const isCritical = avail < moq;
                  const isLowStock = avail < (moq * 1.5);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{prod.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Unit: {prod.unit_of_measure} ({prod.unit_weight_kg || 1} kg) • Lead: {prod.lead_time_days || 2}d
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          ₹{Number(prod.wholesale_price).toLocaleString('en-IN')}/{prod.unit_of_measure}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        ₹{Number(prod.retail_price || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {moq} {prod.unit_of_measure}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {avail} {prod.unit_of_measure}
                        </div>
                        {isCritical ? (
                          <span className="text-[10px] text-rose-700 dark:text-rose-400 font-medium inline-flex items-center space-x-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Below MOQ</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleAvailability(prod)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border transition ${
                            prod.is_available
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                          }`}
                          title="Click to toggle availability"
                        >
                          {prod.is_available ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setEditingProduct(prod)}
                          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition inline-flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
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

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Tag className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>{editingProduct ? 'Edit Commercial Terms' : 'Add Wholesale Product'}</span>
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Product Name</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingProduct?.name || ''}
                    placeholder="e.g. Sona Masoori Rice (25kg)"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'Grains'}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
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
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Unit of Measure</label>
                  <input
                    name="unit_of_measure"
                    required
                    defaultValue={editingProduct?.unit_of_measure || 'bag'}
                    placeholder="bag, tin, carton"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Unit Weight (kg)</label>
                  <input
                    name="unit_weight_kg"
                    type="number"
                    step="0.1"
                    defaultValue={editingProduct?.unit_weight_kg || 25.0}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Retail Price (₹)</label>
                  <input
                    name="retail_price"
                    type="number"
                    step="0.5"
                    defaultValue={editingProduct?.retail_price || 1450}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-emerald-800 dark:text-emerald-400 mb-1">Wholesale Base (₹)</label>
                  <input
                    name="wholesale_price"
                    type="number"
                    step="0.5"
                    required
                    defaultValue={editingProduct?.wholesale_price || 1180}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-emerald-800 dark:text-emerald-400 mb-1">Supplier MOQ</label>
                  <input
                    name="min_wholesale_quantity"
                    type="number"
                    step="1"
                    required
                    defaultValue={editingProduct?.min_wholesale_quantity || 40}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Available Stock</label>
                  <input
                    name="available_quantity"
                    type="number"
                    step="1"
                    required
                    defaultValue={editingProduct?.available_quantity || 500}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Max Order Qty</label>
                  <input
                    name="max_order_quantity"
                    type="number"
                    step="1"
                    defaultValue={editingProduct?.max_order_quantity || ''}
                    placeholder="e.g. 1500"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Radius (km)</label>
                  <input
                    name="service_radius_km"
                    type="number"
                    step="1"
                    defaultValue={editingProduct?.service_radius_km || 50}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Lead Time (days)</label>
                  <input
                    name="lead_time_days"
                    type="number"
                    step="1"
                    defaultValue={editingProduct?.lead_time_days || 2}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  defaultChecked={editingProduct ? editingProduct.is_available : true}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-800 w-4 h-4"
                />
                <label htmlFor="is_available" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Product is currently active & open for Kirana group pooling
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
