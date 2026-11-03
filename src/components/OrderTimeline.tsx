import React from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  CheckCircle2,
  Coffee,
  Bike,
  Utensils,
  Sparkles,
  Check,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/cafe';

interface OrderTimelineProps {
  order: Order;
}

interface StepConfig {
  status: OrderStatus;
  title: string;
  description: string;
  icon: React.ElementType;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const isDelivery = order.orderType === 'delivery';

  const steps: StepConfig[] = isDelivery
    ? [
        {
          status: 'placed',
          title: 'Order Placed',
          description: 'Your order has been received by our roastery',
          icon: ShoppingBag,
        },
        {
          status: 'confirmed',
          title: 'Confirmed by Cafe',
          description: 'The cafe roastery has accepted your order',
          icon: CheckCircle2,
        },
        {
          status: 'preparing',
          title: 'Being Prepared',
          description: 'Your barista is pouring your cappuccino & packing warm pastries',
          icon: Coffee,
        },
        {
          status: 'out_for_delivery',
          title: 'Out for Delivery',
          description: 'Your rider is on the way with your warm brew',
          icon: Bike,
        },
        {
          status: 'delivered',
          title: 'Delivered',
          description: 'Delivered! Savor every sip of your specialty roast',
          icon: Sparkles,
        },
      ]
    : [
        {
          status: 'placed',
          title: 'Order Placed',
          description: 'Your table order has been received',
          icon: ShoppingBag,
        },
        {
          status: 'confirmed',
          title: 'Confirmed',
          description: 'Order accepted by our head barista',
          icon: CheckCircle2,
        },
        {
          status: 'preparing',
          title: 'Being Prepared',
          description: 'Crafting your single-origin extraction',
          icon: Coffee,
        },
        {
          status: 'ready_to_serve',
          title: 'Ready to Serve',
          description: 'Plated and heading to your table',
          icon: Utensils,
        },
        {
          status: 'served',
          title: 'Served',
          description: 'Served! Enjoy your time at BREW.',
          icon: Sparkles,
        },
      ];

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const isCancelled = order.status === 'cancelled';

  // Format timestamp helper (e.g., "10:14 AM")
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get timestamp for each step from order.statusHistory
  const getStepTimestamp = (stepStatus: OrderStatus) => {
    const item = order.statusHistory.find((h) => h.status === stepStatus);
    return item ? formatTime(item.timestamp) : null;
  };

  const progressPercent = Math.min(100, (activeIndex / (steps.length - 1)) * 100);

  if (isCancelled) {
    return (
      <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/30 text-center space-y-2">
        <h4 className="font-serif text-lg text-red-200">Order Was Cancelled</h4>
        <p className="text-xs text-red-300/80">
          This order was cancelled and refunded to your original payment mode.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 rounded-2xl bg-[#1A0F0A]/85 border border-[#C8956B]/25 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F5E9DA]/10">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C8956B]">
          Preparation & Dispatch Flow
        </span>
        <span className="text-xs font-mono text-[#F5E9DA]/60">
          Step {activeIndex + 1} of {steps.length}
        </span>
      </div>

      {/* =========================================================================
          DESKTOP STEPPER (≥768px): Horizontal Stepper with animated connecting line
         ========================================================================= */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Background Track Line */}
          <div className="absolute top-[22px] left-[5%] right-[5%] h-[3px] bg-[#F5E9DA]/15 -translate-y-1/2 z-0" />

          {/* Animated Caramel Progress Line with Spring Fill */}
          <motion.div
            className="absolute top-[22px] left-[5%] h-[3px] bg-[#C8956B] -translate-y-1/2 z-0"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent * 0.9}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          />

          {/* Steps Grid */}
          <div className="relative z-10 grid grid-cols-5 gap-2 text-center">
            {steps.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isUpcoming = idx > activeIndex;
              const timestamp = getStepTimestamp(step.status);
              const IconComponent = step.icon;

              return (
                <div
                  key={step.status}
                  className={`flex flex-col items-center transition-opacity duration-300 ${
                    isUpcoming ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  {/* 44px Circular Icon */}
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring on current step */}
                    {isCurrent && (
                      <span className="absolute -inset-1.5 rounded-full border-2 border-[#C8956B] animate-ping opacity-75" />
                    )}

                    <div
                      className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        isCompleted
                          ? 'bg-[#C8956B] text-[#140A06] border-2 border-[#F5E9DA]'
                          : isCurrent
                          ? 'bg-[#2B1810] text-[#C8956B] border-2 border-[#C8956B] shadow-[#C8956B]/30'
                          : 'bg-[#140A06] text-[#F5E9DA]/40 border-2 border-[#F5E9DA]/15'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3 space-y-1 px-1">
                    <span
                      className={`block text-xs font-bold leading-tight ${
                        isCurrent ? 'text-[#C8956B]' : 'text-[#F5E9DA]'
                      }`}
                    >
                      {step.title}
                    </span>
                    <p className="text-[11px] text-[#F5E9DA]/65 leading-tight line-clamp-2">
                      {step.description}
                    </p>
                    {timestamp && (
                      <span className="inline-block font-mono text-[10px] text-[#C8956B]/80 pt-0.5">
                        {timestamp}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE TIMELINE (<768px): Vertical Flow with connected animated line
         ========================================================================= */}
      <div className="block md:hidden">
        <div className="relative pl-2">
          {/* Vertical Track Line */}
          <div className="absolute left-[29px] top-6 bottom-6 w-[2px] bg-[#F5E9DA]/15" />

          {/* Vertical Caramel Progress Line */}
          <motion.div
            className="absolute left-[29px] top-6 w-[2px] bg-[#C8956B] origin-top"
            initial={{ height: '0%' }}
            animate={{ height: `${progressPercent * 0.9}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          />

          <div className="space-y-6">
            {steps.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isUpcoming = idx > activeIndex;
              const timestamp = getStepTimestamp(step.status);
              const IconComponent = step.icon;

              return (
                <div
                  key={step.status}
                  className={`flex items-start gap-4 transition-opacity duration-300 ${
                    isUpcoming ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  {/* 44px Circular Icon */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    {/* Pulsing ring on current active step */}
                    {isCurrent && (
                      <span className="absolute -inset-1.5 rounded-full border-2 border-[#C8956B] animate-ping opacity-60 pointer-events-none" />
                    )}

                    <div
                      className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                        isCompleted
                          ? 'bg-[#C8956B] text-[#140A06] border-2 border-[#F5E9DA]'
                          : isCurrent
                          ? 'bg-[#2B1810] text-[#C8956B] border-2 border-[#C8956B] shadow-md shadow-[#C8956B]/30'
                          : 'bg-[#140A06] text-[#F5E9DA]/40 border-2 border-[#F5E9DA]/15'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 pt-1 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-[#C8956B]' : 'text-[#F5E9DA]'
                        }`}
                      >
                        {step.title}
                      </h4>
                      {timestamp && (
                        <span className="font-mono text-[10px] text-[#C8956B]/80 shrink-0">
                          {timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#F5E9DA]/70 leading-relaxed mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
