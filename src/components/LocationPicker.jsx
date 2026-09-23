import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, Loader2, CheckCircle2, AlertCircle, X, ChevronDown, Search } from 'lucide-react';
import { INDIAN_STATES } from '../constants/indiaStates';
import { INDIA_DISTRICTS, getDistrictsForState } from '../data/indiaDistricts';
import { searchLocationsInIndia, reverseGeocodeIndia, buildOsmStyle } from '../services/mapService';
import { requestBrowserGeolocation, GEOLOCATION_STATUS } from '../services/locationService';

export default function LocationPicker({
  value = {},
  onChange,
  label = 'Operating Location',
  required = true,
  errors = {}
}) {
  const selectedState = value.state || '';
  const selectedDistrict = value.district || '';
  const city = value.city || '';
  const area = value.area || '';
  const latitude = value.latitude ?? value.businessLocation?.latitude ?? null;
  const longitude = value.longitude ?? value.businessLocation?.longitude ?? null;

  // Locality search state
  const [query, setQuery] = useState(city ? (area && area !== city ? `${area}, ${city}` : city) : '');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);

  // District search & dropdown state
  const [districtFilter, setDistrictFilter] = useState('');
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);
  const districtDropdownRef = useRef(null);

  // GPS state
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | detecting | success | error
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const abortControllerRef = useRef(null);

  // Map preview ref
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  // Available districts for current state
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  // Filtered districts based on user typing
  const filteredDistricts = useMemo(() => {
    if (!districtFilter.trim()) return availableDistricts;
    const q = districtFilter.toLowerCase().trim();
    return availableDistricts.filter(d => d.toLowerCase().includes(q));
  }, [availableDistricts, districtFilter]);

  // Close district dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(e.target)) {
        setShowDistrictMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync internal query input when value city/area changes externally
  useEffect(() => {
    if (city || area) {
      setQuery(area && area !== city ? `${area}, ${city}` : city);
    } else if (!value.state && !value.district) {
      setQuery('');
    }
  }, [city, area, value.state, value.district]);

  // Debounced autocomplete search for City / Locality
  useEffect(() => {
    if (!query || query.trim().length < 2 || !showLocalityDropdown) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchLocationsInIndia(query, selectedState, selectedDistrict, controller.signal);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 380);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, selectedState, selectedDistrict, showLocalityDropdown]);

  // MapLibre preview rendering
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!mapInstanceRef.current) {
      try {
        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: buildOsmStyle(),
          center: [lng, lat],
          zoom: 13,
          attributionControl: false,
          interactive: false
        });

        const el = document.createElement('div');
        el.className = 'w-6 h-6 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;
      } catch (err) {
        console.warn('[LocationPicker] Map initialization error:', err);
      }
    } else {
      mapInstanceRef.current.setCenter([lng, lat]);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLngLat([lng, lat]);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude]);

  // Handle State Change: resets district, locality, pincode, geocoded result
  const handleStateChange = (newState) => {
    setDistrictFilter('');
    setShowDistrictMenu(false);
    setQuery('');
    setSuggestions([]);
    setShowLocalityDropdown(false);

    onChange({
      state: newState,
      district: '',
      city: '',
      area: '',
      pincode: '',
      address: '',
      latitude: null,
      longitude: null,
      businessLocation: null
    });
  };

  // Handle District Change: resets locality and previous geocoded coordinates
  const handleDistrictSelect = (districtName) => {
    setShowDistrictMenu(false);
    setDistrictFilter('');
    setQuery('');
    setSuggestions([]);
    setShowLocalityDropdown(false);

    onChange({
      district: districtName,
      city: '',
      area: '',
      pincode: '',
      address: '',
      latitude: null,
      longitude: null,
      businessLocation: null
    });
  };

  // Handle Locality Suggestion Selection
  const handleSelectSuggestion = (place) => {
    setShowLocalityDropdown(false);
    const placeCity = place.city || place.locality || '';
    const placeArea = place.locality && place.locality !== placeCity ? place.locality : '';
    setQuery(placeArea ? `${placeArea}, ${placeCity}` : (placeCity || place.displayName));

    const finalState = place.state || selectedState;
    const finalDistrict = place.district || selectedDistrict;

    const payload = {
      state: finalState,
      district: finalDistrict,
      city: placeCity,
      area: placeArea,
      pincode: place.pincode || value.pincode || '',
      latitude: place.latitude,
      longitude: place.longitude,
      businessLocation: {
        address: place.displayName,
        city: placeCity,
        area: placeArea,
        district: finalDistrict,
        state: finalState,
        pincode: place.pincode || '',
        latitude: place.latitude,
        longitude: place.longitude,
        source: 'nominatim_geocoded'
      }
    };
    onChange(payload);
  };

  // Handle GPS button click
  const handleRequestGPS = async () => {
    setGpsStatus('detecting');
    setGpsErrorMsg('');

    try {
      const pos = await requestBrowserGeolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      });

      const rev = await reverseGeocodeIndia(pos.latitude, pos.longitude);

      // Match state from INDIAN_STATES
      const matchedState = INDIAN_STATES.find(
        s => s.toLowerCase() === (rev.state || '').toLowerCase()
      ) || rev.state || selectedState;

      // Match district from canonical list for the matched state
      const stateDistricts = getDistrictsForState(matchedState);
      const matchedDistrict = stateDistricts.find(
        d => d.toLowerCase() === (rev.district || '').toLowerCase()
      ) || rev.district || '';

      const gpsCity = rev.city || rev.town || rev.village || '';
      const gpsArea = rev.area || '';

      setGpsStatus('success');
      setQuery(gpsArea && gpsArea !== gpsCity ? `${gpsArea}, ${gpsCity}` : (gpsCity || matchedDistrict || matchedState));

      const payload = {
        state: matchedState,
        district: matchedDistrict,
        city: gpsCity,
        area: gpsArea,
        pincode: rev.pincode || '',
        address: rev.formattedAddress || '',
        latitude: pos.latitude,
        longitude: pos.longitude,
        businessLocation: {
          address: rev.formattedAddress,
          city: gpsCity,
          area: gpsArea,
          district: matchedDistrict,
          state: matchedState,
          pincode: rev.pincode || '',
          latitude: pos.latitude,
          longitude: pos.longitude,
          accuracy: pos.accuracy,
          source: 'device_gps'
        }
      };
      onChange(payload);
    } catch (err) {
      console.warn('[LocationPicker] GPS failed:', err);
      setGpsStatus('error');
      if (err.code === GEOLOCATION_STATUS.DENIED) {
        setGpsErrorMsg('Location access was denied. Please select your state and district below.');
      } else if (err.code === GEOLOCATION_STATUS.TIMEOUT) {
        setGpsErrorMsg('Location detection timed out. Please select your location manually below.');
      } else {
        setGpsErrorMsg(err.message || 'Unable to retrieve device location. Please search manually below.');
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>

        {/* GPS Action Button */}
        <button
          type="button"
          onClick={handleRequestGPS}
          disabled={gpsStatus === 'detecting'}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-md transition shadow-xs disabled:opacity-60 cursor-pointer"
        >
          {gpsStatus === 'detecting' ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
              <span>Use my current location</span>
            </>
          )}
        </button>
      </div>

      {/* GPS Error Alert */}
      {gpsStatus === 'error' && (
        <div className="flex items-start justify-between gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[11px]">{gpsErrorMsg}</p>
              <div className="mt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRequestGPS}
                  className="font-semibold underline text-amber-800 dark:text-amber-300 hover:text-amber-950"
                >
                  Retry GPS
                </button>
                <button
                  type="button"
                  onClick={() => setGpsStatus('idle')}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGpsStatus('idle')}
            className="text-amber-500 hover:text-amber-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* GPS Success Notice */}
      {gpsStatus === 'success' && (
        <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">GPS location detected and reverse-geocoded successfully.</span>
          </div>
          <button
            type="button"
            onClick={() => setGpsStatus('idle')}
            className="text-[10px] text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3-Column Layout: State -> District -> City/Locality Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Level 1: State / UT Selector */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            State / UT <span className="text-rose-600">*</span>
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className={`w-full border rounded-md px-2.5 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800 ${
              errors.state ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <option value="">Select State / UT</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {errors.state && <span className="text-[11px] text-rose-600 mt-1 block">{errors.state}</span>}
        </div>

        {/* Level 2: District Searchable Selector */}
        <div className="relative" ref={districtDropdownRef}>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            District <span className="text-rose-600">*</span>
          </label>
          
          {!selectedState ? (
            <div className="w-full border border-slate-200 dark:border-slate-700/60 rounded-md px-2.5 py-2 text-xs bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed flex items-center justify-between">
              <span>Select state first</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDistrictMenu(!showDistrictMenu)}
                className={`w-full text-left border rounded-md px-2.5 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800 flex items-center justify-between ${
                  errors.district ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className={selectedDistrict ? 'font-medium' : 'text-slate-400'}>
                  {selectedDistrict || 'Select district'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* District Filterable Dropdown */}
              {showDistrictMenu && (
                <div className="absolute z-40 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder={`Filter ${availableDistricts.length} districts...`}
                        value={districtFilter}
                        onChange={(e) => setDistrictFilter(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDistricts.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No districts match "{districtFilter}"
                      </div>
                    ) : (
                      filteredDistricts.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => handleDistrictSelect(d)}
                          className={`w-full text-left px-3 py-1.5 text-xs transition ${
                            selectedDistrict === d
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {d}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {errors.district && <span className="text-[11px] text-rose-600 mt-1 block">{errors.district}</span>}
        </div>

        {/* Level 3: City / Locality Autocomplete Search */}
        <div className="relative">
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            City, Town, Village or Locality <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                selectedDistrict && selectedState
                  ? `Search in ${selectedDistrict}, ${selectedState}`
                  : 'Select state & district first'
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowLocalityDropdown(true);
                onChange({ city: e.target.value });
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowLocalityDropdown(true);
              }}
              className={`w-full border rounded-md pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800 ${
                errors.city ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showLocalityDropdown && suggestions.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-56 overflow-y-auto">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition flex flex-col"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.locality || item.city}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {[item.city, item.district || selectedDistrict, item.state || selectedState, item.pincode].filter(Boolean).join(', ')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {errors.city && (
            <span className="text-[11px] text-rose-600 mt-1 block">{errors.city}</span>
          )}
        </div>
      </div>

      {/* Map Preview when coordinates are resolved */}
      {latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude) && (
        <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-slate-50 dark:bg-slate-950 p-2">
          <div className="flex items-center justify-between pb-1.5 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-medium flex items-center gap-1 text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              Pinpoint: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
            </span>
            <span className="text-slate-600 text-[10px]">{[selectedDistrict, selectedState, 'India'].filter(Boolean).join(', ')}</span>
          </div>
          <div
            ref={mapContainerRef}
            className="w-full h-32 rounded bg-slate-200 dark:bg-slate-800"
          />
        </div>
      )}
    </div>
  );
}
