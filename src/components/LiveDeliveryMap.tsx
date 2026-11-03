import React, { useEffect, useRef, useState } from 'react';
import { Bike, Coffee, Home, Navigation, MapPin, ExternalLink } from 'lucide-react';
import { Order, OrderCoordinates } from '../types/cafe';
import { ORDER_TRACKING_CONFIG } from '../config/cafeConfig';

interface LiveDeliveryMapProps {
  order: Order;
}

// Calculate distance in kilometers using the Haversine formula
const calculateDistanceKm = (c1: OrderCoordinates, c2: OrderCoordinates): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({ order }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const [riderDistance, setRiderDistance] = useState<string>('2.1 km');
  const [riderProgressPercent, setRiderProgressPercent] = useState<number>(0);

  const cafeCoords = ORDER_TRACKING_CONFIG.cafeCoords;
  const customerCoords = order.coordinates || ORDER_TRACKING_CONFIG.defaultCustomerCoords;

  const isOutForDelivery = order.status === 'out_for_delivery';
  const isDelivered = order.status === 'delivered';

  const mapsUrl =
    order.googleMapsUrl ||
    (customerCoords
      ? `https://www.google.com/maps?q=${customerCoords.lat},${customerCoords.lng}`
      : undefined);

  // Calculate rider's current interpolated position along the delivery path
  useEffect(() => {
    if (!customerCoords) return;

    const totalDist = calculateDistanceKm(cafeCoords, customerCoords);

    // If delivered, rider is at customer location
    if (isDelivered) {
      setRiderProgressPercent(1);
      setRiderDistance('0.0 km (Arrived)');
      return;
    }

    if (!isOutForDelivery) {
      // Not yet out for delivery: rider is still waiting at cafe
      setRiderProgressPercent(0);
      setRiderDistance(`${totalDist.toFixed(1)} km`);
      return;
    }

    // Out for delivery: interpolate based on elapsed time within this stage
    const outForDeliveryItem = order.statusHistory.find(
      (h) => h.status === 'out_for_delivery'
    );
    const stageStartTime = outForDeliveryItem ? outForDeliveryItem.timestamp : order.createdAt + 90000;
    const stageDurationMs = (ORDER_TRACKING_CONFIG.simulationDelaysSeconds.deliveredOrServed -
      ORDER_TRACKING_CONFIG.simulationDelaysSeconds.outForDeliveryOrReady) * 1000;

    const updateRider = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - stageStartTime);
      const ratio = Math.min(0.95, elapsed / stageDurationMs); // max 95% until marked delivered

      setRiderProgressPercent(ratio);
      const remainingDist = Math.max(0.1, totalDist * (1 - ratio));
      setRiderDistance(`${remainingDist.toFixed(1)} km`);

      // Update rider marker position on Leaflet map if initialized
      if (riderMarkerRef.current && typeof L !== 'undefined') {
        const curLat = cafeCoords.lat + (customerCoords.lat - cafeCoords.lat) * ratio;
        const curLng = cafeCoords.lng + (customerCoords.lng - cafeCoords.lng) * ratio;
        riderMarkerRef.current.setLatLng([curLat, curLng]);
      }
    };

    updateRider();
    const interval = setInterval(updateRider, 1000);
    return () => clearInterval(interval);
  }, [order, isOutForDelivery, isDelivered, cafeCoords, customerCoords]);

  // Leaflet map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof L === 'undefined') return;

    if (!customerCoords) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      mapInstanceRef.current = map;

      // Dark style OpenStreetMap tiles (tile-pane has CSS filter applied in index.css)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Add Zoom Control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Custom Cafe Icon
      const cafeIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #C8956B; color: #140A06; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #F5E9DA; box-shadow: 0 8px 16px rgba(0,0,0,0.6);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a4 4 0 0 1-4 4 4 4 0 0 1-4-4V4h8z"/><path d="M6 14h12v4a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z"/><path d="M18 8h1a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-1"/></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Custom Customer Home Icon
      const customerIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #F5E9DA; color: #140A06; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #C8956B; box-shadow: 0 8px 16px rgba(0,0,0,0.6);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Add Cafe and Customer Markers
      L.marker([cafeCoords.lat, cafeCoords.lng], { icon: cafeIcon })
        .addTo(map)
        .bindPopup(`<b>BREW. Roastery</b><br/>${ORDER_TRACKING_CONFIG.cafeCoords.label}`);

      const popupHtml = `<b>Delivery Destination</b><br/>${order.destination}${
        order.landmark ? `<br/><span style="color:#C8956B; font-size:11px;">Landmark: ${order.landmark}</span>` : ''
      }`;

      L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      // Draw dashed caramel line route
      const latlngs = [
        [cafeCoords.lat, cafeCoords.lng],
        [customerCoords.lat, customerCoords.lng],
      ];

      L.polyline(latlngs, {
        color: '#C8956B',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '6, 8',
      }).addTo(map);

      // Add Rider marker if out for delivery or delivered
      if (isOutForDelivery || isDelivered) {
        const curLat =
          cafeCoords.lat + (customerCoords.lat - cafeCoords.lat) * riderProgressPercent;
        const curLng =
          cafeCoords.lng + (customerCoords.lng - cafeCoords.lng) * riderProgressPercent;

        const riderIcon = L.divIcon({
          className: 'custom-rider-icon',
          html: `
            <div style="position: relative;">
              <div style="position: absolute; inset: -4px; border-radius: 50%; background: #C8956B; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="background: linear-gradient(135deg, #C8956B, #965B33); color: #F5E9DA; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #F5E9DA; box-shadow: 0 10px 20px rgba(0,0,0,0.8); position: relative; z-index: 10;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const riderMarker = L.marker([curLat, curLng], { icon: riderIcon })
          .addTo(map)
          .bindPopup(`<b>${order.rider?.name || 'Rider'}</b><br/>En route with your order`);
        riderMarkerRef.current = riderMarker;
      }

      // Fit bounds with generous padding
      const bounds = L.latLngBounds([
        [cafeCoords.lat, cafeCoords.lng],
        [customerCoords.lat, customerCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {
      console.error('Error initializing Leaflet map:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [customerCoords, cafeCoords.lat, cafeCoords.lng, isOutForDelivery, isDelivered, order.destination, order.landmark, order.rider?.name]);

  // Fallback if no coordinates available (Requirement 4: address card instead of map)
  if (!customerCoords) {
    return (
      <div className="p-5 rounded-2xl bg-[#1A0F0A]/90 border border-[#C8956B]/30 backdrop-blur-md text-left space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#C8956B] font-bold">
          <MapPin className="w-4 h-4" />
          <span>Delivery Destination</span>
        </div>
        <p className="text-sm font-medium text-[#F5E9DA]">{order.destination}</p>
        {order.landmark && (
          <p className="text-xs text-[#C8956B]">Landmark: {order.landmark}</p>
        )}
        <p className="text-xs text-[#F5E9DA]/60">
          Delivery route calibrated from BREW. Roastery (Indiranagar).
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#C8956B]/30 bg-[#140A06] shadow-xl">
      {/* Live Map Top Status Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#140A06]/90 border border-[#C8956B]/40 backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-[#F5E9DA]">
            {isDelivered
              ? 'Delivered to your door'
              : isOutForDelivery
              ? `Rider is ${riderDistance} away`
              : 'Dispatch route mapped'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#140A06]/90 border border-[#C8956B]/40 text-[11px] font-mono text-[#C8956B] hover:bg-[#C8956B] hover:text-[#140A06] transition-colors shadow-md"
              title="Open customer location in Google Maps"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2B1810]/85 border border-[#F5E9DA]/15 text-[11px] font-mono text-[#F5E9DA]/80 backdrop-blur-md">
            <Navigation className="w-3 h-3 text-[#C8956B]" />
            <span>Live GPS</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[260px] sm:h-[300px] lg:h-[320px] bg-[#140A06]"
      />

      {/* Map Footer Route Bar */}
      <div className="p-3 bg-[#180E07] border-t border-[#F5E9DA]/10 flex items-center justify-between text-xs font-mono text-[#F5E9DA]/80 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Coffee className="w-3.5 h-3.5 text-[#C8956B]" />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">BREW. Roastery</span>
        </div>

        <span className="text-[#C8956B] font-bold">⇢ {riderDistance} ⇢</span>

        <div className="flex items-center gap-2">
          <Home className="w-3.5 h-3.5 text-[#F5E9DA]" />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">
            {order.destination}
          </span>
        </div>
      </div>
    </div>
  );
};
