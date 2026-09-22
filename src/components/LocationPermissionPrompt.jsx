import React, { useState } from 'react';
import { MapPin, ShieldCheck, AlertCircle, Loader2, Navigation, CheckCircle2 } from 'lucide-react';
import { 
  requestBrowserGeolocation, 
  saveRetailerLocation, 
  GEOLOCATION_STATUS 
} from '../services/locationService';

/**
 * LocationPermissionPrompt Modal Component
 * 
 * Provides an explicit, user-friendly permission consent flow for retailers:
 * - Uses real browser GPS geolocation (navigator.geolocation.getCurrentPosition).
 * - Never synthesizes fake coordinates.
 * - Handles every state: NOT_REQUESTED, REQUESTING, GRANTED, DENIED, TIMEOUT, UNAVAILABLE.
 * - Saves coordinates to retailers/{uid}.
 */
export default function LocationPermissionPrompt({ retailerId, onComplete, onDismiss }) {
  const [status, setStatus] = useState(GEOLOCATION_STATUS.NOT_REQUESTED);
  const [errorMessage, setErrorMessage] = useState('');
  const [coordsAcquired, setCoordsAcquired] = useState(null);

  const handleRequestLocation = async () => {
    setStatus(GEOLOCATION_STATUS.REQUESTING);
    setErrorMessage('');

    try {
      // 1. Browser Geolocation API call
      const coords = await requestBrowserGeolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      setCoordsAcquired(coords);

      // 2. Persist real coordinates to Firestore if retailerId is present
      if (retailerId) {
        await saveRetailerLocation(retailerId, coords);
      }

      setStatus(GEOLOCATION_STATUS.GRANTED);

      // Brief success feedback before closing
      setTimeout(() => {
        if (onComplete) onComplete(coords);
      }, 1200);
    } catch (err) {
      console.warn('[LocationPrompt] Geolocation error:', err);
      setStatus(err.code || GEOLOCATION_STATUS.UNAVAILABLE);
      setErrorMessage(err.message || 'Unable to retrieve device GPS location.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-center space-y-5">
        
        {/* Top Icon Indicator */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-sm ${
          status === GEOLOCATION_STATUS.GRANTED 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
            : status === GEOLOCATION_STATUS.DENIED || status === GEOLOCATION_STATUS.UNAVAILABLE || status === GEOLOCATION_STATUS.TIMEOUT
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
            : 'bg-emerald-800 text-white'
        }`}>
          {status === GEOLOCATION_STATUS.GRANTED ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : status === GEOLOCATION_STATUS.REQUESTING ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <MapPin className="w-6 h-6" />
          )}
        </div>

        {/* Headline & Value Proposition */}
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {status === GEOLOCATION_STATUS.GRANTED
              ? 'Location Verified & Shared'
              : 'Allow Samooh to access your location'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
            {status === GEOLOCATION_STATUS.GRANTED
              ? `Accurate to ±${coordsAcquired?.accuracy || 15}m. Your store is now connected to nearby suppliers and pooled procurement clusters.`
              : 'Your real store location enables collective purchasing power, accurate supplier driving distances, and pooled logistics.'}
          </p>
        </div>

        {/* Feature Highlights (when not yet granted) */}
        {status !== GEOLOCATION_STATUS.GRANTED && (
          <div className="text-left bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-2 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start space-x-2">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">•</span>
              <span><strong>Identify nearby Kirana stores</strong> to pool demand and unlock wholesale discounts.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">•</span>
              <span><strong>Calculate real road delivery distances</strong> from wholesale supplier warehouses.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">•</span>
              <span><strong>Optimize shared transport dispatches</strong> (Tata Ace, 407) to reduce delivery costs.</span>
            </div>
          </div>
        )}

        {/* Error / Denial Guidance */}
        {(status === GEOLOCATION_STATUS.DENIED ||
          status === GEOLOCATION_STATUS.TIMEOUT ||
          status === GEOLOCATION_STATUS.UNAVAILABLE ||
          status === GEOLOCATION_STATUS.NOT_SUPPORTED) && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs text-left flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">
                {status === GEOLOCATION_STATUS.DENIED ? 'Permission Denied' : 'Location Notice'}
              </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 space-y-2">
          {status === GEOLOCATION_STATUS.GRANTED ? (
            <div className="py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              Redirecting to dashboard...
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                id="btn-allow-location"
                disabled={status === GEOLOCATION_STATUS.REQUESTING}
                onClick={handleRequestLocation}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {status === GEOLOCATION_STATUS.REQUESTING ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting GPS Location...</span>
                  </>
                ) : status === GEOLOCATION_STATUS.DENIED || status === GEOLOCATION_STATUS.UNAVAILABLE || status === GEOLOCATION_STATUS.TIMEOUT ? (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Allow Location</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-not-now-location"
                disabled={status === GEOLOCATION_STATUS.REQUESTING}
                onClick={onDismiss}
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
              >
                Not Now
              </button>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>You can update or stop sharing your location anytime in your dashboard.</span>
        </div>
      </div>
    </div>
  );
}
