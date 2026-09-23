import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ShieldCheck, AlertCircle, Loader2, Navigation, CheckCircle2, X } from 'lucide-react';
import { 
  requestBrowserGeolocation, 
  saveRetailerLocation, 
  checkGeolocationPermission,
  GEOLOCATION_STATUS 
} from '../services/locationService';

/**
 * LocationPermissionPrompt Modal Component
 * 
 * Provides an explicit, user-friendly permission consent flow for retailers:
 * - Uses real browser GPS geolocation (navigator.geolocation.getCurrentPosition).
 * - Never synthesizes fake coordinates.
 * - Handles every state explicitly: NOT_REQUESTED, REQUESTING, GRANTED, DENIED, TIMEOUT, UNAVAILABLE.
 * - "Not Now" ALWAYS closes the modal immediately and is NEVER disabled.
 * - Location is strictly optional and never blocks normal application usage.
 */
export default function LocationPermissionPrompt({ retailerId, onComplete, onDismiss }) {
  const [status, setStatus] = useState(GEOLOCATION_STATUS.NOT_REQUESTED);
  const [errorMessage, setErrorMessage] = useState('');
  const [coordsAcquired, setCoordsAcquired] = useState(null);

  // Cancellation and unmount guard
  const isCancelledRef = useRef(false);
  const isMountedRef = useRef(true);

  // Check browser permission status on mount
  useEffect(() => {
    isMountedRef.current = true;
    isCancelledRef.current = false;

    checkGeolocationPermission().then((permState) => {
      if (!isMountedRef.current || isCancelledRef.current) return;
      if (permState === 'denied') {
        setStatus(GEOLOCATION_STATUS.DENIED);
        setErrorMessage(
          'Location permission is blocked in your browser. You can enable it in your browser address bar settings or click Not Now to continue.'
        );
      }
    });

    return () => {
      isMountedRef.current = false;
      isCancelledRef.current = true;
    };
  }, []);

  const handleRequestLocation = async () => {
    if (status === GEOLOCATION_STATUS.REQUESTING) return;

    setStatus(GEOLOCATION_STATUS.REQUESTING);
    setErrorMessage('');

    try {
      // 1. Request real device geolocation with timeout and fallback
      const coords = await requestBrowserGeolocation({
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 300000,
      });

      // If user clicked "Not Now" or unmounted while waiting, abort cleanly
      if (isCancelledRef.current || !isMountedRef.current) return;

      setCoordsAcquired(coords);

      // 2. Persist real coordinates if retailerId is present
      if (retailerId) {
        try {
          await saveRetailerLocation(retailerId, coords);
        } catch (dbErr) {
          console.warn('[LocationPrompt] Could not persist location to Firestore:', dbErr);
        }
      }

      if (isCancelledRef.current || !isMountedRef.current) return;

      setStatus(GEOLOCATION_STATUS.GRANTED);

      // Brief success feedback before closing
      setTimeout(() => {
        if (!isCancelledRef.current && isMountedRef.current && onComplete) {
          onComplete(coords);
        }
      }, 900);
    } catch (err) {
      if (isCancelledRef.current || !isMountedRef.current) return;
      console.warn('[LocationPrompt] Geolocation error:', err);

      const errCode = err.code || GEOLOCATION_STATUS.UNAVAILABLE;
      setStatus(errCode);

      if (errCode === GEOLOCATION_STATUS.DENIED) {
        setErrorMessage(
          'Location permission is blocked in your browser. You can enable it in your browser address bar settings.'
        );
      } else if (errCode === GEOLOCATION_STATUS.TIMEOUT) {
        setErrorMessage(
          'Location detection timed out. Please try again or continue without location.'
        );
      } else {
        setErrorMessage(
          err.message || "We couldn't determine your location right now. Check device location services."
        );
      }
    }
  };

  const handleDismiss = () => {
    // Flag cancellation so any in-flight GPS promise is ignored
    isCancelledRef.current = true;
    if (onDismiss) {
      onDismiss();
    }
  };

  const isRequesting = status === GEOLOCATION_STATUS.REQUESTING;
  const isGranted = status === GEOLOCATION_STATUS.GRANTED;
  const isDenied = status === GEOLOCATION_STATUS.DENIED;
  const isTimeout = status === GEOLOCATION_STATUS.TIMEOUT;
  const isUnavailable = status === GEOLOCATION_STATUS.UNAVAILABLE || status === GEOLOCATION_STATUS.NOT_SUPPORTED;
  const hasError = isDenied || isTimeout || isUnavailable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-center space-y-5 relative">
        
        {/* Quick Close Button in top right */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Close (Not Now)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Icon Indicator */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-sm transition-all ${
          isGranted
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
            : hasError
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
            : 'bg-emerald-800 text-white'
        }`}>
          {isGranted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          ) : isRequesting ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : hasError ? (
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          ) : (
            <MapPin className="w-6 h-6" />
          )}
        </div>

        {/* Headline & Guidance */}
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {isGranted
              ? 'Location detected ✓'
              : isDenied
              ? 'Location permission is blocked'
              : isTimeout
              ? 'Location detection timed out'
              : isUnavailable
              ? 'Could not detect your location'
              : 'Allow Samooh to access your location'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
            {isGranted
              ? `Accurate to ±${coordsAcquired?.accuracy || 15}m. Your store coordinates have been saved.`
              : isDenied
              ? 'Permission was denied or blocked in your browser. You can enable it in your browser address bar settings or continue without location.'
              : isTimeout
              ? 'Location detection took too long. You can retry with standard accuracy or continue without location.'
              : 'Your real store location enables collective purchasing power, accurate supplier driving distances, and pooled logistics.'}
          </p>
        </div>

        {/* Feature Highlights (when not granted and not in error) */}
        {!isGranted && !hasError && (
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

        {/* Error / Denial Guidance Alert Box */}
        {hasError && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs text-left flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">
                {isDenied ? 'Permission Blocked' : isTimeout ? 'Request Timed Out' : 'Detection Issue'}
              </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 space-y-2">
          {isGranted ? (
            <div className="py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Location verified! Redirecting to dashboard...</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Primary Action Button */}
              <button
                type="button"
                id="btn-allow-location"
                disabled={isRequesting}
                onClick={handleRequestLocation}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting GPS Location...</span>
                  </>
                ) : hasError ? (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>Retry Location</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Allow Location</span>
                  </>
                )}
              </button>

              {/* Not Now Button - MUST ALWAYS WORK AND NEVER BE DISABLED */}
              <button
                type="button"
                id="btn-not-now-location"
                onClick={handleDismiss}
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
              >
                Not Now
              </button>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
          <span>Location is optional. You can update or control sharing anytime in your store settings.</span>
        </div>
      </div>
    </div>
  );
}
