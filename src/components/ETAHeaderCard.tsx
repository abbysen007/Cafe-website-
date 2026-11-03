import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order } from '../types/cafe';
import { getStageDetails } from '../services/orderService';

interface ETAHeaderCardProps {
  order: Order;
}

// Rolling digit component
const RollingDigit: React.FC<{ char: string }> = ({ char }) => {
  if (char === ':') {
    return <span className="inline-block mx-0.5 text-[#C8956B]">:</span>;
  }

  return (
    <div className="relative inline-flex overflow-hidden h-[1.15em] leading-[1.15em] min-w-[0.6em] justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block font-mono"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export const ETAHeaderCard: React.FC<ETAHeaderCardProps> = ({ order }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const isDelivery = order.orderType === 'delivery';
  const stage = getStageDetails(order.status, order.orderType);

  const isDelivered = order.status === 'delivered' || order.status === 'served';
  const isCancelled = order.status === 'cancelled';

  // Total estimate duration in ms
  const totalDurationMs = (order.estimatedMinutes || (isDelivery ? 12 : 8)) * 60 * 1000;
  const targetTime = order.createdAt + totalDurationMs;

  useEffect(() => {
    if (isDelivered || isCancelled) {
      setSecondsRemaining(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      setSecondsRemaining(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetTime, isDelivered, isCancelled]);

  // Format MM:SS
  const mins = String(Math.floor(secondsRemaining / 60)).padStart(2, '0');
  const secs = String(secondsRemaining % 60).padStart(2, '0');
  const timeString = `${mins}:${secs}`;

  // Percentage progress across card
  const elapsed = Math.max(0, Date.now() - order.createdAt);
  const progressRatio = isDelivered ? 1 : isCancelled ? 0 : Math.min(0.96, Math.max(0.08, elapsed / totalDurationMs));
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#2B1810]/90 via-[#1A0F0A] to-[#140A06] border border-[#C8956B]/35 shadow-2xl p-5 sm:p-7 text-left">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8956B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Thin Progress Bar Across Card Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F5E9DA]/10 overflow-hidden">
        <motion.div
          className={`h-full ${
            isCancelled ? 'bg-red-500' : isDelivered ? 'bg-emerald-400' : 'bg-[#C8956B]'
          }`}
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        
        {/* Left: Stage Headline & Order ID */}
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C8956B] font-bold">
              Order #{order.id.replace('#', '')}
            </span>
            <span className="text-[#F5E9DA]/30">·</span>
            <span className="text-xs uppercase tracking-wider text-[#F5E9DA]/70 font-mono">
              {isDelivery ? 'Delivery' : 'Dine-In Table'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.h2
              key={order.status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="font-serif text-2xl sm:text-3xl text-[#F5E9DA] leading-tight"
            >
              {stage.headline}
            </motion.h2>
          </AnimatePresence>

          <p className="text-xs sm:text-sm text-[#F5E9DA]/75 font-light leading-relaxed">
            {stage.description}
          </p>
        </div>

        {/* Right: Live ETA Countdown with Rolling Digits */}
        <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3.5 rounded-2xl bg-[#140A06]/80 border border-[#C8956B]/25 backdrop-blur-md min-w-[150px]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#F5E9DA]/60 flex items-center gap-1.5">
            {isDelivered ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : isCancelled ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-[#C8956B]" />
            )}
            <span>
              {isDelivered
                ? 'Completed'
                : isCancelled
                ? 'Status'
                : isDelivery
                ? 'Estimated Arrival'
                : 'Estimated Serving'}
            </span>
          </span>

          <div className="text-xl sm:text-2xl font-bold font-mono text-[#F5E9DA] flex items-center mt-0.5">
            {isDelivered ? (
              <span className="text-emerald-400 text-lg sm:text-xl font-serif">Served & Enjoyed</span>
            ) : isCancelled ? (
              <span className="text-red-400 text-lg">Cancelled</span>
            ) : (
              <div className="flex items-center text-[#C8956B]">
                <span className="text-xs font-normal text-[#F5E9DA]/60 mr-1.5 uppercase font-sans">
                  In
                </span>
                {timeString.split('').map((char, i) => (
                  <RollingDigit key={i} char={char} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
