import React from 'react';
import { Phone, Star, ShieldCheck, Bike } from 'lucide-react';
import { Order } from '../types/cafe';
import { ORDER_TRACKING_CONFIG } from '../config/cafeConfig';

interface DeliveryPartnerCardProps {
  order: Order;
}

export const DeliveryPartnerCard: React.FC<DeliveryPartnerCardProps> = ({ order }) => {
  // Only appears from "Out for Delivery" onwards for delivery orders
  if (
    order.orderType !== 'delivery' ||
    !['out_for_delivery', 'delivered'].includes(order.status)
  ) {
    return null;
  }

  const rider = order.rider || ORDER_TRACKING_CONFIG.defaultRider;

  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#1A0F0A]/90 border border-[#C8956B]/30 backdrop-blur-md shadow-xl text-left">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F5E9DA]/10">
        <div className="flex items-center gap-2">
          <Bike className="w-4 h-4 text-[#C8956B]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C8956B]">
            Assigned Delivery Partner
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Barista Courier</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Rider profile */}
        <div className="flex items-center gap-3.5">
          <img
            src={rider.avatar}
            alt={rider.name}
            className="w-13 h-13 rounded-full object-cover border-2 border-[#C8956B]/50 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#F5E9DA]">{rider.name}</h4>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2B1810] border border-[#C8956B]/30 text-[11px] font-mono font-bold text-[#C8956B]">
                <Star className="w-3 h-3 fill-[#C8956B]" />
                <span>{rider.rating}</span>
              </div>
            </div>
            <p className="text-xs text-[#F5E9DA]/65 mt-0.5">{rider.vehicle}</p>
          </div>
        </div>

        {/* Action Buttons: Call Rider & Call Cafe */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href={`tel:${rider.phone.replace(/\s+/g, '')}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-colors shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Rider</span>
          </a>

          <a
            href={`tel:${ORDER_TRACKING_CONFIG.cafePhone.replace(/\s+/g, '')}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[#2B1810] active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-[#C8956B]" />
            <span>Call Cafe</span>
          </a>
        </div>

      </div>
    </div>
  );
};
