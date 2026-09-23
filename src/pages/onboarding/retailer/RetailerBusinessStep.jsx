import React, { useState } from 'react';
import { Store, User, Building, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import LocationPicker from '../../../components/LocationPicker';

const BUSINESS_TYPES = [
  'Kirana Store',
  'Grocery Store',
  'Convenience Store',
  'Mini Mart',
  'General Store',
  'Superette',
  'Other'
];

export default function RetailerBusinessStep({ data, onUpdate, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!data.shopName?.trim()) errs.shopName = 'Store name is required';
    if (!data.ownerName?.trim()) errs.ownerName = 'Owner / contact name is required';
    if (!data.state?.trim()) errs.state = 'State is required';
    if (!data.district?.trim()) errs.district = 'District is required';
    if (!data.city?.trim()) errs.city = 'Operating city or locality is required';
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
          Step 1: Business Information
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter your Kirana store details to establish your localized procurement identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shop Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Shop / Business Name <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Store className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Sri Lakshmi Kirana & General Store"
              value={data.shopName || ''}
              onChange={(e) => onUpdate({ shopName: e.target.value })}
              className={`w-full border rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800 ${
                errors.shopName ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.shopName && <span className="text-[11px] text-rose-600 mt-1 block">{errors.shopName}</span>}
        </div>

        {/* Owner / Contact Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Owner / Contact Name <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Srinivas Rao"
              value={data.ownerName || ''}
              onChange={(e) => onUpdate({ ownerName: e.target.value })}
              className={`w-full border rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800 ${
                errors.ownerName ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.ownerName && <span className="text-[11px] text-rose-600 mt-1 block">{errors.ownerName}</span>}
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Business Type
          </label>
          <div className="relative">
            <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={data.businessType || 'Kirana Store'}
              onChange={(e) => onUpdate({ businessType: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            >
              {BUSINESS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Contact Phone (Optional)
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

      {/* State & Location Autocomplete with Map Preview */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <LocationPicker
          value={data}
          onChange={(loc) => onUpdate(loc)}
          label="Store Operating Location & State"
          required
          errors={errors}
        />
      </div>

      {/* Shop Address & Pincode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Shop Address <span className="text-slate-400 font-normal">(Physical shop location)</span>
          </label>
          <input
            type="text"
            placeholder="Enter your shop address (Door No, Street Name, Landmark)"
            value={data.address || ''}
            onChange={(e) => {
              const newAddr = e.target.value;
              onUpdate({
                address: newAddr,
                businessLocation: data.businessLocation ? {
                  ...data.businessLocation,
                  address: newAddr
                } : (data.latitude && data.longitude ? {
                  address: newAddr,
                  area: data.area || data.city || '',
                  city: data.city || '',
                  district: data.district || '',
                  state: data.state || '',
                  pincode: data.pincode || '',
                  latitude: data.latitude,
                  longitude: data.longitude,
                  source: 'manual_entry'
                } : null)
              });
            }}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Pincode
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="e.g. 500034"
            value={data.pincode || ''}
            onChange={(e) => {
              const newPin = e.target.value.replace(/\D/g, '');
              onUpdate({
                pincode: newPin,
                businessLocation: data.businessLocation ? {
                  ...data.businessLocation,
                  pincode: newPin
                } : (data.latitude && data.longitude ? {
                  address: data.address || '',
                  area: data.area || data.city || '',
                  city: data.city || '',
                  district: data.district || '',
                  state: data.state || '',
                  pincode: newPin,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  source: 'manual_entry'
                } : null)
              });
            }}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>
      </div>

      {/* Optional Business Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Years in Business
          </label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 5"
            value={data.yearsInBusiness || ''}
            onChange={(e) => onUpdate({ yearsInBusiness: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Approx. Shop Size (sq ft)
          </label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 350"
            value={data.shopSize || ''}
            onChange={(e) => onUpdate({ shopSize: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Staff / Employees
          </label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 2"
            value={data.employeeCount || ''}
            onChange={(e) => onUpdate({ employeeCount: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>
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
          <span>Continue to Products Sold</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
