import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Star, Clock, Truck, Save, CheckCircle2, ShieldCheck,
  MapPin, Navigation, Loader2, AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { geocodeAddress } from '../../services/mapService';

export default function SupplierProfile() {
  const navigate = useNavigate();
  const { currentSupplier, setCurrentSupplier, firebaseUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [notification, setNotification] = useState(null);

  const [name, setName] = useState(currentSupplier?.name || '');
  const [contactPerson, setContactPerson] = useState(currentSupplier?.contactPerson || '');
  const [email, setEmail] = useState(currentSupplier?.email || firebaseUser?.email || '');
  const [phone, setPhone] = useState(currentSupplier?.phone || '');
  const [address, setAddress] = useState(currentSupplier?.address || '');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(currentSupplier?.serviceRadiusKm || 50);
  const [leadTimeDays, setLeadTimeDays] = useState(currentSupplier?.leadTimeDays || 2);

  // Business location geocoding state
  const [warehouseAddress, setWarehouseAddress] = useState(
    currentSupplier?.businessLocation?.address || currentSupplier?.address || ''
  );
  const [warehouseCity, setWarehouseCity] = useState(
    currentSupplier?.businessLocation?.city || currentSupplier?.city || ''
  );
  const [warehouseState, setWarehouseState] = useState(
    currentSupplier?.businessLocation?.state || ''
  );
  const [warehousePincode, setWarehousePincode] = useState(
    currentSupplier?.businessLocation?.pincode || ''
  );
  const [businessLocation, setBusinessLocation] = useState(
    currentSupplier?.businessLocation || null
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');

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
      leadTimeDays: parseInt(leadTimeDays),
      businessLocation: businessLocation || currentSupplier?.businessLocation || null
    };
    setCurrentSupplier(updated);
    setNotification("Supplier profile updated successfully");
    setEditing(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGeocodeWarehouse = async () => {
    const fullAddress = [warehouseAddress, warehouseCity, warehouseState, warehousePincode]
      .filter(Boolean).join(', ');

    if (!fullAddress.trim()) {
      setGeocodeError('Please enter the warehouse address details before verifying.');
      return;
    }

    setIsGeocoding(true);
    setGeocodeError('');

    try {
      const result = await geocodeAddress(fullAddress);
      const locationPayload = {
        address: warehouseAddress,
        city: warehouseCity,
        state: warehouseState,
        pincode: warehousePincode,
        latitude: result.latitude,
        longitude: result.longitude,
        formattedAddress: result.formattedAddress,
        verified: true,
        updatedAt: new Date().toISOString()
      };

      setBusinessLocation(locationPayload);

      // Persist to Firestore if the supplier is authenticated
      const supplierId = firebaseUser?.uid || currentSupplier?.id;
      if (supplierId) {
        await updateDoc(doc(db, 'suppliers', supplierId), {
          businessLocation: locationPayload,
          updated_at: new Date().toISOString()
        });
      }

      setCurrentSupplier({ ...currentSupplier, businessLocation: locationPayload });
      setNotification('Warehouse location verified and saved.');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setGeocodeError(err.message || 'Unable to verify warehouse coordinates. Please check the address and try again.');
    } finally {
      setIsGeocoding(false);
    }
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

            {/* ── Warehouse Business Location (Real Geocoded Coordinates) ─────── */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                    Warehouse Business Location
                  </span>
                </div>
                {businessLocation?.verified && (
                  <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Coordinates Verified</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your registered warehouse address. Click "Verify & Geocode" to resolve it to real geographic coordinates for the Nearby Retailers map and delivery routing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Street / Warehouse Address</label>
                  <input
                    value={warehouseAddress}
                    onChange={(e) => setWarehouseAddress(e.target.value)}
                    placeholder="e.g. Plot 45, Phase 2, Kukatpally Industrial Area"
                    className="w-full border rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">City</label>
                  <input
                    value={warehouseCity}
                    onChange={(e) => setWarehouseCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full border rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">State</label>
                  <input
                    value={warehouseState}
                    onChange={(e) => setWarehouseState(e.target.value)}
                    placeholder="e.g. Telangana"
                    className="w-full border rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Pincode</label>
                  <input
                    value={warehousePincode}
                    onChange={(e) => setWarehousePincode(e.target.value)}
                    placeholder="e.g. 500072"
                    maxLength={6}
                    className="w-full border rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
              </div>

              {/* Geocode Result Display */}
              {businessLocation?.latitude && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Real Coordinates Verified</span>
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">{businessLocation.formattedAddress}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    {businessLocation.latitude.toFixed(5)}, {businessLocation.longitude.toFixed(5)}
                  </p>
                </div>
              )}

              {/* Geocode Error */}
              {geocodeError && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs flex items-start space-x-2 text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{geocodeError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={isGeocoding}
                  onClick={handleGeocodeWarehouse}
                  className="py-2 px-3.5 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-medium text-xs transition flex items-center space-x-2 shadow-sm disabled:opacity-60"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Geocoding Address...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Verify & Geocode Location</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/supplier/nearby-retailers')}
                  className="py-2 px-3.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs transition flex items-center space-x-2 shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View Nearby Retailers Map</span>
                </button>
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
