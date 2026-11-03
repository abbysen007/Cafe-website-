import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  RotateCcw,
  XCircle,
  MessageCircle,
  Bell,
  UtensilsCrossed,
  Share2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Order, CartItem } from '../types/cafe';
import { CAFE_CONFIG, ORDER_TRACKING_CONFIG } from '../config/cafeConfig';
import { subscribeToOrder, cancelOrder, normalizeOrderId } from '../services/orderService';
import { ETAHeaderCard } from '../components/ETAHeaderCard';
import { OrderTimeline } from '../components/OrderTimeline';
import { LiveDeliveryMap } from '../components/LiveDeliveryMap';
import { DeliveryPartnerCard } from '../components/DeliveryPartnerCard';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
import { RatingReviewCard } from '../components/RatingReviewCard';

interface OrderTrackingPageProps {
  orderId: string;
  onBackToMenu: () => void;
  onReorder: (items: CartItem[]) => void;
  onOpenLookup: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  orderId,
  onBackToMenu,
  onReorder,
  onOpenLookup,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const prevStatusRef = useRef<string | null>(null);

  // Subscribe to real-time order updates via subscribeToOrder (Requirement 6)
  useEffect(() => {
    setIsLoading(true);
    const cleanId = normalizeOrderId(orderId);

    const unsubscribe = subscribeToOrder(cleanId, (updatedOrder) => {
      setOrder(updatedOrder);
      setIsLoading(false);

      // Toast notification and soft vibration on status change (Requirement 7)
      if (prevStatusRef.current && prevStatusRef.current !== updatedOrder.status) {
        const readableStatus = updatedOrder.status.replace(/_/g, ' ').toUpperCase();
        setStatusToast(`Order status updated: ${readableStatus}`);

        // Soft vibration on status change
        try {
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([40, 60, 40]);
          }
        } catch (e) {
          // ignore
        }

        setTimeout(() => setStatusToast(null), 3000);
      }

      prevStatusRef.current = updatedOrder.status;
    });

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  // Share / Copy tracking link
  const handleShareLink = () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (e) {
      // ignore
    }
  };

