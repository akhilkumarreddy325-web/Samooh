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
 * Requests the device's real GPS coordinates via the browser Geolocation API.
 * Never generates or simulates fake coordinates.
 * 
 * @param {Object} options 
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, timestamp: number }>}
 */
export function requestBrowserGeolocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 12000,
    maximumAge = 0
  } = options;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const err = new Error('Browser does not support device geolocation.');
      err.code = GEOLOCATION_STATUS.NOT_SUPPORTED;
      return reject(err);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 0),
          timestamp: position.timestamp || Date.now()
        };
        resolve(coords);
      },
      (error) => {
        let statusCode = GEOLOCATION_STATUS.UNAVAILABLE;
        let userMessage = 'Unable to acquire your device location.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            statusCode = GEOLOCATION_STATUS.DENIED;
            userMessage = 'Location access was denied. You can enable location permission in your browser or device settings and click Try Again.';
            break;
          case error.POSITION_UNAVAILABLE:
            statusCode = GEOLOCATION_STATUS.UNAVAILABLE;
            userMessage = 'GPS signal or location service is currently unavailable. Please verify device location services are turned on.';
            break;
          case error.TIMEOUT:
            statusCode = GEOLOCATION_STATUS.TIMEOUT;
            userMessage = 'Location request timed out. Please check your network and GPS connection and retry.';
            break;
          default:
            statusCode = GEOLOCATION_STATUS.UNAVAILABLE;
            userMessage = error.message || 'An unexpected error occurred while obtaining your location.';
            break;
        }

        const err = new Error(userMessage);
        err.code = statusCode;
        err.rawCode = error.code;
        reject(err);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );
  });
}

/**
 * Saves or updates verified GPS location to the retailer's Firestore profile.
 * 
 * @param {string} retailerId 
 * @param {Object} locationData 
 * @returns {Promise<Object>}
 */
export async function saveRetailerLocation(retailerId, locationData) {
  if (!retailerId) throw new Error('Retailer ID is required to save location.');

  const nowIso = new Date().toISOString();
  const locationPayload = {
    latitude: Number(locationData.latitude),
    longitude: Number(locationData.longitude),
    accuracy: Number(locationData.accuracy || 0),
    updatedAt: nowIso,
    permissionGranted: true,
    sharingEnabled: true,
    source: 'device_gps'
  };

  const ref = doc(db, 'retailers', retailerId);
  await updateDoc(ref, {
    location: locationPayload,
    updated_at: nowIso
  });

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
