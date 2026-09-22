import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  RotateCw, 
  EyeOff, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';
import { 
  requestBrowserGeolocation, 
  saveRetailerLocation, 
  setRetailerLocationSharing, 
  formatLocationFreshness,
  GEOLOCATION_STATUS 
} from '../services/locationService';

/**
 * RetailerLocationCard Component
 * 
 * Provides an on-demand location management panel in the Retailer Portal:
 * - Shows current GPS status, accuracy, and freshness.
 * - Allows updating GPS location on demand.
 * - Allows pausing/stopping location sharing or resuming sharing.
 */
export default function RetailerLocationCard({ 
  retailerId, 
  initialLocation, 
  onLocationUpdate 
}) {
  const [location, setLocation] = useState(initialLocation || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTogglingShare, setIsTogglingShare] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', message: string }

  const isShared = location?.sharingEnabled !== false && location?.latitude != null;
  const freshness = formatLocationFreshness(location?.updatedAt);

  const handleUpdateLocation = async () => {
    setIsUpdating(true);
    setNotice(null);

    try {
      const coords = await requestBrowserGeolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      if (retailerId) {
        await saveRetailerLocation(retailerId, coords);
      }

      const updatedLoc = {
        ...coords,
        updatedAt: new Date().toISOString(),
        permissionGranted: true,
        sharingEnabled: true,
        source: 'device_gps'
      };

      setLocation(updatedLoc);
      if (onLocationUpdate) onLocationUpdate(updatedLoc);

      setNotice({
        type: 'success',
        message: `Store location updated successfully (accurate to ±${coords.accuracy}m).`
      });
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      console.warn('[RetailerLocationCard] Location error:', err);
      setNotice({
        type: 'error',
        message: err.message || 'Failed to update store location.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleSharing = async () => {
    if (!retailerId) return;
    setIsTogglingShare(true);
    setNotice(null);

    const nextState = !isShared;

    try {
      if (nextState && !location?.latitude) {
        // Needs initial coordinates first
        await handleUpdateLocation();
      } else {
        await setRetailerLocationSharing(retailerId, nextState);
        const updated = {
          ...location,
          sharingEnabled: nextState
        };
        setLocation(updated);
        if (onLocationUpdate) onLocationUpdate(updated);

        setNotice({
          type: 'success',
          message: nextState 
            ? 'Location sharing resumed. Nearby suppliers can now calculate direct delivery routes.' 
            : 'Location sharing stopped. Your precise coordinates are hidden from suppliers.'
        });
        setTimeout(() => setNotice(null), 4000);
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: err.message || 'Failed to update sharing preference.'
      });
    } finally {
      setIsTogglingShare(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/90 shadow-sm space-y-4">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
            isShared ? 'bg-emerald-800' : 'bg-slate-600'
          }`}>
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
              Store Location & Proximity Sharing
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Used for pooled delivery grouping and real supplier driving routes.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isShared ? (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Location Shared</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Location Not Shared</span>
            </span>
          )}
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div className={`p-3 rounded-lg text-xs flex items-start space-x-2 ${
          notice.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      {isShared ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-medium">GPS Accuracy</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              ±{location?.accuracy || 15} meters
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-medium">Last Verified</span>
            <span className={`font-semibold ${freshness.isStale ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {freshness.text}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-medium">GPS Source</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              Device Sensor (Real)
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          Sharing your real store coordinates enables nearby suppliers to verify wholesale delivery eligibility and calculate direct route savings for your orders.
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {isShared ? (
          <>
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleUpdateLocation}
              className="py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs transition shadow-sm flex items-center space-x-1.5 disabled:opacity-60"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Acquiring GPS...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Update Location</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isTogglingShare}
              onClick={handleToggleSharing}
              className="py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition flex items-center space-x-1.5 disabled:opacity-60"
            >
              {isTogglingShare ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Stop Sharing Location</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleUpdateLocation}
            className="py-2 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs transition shadow-sm flex items-center space-x-1.5 disabled:opacity-60"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Requesting GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5" />
                <span>Share My Location</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
