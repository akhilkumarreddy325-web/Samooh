import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MapPin, Navigation, Truck, Users, Clock, AlertCircle,
  Loader2, RefreshCw, ChevronRight, X, Filter, CheckCircle2,
  Phone, Store, ExternalLink
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useApp } from "../../context/AppContext";
import {
  buildOsmStyle,
  MAP_ATTRIBUTION,
  fetchDrivingRoute,
  getOSMDirectionsUrl
} from "../../services/mapService";
import { calculateHaversineDistanceKm } from "../../services/locationService";

const DEFAULT_CENTER = [78.4867, 17.3850]; // Hyderabad [lng, lat]

function fmtDist(km) {
  if (km == null) return "-";
  if (km < 1) return Math.round(km * 1000) + " m";
  return km.toFixed(1) + " km";
}
function fmtDuration(minutes) {
  if (!minutes) return "-";
  const m = Math.round(minutes);
  if (m < 60) return m + " min";
  return Math.floor(m / 60) + "h " + (m % 60) + "m";
}

// Supplier marker SVG (green warehouse pin)
function supplierMarkerEl() {
  const el = document.createElement("div");
  el.style.cssText = `
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:#065f46;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,.35);
    transform:rotate(-45deg);cursor:pointer;
  `;
  return el;
}

// Retailer marker SVG (blue circle)
function retailerMarkerEl(isSelected) {
  const el = document.createElement("div");
  el.style.cssText = `
    width:${isSelected ? 22 : 16}px;
    height:${isSelected ? 22 : 16}px;
    border-radius:50%;
    background:${isSelected ? "#1d4ed8" : "#3b82f6"};
    border:${isSelected ? "3px" : "2px"} solid #fff;
    box-shadow:0 1px 6px rgba(0,0,0,.3);
    cursor:pointer;
    transition:all .15s;
  `;
  return el;
}

const ROUTE_SOURCE_ID = "ors-route";
const ROUTE_LAYER_ID  = "ors-route-line";

