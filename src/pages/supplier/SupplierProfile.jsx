import React, { useState } from 'react';
import { 
  Building2, Star, Clock, Truck, Save, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SupplierProfile() {
  const { currentSupplier, setCurrentSupplier } = useApp();
  const [editing, setEditing] = useState(false);
  const [notification, setNotification] = useState(null);

  const [name, setName] = useState(currentSupplier?.name || 'Deccan Wholesale Grains');
  const [contactPerson, setContactPerson] = useState(currentSupplier?.contactPerson || 'Rajesh Agarwal');
  const [email, setEmail] = useState(currentSupplier?.email || 'deccan@samooh.in');
  const [phone, setPhone] = useState(currentSupplier?.phone || '+91 98480 12345');
  const [address, setAddress] = useState(currentSupplier?.address || 'Plot 45, Phase 2, Kukatpally, Hyderabad');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(currentSupplier?.serviceRadiusKm || 60);
  const [leadTimeDays, setLeadTimeDays] = useState(currentSupplier?.leadTimeDays || 2);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...currentSupplier,
      name,
      contactPerson,
      email,
      phone,
      address,
      serviceRadiusKm: parseFloat(serviceRadiusKm),
      leadTimeDays: parseInt(leadTimeDays)
    };
    setCurrentSupplier(updated);
    setNotification("Supplier profile updated successfully");
    setEditing(false);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Wholesale Entity
          </span>
          <span className="text-xs text-slate-500 font-normal">
            ID: {currentSupplier?.id || 'sup_01'}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Supplier Business Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Commercial credentials, logistics hub address, delivery coverage, and operational terms.
        </p>
      </div>

      {notification && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Summary Card (1 col) */}
        <div className="p-5 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm space-y-4 text-center">
          <div className="w-14 h-14 rounded-lg bg-emerald-800 text-white mx-auto flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{currentSupplier?.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentSupplier?.address}</p>
          </div>

          <div className="flex items-center justify-center space-x-2 pt-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Verified Wholesale Partner</span>
            </span>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Reliability:</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{currentSupplier?.rating || 4.8} / 5.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Service Radius:</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{currentSupplier?.serviceRadiusKm || 60} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead Time:</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{currentSupplier?.leadTimeDays || 2} days</span>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Details Form (2 cols) */}
        <div className="md:col-span-2 p-5 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Business Entity Information</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
              >
                Edit Details
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Company / Business Name</label>
                <input
                  disabled={!editing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border rounded-md px-3 py-1.5 ${
                    !editing 
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200' 
                      : 'bg-white border-slate-300 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Contact Person</label>
                <input
                  disabled={!editing}
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className={`w-full border rounded-md px-3 py-1.5 ${
                    !editing 
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200' 
                      : 'bg-white border-slate-300 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                <input
                  disabled={!editing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-md px-3 py-1.5 ${
                    !editing 
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200' 
                      : 'bg-white border-slate-300 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                <input
                  disabled={!editing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full border rounded-md px-3 py-1.5 ${
                    !editing 
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200' 
                      : 'bg-white border-slate-300 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Warehouse Facility Address</label>
              <input
                disabled={!editing}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full border rounded-md px-3 py-1.5 ${
                  !editing 
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200' 
                    : 'bg-white border-slate-300 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Service Coverage Radius (km)</label>
                <input
                  type="number"
                  disabled={!editing}
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(e.target.value)}
                  className={`w-full border rounded-md px-3 py-1.5 ${
                    !editing 
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200' 
                      : 'bg-white border-slate-300 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Standard Lead Time (days)</label>
                <input
                  type="number"
                  disabled={!editing}
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  className={`w-full border rounded-md px-3 py-1.5 ${
                    !editing 
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200' 
                      : 'bg-white border-slate-300 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>
            </div>

            {editing && (
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
