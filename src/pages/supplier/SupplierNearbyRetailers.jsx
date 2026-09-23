import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Navigation, Truck, Clock, AlertCircle,
  Loader2, RefreshCw, ChevronRight, X, Filter, CheckCircle2,
  Phone, Store, ExternalLink, Search, ArrowUpDown, Package,
  ShieldCheck, AlertTriangle, Warehouse
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useApp } from "../../context/AppContext";
import {
  buildOsmStyle,
  fetchDrivingRoute,
  getOSMDirectionsUrl
} from "../../services/mapService";
import { calculateHaversineDistanceKm } from "../../services/locationService";
import { getRecommendations } from "../../services/api";
import { SAMPLE_WAREHOUSE, SAMPLE_RETAIL_LOCATIONS } from "../../data/sampleNetworkLocations";

const ROUTE_SOURCE_ID = "ors-road-route-source";
const ROUTE_LAYER_CASING_ID = "ors-road-route-casing";
const ROUTE_LAYER_ID = "ors-road-route-line";

function fmtDist(km) {
  if (km == null || isNaN(km)) return "-";
  if (km < 1) return Math.round(km * 1000) + " m";
  return km.toFixed(1) + " km";
}

function fmtDuration(minutes) {
  if (!minutes || isNaN(minutes)) return "-";
  const m = Math.round(minutes);
  if (m < 60) return m + " min";
  return Math.floor(m / 60) + "h " + (m % 60) + "m";
}

/**
 * Creates distinct, professional Supplier Warehouse marker element
 */
function createSupplierMarkerEl() {
  const container = document.createElement("div");
  container.className = "samooh-supplier-marker-container";
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  `;

  const pin = document.createElement("div");
  pin.style.cssText = `
    width: 36px;
    height: 36px;
    border-radius: 50% 50% 50% 0;
    background: #065f46;
    border: 2.5px solid #ffffff;
    box-shadow: 0 4px 10px rgba(6, 95, 70, 0.4);
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const iconWrapper = document.createElement("div");
  iconWrapper.style.cssText = `
    transform: rotate(45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
  `;
  iconWrapper.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
      <path d="M6 18h12"/>
      <path d="M6 14h12"/>
      <rect width="4" height="6" x="10" y="16"/>
    </svg>
  `;

  pin.appendChild(iconWrapper);
  container.appendChild(pin);
  return container;
}

/**
 * Creates clean, professional Retailer Store marker element
 * Real store: emerald green
 * Network retail point: clean slate / blue
 * No glowing circles, no neon colors, no DEMO tags
 */
function createRetailerMarkerEl(isSelected, isRealStore = false) {
  const container = document.createElement("div");
  container.className = `samooh-retailer-marker-container ${isRealStore ? "real-retailer-marker" : "network-retailer-marker"}`;
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  `;

  const pin = document.createElement("div");
  const size = isSelected ? 32 : 24;

  let bg, border, shadow;
  if (isRealStore) {
    bg = isSelected ? "#047857" : "#059669";
    border = isSelected ? "2.5px solid #ffffff" : "2px solid #ffffff";
    shadow = isSelected ? "0 4px 10px rgba(4, 120, 87, 0.45)" : "0 2px 5px rgba(0, 0, 0, 0.25)";
  } else {
    bg = isSelected ? "#2563eb" : "#334155";
    border = isSelected ? "2.5px solid #ffffff" : "2px solid #ffffff";
    shadow = isSelected ? "0 4px 10px rgba(37, 99, 235, 0.45)" : "0 2px 5px rgba(0, 0, 0, 0.25)";
  }

  pin.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${bg};
    border: ${border};
    box-shadow: ${shadow};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease, background 0.15s ease;
  `;

  const icon = document.createElement("div");
  icon.style.cssText = `
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  icon.innerHTML = isSelected
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
        <path d="M2 7h20"/>
       </svg>`
    : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <path d="M2 7h20"/>
       </svg>`;

  pin.appendChild(icon);
  container.appendChild(pin);
  return container;
}

