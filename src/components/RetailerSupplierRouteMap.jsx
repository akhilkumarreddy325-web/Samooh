import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Store, Building2, Navigation, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { buildOsmStyle, fetchDrivingRoute, getOSMDirectionsUrl } from '../services/mapService';
import { calculateHaversineDistanceKm } from '../services/locationService';
import { SAMPLE_WAREHOUSE } from '../data/sampleNetworkLocations';

/**
 * Extracts validated retailer shop coordinates with priority:
 * 1. Real saved businessLocation coordinates (from onboarding/profile)
 * 2. Location object coordinates
 */
export function getRetailerShopCoords(retailer, userProfile) {
  const bLoc = userProfile?.businessLocation || retailer?.businessLocation;
  if (
    bLoc?.latitude != null && bLoc?.longitude != null &&
    !isNaN(Number(bLoc.latitude)) && !isNaN(Number(bLoc.longitude))
  ) {
    return {
      latitude: Number(bLoc.latitude),
      longitude: Number(bLoc.longitude),
      name: retailer?.storeName || retailer?.name || userProfile?.storeName || 'Your Shop',
      area: bLoc.area || bLoc.city || retailer?.city || 'Shop Location',
      address: bLoc.address || retailer?.address || ''
    };
  }

  const loc = userProfile?.location || retailer?.location;
  if (
    loc?.latitude != null && loc?.longitude != null &&
    !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude))
  ) {
    return {
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      name: retailer?.storeName || retailer?.name || userProfile?.storeName || 'Your Shop',
      area: retailer?.city || retailer?.area || 'Shop Location',
      address: retailer?.address || ''
    };
  }

  return null;
}

/**
 * Extracts validated supplier warehouse coordinates with priority:
 * 1. Real saved businessLocation coordinates
 * 2. Supplier location coordinates
 * 3. Canonical warehouse location fallback
 */
export function getSupplierWarehouseCoords(supplier) {
  if (!supplier) return null;

  const bLoc = supplier.businessLocation;
  if (
    bLoc?.latitude != null && bLoc?.longitude != null &&
    !isNaN(Number(bLoc.latitude)) && !isNaN(Number(bLoc.longitude))
  ) {
    return {
      latitude: Number(bLoc.latitude),
      longitude: Number(bLoc.longitude),
      name: supplier.name || supplier.businessName || 'Supplier Warehouse',
      area: bLoc.locality || bLoc.city || supplier.city || 'Warehouse Hub',
      address: bLoc.address || supplier.address || ''
    };
  }

  if (
    supplier.latitude != null && supplier.longitude != null &&
    !isNaN(Number(supplier.latitude)) && !isNaN(Number(supplier.longitude))
  ) {
    return {
      latitude: Number(supplier.latitude),
      longitude: Number(supplier.longitude),
      name: supplier.name || supplier.businessName || 'Supplier Warehouse',
      area: supplier.location || supplier.city || 'Warehouse Hub',
      address: supplier.address || ''
    };
  }

  // If supplier matches default warehouse cluster or has no explicit coords,
  // anchor to the canonical Medchal wholesale distribution centre
  if (SAMPLE_WAREHOUSE?.latitude != null && SAMPLE_WAREHOUSE?.longitude != null) {
    return {
      latitude: SAMPLE_WAREHOUSE.latitude,
      longitude: SAMPLE_WAREHOUSE.longitude,
      name: supplier.name || SAMPLE_WAREHOUSE.name,
      area: SAMPLE_WAREHOUSE.locality,
      address: SAMPLE_WAREHOUSE.address
    };
  }

  return null;
}