export default function SupplierNearbyRetailers() {
  const { currentSupplier } = useApp();
  const supplierLocation = currentSupplier?.businessLocation;

  const [retailers, setRetailers]   = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [route, setRoute]           = useState(null);
  const [maxRadiusKm, setMaxRadiusKm] = useState(currentSupplier?.serviceRadiusKm || 50);

  const [isLoadingRetailers, setIsLoadingRetailers] = useState(true);
  const [isLoadingRoute, setIsLoadingRoute]         = useState(false);
  const [mapReady, setMapReady]                     = useState(false);
  const [mapError, setMapError]                     = useState("");
  const [fetchError, setFetchError]                 = useState("");
  const [routeError, setRouteError]                 = useState("");
  const [supplierLocationMissing, setSupplierLocationMissing] = useState(false);

  const mapContainerRef  = useRef(null);
  const mapRef           = useRef(null);
  const supplierMarkerRef = useRef(null);
  const retailerMarkersRef = useRef({});  // { retailerId: maplibregl.Marker }
  const popupRef         = useRef(null);

  // 1. Initialise MapLibre map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const center = supplierLocation
      ? [supplierLocation.longitude, supplierLocation.latitude]
      : DEFAULT_CENTER;

    let map;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: buildOsmStyle(),
        center,
        zoom: 12,
        attributionControl: false,
      });
    } catch (err) {
      setMapError("Map failed to initialise: " + (err.message || "Unknown error."));
      return;
    }

    // Custom attribution control respecting OSM requirements
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    popupRef.current = new maplibregl.Popup({ closeButton: false, maxWidth: "260px" });

    map.on("load", () => {
      // Supplier marker
      if (supplierLocation) {
        const el = supplierMarkerEl();
        supplierMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([supplierLocation.longitude, supplierLocation.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 20 }).setHTML(
              "<strong>" + (currentSupplier?.name || "Your Warehouse") + "</strong>" +
              "<br/><span style='color:#6b7280;font-size:11px'>" +
              (supplierLocation.formattedAddress || supplierLocation.address || "") + "</span>"
            )
          )
          .addTo(map);
      }

      // Route source + layer (empty until a route is fetched)
      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#1d4ed8", "line-width": 4, "line-opacity": 0.85 },
      });

      setMapReady(true);
    });

    map.on("error", (e) => {
      console.error("[Samooh Map]", e);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Fetch retailers from Firestore
  const fetchRetailers = useCallback(async () => {
    setIsLoadingRetailers(true);
    setFetchError("");
    try {
      const q = query(
        collection(db, "retailers"),
        where("locationSharing.sharingEnabled", "==", true)
      );
      const snap = await getDocs(q);
      const data = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setRetailers(data);
    } catch (err) {
      setFetchError(err.message || "Failed to load retailers.");
    } finally {
      setIsLoadingRetailers(false);
    }
  }, []);
  useEffect(() => { fetchRetailers(); }, [fetchRetailers]);

  // 3. Filter by Haversine radius
  useEffect(() => {
    if (!supplierLocation?.latitude || !supplierLocation?.longitude) {
      setSupplierLocationMissing(true);
      setFiltered(retailers.filter((r) => r.locationSharing?.latitude).map((r) => ({ ...r, _distKm: null })));
      return;
    }
    setSupplierLocationMissing(false);
    const withDist = retailers
      .map((r) => {
        const loc = r.locationSharing;
        if (!loc?.latitude || !loc?.longitude) return null;
        const dist = calculateHaversineDistanceKm(
          supplierLocation.latitude, supplierLocation.longitude,
          loc.latitude, loc.longitude
        );
        return { ...r, _distKm: dist };
      })
      .filter(Boolean)
      .filter((r) => r._distKm <= maxRadiusKm)
      .sort((a, b) => a._distKm - b._distKm);
    setFiltered(withDist);
  }, [retailers, supplierLocation, maxRadiusKm]);

  // 4. Sync retailer markers when filtered list / selection changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Remove old markers no longer in filtered list
    const filteredIds = new Set(filtered.map((r) => r.id));
    Object.entries(retailerMarkersRef.current).forEach(([id, marker]) => {
      if (!filteredIds.has(id)) { marker.remove(); delete retailerMarkersRef.current[id]; }
    });

    // Add / update markers
    filtered.forEach((retailer) => {
      const loc = retailer.locationSharing;
      if (!loc?.latitude || !loc?.longitude) return;
      const isSelected = selected?.id === retailer.id;

      if (retailerMarkersRef.current[retailer.id]) {
        // Update element style for selection state
        const el = retailerMarkersRef.current[retailer.id].getElement();
        el.style.width  = isSelected ? "22px" : "16px";
        el.style.height = isSelected ? "22px" : "16px";
        el.style.background = isSelected ? "#1d4ed8" : "#3b82f6";
        el.style.border = isSelected ? "3px solid #fff" : "2px solid #fff";
        return;
      }

      const el = retailerMarkerEl(isSelected);
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([loc.longitude, loc.latitude])
        .addTo(map);

      el.addEventListener("click", () => selectRetailer(retailer));
      retailerMarkersRef.current[retailer.id] = marker;
    });
  }, [filtered, mapReady, selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 5. Draw route on map
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const src = map.getSource(ROUTE_SOURCE_ID);
    if (!src) return;

    if (!route?.geometry) {
      src.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    // Directly set the ORS GeoJSON LineString geometry as a Feature
    src.setData({
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: route.geometry, properties: {} }],
    });

    // Fit bounds to route
    if (route.geojson?.bbox) {
      const [minLng, minLat, maxLng, maxLat] = route.geojson.bbox;
      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60 });
    }
  }, [route, mapReady]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const selectRetailer = useCallback((retailer) => {
    setSelected(retailer);
    setRoute(null);
    setRouteError("");
    const loc = retailer.locationSharing;
    if (mapRef.current && loc?.latitude) {
      mapRef.current.flyTo({ center: [loc.longitude, loc.latitude], zoom: 14 });
    }
  }, []);

  const handleGetRoute = useCallback(async () => {
    if (!selected || !supplierLocation) return;
    setIsLoadingRoute(true);
    setRouteError("");
    setRoute(null);
    try {
      const result = await fetchDrivingRoute(
        { latitude: supplierLocation.latitude, longitude: supplierLocation.longitude },
        { latitude: selected.locationSharing.latitude, longitude: selected.locationSharing.longitude }
      );
      setRoute(result);
    } catch (err) {
      setRouteError(err.message || "Could not calculate route.");
    } finally {
      setIsLoadingRoute(false);
    }
  }, [selected, supplierLocation]);

  const handleClearSelection = useCallback(() => {
    setSelected(null);
    setRoute(null);
    setRouteError("");
    if (mapRef.current && supplierLocation) {
      mapRef.current.flyTo({ center: [supplierLocation.longitude, supplierLocation.latitude], zoom: 12 });
    }
  }, [supplierLocation]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              Nearby Retailers
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Retailers who have enabled location sharing — real GPS, real roads
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radius:</span>
              <select
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {[10, 25, 50, 75, 100, 150, 200].map((v) => (
                  <option key={v} value={v}>{v} km</option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchRetailers}
              disabled={isLoadingRetailers}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 transition"
              title="Refresh"
            >
              <RefreshCw className={"w-3.5 h-3.5 " + (isLoadingRetailers ? "animate-spin" : "")} />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {supplierLocationMissing && (
        <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Your warehouse location has not been geocoded yet.
            Go to <Link to="/supplier/profile" className="font-semibold underline hover:text-amber-950 dark:hover:text-amber-200">Supplier Profile → Warehouse Business Location</Link> and click "Verify &amp; Geocode Location".
          </span>
        </div>
      )}
      {fetchError && (
        <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 flex items-start gap-2 text-xs text-red-700 dark:text-red-300 flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{fetchError}</span>
        </div>
      )}
      {mapError && (
        <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 flex items-start gap-2 text-xs text-red-700 dark:text-red-300 flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{mapError}</span>
        </div>
      )}

      {/* Split layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-white dark:bg-slate-900">
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {isLoadingRetailers ? "Loading..." : filtered.length + " retailer" + (filtered.length !== 1 ? "s" : "") + " found"}
            </span>
          </div>

          {isLoadingRetailers ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
              <p className="text-xs">Loading retailers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 px-6 text-center">
              <Users className="w-8 h-8 opacity-40" />
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No retailers with shared locations</p>
                <p className="text-xs mt-1 text-slate-400">
                  {supplierLocationMissing
                    ? "Geocode your warehouse to enable distance filtering."
                    : "No retailers have enabled location sharing within " + maxRadiusKm + " km. Try increasing the radius."}
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((retailer) => {
                const isActive = selected?.id === retailer.id;
                const loc = retailer.locationSharing;
                return (
                  <li key={retailer.id}>
                    <button
                      onClick={() => selectRetailer(retailer)}
                      className={"w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 " + (isActive ? "bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-600" : "")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className={"text-xs font-semibold truncate " + (isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200")}>
                            {retailer.storeName || retailer.name || "Retailer"}
                          </p>
                          {(retailer.address || loc?.formattedAddress) && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                              {retailer.address || loc.formattedAddress}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            {retailer._distKm != null && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                <Navigation className="w-2.5 h-2.5" />
                                {fmtDist(retailer._distKm)} straight line
                              </span>
                            )}
                            {retailer.phone && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                                <Phone className="w-2.5 h-2.5" />
                                {retailer.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className={"w-3.5 h-3.5 flex-shrink-0 mt-1 " + (isActive ? "text-blue-500" : "text-slate-300 dark:text-slate-600")} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Map + Detail */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Map container */}
          <div className="relative flex-1 min-h-[300px]">
            {!mapReady && !mapError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                  <p className="text-xs">Loading map...</p>
                </div>
              </div>
            )}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Selected retailer detail panel */}
          {selected && (
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 max-h-60 overflow-y-auto">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-blue-600" />
                    {selected.storeName || selected.name || "Retailer"}
                  </h2>
                  {selected.address && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selected.address}</p>
                  )}
                </div>
                <button onClick={handleClearSelection} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 ml-2 flex-shrink-0 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selected._distKm != null && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    <Navigation className="w-3 h-3 text-slate-400" />
                    {fmtDist(selected._distKm)} straight line
                  </span>
                )}
                {route && (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md font-medium">
                      <Truck className="w-3 h-3" />
                      {fmtDist(route.distanceKm)} driving
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md font-medium">
                      <Clock className="w-3 h-3" />
                      {fmtDuration(route.durationMinutes)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Real road route via OpenRouteService
                    </span>
                  </>
                )}
              </div>

              {routeError && (
                <div className="p-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{routeError}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 items-center">
                {!route ? (
                  <button
                    onClick={handleGetRoute}
                    disabled={isLoadingRoute || !supplierLocation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium transition shadow-sm disabled:opacity-60"
                  >
                    {isLoadingRoute ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                    {isLoadingRoute ? "Calculating..." : "Get Driving Route"}
                  </button>
                ) : (
                  <button
                    onClick={handleGetRoute}
                    disabled={isLoadingRoute}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Recalculate
                  </button>
                )}
                {selected?.locationSharing?.latitude && supplierLocation && (
                  <a
                    href={getOSMDirectionsUrl(
                      { latitude: supplierLocation.latitude, longitude: supplierLocation.longitude },
                      { latitude: selected.locationSharing.latitude, longitude: selected.locationSharing.longitude }
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Directions
                  </a>
                )}
                {!supplierLocation && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 self-center">
                    Geocode your warehouse first to enable routing.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 sm:px-6 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 flex flex-wrap items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-800 border-2 border-white shadow-sm" />
          Your Warehouse
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
          Retailer (real GPS)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-8 h-0.5 bg-blue-600 rounded" />
          Driving route (ORS)
        </span>
        <span className="ml-auto opacity-75"
          dangerouslySetInnerHTML={{ __html: "\u00a9 <a href='https://www.openstreetmap.org/copyright' target='_blank' rel='noopener' class='underline'>OpenStreetMap</a> contributors" }}
        />
      </div>
    </div>
  );
}