export default function SupplierNearbyRetailers() {
  const { currentSupplier, firebaseUser, userProfile } = useApp();

  // Distinguish real authenticated supplier from demo hackathon session
  const isRealSupplier = Boolean(
    firebaseUser &&
    (userProfile?.role === "supplier" || currentSupplier?.id === firebaseUser?.uid)
  );

  // Canonical Warehouse Determination
  // 1. Real supplier with saved location -> use their verified businessLocation
  // 2. Real supplier without saved location -> null (show requirement card, do not mask)
  // 3. Demo hackathon supplier -> canonical fixed Medchal Industrial Area warehouse
  const activeWarehouse = useMemo(() => {
    if (isRealSupplier) {
      const bl = currentSupplier?.businessLocation;
      if (
        bl?.latitude &&
        bl?.longitude &&
        !isNaN(Number(bl.latitude)) &&
        !isNaN(Number(bl.longitude))
      ) {
        return {
          id: currentSupplier?.id,
          name: currentSupplier?.name || "Your Warehouse",
          facilityType: "Supplier Warehouse",
          locality: bl.locality || bl.area || currentSupplier?.city || "Warehouse Location",
          city: bl.city || currentSupplier?.city || "Hyderabad",
          state: bl.state || "Telangana",
          address: bl.formattedAddress || bl.address || currentSupplier?.address || "Verified Logistics Hub",
          latitude: Number(bl.latitude),
          longitude: Number(bl.longitude),
          isDemo: false
        };
      }
      return null;
    }
    // Fixed canonical demo warehouse
    return SAMPLE_WAREHOUSE;
  }, [isRealSupplier, currentSupplier]);

  const hasSupplierCoords = Boolean(activeWarehouse);

  const [rawRetailers, setRawRetailers] = useState([]);
  const [, setActivePools] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);

  // Route state & Coordinate-pair caching
  const [activeRoute, setActiveRoute] = useState(null);
  const [routesCache, setRoutesCache] = useState({}); // { [retailerId]: routeResult }
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState("");

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [maxRadiusKm, setMaxRadiusKm] = useState(60);
  const [sortBy, setSortBy] = useState("geo_distance"); // geo_distance | road_distance | driving_time | demand

  // Status flags
  const [isLoadingRetailers, setIsLoadingRetailers] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const supplierMarkerRef = useRef(null);
  const retailerMarkersRef = useRef({}); // { [retailerId]: maplibregl.Marker }

  // 1. Initialise MapLibre Map with deterministic initial center
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialCenter = activeWarehouse
      ? [Number(activeWarehouse.longitude), Number(activeWarehouse.latitude)]
      : [SAMPLE_WAREHOUSE.longitude, SAMPLE_WAREHOUSE.latitude];

    let map;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: buildOsmStyle(),
        center: initialCenter,
        zoom: 11.5,
        attributionControl: false,
      });
    } catch (err) {
      setMapError("Failed to initialize map: " + (err.message || "Unknown error"));
      return;
    }

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.on("load", () => {
      // Add route GeoJSON Source and Layers
      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Subtle casing line underneath for road readability
      map.addLayer({
        id: ROUTE_LAYER_CASING_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": 7,
          "line-opacity": 0.9,
        },
      });

      // Primary road route line
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#2563eb",
          "line-width": 4.5,
          "line-opacity": 0.95,
        },
      });

      setMapReady(true);
    });

    map.on("error", (e) => {
      console.warn("[Samooh MapLibre]", e);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Render or Update Supplier Warehouse Marker
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    if (supplierMarkerRef.current) {
      supplierMarkerRef.current.remove();
      supplierMarkerRef.current = null;
    }

    if (activeWarehouse) {
      const sEl = createSupplierMarkerEl();
      const sPopup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="padding: 6px 8px; font-family: inherit;">
          <div style="font-size: 10px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">Supplier Warehouse</div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${activeWarehouse.locality}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">${activeWarehouse.city}, ${activeWarehouse.state}</div>
          <div style="font-size: 10px; color: #059669; margin-top: 3px; font-weight: 600;">Verified warehouse location</div>
        </div>
      `);

      supplierMarkerRef.current = new maplibregl.Marker({ element: sEl, anchor: "bottom" })
        .setLngLat([Number(activeWarehouse.longitude), Number(activeWarehouse.latitude)])
        .setPopup(sPopup)
        .addTo(map);
    }
  }, [activeWarehouse, mapReady]);

  // 3. Fetch real retailers from Firestore with strict privacy enforcement
  // Real retailers take priority. Fixed sample locations supplement the map for SIH demonstration.
  const fetchRetailersAndDemand = useCallback(async () => {
    setIsLoadingRetailers(true);

    try {
      // 1. Fetch active procurement pools/recommendations
      let pools = [];
      try {
        const recRes = await getRecommendations();
        pools = recRes?.data || [];
        setActivePools(pools);
      } catch (poolErr) {
        console.warn("[Samooh Map] Could not load active recommendations:", poolErr);
      }

      // 2. Fetch real Firestore retailers
      const snap = await getDocs(collection(db, "retailers"));
      const eligibleRealRetailers = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        // Check canonical locationSharing or location fields
        const loc = data.location || data.locationSharing;
        const sharingEnabled = Boolean(
          data.location?.sharingEnabled === true ||
          data.locationSharing?.sharingEnabled === true
        );

        const lat = Number(data.location?.latitude ?? data.locationSharing?.latitude);
        const lng = Number(data.location?.longitude ?? data.locationSharing?.longitude);

        const hasValidCoords =
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat !== 0 &&
          lng !== 0 &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180;

        // PRIVACY ENFORCEMENT:
        // Retailer is ONLY visible if sharing is explicitly enabled AND coordinates are valid
        if (sharingEnabled && hasValidCoords) {
          const matchedPool = pools.find(
            (p) => p.retailer_ids && p.retailer_ids.includes(id)
          );

          eligibleRealRetailers.push({
            id,
            name: data.storeName || data.name || "Kirana Retailer",
            ownerName: data.ownerName || null,
            businessType: data.store_type || data.storeType || "Kirana Store",
            locality: data.area || data.city || "Retail Store",
            area: data.area || null,
            city: data.city || "Hyderabad",
            state: data.state || "Telangana",
            address: data.address || `${data.area || ""}, ${data.city || ""}`.trim() || "Hyderabad",
            contactPhone: data.contact_phone || data.contactPhone || data.phone || null,
            isDemo: false,
            location: {
              latitude: lat,
              longitude: lng,
              sharingEnabled: true,
              accuracy: loc?.accuracy || null,
            },
            procurementProfile: data.procurement_profile || null,
            activePool: matchedPool || null,
          });
        }
      });

      // REAL RETAILERS TAKE PRIORITY
      // Fixed sample locations supplement the map to guarantee a complete, realistic wholesale network
      if (eligibleRealRetailers.length > 0) {
        setRawRetailers([...eligibleRealRetailers, ...SAMPLE_RETAIL_LOCATIONS]);
      } else {
        setRawRetailers(SAMPLE_RETAIL_LOCATIONS);
      }
    } catch (err) {
      console.error("[Samooh Map] Error fetching retailers:", err);
      // Fallback to canonical sample dataset on fetch error so map stays resilient
      setRawRetailers(SAMPLE_RETAIL_LOCATIONS);
    } finally {
      setIsLoadingRetailers(false);
    }
  }, []);

  useEffect(() => {
    fetchRetailersAndDemand();
  }, [fetchRetailersAndDemand]);

  // 4. Compute geographic straight-line distance & apply search, radius, and sorting
  const processedRetailers = useMemo(() => {
    const originLat = activeWarehouse ? activeWarehouse.latitude : SAMPLE_WAREHOUSE.latitude;
    const originLng = activeWarehouse ? activeWarehouse.longitude : SAMPLE_WAREHOUSE.longitude;

    return rawRetailers
      .map((ret) => {
        const geoDistKm = calculateHaversineDistanceKm(
          originLat,
          originLng,
          ret.location.latitude,
          ret.location.longitude
        );

        const cachedRoute = routesCache[ret.id] || null;

        // Compute procurement demand summary if available
        let demandSummary = null;
        let demandQty = 0;
        if (ret.activePool) {
          demandSummary = `${ret.activePool.product_name} (${ret.activePool.current_pool_quantity || ""} pooled)`;
          demandQty = ret.activePool.current_pool_quantity || 10;
        } else if (ret.procurementProfile?.products_needed?.length > 0) {
          const first = ret.procurementProfile.products_needed[0];
          demandSummary = `${first.typical_quantity || ""} ${first.unit || "kg"} ${first.product_name}`;
          demandQty = Number(first.typical_quantity) || 5;
        }

        return {
          ...ret,
          geoDistKm,
          cachedRoute,
          demandSummary,
          demandQty,
        };
      })
      .filter((ret) => {
        // Radius filter
        if (ret.geoDistKm != null && ret.geoDistKm > maxRadiusKm) return false;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = ret.name.toLowerCase().includes(q);
          const matchLocality = (ret.locality || "").toLowerCase().includes(q);
          const matchAddress = ret.address.toLowerCase().includes(q);
          const matchDemand = ret.demandSummary ? ret.demandSummary.toLowerCase().includes(q) : false;
          if (!matchName && !matchLocality && !matchAddress && !matchDemand) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Real retailers ALWAYS take priority over sample network locations
        if (Boolean(a.isDemo) !== Boolean(b.isDemo)) {
          return a.isDemo ? 1 : -1;
        }
        if (sortBy === "road_distance") {
          const aRoad = a.cachedRoute?.distanceKm ?? (a.geoDistKm != null ? a.geoDistKm + 9999 : 9999);
          const bRoad = b.cachedRoute?.distanceKm ?? (b.geoDistKm != null ? b.geoDistKm + 9999 : 9999);
          return aRoad - bRoad;
        }
        if (sortBy === "driving_time") {
          const aTime = a.cachedRoute?.durationMinutes ?? 9999;
          const bTime = b.cachedRoute?.durationMinutes ?? 9999;
          return aTime - bTime;
        }
        if (sortBy === "demand") {
          return (b.demandQty || 0) - (a.demandQty || 0);
        }
        // Default: nearest geographic distance
        if (a.geoDistKm != null && b.geoDistKm != null) {
          return a.geoDistKm - b.geoDistKm;
        }
        return 0;
      });
  }, [rawRetailers, activeWarehouse, maxRadiusKm, searchQuery, sortBy, routesCache]);

  // 5. Deterministic FitBounds on map load / dataset change
  // Opens consistently around the supplier warehouse and nearby retail points
  const hasInitializedBounds = useRef(false);
  useEffect(() => {
    if (!mapReady || !mapRef.current || !activeWarehouse) return;
    if (processedRetailers.length === 0) return;

    if (!hasInitializedBounds.current) {
      let minLng = activeWarehouse.longitude;
      let maxLng = activeWarehouse.longitude;
      let minLat = activeWarehouse.latitude;
      let maxLat = activeWarehouse.latitude;

      processedRetailers.forEach((ret) => {
        const lng = Number(ret.location.longitude);
        const lat = Number(ret.location.latitude);
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: { top: 50, bottom: 50, left: 50, right: 50 }, maxZoom: 12.5, duration: 400 }
      );
      hasInitializedBounds.current = true;
    }
  }, [mapReady, activeWarehouse, processedRetailers]);

  // 6. Update Retailer Markers on the Map
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    const visibleIds = new Set(processedRetailers.map((r) => r.id));

    // Remove stale markers
    Object.entries(retailerMarkersRef.current).forEach(([id, marker]) => {
      if (!visibleIds.has(id)) {
        marker.remove();
        delete retailerMarkersRef.current[id];
      }
    });

    // Add or update markers with clean, professional store pins
    processedRetailers.forEach((ret) => {
      const isSelected = selectedRetailer?.id === ret.id;
      const isRealStore = !ret.isDemo;

      if (retailerMarkersRef.current[ret.id]) {
        const existingMarker = retailerMarkersRef.current[ret.id];
        const newEl = createRetailerMarkerEl(isSelected, isRealStore);
        existingMarker.getElement().replaceWith(newEl);
        newEl.addEventListener("click", (e) => {
          e.stopPropagation();
          handleSelectRetailer(ret);
        });
        return;
      }

      const el = createRetailerMarkerEl(isSelected, isRealStore);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        handleSelectRetailer(ret);
      });

      const cached = routesCache[ret.id];
      const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(`
        <div style="padding: 4px 6px; font-family: inherit;">
          <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${ret.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 1px;">${ret.locality || ret.city}, ${ret.state || "Telangana"}</div>
          ${cached ? `
            <div style="margin-top: 6px; padding-top: 5px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #334155;">
              <div><strong>Driving distance:</strong> ${fmtDist(cached.distanceKm)}</div>
              <div><strong>Estimated drive:</strong> ${fmtDuration(cached.durationMinutes)}</div>
            </div>
          ` : `
            <div style="margin-top: 6px; font-size: 11px; color: #2563eb; font-weight: 600;">Click to view route</div>
          `}
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([ret.location.longitude, ret.location.latitude])
        .setPopup(popup)
        .addTo(map);

      retailerMarkersRef.current[ret.id] = marker;
    });
  }, [processedRetailers, selectedRetailer?.id, mapReady, routesCache]); // eslint-disable-line react-hooks/exhaustive-deps

  // 7. Draw active road route on MapLibre map
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    const src = map.getSource(ROUTE_SOURCE_ID);
    if (!src) return;

    if (!activeRoute?.geometry) {
      src.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    // Set OpenRouteService GeoJSON LineString geometry
    src.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: activeRoute.geometry,
          properties: {},
        },
      ],
    });

    // Fit map bounds to encompass warehouse and route
    if (activeRoute.geojson?.bbox) {
      const [minLng, minLat, maxLng, maxLat] = activeRoute.geojson.bbox;
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: { top: 60, bottom: 60, left: 60, right: 60 }, maxZoom: 14.5, duration: 600 }
      );
    }
  }, [activeRoute, mapReady]);

  // 8. Calculate real driving route via OpenRouteService
  // Origin: Supplier Warehouse -> Destination: Retailer Coordinates
  const calculateRouteForRetailer = useCallback(async (retailer) => {
    if (!retailer?.location || !activeWarehouse) return;

    const cacheKey = retailer.id;
    if (routesCache[cacheKey]) {
      setActiveRoute(routesCache[cacheKey]);
      setRouteError("");
      return;
    }

    setIsLoadingRoute(true);
    setRouteError("");

    try {
      const originCoords = {
        latitude: activeWarehouse.latitude,
        longitude: activeWarehouse.longitude,
      };
      const destCoords = {
        latitude: Number(retailer.location.latitude),
        longitude: Number(retailer.location.longitude),
      };

      const result = await fetchDrivingRoute(originCoords, destCoords);
      setActiveRoute(result);
      setRoutesCache((prev) => ({ ...prev, [cacheKey]: result }));
    } catch (err) {
      console.warn("[Samooh Routing] Error calculating route:", err.message);
      let userFriendlyMsg = "Could not calculate a driving route. Please try again.";
      if (err.message && err.message.includes("MISSING_ORS_KEY")) {
        userFriendlyMsg = "OpenRouteService API key not configured. Real road routing is unavailable.";
      } else if (err.message && err.message.includes("rate limit")) {
        userFriendlyMsg = "Routing service rate limit reached. Please wait a moment and try again.";
      } else if (err.message && (err.message.includes("No route found") || err.message.includes("invalid"))) {
        userFriendlyMsg = "No road driving route found between warehouse and this retailer.";
      } else if (err.message) {
        userFriendlyMsg = err.message;
      }
      setRouteError(userFriendlyMsg);
      setActiveRoute(null);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [activeWarehouse, routesCache]);

  // 9. Select Retailer Handler
  const handleSelectRetailer = useCallback((retailer) => {
    setSelectedRetailer(retailer);
    setRouteError("");

    if (mapRef.current && retailer.location) {
      mapRef.current.flyTo({
        center: [retailer.location.longitude, retailer.location.latitude],
        zoom: 13.5,
        speed: 1.2,
      });
    }

    // Load or calculate real road driving route on demand
    calculateRouteForRetailer(retailer);
  }, [calculateRouteForRetailer]);

  const handleClearSelection = useCallback(() => {
    setSelectedRetailer(null);
    setActiveRoute(null);
    setRouteError("");

    if (mapRef.current && activeWarehouse) {
      mapRef.current.flyTo({
        center: [Number(activeWarehouse.longitude), Number(activeWarehouse.latitude)],
        zoom: 11.5,
      });
    }
  }, [activeWarehouse]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Top Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Truck className="w-4 h-4" />
              </span>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Nearby Retailers &amp; Route Logistics
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Wholesale distribution routes based on verified warehouse coordinates and retailer network locations.
            </p>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchRetailersAndDemand}
              disabled={isLoadingRetailers}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 transition shadow-sm"
              title="Refresh Retailers and Pool Demand"
            >
              <RefreshCw className={"w-3.5 h-3.5 " + (isLoadingRetailers ? "animate-spin text-emerald-700" : "")} />
            </button>
          </div>
        </div>
      </div>

      {/* Warehouse Card */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex-shrink-0">
        {hasSupplierCoords ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-start sm:items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                <Warehouse className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Supplier Warehouse
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Verified warehouse location
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                  {activeWarehouse.locality}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {activeWarehouse.city}, {activeWarehouse.state}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
              <Link
                to="/supplier/profile"
                className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
              >
                Edit warehouse
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950 dark:text-amber-100">Warehouse location required</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Set and verify your warehouse location to view road distances and dispatch routes to nearby stores.
                </p>
              </div>
            </div>
            <Link
              to="/supplier/profile"
              className="self-start sm:self-center px-3 py-1.5 rounded-md bg-amber-800 hover:bg-amber-900 text-white font-medium text-xs transition shadow-sm"
            >
              Set warehouse location
            </Link>
          </div>
        )}
      </div>

      {/* Main Split Layout: Retailer List (Left) + Map & Route Details (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* Left: Retailer Explorer Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          
          {/* Search & Filters Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-2.5 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by store name, area, product..."
                className="w-full pl-8 pr-7 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                  <Filter className="w-2.5 h-2.5" />
                  <span>Radius:</span>
                </label>
                <select
                  value={maxRadiusKm}
                  onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  {[10, 25, 40, 60, 100].map((r) => (
                    <option key={r} value={r}>{r} km radius</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                  <ArrowUpDown className="w-2.5 h-2.5" />
                  <span>Sort by:</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="geo_distance">Nearest (Geographic)</option>
                  <option value="road_distance">Driving distance</option>
                  <option value="driving_time">Driving travel time</option>
                  <option value="demand">Procurement demand</option>
                </select>
              </div>
            </div>

            {/* Single subtle demonstration note per requirement #4 */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>
                {isLoadingRetailers ? "Refreshing..." : `${processedRetailers.length} eligible retail location${processedRetailers.length === 1 ? "" : "s"}`}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Network active
              </span>
            </div>
          </div>

          {/* Retailer Scrollable List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoadingRetailers ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                <p className="text-xs">Loading retail network...</p>
              </div>
            ) : processedRetailers.length === 0 ? (
              <div className="py-16 px-6 text-center text-slate-400 space-y-2">
                <Store className="w-8 h-8 mx-auto opacity-40 text-slate-500" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No retail locations match your filter.
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Adjust the radius or search term to discover nearby retail points.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {processedRetailers.map((ret) => {
                  const isSelected = selectedRetailer?.id === ret.id;
                  const cachedRoute = routesCache[ret.id];

                  return (
                    <li key={ret.id}>
                      <button
                        onClick={() => handleSelectRetailer(ret)}
                        className={`w-full text-left p-3.5 transition-all flex flex-col gap-2 ${
                          isSelected
                            ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="p-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                <Store className="w-3 h-3" />
                              </span>
                              <p className={`text-xs font-bold truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-slate-100"}`}>
                                {ret.name}
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {ret.address}
                            </p>
                          </div>

                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}>
                            {ret.businessType || ret.storeType || "Retail Point"}
                          </span>
                        </div>

                        {/* Distance & Driving Information */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          {ret.geoDistKm != null && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" title="Straight line distance">
                              <Navigation className="w-2.5 h-2.5 text-slate-400" />
                              <span>Geographic: {fmtDist(ret.geoDistKm)}</span>
                            </span>
                          )}

                          {cachedRoute ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                              <Truck className="w-2.5 h-2.5" />
                              <span>Road: {fmtDist(cachedRoute.distanceKm)} · {fmtDuration(cachedRoute.durationMinutes)}</span>
                            </span>
                          ) : isSelected && isLoadingRoute ? (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              <span>Calculating road route...</span>
                            </span>
                          ) : null}
                        </div>

                        {/* Demand & Procurement Context */}
                        {ret.demandSummary && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-800 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 truncate">
                            <Package className="w-3 h-3 flex-shrink-0 text-emerald-700" />
                            <span className="truncate">Demand: {ret.demandSummary}</span>
                          </div>
                        )}

                        {/* View Route Action Row */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${ret.isDemo ? "bg-slate-400" : "bg-emerald-600 animate-pulse"} inline-block`} />
                            {ret.locality || ret.area || ret.city}
                          </span>
                          <span className={`font-semibold flex items-center gap-0.5 ${isSelected ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}`}>
                            {isSelected ? "Route Selected" : "View Route"}
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Map Canvas & Route Intelligence Drawer */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          
          {/* Map Canvas */}
          <div className="relative flex-1 min-h-[340px]">
            {!mapReady && !mapError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                <p className="text-xs">Rendering logistics map...</p>
              </div>
            )}
            {mapError && (
              <div className="absolute inset-4 z-10 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Map Error</span>
                </div>
                <p className="mt-1">{mapError}</p>
              </div>
            )}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Selected Retailer & Road Route Intelligence Drawer */}
          {selectedRetailer && (
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 max-h-72 overflow-y-auto shadow-lg z-20">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      <Store className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {selectedRetailer.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                      {selectedRetailer.locality || selectedRetailer.area || selectedRetailer.city}, {selectedRetailer.state || "Telangana"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedRetailer.address}
                  </p>
                </div>

                <button
                  onClick={handleClearSelection}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
                  title="Close Selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Real Road Route Metrics Card */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Route Details
                  </span>
                  {activeRoute && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Calculated via OpenRouteService
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Road Driving Distance */}
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Driving Distance</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                      {isLoadingRoute ? "..." : fmtDist(activeRoute?.distanceKm)}
                    </span>
                  </div>

                  {/* Estimated Driving Time */}
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Estimated Drive</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {isLoadingRoute ? "..." : fmtDuration(activeRoute?.durationMinutes)}
                    </span>
                  </div>

                  {/* Straight-line Geographic Distance */}
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Geographic Distance</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-slate-400" />
                      {fmtDist(selectedRetailer.geoDistKm)}
                    </span>
                  </div>

                  {/* Route Assessment per requirement #9 */}
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Routing Status</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {isLoadingRoute
                        ? "Calculating..."
                        : activeRoute
                        ? "Driving route calculated"
                        : "Route uncalculated"}
                    </span>
                  </div>
                </div>

                {/* Demand Context if present */}
                {selectedRetailer.demandSummary && (
                  <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-200">
                      <Package className="w-3.5 h-3.5 text-emerald-700" />
                      <span><strong>Procurement Demand:</strong> {selectedRetailer.demandSummary}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                      {selectedRetailer.procurementProfile?.pooled_procurement_enabled !== false ? "Pool Eligible" : "Direct Order"}
                    </span>
                  </div>
                )}
              </div>

              {/* Route Error Notification */}
              {routeError && (
                <div className="p-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{routeError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => calculateRouteForRetailer(selectedRetailer)}
                    disabled={isLoadingRoute || !hasSupplierCoords}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition shadow-sm disabled:opacity-60"
                  >
                    {isLoadingRoute ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Calculating Road Route...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Recalculate Route</span>
                      </>
                    )}
                  </button>

                  {/* External Navigation via OpenStreetMap */}
                  {hasSupplierCoords && selectedRetailer?.location && (
                    <a
                      href={getOSMDirectionsUrl(
                        {
                          latitude: activeWarehouse.latitude,
                          longitude: activeWarehouse.longitude,
                        },
                        {
                          latitude: selectedRetailer.location.latitude,
                          longitude: selectedRetailer.location.longitude,
                        }
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium transition shadow-sm"
                      title="Open external turn-by-turn navigation in OpenStreetMap"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Navigate via OpenStreetMap</span>
                    </a>
                  )}

                  {selectedRetailer.contactPhone && (
                    <a
                      href={`tel:${selectedRetailer.contactPhone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
                    >
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{selectedRetailer.contactPhone}</span>
                    </a>
                  )}
                </div>

                {!hasSupplierCoords && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Configure warehouse in Profile to enable routes.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Legend Footer */}
      <div className="px-4 sm:px-6 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-emerald-800 border-2 border-white shadow-sm" />
            Supplier Warehouse (Origin)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-slate-700 border-2 border-white shadow-sm" />
            Retail Point
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-7 h-1 bg-blue-600 rounded" />
            Driving Route (OpenRouteService)
          </span>
        </div>

        <div
          className="text-[10px] text-slate-400"
          dangerouslySetInnerHTML={{
            __html: "\u00a9 <a href='https://www.openstreetmap.org/copyright' target='_blank' rel='noopener' class='underline hover:text-slate-600'>OpenStreetMap</a> contributors",
          }}
        />
      </div>
    </div>
  );
}