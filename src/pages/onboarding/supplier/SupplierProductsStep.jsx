import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import StandardizedProductSelector from '../../../components/StandardizedProductSelector';
import { getProductById, resolveCanonicalProductId } from '../../../data/productCatalog';
import { getSectorById } from '../../../data/businessSectors';

export default function SupplierProductsStep({ data, onUpdate, onNext, onBack }) {
  // Initialize selected product IDs from data.selectedProductIds or resolve from configuredProducts/productsSupplied
  const [selectedProductIds, setSelectedProductIds] = useState(() => {
    if (Array.isArray(data.selectedProductIds) && data.selectedProductIds.length > 0) {
      return data.selectedProductIds;
    }
    // Attempt migration from existing configuredProducts or productsSupplied
    const fromConfigured = (data.configuredProducts || []).map(p => p.productId || resolveCanonicalProductId(p.name)).filter(Boolean);
    if (fromConfigured.length > 0) return Array.from(new Set(fromConfigured));

    const fromSupplied = (data.productsSupplied || []).map(resolveCanonicalProductId).filter(Boolean);
    if (fromSupplied.length > 0) return Array.from(new Set(fromSupplied));

    return [];
  });

  const activeSector = getSectorById(data.businessSectorId || 'grocery');

  const handleToggleProduct = (productId, productObj) => {
    setSelectedProductIds(prev => {
      let next;
      if (prev.includes(productId)) {
        next = prev.filter(id => id !== productId);
      } else {
        next = [...prev, productId];
      }

      // Synchronize with parent form state
      const canonicalProducts = next.map(id => getProductById(id)).filter(Boolean);
      
      // Preserve existing user-entered values in configuredProducts if already present
      const existingConfigMap = new Map((data.configuredProducts || []).map(p => [p.productId || p.id, p]));
      
      const updatedConfiguredProducts = canonicalProducts.map(cp => {
        const existing = existingConfigMap.get(cp.id) || {};
        return {
          id: cp.id,
          productId: cp.id,
          canonical_product_id: cp.id,
          name: cp.name,
          category: cp.groupName,
          unit: existing.unit || cp.defaultUnit || 'kg',
          availableStock: existing.availableStock != null ? existing.availableStock : (existing.available_quantity != null ? String(existing.available_quantity) : ''),
          available_quantity: existing.available_quantity != null ? existing.available_quantity : (existing.availableStock ? Number(existing.availableStock) : null),
          price: existing.price != null ? existing.price : (existing.wholesale_price != null ? String(existing.wholesale_price) : ''),
          wholesale_price: existing.wholesale_price != null ? existing.wholesale_price : (existing.price ? Number(existing.price) : null),
          moq: existing.moq != null ? String(existing.moq) : '',
          restockFrequency: existing.restockFrequency || existing.replenishment_cycle || 'Weekly',
          replenishment_cycle: existing.replenishment_cycle || existing.restockFrequency || 'Weekly'
        };
      });

      onUpdate({
        selectedProductIds: next,
        productsSupplied: canonicalProducts.map(cp => cp.name),
        configuredProducts: updatedConfiguredProducts
      });

      return next;
    });
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 2: Wholesale Products Supplied
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select commodities from our standardized catalog for <strong>{activeSector.name}</strong> that your enterprise supplies.
        </p>
      </div>

      {/* Standardized Product Catalog Selector */}
      <StandardizedProductSelector
        sectorId={data.businessSectorId || 'grocery'}
        selectedProductIds={selectedProductIds}
        onToggleProduct={handleToggleProduct}
        onContinue={handleContinue}
        role="supplier"
        continueLabel="Continue to Stock & Pricing"
      />

      {/* Back Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Business Info</span>
        </button>
      </div>
    </div>
  );
}
