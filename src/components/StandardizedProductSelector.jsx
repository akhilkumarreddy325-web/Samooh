import React, { useState, useMemo } from 'react';
import { Search, Check, Plus, PackageSearch, AlertCircle } from 'lucide-react';
import { 
  getGroupsBySector, 
  getProductsBySector, 
  searchProducts, 
  getProductDisplayName,
  getProductById
} from '../data/productCatalog';
import { getSectorById } from '../data/businessSectors';
import { useApp } from '../context/AppContext';
import RequestProductModal from './RequestProductModal';

export default function StandardizedProductSelector({
  sectorId = 'grocery',
  selectedProductIds = [],
  onToggleProduct,
  onContinue,
  role = 'retailer',
  continueLabel = 'Continue'
}) {
  const { currentLanguage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  const activeSector = getSectorById(sectorId);

  // Grouped products for the active sector
  const allSectorProducts = useMemo(() => {
    return getProductsBySector(sectorId);
  }, [sectorId]);

  // Filtered products based on search input (strictly a filter, never creates products)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSectorProducts;
    }
    return searchProducts(searchQuery, sectorId);
  }, [allSectorProducts, searchQuery, sectorId]);

  // Group filtered products by product group
  const groupedProducts = useMemo(() => {
    const map = new Map();
    for (const prod of filteredProducts) {
      if (!map.has(prod.groupId)) {
        map.set(prod.groupId, {
          groupId: prod.groupId,
          groupName: prod.groupName,
          products: []
        });
      }
      map.get(prod.groupId).products.push(prod);
    }
    return Array.from(map.values());
  }, [filteredProducts]);

  const selectedCount = selectedProductIds.length;

  const handleContinueClick = () => {
    if (selectedCount === 0) {
      setValidationError('Please select at least one standardized product to proceed.');
      return;
    }
    setValidationError('');
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {role === 'supplier' ? 'What products does your enterprise supply?' : 'What products do you sell or need?'}
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Standardized catalog for <strong className="text-emerald-800 dark:text-emerald-400">{activeSector?.name}</strong>
          </p>
        </div>

        {/* Selected Counter Badge */}
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
          </span>
        </div>
      </div>

      {validationError && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Real-time Search Input (Search strictly, no free-form creation) */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          id="product_catalog_search"
          placeholder={`Search standardized ${activeSector?.name || ''} products (e.g. rice, oil, brake)...`}
          value={searchQuery}
          onChange={(e) => {
            setValidationError('');
            setSearchQuery(e.target.value);
          }}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Catalog Group Listings */}
      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
        {groupedProducts.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 text-xs space-y-2">
            <p>No products match "{searchQuery}" in {activeSector?.name}.</p>
            <p className="text-[11px] text-slate-400">
              Only canonical catalog items can be selected to ensure group matching consistency.
            </p>
          </div>
        ) : (
          groupedProducts.map((group) => (
            <div key={group.groupId} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700/60 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>{group.groupName}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {group.products.length} {group.products.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {group.products.map((prod) => {
                  const isChecked = selectedProductIds.includes(prod.id);
                  const displayName = getProductDisplayName(prod, currentLanguage);

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      id={`prod_btn_${prod.id}`}
                      onClick={() => {
                        setValidationError('');
                        onToggleProduct(prod.id, prod);
                      }}
                      className={`p-2 rounded-md border text-left text-xs transition flex items-center justify-between space-x-2 ${
                        isChecked
                          ? 'border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="truncate block leading-tight">
                          {displayName}
                        </span>
                        {displayName !== prod.name && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                            {prod.name}
                          </span>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition ${
                        isChecked
                          ? 'bg-emerald-800 border-emerald-800 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Missing Product Banner */}
      <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">
          Can't find your product in the catalog?
        </span>
        <button
          type="button"
          onClick={() => setIsRequestModalOpen(true)}
          className="text-emerald-800 dark:text-emerald-400 font-semibold hover:underline flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Request a product</span>
        </button>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60">
        <span className="text-xs text-slate-500">
          {selectedCount} selected for your catalog
        </span>
        <button
          type="button"
          onClick={handleContinueClick}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition shadow-sm"
        >
          {continueLabel}
        </button>
      </div>

      {/* Product Request Modal */}
      <RequestProductModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        sectorId={sectorId}
      />
    </div>
  );
}
