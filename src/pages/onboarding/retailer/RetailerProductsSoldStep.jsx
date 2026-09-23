import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import StandardizedProductSelector from '../../../components/StandardizedProductSelector';
import { getProductById, resolveCanonicalProductId } from '../../../data/productCatalog';
import { getSectorById } from '../../../data/businessSectors';

export default function RetailerProductsSoldStep({ data, onUpdate, onNext, onBack }) {
  // Initialize selected product IDs from data.selectedProductIds or resolve from existing productsSold/productsNeeded
  const [selectedProductIds, setSelectedProductIds] = useState(() => {
    if (Array.isArray(data.selectedProductIds) && data.selectedProductIds.length > 0) {
      return data.selectedProductIds;
    }
    // Attempt migration from existing productsNeeded or productsSold
    const fromNeeded = (data.productsNeeded || []).map(p => p.productId || resolveCanonicalProductId(p.name || p.product_name)).filter(Boolean);
    if (fromNeeded.length > 0) return Array.from(new Set(fromNeeded));

    const fromSold = (data.productsSold || []).map(resolveCanonicalProductId).filter(Boolean);
    if (fromSold.length > 0) return Array.from(new Set(fromSold));

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
      
      // Preserve existing user-entered values in productsNeeded if already present
      const existingNeededMap = new Map((data.productsNeeded || []).map(p => [p.productId || p.id, p]));
      
      const updatedProductsNeeded = canonicalProducts.map(cp => {
        const existing = existingNeededMap.get(cp.id) || {};
        return {
          id: cp.id,
          productId: cp.id,
          canonical_product_id: cp.id,
          name: cp.name,
          category: cp.groupName,
          unit: existing.unit || cp.defaultUnit || 'kg',
          typicalQuantity: existing.typicalQuantity != null ? existing.typicalQuantity : (existing.typical_quantity != null ? String(existing.typical_quantity) : ''),
          typical_quantity: existing.typical_quantity != null ? existing.typical_quantity : (existing.typicalQuantity ? Number(existing.typicalQuantity) : null),
          purchaseFrequency: existing.purchaseFrequency || existing.purchase_frequency || 'Weekly',
          purchase_frequency: existing.purchase_frequency || existing.purchaseFrequency || 'Weekly',
          approxBudget: existing.approxBudget != null ? existing.approxBudget : (existing.approx_budget != null ? String(existing.approx_budget) : ''),
          approx_budget: existing.approx_budget != null ? existing.approx_budget : (existing.approxBudget ? Number(existing.approxBudget) : null)
        };
      });

      onUpdate({
        selectedProductIds: next,
        productsSold: canonicalProducts.map(cp => cp.name),
        productsNeeded: updatedProductsNeeded
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
          Step 2: What products do you sell or need?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select products from our standardized catalog for <strong>{activeSector.name}</strong> to unlock group procurement discounts.
        </p>
      </div>

      {/* Standardized Product Catalog Selector */}
      <StandardizedProductSelector
        sectorId={data.businessSectorId || 'grocery'}
        selectedProductIds={selectedProductIds}
        onToggleProduct={handleToggleProduct}
        onContinue={handleContinue}
        role="retailer"
        continueLabel="Continue to Product Details"
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
