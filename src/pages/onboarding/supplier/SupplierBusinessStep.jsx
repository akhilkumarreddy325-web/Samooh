import React, { useState } from 'react';
import { Building2, User, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import LocationPicker from '../../../components/LocationPicker';

const SUPPLIER_TYPES = [
  'Wholesaler',
  'Distributor',
  'Manufacturer',
  'Local Supplier',
  'FMCG Distributor',
  'Grocery Wholesaler',
  'Agro Trading Hub',
  'Other'
];

export default function SupplierBusinessStep({ data, onUpdate, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!data.businessName?.trim()) errs.businessName = 'Company / business name is required';
    if (!data.contactPerson?.trim()) errs.contactPerson = 'Primary contact person is required';
    if (!data.state?.trim()) errs.state = 'State is required';
    if (!data.district?.trim()) errs.district = 'District is required';
    if (!data.city?.trim()) errs.city = 'Operating city or warehouse locality is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleNext} className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 1: Supplier Business Information
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Provide your enterprise or warehouse details to join Samooh's wholesale distributor network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Supplier / Company Name <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Deccan Wholesale Grains & Pulses"
              value={data.businessName || ''}
              onChange={(e) => onUpdate({ businessName: e.target.value })}
              className={`w-full border rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800 ${
                errors.businessName ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.businessName && <span className="text-[11px] text-rose-600 mt-1 block">{errors.businessName}</span>}
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Contact Person <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Rajesh Agarwal"
              value={data.contactPerson || ''}
              onChange={(e) => onUpdate({ contactPerson: e.target.value })}
              className={`w-full border rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800 ${
                errors.contactPerson ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.contactPerson && <span className="text-[11px] text-rose-600 mt-1 block">{errors.contactPerson}</span>}
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Business Classification
          </label>
          <select
            value={data.businessType || 'Wholesaler'}
            onChange={(e) => onUpdate({ businessType: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          >
            {SUPPLIER_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Dispatch Contact Phone
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              placeholder="+91 98480 12345"
              value={data.contactPhone || ''}
              onChange={(e) => onUpdate({ contactPhone: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
          </div>
        </div>
      </div>

      {/* Warehouse Location & State Autocomplete with Map Preview */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <LocationPicker
          value={data}
          onChange={(loc) => onUpdate(loc)}
          label="Warehouse Location & Operating State"
          required
          errors={errors}
        />
      </div>

      {/* Warehouse Physical Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Full Warehouse / Facility Address (Optional)
        </label>
        <input
          type="text"
          placeholder="Plot No, Industrial Estate, Gate No"
          value={data.warehouseAddress || ''}
          onChange={(e) => onUpdate({ warehouseAddress: e.target.value })}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="py-2 px-6 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center space-x-1.5"
        >
          <span>Continue to Products Supplied</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
