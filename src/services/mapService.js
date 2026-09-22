/**
 * Map & Routing Service for Samooh
 *
 * Provider stack — zero Google Maps dependency:
 *   Map renderer  : MapLibre GL JS (imported by components, not this service)
 *   Map tiles     : OpenStreetMap public raster tiles (centralised via buildOsmStyle)
 *   Geocoding     : Nominatim (openstreetmap.org) — user-triggered only, results cached in Firestore
 *   Routing       : OpenRouteService v2 POST /directions/driving-car/geojson
 *   Directions    : OSM-based external link
 *
 * Attribution required on every map view:
 *   © OpenStreetMap contributors
 */

import { calculateHaversineDistanceKm } from './locationService';

// ── Centralised map configuration ──────────────────────────────────────────────
// To swap the tile provider, change the tiles array here only.
export const MAP_ATTRIBUTION =
  '\u00a9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>';

/**
 * Returns a MapLibre GL-compatible style object backed by OSM raster tiles.
 * Pass the return value directly as the `style` option when constructing a Map.
 */
export function buildOsmStyle() {
  return {
    version: 8,
    // Glyphs needed for text labels if added later
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: MAP_ATTRIBUTION,
        maxzoom: 19,
      },
    },
    layers: [
      { id: 'osm-tiles', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 20 },
    ],
  };
}

// ── In-memory route cache ──────────────────────────────────────────────────────
const routeCache = new Map();

// ── Geocoding via Nominatim ────────────────────────────────────────────────────

/**
 * Converts a business/warehouse address string to real coordinates using Nominatim.
 *
 * Usage policy respected:
 *  - Only called on explicit user action (not automatic/bulk)
 *  - User-Agent header identifies this application
 *  - India-biased search (countrycodes=in)
 *  - Caller persists result to Firestore to avoid repeated geocoding
 *
 * @param {string} addressString
 * @returns {Promise<{ latitude: number, longitude: number, formattedAddress: string }>}
 */
export async function geocodeAddress(addressString) {
  if (!addressString || !addressString.trim()) {
    throw new Error('Address is required for geocoding.');
  }

  const params = new URLSearchParams({
    q: addressString.trim(),
    format: 'json',
    limit: '1',
    countrycodes: 'in',
    addressdetails: '0',
  });

  let response;
  try {
    response = await fetch(
      'https://nominatim.openstreetmap.org/search?' + params.toString(),
      {
        headers: {
          'User-Agent': 'Samooh-B2B-Procurement/1.0 (hackathon prototype; contact: admin@samooh.in)',
          Accept: 'application/json',
        },
      }
    );
  } catch (_) {
    throw new Error('Geocoding request failed. Check your internet connection and try again.');
  }

  if (!response.ok) {
    throw new Error('Nominatim geocoding error (HTTP ' + response.status + '). Please try again.');
  }

  let results;
  try { results = await response.json(); } catch (_) {
    throw new Error('Geocoding returned an unexpected response format.');
  }

  if (!results || results.length === 0) {
    throw new Error(
      'No coordinates found for "' + addressString + '". Verify the street, area, or pincode.'
    );
  }

  const top = results[0];
  const latitude = parseFloat(top.lat);
  const longitude = parseFloat(top.lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Geocoding returned invalid coordinates. Please check the address.');
  }

  return {
    latitude,
    longitude,
    formattedAddress: top.display_name || addressString,
  };
}

// ── Routing via OpenRouteService v2 ───────────────────────────────────────────

/**
 * Returns the ORS API key from the Vite environment.
 * @returns {string|null}
 */
export function getOrsApiKey() {
  return import.meta.env.VITE_OPENROUTESERVICE_API_KEY || null;
}

