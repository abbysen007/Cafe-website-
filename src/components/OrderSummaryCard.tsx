import React from 'react';
import { Receipt, MapPin, CreditCard, Utensils, ExternalLink } from 'lucide-react';
import { Order } from '../types/cafe';
import { CAFE_CONFIG } from '../config/cafeConfig';

interface OrderSummaryCardProps {
  order: Order;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order }) => {
  const isDelivery = order.orderType === 'delivery';

  // Fix destination text per requirement: "Delivering to {address}" or "Serving at Table {n}"
  const formattedDestination = isDelivery
    ? `Delivering to ${order.destination}`
    : `Serving at Table ${order.destination.replace(/table\s*/i, '')}`;

  const mapsUrl =
    order.googleMapsUrl ||
    (order.coordinates
      ? `https://www.google.com/maps?q=${order.coordinates.lat},${order.coordinates.lng}`
      : undefined);

  return (
    <div className="w-full p-4 sm:p-6 rounded-2xl bg-[#1A0F0A]/90 border border-[#F5E9DA]/10 backdrop-blur-md shadow-xl text-left space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F5E9DA]/10">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[#C8956B]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C8956B]">
            Itemized Order Receipt
          </span>
        </div>
        <span className="text-xs font-mono text-[#F5E9DA]/60">
          {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items
        </span>
      </div>

      {/* Destination & Payment Info Box */}
      <div className="p-3.5 rounded-xl bg-[#140A06] border border-[#F5E9DA]/10 space-y-2 text-xs">
        <div className="flex items-start gap-2.5">
          {isDelivery ? (
            <MapPin className="w-4 h-4 text-[#C8956B] shrink-0 mt-0.5" />
          ) : (
            <Utensils className="w-4 h-4 text-[#C8956B] shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C8956B] font-bold block">
              {isDelivery ? 'Delivery Location' : 'Dine-In Seating'}
            </span>
            <p className="text-sm font-semibold text-[#F5E9DA] leading-snug">
              {formattedDestination}
            </p>
            {isDelivery && order.landmark && (
              <p className="text-[11px] font-mono text-[#F5E9DA]/70">
                <span className="text-[#C8956B]">Flat / Landmark:</span> {order.landmark}
              </p>
            )}
            {isDelivery && order.distanceKm !== undefined && (
              <p className="text-[10px] font-mono text-[#F5E9DA]/50">
                Distance: {order.distanceKm} km from Indiranagar roastery
              </p>
            )}
            {isDelivery && mapsUrl && (
              <div className="pt-1">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2B1810] border border-[#C8956B]/40 text-[#C8956B] hover:bg-[#C8956B] hover:text-[#140A06] transition-colors text-[11px] font-mono font-semibold"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[#F5E9DA]/10 flex items-center justify-between text-[#F5E9DA]/80">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#C8956B]" />
            <span className="font-mono text-[11px] uppercase">
              Payment: {order.paymentMode.toUpperCase()}
            </span>
          </div>
          <span className="text-emerald-400 font-mono text-[11px] font-bold">Paid / Verified</span>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {order.items.map((it) => (
          <div key={it.dish.id} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={it.dish.image}
                alt={it.dish.name}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#F5E9DA] truncate">{it.dish.name}</p>
                <span className="text-[11px] font-mono text-[#F5E9DA]/60">
                  {CAFE_CONFIG.currencySymbol}{it.dish.price}.00 × {it.quantity}
                </span>
              </div>
            </div>

            <span className="font-mono font-bold text-sm text-[#F5E9DA] shrink-0">
              {CAFE_CONFIG.currencySymbol}{it.dish.price * it.quantity}.00
            </span>
          </div>
        ))}
      </div>

      {/* Financial Breakdown (Matches Checkout Exactly) */}
      <div className="pt-3 border-t border-[#F5E9DA]/10 space-y-1.5 text-xs font-mono">
        <div className="flex justify-between text-[#F5E9DA]/70">
          <span>Subtotal</span>
          <span>{CAFE_CONFIG.currencySymbol}{order.totals.subtotal}.00</span>
        </div>

        {order.totals.discount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Special Offer Discount</span>
            <span>-{CAFE_CONFIG.currencySymbol}{order.totals.discount}.00</span>
          </div>
        )}

        {isDelivery && (
          <div className="flex justify-between text-[#F5E9DA]/70">
            <span>Roastery Delivery Fee</span>
            <span>
              {order.totals.deliveryFee === 0
                ? 'FREE'
                : `${CAFE_CONFIG.currencySymbol}${order.totals.deliveryFee}.00`}
            </span>
          </div>
        )}

        <div className="flex justify-between text-[#F5E9DA]/70">
          <span>Taxes (5% GST)</span>
          <span>{CAFE_CONFIG.currencySymbol}{order.totals.tax}.00</span>
        </div>

        <div className="pt-2 border-t border-[#F5E9DA]/10 flex justify-between font-bold text-sm sm:text-base text-[#F5E9DA]">
          <span>Grand Total</span>
          <span className="text-[#C8956B]">
            {CAFE_CONFIG.currencySymbol}{order.totals.grandTotal}.00
          </span>
        </div>
      </div>
    </div>
  );
};
