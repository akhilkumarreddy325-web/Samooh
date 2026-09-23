/**
 * Location Service for Samooh
 * 
 * Provides:
 * 1. Device GPS Geolocation using navigator.geolocation.getCurrentPosition
 * 2. Complete error state classification and human-friendly troubleshooting advice
 * 3. Firestore persistence for retailers' coordinates, accuracy, and sharing state
 * 4. High-precision Haversine straight-line distance calculation
 * 5. Freshness indicators for stale locations
 */

import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Geolocation error state codes
 */
export const GEOLOCATION_STATUS = {
  NOT_REQUESTED: 'NOT_REQUESTED',
  REQUESTING: 'REQUESTING',
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  UNAVAILABLE: 'UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  NOT_SUPPORTED: 'NOT_SUPPORTED'
};

/**
 * Checks browser permission state for geolocation where supported.
 * @returns {Promise<'granted'|'prompt'|'denied'|'unknown'>}
 */
export async function checkGeolocationPermission() {
  if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return 'unknown';
  }
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch (_) {
    return 'unknown';
  }
}

/**
 * Core helper that wraps a single getCurrentPosition call with a hard JS timeout.
 */
function queryPositionOnce(options, hardTimeoutMs) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const err = new Error('Browser does not support device geolocation.');
      err.code = GEOLOCATION_STATUS.NOT_SUPPORTED;
      return reject(err);
    }

    let isSettled = false;
    const timer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      const err = new Error('Location detection timed out. Please try again or continue without location.');
      err.code = GEOLOCATION_STATUS.TIMEOUT;
      reject(err);
    }, hardTimeoutMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 0),
          timestamp: position.timestamp || Date.now()
        });
      },
      (error) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);

        let statusCode = GEOLOCATION_STATUS.UNAVAILABLE;
        let userMessage = "We couldn't determine your location right now.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            statusCode = GEOLOCATION_STATUS.DENIED;
            userMessage = 'Location access was denied. You can enable it later from your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            statusCode = GEOLOCATION_STATUS.UNAVAILABLE;
            userMessage = "We couldn't determine your location right now. Check device location services.";
            break;
          case error.TIMEOUT:
            statusCode = GEOLOCATION_STATUS.TIMEOUT;
            userMessage = 'Location detection timed out. Please try again or continue without location.';
            break;
          default:
            statusCode = GEOLOCATION_STATUS.UNAVAILABLE;
            userMessage = error.message || "We couldn't determine your location right now.";
            break;
        }

        const err = new Error(userMessage);
        err.code = statusCode;
        err.rawCode = error.code;
        reject(err);
      },
      options
    );
  });
}

/**
 * Requests the device's real GPS coordinates via the browser Geolocation API.
 * Never generates or simulates fake coordinates.
 * Includes hard timeout protection and graceful fallback from high to standard accuracy.
 *
 * @param {Object} options 
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, timestamp: number }>}
 */
export async function requestBrowserGeolocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000
  } = options;

  // Check secure context (HTTPS or localhost)
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    const err = new Error('Geolocation requires a secure connection (HTTPS).');
    err.code = GEOLOCATION_STATUS.UNAVAILABLE;
    throw err;
  }

  // Attempt 1: with requested options (default high accuracy)
  try {
    return await queryPositionOnce(
      { enableHighAccuracy, timeout, maximumAge },
      timeout + 1500 // JS safety timer slightly beyond browser timeout
    );
  } catch (err) {
    // If high accuracy timed out or was position unavailable, retry once with enableHighAccuracy: false
    if (enableHighAccuracy && (err.code === GEOLOCATION_STATUS.TIMEOUT || err.code === GEOLOCATION_STATUS.UNAVAILABLE)) {
      console.info('[LocationService] High accuracy GPS timed out or unavailable, gracefully falling back to standard accuracy...');
      try {
        return await queryPositionOnce(
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 },
          7500
        );
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw err;
  }
}

/**
 * Saves or updates verified GPS location to the retailer's Firestore profile.
 * Does NOT force location sharing to true automatically; respects user's explicit preference.
 * 
 * @param {string} retailerId 
 * @param {Object} locationData 
 * @param {boolean|null} sharingEnabled
 * @returns {Promise<Object>}
 */
