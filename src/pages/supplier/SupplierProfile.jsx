import React, { useState } from 'react';
import { 
  Building2, User, Mail, Phone, MapPin, 
  ShieldCheck, Star, Clock, Truck, Save, CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SupplierProfile() {
  const { theme, currentSupplier, setCurrentSupplier } = useApp();
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
    setNotification("Supplier profile updated successfully!");
    setEditing(false);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Wholesale Entity
          </span>
          <span className="text-xs text-slate-400">
            ID: {currentSupplier?.id || 'sup_01'}
          </span>
        </div>
        <h1 className={`text-2xl font-black tracking-tight mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
          Supplier Business Profile
        </h1>
        <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
          Business credentials, logistics hub address, delivery radius, and contact information.
        </p>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Summary Card (1 col) */}
        <div className={`p-6 rounded-3xl border space-y-4 text-center ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131A2A] border-slate-800 text-white'
        }`}>
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 p-1 mx-auto shadow-lg flex items-center justify-center">
            <div className={`w-full h-full rounded-[20px] flex items-center justify-center ${
              theme === 'light' ? 'bg-white' : 'bg-[#0B1020]'
            }`}>
              <Building2 className="w-9 h-9 text-amber-500" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-black">{currentSupplier?.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{currentSupplier?.address}</p>
          </div>

          <div className="flex items-center justify-center space-x-2 pt-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Wholesale Partner</span>
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Reliability Rating:</span>
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{currentSupplier?.rating || 4.8} / 5.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Service Radius:</span>
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{currentSupplier?.serviceRadiusKm || 60} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Standard Lead Time:</span>
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{currentSupplier?.leadTimeDays || 2} days</span>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Details Form (2 cols) */}
        <div className={`md:col-span-2 p-6 rounded-3xl border space-y-5 ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131A2A] border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black">Business Entity Information</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition"
              >
                Edit Details
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="px-3.5 py-1.5 rounded-xl border text-xs font-bold text-slate-400 hover:text-slate-200 transition"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Company / Business Name</label>
                <input
                  disabled={!editing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    !editing 
                      ? 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent text-slate-700 dark:text-slate-300' 
                      : theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0B1020] border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Primary Contact Person</label>
                <input
                  disabled={!editing}
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    !editing 
                      ? 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent text-slate-700 dark:text-slate-300' 
                      : theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0B1020] border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Email Address</label>
                <input
                  disabled={!editing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    !editing 
                      ? 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent text-slate-700 dark:text-slate-300' 
                      : theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0B1020] border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Phone Number</label>
                <input
                  disabled={!editing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    !editing 
                      ? 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent text-slate-700 dark:text-slate-300' 
                      : theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0B1020] border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Warehouse Facility Address</label>
              <input
                disabled={!editing}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 ${
                  !editing 
                    ? 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent text-slate-700 dark:text-slate-300' 
                    : theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0B1020] border-slate-700'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Delivery / Service Radius (km)</label>
                <input
                  type="number"
                  disabled={!editing}
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    !editing 
                      ? 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent text-slate-700 dark:text-slate-300' 
                      : theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0B1020] border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Lead Time (days)</label>
                <input
                  type="number"
                  disabled={!editing}
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    !editing 
                      ? 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent text-slate-700 dark:text-slate-300' 
                      : theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0B1020] border-slate-700'
                  }`}
                />
              </div>
            </div>

            {editing && (
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
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