/**
 * Fetches a real driving route from OpenRouteService v2.
 *
 * API endpoint: POST https://api.openrouteservice.org/v2/directions/driving-car/geojson
 * Returns RFC 7946 GeoJSON FeatureCollection with a LineString geometry.
 * The geometry is used directly as a MapLibre GeoJSON source for the line-layer.
 *
 * Routes are cached in memory by coordinate pair to minimise API calls.
 * Cache is invalidated via clearRouteCache() when coordinates change.
 *
 * @param {{ latitude: number, longitude: number }} origin
 * @param {{ latitude: number, longitude: number }} destination
 * @returns {Promise<{
 *   distanceKm: number,
 *   durationMinutes: number,
 *   geojson: Object,
 *   geometry: Object,
 *   isRealRoute: boolean,
 *   directionsUrl: string,
 *   summary: string,
 * }>}
 */
export async function fetchDrivingRoute(origin, destination) {
  if (
    !origin?.latitude || !origin?.longitude ||
    !destination?.latitude || !destination?.longitude
  ) {
    throw new Error('Valid origin and destination coordinates are required for routing.');
  }

  const cacheKey =
    origin.latitude.toFixed(5) + ',' + origin.longitude.toFixed(5) +
    '->' +
    destination.latitude.toFixed(5) + ',' + destination.longitude.toFixed(5);

  if (routeCache.has(cacheKey)) return routeCache.get(cacheKey);

  const apiKey = getOrsApiKey();
  if (!apiKey) {
    throw new Error(
      'MISSING_ORS_KEY: Add VITE_OPENROUTESERVICE_API_KEY to .env.local. ' +
      'Get a free key at https://openrouteservice.org/dev/'
    );
  }

  // ORS expects [longitude, latitude] — GeoJSON coordinate order
  const body = {
    coordinates: [
      [origin.longitude, origin.latitude],
      [destination.longitude, destination.latitude],
    ],
  };

  let response;
  try {
    response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
          Accept: 'application/geo+json',
        },
        body: JSON.stringify(body),
      }
    );
  } catch (_) {
    throw new Error('Could not reach OpenRouteService. Check your internet connection.');
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      'OpenRouteService API key is invalid or unauthorized. Check VITE_OPENROUTESERVICE_API_KEY.'
    );
  }
  if (response.status === 429) {
    throw new Error('OpenRouteService rate limit reached. Please wait a moment and try again.');
  }
  if (!response.ok) {
    let detail = '';
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message || errBody?.message || '';
    } catch (_) {}
    throw new Error(
      'Routing API error (HTTP ' + response.status + ')' + (detail ? ': ' + detail : '') + '.'
    );
  }

  let geojson;
  try { geojson = await response.json(); } catch (_) {
    throw new Error('Routing service returned an unexpected response format.');
  }

  const feature = geojson?.features?.[0];
  if (!feature) throw new Error('No route found between these two locations.');

  const summary = feature.properties?.summary;
  if (!summary) throw new Error('Route response is missing distance/duration summary.');

  const distanceKm = Math.round((summary.distance / 1000) * 10) / 10;
  const durationMinutes = Math.round(summary.duration / 60);

  const result = {
    distanceKm,
    durationMinutes,
    geojson,
    geometry: feature.geometry, // GeoJSON LineString — add directly to MapLibre source
    isRealRoute: true,
    directionsUrl: getOSMDirectionsUrl(origin, destination),
    summary: distanceKm + ' km \u00b7 ' + durationMinutes + ' min',
  };

  routeCache.set(cacheKey, result);
  return result;
}

// ── External directions URL ────────────────────────────────────────────────────

/**
 * Returns an OpenStreetMap-based directions URL using OSRM routing.
 *
 * @param {{ latitude: number, longitude: number }} origin
 * @param {{ latitude: number, longitude: number }} destination
 * @returns {string}
 */
export function getOSMDirectionsUrl(origin, destination) {
  return (
    'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car' +
    '&route=' + origin.latitude + ',' + origin.longitude +
    ';' + destination.latitude + ',' + destination.longitude
  );
}

/**
 * Clears the in-memory route cache.
 * Call when supplier or retailer coordinates change significantly.
 */
export function clearRouteCache() {
  routeCache.clear();
}
