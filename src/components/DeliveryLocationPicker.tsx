import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LocateFixed,
  Loader2,
  MapPin,
  Search,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { DELIVERY_CONFIG, GOOGLE_MAPS_API_KEY } from '../config/cafeConfig';

// In-memory cache for reverse geocoding to avoid duplicate network requests
const reverseGeocodeCache = new Map<string, string>();
let lastReverseCallTimestamp = 0;

export const calculateHaversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface SearchResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
}

export interface DeliveryLocationState {
  coords: { lat: number; lng: number } | null;
  accuracy: number | 'manual' | null;
  address: string;
  landmark: string;
  distanceKm: number | null;
  fee: number | null;
  isOutOfZone: boolean;
}

interface DeliveryLocationPickerProps {
  locationState: DeliveryLocationState;
  onChange: (updater: (prev: DeliveryLocationState) => DeliveryLocationState) => void;
  errors?: {
    location?: string;
    address?: string;
    landmark?: string;
  };
}

export const DeliveryLocationPicker: React.FC<DeliveryLocationPickerProps> = ({
  locationState,
  onChange,
  errors = {},
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const watchTimerRef = useRef<any>(null);
  const debounceTimerRef = useRef<any>(null);

  // UI state
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { coords, accuracy, address, landmark, distanceKm, fee, isOutOfZone } = locationState;

  // Cleanup geolocation watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (watchTimerRef.current) {
        clearTimeout(watchTimerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Recalculate distance and fee when coords change
  const updateCoordsData = useCallback(
    (lat: number, lng: number, acc: number | 'manual') => {
      const dist = calculateHaversineKm(
        DELIVERY_CONFIG.cafeLat,
        DELIVERY_CONFIG.cafeLng,
        lat,
        lng
      );
      const roundedDist = Math.round(dist * 10) / 10;
      const calculatedFee = DELIVERY_CONFIG.calculateFee(roundedDist);
      const outOfZone = calculatedFee === null;

      onChange((prev) => ({
        ...prev,
        coords: { lat, lng },
        accuracy: acc,
        distanceKm: roundedDist,
        fee: calculatedFee,
        isOutOfZone: outOfZone,
      }));
    },
    [onChange]
  );

  // Reverse geocoding with in-memory caching and <= 1 req/s throttle
  const performReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      if (reverseGeocodeCache.has(cacheKey)) {
        const cached = reverseGeocodeCache.get(cacheKey)!;
        onChange((prev) => ({ ...prev, address: cached }));
        return;
      }

      // Check if custom Google Maps API Key is provided
      const apiKey: string = GOOGLE_MAPS_API_KEY;
      if (apiKey && apiKey.trim().length > 0) {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
          );
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const formatted = data.results[0].formatted_address;
            reverseGeocodeCache.set(cacheKey, formatted);
            onChange((prev) => ({ ...prev, address: formatted }));
            return;
          }
        } catch (e) {
          console.warn('Google geocoding error, falling back to OSM Nominatim:', e);
        }
      }

      // Throttle Nominatim: wait if called < 1000ms ago
      const now = Date.now();
      const elapsed = now - lastReverseCallTimestamp;
      if (elapsed < 1000) {
        await new Promise((r) => setTimeout(r, 1000 - elapsed));
      }
      lastReverseCallTimestamp = Date.now();

      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data && data.display_name) {
          // Format a clean, human-readable address from addressdetails if present
          let formattedAddress = data.display_name;
          if (data.address) {
            const a = data.address;
            const parts = [
              a.house_number || a.building,
              a.road || a.pedestrian || a.suburb,
              a.neighbourhood || a.residential,
              a.city_district || a.subdistrict,
              a.city || a.town || 'Bengaluru',
              a.postcode,
            ].filter(Boolean);
            if (parts.length >= 2) {
              formattedAddress = parts.join(', ');
            }
          }

          reverseGeocodeCache.set(cacheKey, formattedAddress);
          onChange((prev) => ({ ...prev, address: formattedAddress }));
        } else {
          const fallback = `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          reverseGeocodeCache.set(cacheKey, fallback);
          onChange((prev) => ({ ...prev, address: fallback }));
        }
      } catch (err) {
        console.warn('Nominatim reverse lookup failed, using fallback:', err);
        const fallback = `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        onChange((prev) => ({
          ...prev,
          address: prev.address.trim().length > 0 ? prev.address : fallback,
        }));
      }
    },
    [onChange]
  );

  // Initialize or update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    const defaultLat = coords ? coords.lat : DELIVERY_CONFIG.cafeLat;
    const defaultLng = coords ? coords.lng : DELIVERY_CONFIG.cafeLng;

    // Create map if not yet initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: coords ? 16 : 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark styled tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Create Custom Pin Icon
      const pinIcon = L.divIcon({
        className: 'delivery-pin-container',
        html: `
          <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center; cursor:grab;">
            <div style="position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:12px; height:4px; background:rgba(0,0,0,0.5); border-radius:50%; filter:blur(1px);"></div>
            <div style="width:34px; height:34px; border-radius:50%; background:#1A0F0A; border:2px solid #C8956B; box-shadow:0 4px 12px rgba(200,149,107,0.45); display:flex; align-items:center; justify-content:center; color:#C8956B;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 36],
      });

      // Draggable Marker
      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateCoordsData(pos.lat, pos.lng, 'manual');

        // Debounce reverse geocoding
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          performReverseGeocode(pos.lat, pos.lng);
        }, 600);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size once DOM settles
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 250);
    } else {
      // Map exists, sync pin position if coords changed
      if (coords && markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }

    // Sync accuracy circle
    if (mapInstanceRef.current && coords) {
      if (circleRef.current) {
        mapInstanceRef.current.removeLayer(circleRef.current);
        circleRef.current = null;
      }

      if (typeof accuracy === 'number' && accuracy > 0) {
        circleRef.current = L.circle([coords.lat, coords.lng], {
          radius: Math.min(accuracy, 200),
          color: accuracy <= 30 ? '#10B981' : accuracy <= 100 ? '#F59E0B' : '#EF4444',
          fillColor: accuracy <= 30 ? '#10B981' : accuracy <= 100 ? '#F59E0B' : '#EF4444',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(mapInstanceRef.current);
      }
    }
  }, [coords, accuracy, updateCoordsData, performReverseGeocode]);

  // Recenter button action
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !coords) return;
    mapInstanceRef.current.setView([coords.lat, coords.lng], 16, { animate: true });
  };

  // High Accuracy Geolocation Detection
  const handleUseCurrentLocation = () => {
    setDetectionError(null);
    setIsIframeBlocked(false);

    // 1. Check browser support
    if (!navigator.geolocation) {
      setDetectionError('Geolocation is not supported by your current browser.');
      return;
    }

    // 2. Check secure context (GPS requires HTTPS or localhost)
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setDetectionError('High-accuracy GPS requires an HTTPS secure connection.');
      return;
    }

    setIsDetecting(true);

    let bestReading: { lat: number; lng: number; accuracy: number } | null = null;
    const startTime = Date.now();
    const MAX_SETTLE_MS = 12000; // 12 seconds settle period per requirement

    const stopTrackingAndCommit = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (watchTimerRef.current) {
        clearTimeout(watchTimerRef.current);
        watchTimerRef.current = null;
      }
      setIsDetecting(false);

      if (bestReading) {
        updateCoordsData(bestReading.lat, bestReading.lng, bestReading.accuracy);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([bestReading.lat, bestReading.lng], 16, {
            animate: true,
          });
        }
        performReverseGeocode(bestReading.lat, bestReading.lng);
      } else {
        setDetectionError('Could not find your location. Try again or search above.');
      }
    };

    // Watch position
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);

          // Update best reading if better accuracy or first reading
          if (!bestReading || acc < bestReading.accuracy) {
            bestReading = { lat, lng, accuracy: acc };
          }

          // Early exit if accuracy <= 25 meters (Requirement 2)
          if (acc <= 25) {
            stopTrackingAndCommit();
          }
        },
        (err) => {
          console.warn('Geolocation error code:', err.code, err.message);

          // Check if iframe policy prevented geolocation
          const isInsideIframe = window.self !== window.top;
          if (err.code === err.PERMISSION_DENIED) {
            if (isInsideIframe) {
              setIsIframeBlocked(true);
              setDetectionError(
                'Location access was restricted by the preview frame. Open the app in its own tab to use location.'
              );
            } else {
              setDetectionError(
                'Location access was denied. Please search your area above or type your address.'
              );
            }
          } else if (err.code === err.TIMEOUT) {
            setDetectionError('Location request timed out. Try again or search above.');
          } else {
            setDetectionError('Could not find your location. Try again or search above.');
          }
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          setIsDetecting(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

      // Stop reading after max 12 seconds to let GPS settle (Requirement 2)
      watchTimerRef.current = setTimeout(() => {
        stopTrackingAndCommit();
      }, MAX_SETTLE_MS);
    } catch (err: any) {
      console.warn('Geolocation launch exception:', err);
      const isInsideIframe = window.self !== window.top;
      if (isInsideIframe) {
        setIsIframeBlocked(true);
        setDetectionError('Open the app in its own tab to use location.');
      } else {
        setDetectionError('Could not find your location. Try again or search above.');
      }
      setIsDetecting(false);
    }
  };

  // Forward Nominatim Search (India focus)
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery.trim()
      )}&countrycodes=in&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });
      const data: SearchResult[] = await res.json();
      setSearchResults(data || []);
      setShowSearchResults(true);
    } catch (err) {
      console.warn('Search query failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setShowSearchResults(false);
    setSearchQuery('');
    setDetectionError(null);

    updateCoordsData(lat, lng, 'manual');
    onChange((prev) => ({
      ...prev,
      address: item.display_name,
    }));

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="space-y-3.5 text-left">
      {/* 1. Forward Search Box Above Map (Requirement 3) */}
      <div className="relative">
        <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#F5E9DA]/70 font-semibold mb-1">
          <Search className="w-3.5 h-3.5 text-[#C8956B]" />
          <span>Search Area or Landmark</span>
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search your area, locality or landmark (e.g. Indiranagar, Halasuru)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 3) {
                // Auto trigger search on 3+ chars
                if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = setTimeout(() => {
                  handleSearchSubmit();
                }, 400);
              }
            }}
            onFocus={() => {
              if (searchResults.length > 0) setShowSearchResults(true);
            }}
            className="w-full pl-9 pr-20 py-2.5 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none focus:border-[#C8956B]"
          />
          <Search className="w-4 h-4 text-[#C8956B]/70 absolute left-3 pointer-events-none" />

          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-1.5 px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[#C8956B]/20 text-[#C8956B] hover:bg-[#C8956B] hover:text-[#140A06] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#1A0F0A] border border-[#C8956B]/40 shadow-2xl divide-y divide-[#F5E9DA]/10">
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => selectSearchResult(item)}
                className="w-full px-3 py-2 text-left text-xs text-[#F5E9DA]/90 hover:bg-[#C8956B]/20 transition-colors flex items-start gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C8956B] shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-snug">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Full-Width Outlined Button: "Use My Current Location" (Requirement 1 & 2) */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isDetecting}
          className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[46px] rounded-xl border border-[#C8956B] text-[#C8956B] hover:bg-[#C8956B] hover:text-[#140A06] transition-all cursor-pointer font-medium text-xs uppercase tracking-wider shadow-sm active:scale-[0.99] disabled:opacity-70"
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#C8956B]" />
              <span className="font-mono">Finding your location…</span>
            </>
          ) : (
            <>
              <LocateFixed className="w-4 h-4" />
              <span>Use My Current Location</span>
            </>
          )}
        </button>

        {/* Error / Permission message if any */}
        {detectionError && (
          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p>{detectionError}</p>
              {isIframeBlocked && (
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center gap-1 font-bold text-[#C8956B] underline hover:text-[#F5E9DA] cursor-pointer pt-0.5"
                >
                  <span>Open app in new tab</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Dark-Styled Leaflet Map Card (Requirement 1 & 2) */}
      <div className="relative rounded-2xl overflow-hidden border border-[#C8956B]/30 bg-[#140A06] shadow-lg">
        {/* Map Container ~220px tall */}
        <div ref={mapContainerRef} className="w-full h-[220px] bg-[#140A06] z-0" />

        {/* Recenter Button on Map */}
        {coords && (
          <button
            type="button"
            onClick={handleRecenter}
            className="absolute top-2.5 right-2.5 z-10 p-2 rounded-xl bg-[#140A06]/85 border border-[#C8956B]/40 text-[#C8956B] hover:bg-[#C8956B] hover:text-[#140A06] transition-colors shadow-md cursor-pointer flex items-center justify-center"
            title="Recenter pin on map"
            aria-label="Recenter map"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Live Accuracy Badge on Map (Requirement 2) */}
        {coords && (
          <div className="absolute top-2.5 left-2.5 z-10">
            {accuracy === 'manual' ? (
              <span className="px-2 py-1 rounded-full bg-[#140A06]/90 border border-[#F5E9DA]/20 text-[10px] font-mono text-[#F5E9DA]/80 flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8956B]"></span>
                <span>Pinned location</span>
              </span>
            ) : typeof accuracy === 'number' && accuracy <= 30 ? (
              <span className="px-2 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Accurate to {accuracy}m</span>
              </span>
            ) : typeof accuracy === 'number' && accuracy <= 100 ? (
              <span className="px-2 py-1 rounded-full bg-amber-950/90 border border-amber-500/50 text-[10px] font-mono text-amber-300 flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Approximate ({accuracy}m)</span>
              </span>
            ) : typeof accuracy === 'number' && accuracy > 100 ? (
              <div className="flex flex-col gap-1">
                <span className="px-2 py-1 rounded-full bg-red-950/90 border border-red-500/50 text-[10px] font-mono text-red-300 flex items-center gap-1.5 shadow-md w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  <span>Low accuracy ({accuracy}m)</span>
                </span>
                <span className="text-[10px] bg-[#140A06]/90 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                  Please drag the pin to your exact building or{' '}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="underline text-[#C8956B] cursor-pointer"
                  >
                    try again
                  </button>
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Drag Hint at bottom of map */}
        <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg bg-[#140A06]/90 border border-[#F5E9DA]/15 text-[10px] text-[#F5E9DA]/80 font-mono shadow-md backdrop-blur-xs flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-[#C8956B]" />
            <span>Drag pin to exact doorstep</span>
          </span>

          {coords && distanceKm !== null && (
            <span
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold shadow-md backdrop-blur-xs ${
                isOutOfZone
                  ? 'bg-red-950/90 border-red-500/50 text-red-300'
                  : 'bg-[#140A06]/90 border-[#C8956B]/40 text-[#C8956B]'
              }`}
            >
              {distanceKm} km from cafe
            </span>
          )}
        </div>
      </div>

      {/* Out of Delivery Zone Warning Banner (Requirement 4) */}
      {isOutOfZone && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Beyond Maximum Delivery Range ({distanceKm} km)</span>
          </div>
          <p className="text-[11px] text-red-200/90 leading-relaxed">
            Sorry, we deliver within 6 km of our Indiranagar roastery. Please choose{' '}
            <strong className="text-white">Dine-In</strong> or collect in person at our counter.
          </p>
        </div>
      )}

      {/* Distance and Delivery Fee Tier Indicator */}
      {distanceKm !== null && !isOutOfZone && fee !== null && (
        <div className="p-2.5 rounded-xl bg-[#140A06] border border-[#C8956B]/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#F5E9DA]/80">
            <Navigation className="w-3.5 h-3.5 text-[#C8956B]" />
            <span>Distance from roastery:</span>
            <span className="font-bold text-[#F5E9DA]">{distanceKm} km</span>
          </div>
          <span className="text-[#C8956B] font-bold">
            Delivery: ₹{fee}.00
          </span>
        </div>
      )}

      {/* 4. Detected Address Text (Auto-filled & Editable) (Requirement 1) */}
      <div className="space-y-1">
        <label className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C8956B]" />
            <span>Delivery Address (Street / Area) *</span>
          </span>
          {coords && (
            <span className="text-[10px] font-mono text-[#C8956B]">
              Lat {coords.lat.toFixed(4)}, Lng {coords.lng.toFixed(4)}
            </span>
          )}
        </label>
        <textarea
          rows={2}
          required
          placeholder="Auto-detected address appears here. You can fine-tune street or building name."
          value={address}
          onChange={(e) => onChange((prev) => ({ ...prev, address: e.target.value }))}
          className={`w-full px-3.5 py-2 text-xs rounded-xl bg-[#140A06] border text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none resize-none leading-relaxed ${
            errors.address ? 'border-red-500' : 'border-[#F5E9DA]/15 focus:border-[#C8956B]'
          }`}
        />
        {errors.address && (
          <span className="text-[11px] text-red-400 block">{errors.address}</span>
        )}
      </div>

      {/* 5. Flat / House / Landmark Extra Field (Required Hint) (Requirement 1 & 6) */}
      <div className="space-y-1">
        <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C8956B]" />
          <span>Flat / House / Landmark *</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. 2nd floor, near the blue gate, Apt 402"
          value={landmark}
          onChange={(e) => onChange((prev) => ({ ...prev, landmark: e.target.value }))}
          className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#140A06] border text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none ${
            errors.landmark ? 'border-red-500' : 'border-[#F5E9DA]/15 focus:border-[#C8956B]'
          }`}
        />
        {errors.landmark && (
          <span className="text-[11px] text-red-400 block">{errors.landmark}</span>
        )}
      </div>

      {/* 6. Subtle Privacy Note (Requirement 5) */}
      <div className="flex items-center gap-1.5 text-[10px] text-[#F5E9DA]/45 font-mono pt-0.5">
        <CheckCircle2 className="w-3 h-3 text-[#C8956B]/60 shrink-0" />
        <span>Your location is used only to deliver this order.</span>
      </div>
    </div>
  );
};