export default function RetailerSupplierRouteMap({
  retailer = null,
  userProfile = null,
  supplier = null,
  height = '280px',
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const isMapLoadedRef = useRef(false);

  // Markers stored in refs to avoid recreation
  const retailerMarkerRef = useRef(null);
  const supplierMarkerRef = useRef(null);

  // Stale request guard & abort controller
  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const fittedRouteKeyRef = useRef('');

  // Routing state
  const [routeStatus, setRouteStatus] = useState('idle'); // idle | loading | ready | failed | missing_coords
  const [routeInfo, setRouteInfo] = useState(null);
  const [straightLineKm, setStraightLineKm] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Resolved coordinates
  const origin = useMemo(() => getRetailerShopCoords(retailer, userProfile), [retailer, userProfile]);
  const destination = useMemo(() => getSupplierWarehouseCoords(supplier), [supplier]);

  // 1. Initialize MapLibre GL instance ONCE
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialCenter = destination
      ? [destination.longitude, destination.latitude]
      : origin
      ? [origin.longitude, origin.latitude]
      : [78.4812, 17.6189]; // Medchal default

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: buildOsmStyle(),
        center: initialCenter,
        zoom: 11,
        bearing: 0,
        pitch: 0,
        attributionControl: false
      });

      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: true }), 'top-right');

      map.on('load', () => {
        isMapLoadedRef.current = true;

        // Initialize empty GeoJSON source for driving route
        if (!map.getSource('driving-route')) {
          map.addSource('driving-route', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });

          // Casing layer for contrast
          map.addLayer({
            id: 'driving-route-casing',
            type: 'line',
            source: 'driving-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1E3A8A',
              'line-width': 6,
              'line-opacity': 0.4
            }
          });

          // Main route line layer
          map.addLayer({
            id: 'driving-route-line',
            type: 'line',
            source: 'driving-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#2563EB',
              'line-width': 4,
              'line-opacity': 0.95
            }
          });
        }
      });

      mapRef.current = map;
    } catch (err) {
      console.warn('[RouteMap] MapLibre init error:', err);
    }

    // Container ResizeObserver to prevent cropped or distorted map
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        isMapLoadedRef.current = false;
      }
    };
  }, []);

  // 2. Update Markers when coordinates change (never recreate map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // A. Retailer Shop Marker
    if (origin) {
      if (!retailerMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'flex flex-col items-center cursor-pointer pointer-events-auto';
        el.innerHTML = `
          <div class="px-2 py-0.5 rounded shadow-md bg-emerald-700 text-white text-[10px] font-bold tracking-tight whitespace-nowrap border border-white">
            Your Shop
          </div>
          <div class="w-6 h-6 rounded-full bg-emerald-700 text-white border-2 border-white shadow-lg flex items-center justify-center -mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
          </div>
        `;
        retailerMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([origin.longitude, origin.latitude])
          .addTo(map);
      } else {
        retailerMarkerRef.current.setLngLat([origin.longitude, origin.latitude]);
      }
    } else if (retailerMarkerRef.current) {
      retailerMarkerRef.current.remove();
      retailerMarkerRef.current = null;
    }

    // B. Supplier Warehouse Marker
    if (destination) {
      if (!supplierMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'flex flex-col items-center cursor-pointer pointer-events-auto';
        el.innerHTML = `
          <div class="px-2 py-0.5 rounded shadow-md bg-blue-700 text-white text-[10px] font-bold tracking-tight whitespace-nowrap border border-white">
            Supplier Warehouse
          </div>
          <div class="w-6 h-6 rounded-full bg-blue-700 text-white border-2 border-white shadow-lg flex items-center justify-center -mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
          </div>
        `;
        supplierMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([destination.longitude, destination.latitude])
          .addTo(map);
      } else {
        supplierMarkerRef.current.setLngLat([destination.longitude, destination.latitude]);
      }
    } else if (supplierMarkerRef.current) {
      supplierMarkerRef.current.remove();
      supplierMarkerRef.current = null;
    }
  }, [origin, destination]);

  // 3. Fetch Road Route with Stale Request Protection
  useEffect(() => {
    if (!origin && !destination) {
      setRouteStatus('missing_coords');
      setErrorMessage('Shop and warehouse locations required to show route.');
      return;
    }
    if (!origin) {
      setRouteStatus('missing_coords');
      setErrorMessage('Shop location needs to be completed.');
      return;
    }
    if (!destination) {
      setRouteStatus('missing_coords');
      setErrorMessage('Supplier warehouse location unavailable.');
      return;
    }

    // Compute straight-line distance as baseline
    const straightDist = calculateHaversineDistanceKm(
      origin.latitude, origin.longitude,
      destination.latitude, destination.longitude
    );
    setStraightLineKm(straightDist);

    // Guard: increment request ID to cancel older in-flight results
    const requestId = ++activeRequestIdRef.current;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setRouteStatus('loading');
    setErrorMessage('');

    const routeKey = `${origin.latitude.toFixed(4)},${origin.longitude.toFixed(4)}->${destination.latitude.toFixed(4)},${destination.longitude.toFixed(4)}`;

    async function loadRoute() {
      try {
        const result = await fetchDrivingRoute(origin, destination, { signal: controller.signal });

        // Stale response guard
        if (activeRequestIdRef.current !== requestId) return;

        setRouteInfo(result);
        setRouteStatus('ready');

        // Apply route geometry to map source
        const map = mapRef.current;
        if (map) {
          const updateSource = () => {
            const src = map.getSource('driving-route');
            if (src) {
              src.setData({
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    geometry: result.geometry,
                    properties: {}
                  }
                ]
              });
            }

            // Fit camera once per route key
            if (fittedRouteKeyRef.current !== routeKey && result.geometry?.coordinates?.length) {
              const bounds = new maplibregl.LngLatBounds();
              result.geometry.coordinates.forEach(coord => {
                bounds.extend(coord);
              });

              map.fitBounds(bounds, {
                padding: { top: 45, bottom: 45, left: 45, right: 45 },
                maxZoom: 14,
                duration: 600,
                bearing: 0,
                pitch: 0
              });
              fittedRouteKeyRef.current = routeKey;
            }
          };

          if (map.isStyleLoaded()) {
            updateSource();
          } else {
            map.once('load', updateSource);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (activeRequestIdRef.current !== requestId) return;

        console.warn('[RouteMap] ORS routing fallback:', err.message);
        setRouteStatus('failed');
        setErrorMessage('Driving route unavailable');

        // Clear route geometry on failure
        const map = mapRef.current;
        if (map && map.getSource('driving-route')) {
          map.getSource('driving-route').setData({
            type: 'FeatureCollection',
            features: []
          });
        }

        // Fit bounds around origin & destination markers only
        if (map && fittedRouteKeyRef.current !== routeKey) {
          const bounds = new maplibregl.LngLatBounds();
          bounds.extend([origin.longitude, origin.latitude]);
          bounds.extend([destination.longitude, destination.latitude]);
          map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 13,
            duration: 500,
            bearing: 0,
            pitch: 0
          });
          fittedRouteKeyRef.current = routeKey;
        }
      }
    }

    loadRoute();

    return () => {
      controller.abort();
    };
  }, [origin, destination]);

  return (
    <div className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm flex flex-col ${className}`}>
      {/* Route Header Summary Bar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/75 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-3 text-xs">
          {/* Shop */}
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Your Shop</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 truncate block">
                {origin?.area || 'Shop Location'}
              </span>
            </div>
          </div>

          <div className="text-slate-400 font-bold text-sm px-1 select-none">→</div>

          {/* Supplier Warehouse */}
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Warehouse</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 truncate block">
                {destination?.area || destination?.name || 'Wholesale Hub'}
              </span>
            </div>
          </div>
        </div>

        {/* Distance & Time Pill */}
        <div className="flex items-center space-x-2">
          {routeStatus === 'loading' && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Calculating route…</span>
            </div>
          )}

          {routeStatus === 'ready' && routeInfo && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold">
              <Navigation className="w-3 h-3 text-emerald-700" />
              <span>{routeInfo.distanceKm} km · ~{routeInfo.durationMinutes} min</span>
            </div>
          )}

          {routeStatus === 'failed' && straightLineKm && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-xs font-medium" title="Driving route unavailable; straight-line distance shown">
              <span>Driving route unavailable (~{straightLineKm.toFixed(1)} km direct)</span>
            </div>
          )}

          {routeStatus === 'missing_coords' && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
              <AlertCircle className="w-3 h-3 text-slate-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* External directions link */}
          {origin && destination && (
            <a
              href={getOSMDirectionsUrl(origin, destination)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white transition flex-shrink-0"
              title="Open full directions in OpenStreetMap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Missing coords overlay if neither exists */}
        {routeStatus === 'missing_coords' && (
          <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-center p-4 text-center">
            <div className="max-w-xs space-y-1.5">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {errorMessage}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Complete your shop address and location during onboarding to view exact road delivery routes and transit times.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