  // WhatsApp Support Link
  const getWhatsAppHelpLink = () => {
    if (!order) return '#';
    const msg = `Hi BREW. Concierge, I need assistance with my Order #${order.id} (${order.customer.name}, ${order.customer.phone}). Status: ${order.status}.`;
    return `https://wa.me/${CAFE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  // Handle Cancellation
  const handleConfirmCancel = () => {
    if (!order) return;
    const res = cancelOrder(order.id);
    if (res.success) {
      setShowCancelModal(false);
      setCancelError(null);
    } else {
      setCancelError(res.message);
    }
  };

  // Check if cancel button is currently permitted (first 60s & not in preparation or beyond)
  const canCancelOrder = Boolean(
    order &&
      order.status !== 'cancelled' &&
      !['preparing', 'out_for_delivery', 'ready_to_serve', 'delivered', 'served'].includes(
        order.status
      ) &&
      (Date.now() - order.createdAt) / 1000 <=
        ORDER_TRACKING_CONFIG.cancellationWindowSeconds
  );

  // Remaining cancel seconds for timer display
  const cancelSecondsLeft = order
    ? Math.max(
        0,
        Math.floor(
          ORDER_TRACKING_CONFIG.cancellationWindowSeconds -
            (Date.now() - order.createdAt) / 1000
        )
      )
    : 0;

  // Skeleton Loader while order loads (Requirement 7: Never show a blank screen)
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4">
          <div className="h-10 w-32 bg-[#2B1810]/60 rounded-full animate-pulse" />
          <div className="h-10 w-24 bg-[#2B1810]/60 rounded-full animate-pulse" />
        </div>
        <div className="h-44 bg-[#1A0F0A]/80 border border-[#C8956B]/20 rounded-3xl animate-pulse" />
        <div className="h-64 bg-[#1A0F0A]/80 border border-[#C8956B]/20 rounded-2xl animate-pulse" />
        <div className="h-48 bg-[#1A0F0A]/80 border border-[#C8956B]/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Not found state if order id does not exist
  if (!order) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-md mx-auto text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl text-[#F5E9DA]">Order Not Found</h2>
          <p className="text-sm text-[#F5E9DA]/70 leading-relaxed">
            We could not locate any order with ID <span className="font-mono text-[#C8956B]">#{orderId}</span>. It may have expired or was placed in a different session.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onOpenLookup}
            className="flex-1 py-3.5 min-h-[48px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Lookup by Phone Number
          </button>
          <button
            onClick={onBackToMenu}
            className="flex-1 py-3.5 min-h-[48px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Real-time Status Change Toast */}
      <AnimatePresence>
        {statusToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#C8956B] text-[#140A06] text-xs font-bold font-mono shadow-2xl flex items-center gap-2 border border-[#F5E9DA]/30"
          >
            <Bell className="w-4 h-4" />
            <span>{statusToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F5E9DA]/10">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full border border-[#F5E9DA]/15 hover:border-[#C8956B] text-[#F5E9DA] text-xs font-semibold uppercase tracking-wider hover:bg-[#2B1810]/70 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#C8956B]" />
          <span>Back to Menu</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share/Bookmark Button */}
          <button
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-full border border-[#F5E9DA]/15 hover:border-[#C8956B] text-[#F5E9DA] text-xs font-mono transition-colors hover:bg-[#2B1810]/70 cursor-pointer"
            title="Copy bookmarkable tracking URL"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#C8956B]" />
                <span className="hidden sm:inline">Share Tracking</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Header Card (Status headline, Space Grotesk ID, live rolling ETA countdown) */}
      <ETAHeaderCard order={order} />

      {/* 2. Order Status Stepper/Timeline */}
      <OrderTimeline order={order} />

      {/* 3. Live Delivery Map (Delivery Orders Only) */}
      {order.orderType === 'delivery' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C8956B]">
              Real-Time Roastery Dispatch Map
            </span>
          </div>
          <LiveDeliveryMap order={order} />
        </div>
      )}

      {/* 4. Assigned Delivery Partner Card (Appears from Out for Delivery) */}
      <DeliveryPartnerCard order={order} />

      {/* 5. 5-Star Rating & Review Card (Appears upon Delivered or Served) */}
      <RatingReviewCard
        order={order}
        onRatingSaved={() => {
          setStatusToast('Review saved! Thank you.');
          setTimeout(() => setStatusToast(null), 2500);
        }}
      />

      {/* 6. Order Summary Card (Full Itemized breakdown matching checkout) */}
      <OrderSummaryCard order={order} />

      {/* 7. Action Bar: Cancel Order, Reorder, WhatsApp Support, Back to Menu */}
      <div className="p-5 rounded-2xl bg-[#1A0F0A]/85 border border-[#C8956B]/25 backdrop-blur-md shadow-xl space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C8956B] block text-left">
          Order Actions & Concierge
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Reorder Button */}
          <button
            onClick={() => onReorder(order.items)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 min-h-[48px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-colors shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reorder Items</span>
          </button>

          {/* Cancel Order Button */}
          {order.status !== 'cancelled' && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={!canCancelOrder}
              className={`flex items-center justify-center gap-2 py-3.5 px-4 min-h-[48px] rounded-full border text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                canCancelOrder
                  ? 'border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer active:scale-95'
                  : 'border-[#F5E9DA]/10 text-[#F5E9DA]/30 cursor-not-allowed bg-[#140A06]'
              }`}
              title={
                canCancelOrder
                  ? `Cancel available for ${cancelSecondsLeft}s`
                  : 'Cancellation window expired or order is in preparation'
              }
            >
              <XCircle className="w-4 h-4" />
              <span>
                {canCancelOrder ? `Cancel (${cancelSecondsLeft}s)` : 'Cancel Order'}
              </span>
            </button>
          )}

          {/* WhatsApp Support Button */}
          <a
            href={getWhatsAppHelpLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 px-4 min-h-[48px] rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Us</span>
          </a>

          {/* Back to Menu */}
          <button
            onClick={onBackToMenu}
            className="flex items-center justify-center gap-2 py-3.5 px-4 min-h-[48px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[#2B1810] cursor-pointer whitespace-nowrap"
          >
            <UtensilsCrossed className="w-4 h-4 text-[#C8956B]" />
            <span>Back to Menu</span>
          </button>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Order Cancellation"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-[#1A0F0A] border border-red-500/40 p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-500/50 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl text-[#F5E9DA]">Cancel Order?</h3>
                <p className="text-xs text-[#F5E9DA]/75 leading-relaxed">
                  Are you sure you want to cancel Order #{order.id}? Any payment will be automatically refunded.
                </p>
              </div>

              {cancelError && (
                <p className="text-xs text-red-400 bg-red-950/60 p-2 rounded-xl">
                  {cancelError}
                </p>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 min-h-[44px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] text-xs font-semibold uppercase cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-3 min-h-[44px] rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase cursor-pointer shadow-lg"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