export async function saveRetailerLocation(retailerId, locationData, sharingEnabled = null) {
  if (!retailerId) throw new Error('Retailer ID is required to save location.');

  const nowIso = new Date().toISOString();

  // If sharingEnabled is explicitly passed, use it. Otherwise keep existing state or default to false.
  let shouldShare = false;
  if (typeof sharingEnabled === 'boolean') {
    shouldShare = sharingEnabled;
  } else {
    try {
      const snap = await getDoc(doc(db, 'retailers', retailerId));
      if (snap.exists()) {
        const existingLoc = snap.data()?.location || snap.data()?.locationSharing;
        if (typeof existingLoc?.sharingEnabled === 'boolean') {
          shouldShare = existingLoc.sharingEnabled;
        }
      }
    } catch (_) {}
  }

  const locationPayload = {
    latitude: Number(locationData.latitude),
    longitude: Number(locationData.longitude),
    accuracy: Number(locationData.accuracy || 0),
    updatedAt: nowIso,
    permissionGranted: true,
    sharingEnabled: shouldShare,
    source: 'device_gps'
  };

  const ref = doc(db, 'retailers', retailerId);
  await setDoc(ref, {
    location: locationPayload,
    updated_at: nowIso
  }, { merge: true });

  return locationPayload;
}

/**
 * Toggles location sharing for a retailer without deleting historical records or store data.
 * 
 * @param {string} retailerId 
 * @param {boolean} sharingEnabled 
 * @returns {Promise<boolean>}
 */
export async function setRetailerLocationSharing(retailerId, sharingEnabled) {
  if (!retailerId) throw new Error('Retailer ID is required.');

  const nowIso = new Date().toISOString();
  const ref = doc(db, 'retailers', retailerId);

  await updateDoc(ref, {
    'location.sharingEnabled': Boolean(sharingEnabled),
    updated_at: nowIso
  });

  return Boolean(sharingEnabled);
}

/**
 * Retrieves the retailer document and its current location status.
 * 
 * @param {string} retailerId 
 * @returns {Promise<Object|null>}
 */
export async function getRetailerLocation(retailerId) {
  if (!retailerId) return null;
  try {
    const snap = await getDoc(doc(db, 'retailers', retailerId));
    if (snap.exists()) {
      return snap.data()?.location || null;
    }
    return null;
  } catch (err) {
    console.warn(`[LocationService] Error fetching retailer location for ${retailerId}:`, err);
    return null;
  }
}

/**
 * Calculates high-precision Haversine straight-line distance between two geographic coordinates in kilometers.
 * 
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} distance in kilometers rounded to 1 decimal place
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
    return 0;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = (nLat2 - nLat1) * (Math.PI / 180);
  const dLon = (nLon2 - nLon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nLat1 * (Math.PI / 180)) *
    Math.cos(nLat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
}

/**
 * Formats a location timestamp into a friendly, freshness-aware string.
 * Detects stale coordinates and provides guidance.
 * 
 * @param {string|number|Date} timestamp 
 * @returns {{ text: string, isStale: boolean, daysAgo: number }}
 */
export function formatLocationFreshness(timestamp) {
  if (!timestamp) {
    return { text: 'Never updated', isStale: true, daysAgo: 999 };
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;

  if (isNaN(diffMs) || diffMs < 0) {
    return { text: 'Just now', isStale: false, daysAgo: 0 };
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return { text: 'Just now', isStale: false, daysAgo: 0 };
  }
  if (diffMinutes < 60) {
    return { text: `${diffMinutes}m ago`, isStale: false, daysAgo: 0 };
  }
  if (diffHours < 24) {
    return { text: `${diffHours}h ago`, isStale: false, daysAgo: 0 };
  }
  if (diffDays === 1) {
    return { text: 'Yesterday', isStale: false, daysAgo: 1 };
  }

  const isStale = diffDays >= 7;
  return {
    text: `${diffDays} days ago`,
    isStale,
    daysAgo: diffDays
  };
}
