import React, { useState, useEffect } from 'react';
import {
  Lock,
  Coffee,
  CheckCircle2,
  Bike,
  Utensils,
  Sparkles,
  XCircle,
  ExternalLink,
  RefreshCw,
  LogOut,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/cafe';
import { CAFE_CONFIG, ORDER_TRACKING_CONFIG } from '../config/cafeConfig';
import { getAllOrders, updateOrderStatus } from '../services/orderService';

interface AdminDashboardPageProps {
  onBackToMenu: () => void;
  onOpenOrderTracking: (orderId: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onBackToMenu,
  onOpenOrderTracking,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'dine-in' | 'active'>('all');

  // Load orders
  const refreshOrders = () => {
    setOrders(getAllOrders());
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
      const interval = setInterval(refreshOrders, 2000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Handle PIN verification
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ORDER_TRACKING_CONFIG.adminPin) {
      setIsAuthenticated(true);
      setPinError(null);
    } else {
      setPinError('Incorrect Operator PIN. Please try again.');
    }
  };

  // Next status progression helper
  const getNextStatus = (order: Order): OrderStatus | null => {
    if (order.status === 'cancelled') return null;

    if (order.orderType === 'delivery') {
      switch (order.status) {
        case 'placed':
          return 'confirmed';
        case 'confirmed':
          return 'preparing';
        case 'preparing':
          return 'out_for_delivery';
        case 'out_for_delivery':
          return 'delivered';
        default:
          return null;
      }
    } else {
      // dine-in
      switch (order.status) {
        case 'placed':
          return 'confirmed';
        case 'confirmed':
          return 'preparing';
        case 'preparing':
          return 'ready_to_serve';
        case 'ready_to_serve':
          return 'served';
        default:
          return null;
      }
    }
  };

  const handleAdvanceStatus = (order: Order) => {
    const next = getNextStatus(order);
    if (next) {
      updateOrderStatus(order.id, next);
      refreshOrders();
    }
  };

  const handleSetStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    refreshOrders();
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (filterType === 'delivery') return o.orderType === 'delivery';
    if (filterType === 'dine-in') return o.orderType === 'dine-in';
    if (filterType === 'active') return !['delivered', 'served', 'cancelled'].includes(o.status);
    return true;
  });

  // PIN Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-3xl bg-[#1A0F0A] border border-[#C8956B]/40 shadow-2xl p-7 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#C8956B]/20 border border-[#C8956B]/40 text-[#C8956B] flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-[#F5E9DA]">Cafe Admin Console</h2>
            <p className="text-xs text-[#F5E9DA]/65">
              Enter operator PIN to manage live orders & dispatch
            </p>
          </div>

          {pinError && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-3.5">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              required
              placeholder="PIN (Default: 1234)"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                if (pinError) setPinError(null);
              }}
              className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 px-4 rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] focus:outline-none focus:border-[#C8956B] min-h-[48px]"
            />

            <button
              type="submit"
              className="w-full py-3.5 min-h-[48px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-colors shadow-lg active:scale-95 cursor-pointer"
            >
              Authenticate Operator
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={onBackToMenu}
              className="text-xs text-[#F5E9DA]/50 hover:text-[#C8956B] transition-colors cursor-pointer"
            >
              ← Back to Customer Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 text-left">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1A0F0A]/90 border border-[#C8956B]/30 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C8956B]" />
            <h1 className="font-serif text-xl sm:text-2xl text-[#F5E9DA]">
              {CAFE_CONFIG.brandName} Roastery Operator Console
            </h1>
          </div>
          <p className="text-xs text-[#F5E9DA]/65 mt-0.5">
            Real-time multi-tab order pipeline synced via BroadcastChannel & LocalStorage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshOrders}
            className="p-2.5 min-w-[44px] min-h-[44px] rounded-full border border-[#F5E9DA]/15 hover:border-[#C8956B] text-[#F5E9DA] hover:bg-[#2B1810] transition-colors cursor-pointer flex items-center justify-center"
            title="Refresh order pipeline"
          >
            <RefreshCw className="w-4 h-4 text-[#C8956B]" />
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full border border-[#F5E9DA]/15 hover:border-red-400 text-xs font-semibold uppercase text-[#F5E9DA]/80 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#1A0F0A] border border-[#F5E9DA]/10 overflow-x-auto">
          {(
            [
              { id: 'all', label: `All Orders (${orders.length})` },
              {
                id: 'active',
                label: `Active Pipeline (${
                  orders.filter((o) => !['delivered', 'served', 'cancelled'].includes(o.status)).length
                })`,
              },
              {
                id: 'delivery',
                label: `Delivery (${orders.filter((o) => o.orderType === 'delivery').length})`,
              },
              {
                id: 'dine-in',
                label: `Dine-In (${orders.filter((o) => o.orderType === 'dine-in').length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 min-h-[36px] text-xs font-mono rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-[#C8956B] text-[#140A06] font-bold shadow-sm'
                  : 'text-[#F5E9DA]/70 hover:text-[#F5E9DA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onBackToMenu}
          className="text-xs text-[#F5E9DA]/60 hover:text-[#C8956B] underline cursor-pointer"
        >
          View Cafe Menu
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#1A0F0A]/60 border border-[#F5E9DA]/10 text-center space-y-3">
          <Coffee className="w-10 h-10 text-[#C8956B]/40 mx-auto" />
          <h3 className="font-serif text-lg text-[#F5E9DA]">No Orders In This View</h3>
          <p className="text-xs text-[#F5E9DA]/60 max-w-sm mx-auto">
            Place an order from the customer checkout or wait for incoming patron requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order);
            const isCompleted = order.status === 'delivered' || order.status === 'served';
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={order.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#1A0F0A]/90 border border-[#C8956B]/25 backdrop-blur-md shadow-xl space-y-4 transition-all hover:border-[#C8956B]/50"
              >
                {/* Order Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F5E9DA]/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#C8956B]">
                        #{order.id.replace('#', '')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#2B1810] border border-[#C8956B]/30 text-[11px] font-mono uppercase text-[#F5E9DA]">
                        {order.orderType === 'delivery' ? 'Delivery' : 'Dine-In Table'}
                      </span>
                      <span className="text-xs text-[#F5E9DA]/40 font-mono">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-[#F5E9DA]/90 flex items-center gap-2">
                      <span className="font-semibold">{order.customer.name}</span>
                      <span>·</span>
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="font-mono text-[#C8956B] hover:underline"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                  </div>

                  {/* Status Badge & Open Customer View Link */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-400'
                          : isCancelled
                          ? 'bg-red-950/70 border border-red-500/50 text-red-400'
                          : 'bg-[#C8956B]/20 border border-[#C8956B]/50 text-[#C8956B]'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>

                    <button
                      onClick={() => onOpenOrderTracking(order.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-xs font-mono text-[#F5E9DA] hover:bg-[#2B1810] cursor-pointer"
                      title="Open Customer Live Tracking Screen"
                    >
                      <span>Track</span>
                      <ExternalLink className="w-3 h-3 text-[#C8956B]" />
                    </button>
                  </div>
                </div>

                {/* Details & Items */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {/* Destination */}
                  <div className="md:col-span-5 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#C8956B] font-bold block">
                      {order.orderType === 'delivery' ? 'Delivery Address' : 'Dine-In Seating'}
                    </span>
                    <p className="text-[#F5E9DA] font-medium leading-relaxed">
                      {order.destination}
                    </p>
                    {order.landmark && (
                      <p className="text-[11px] font-mono text-[#F5E9DA]/75">
                        <span className="text-[#C8956B]">Landmark:</span> {order.landmark}
                      </p>
                    )}
                    {order.distanceKm !== undefined && (
                      <p className="text-[10px] font-mono text-[#F5E9DA]/55">
                        Distance from Roastery: {order.distanceKm} km
                      </p>
                    )}
                    {(order.googleMapsUrl || order.coordinates) && (
                      <div className="pt-1">
                        <a
                          href={
                            order.googleMapsUrl ||
                            `https://www.google.com/maps?q=${order.coordinates!.lat},${order.coordinates!.lng}`
                          }
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

                  {/* Items List */}
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#C8956B] font-bold block">
                      Ordered Specialties
                    </span>
                    <div className="space-y-0.5 max-h-24 overflow-y-auto pr-1">
                      {order.items.map((it) => (
                        <div key={it.dish.id} className="flex justify-between text-[#F5E9DA]/80">
                          <span className="truncate pr-1">
                            {it.dish.name} <span className="text-[#C8956B]">×{it.quantity}</span>
                          </span>
                          <span className="font-mono">
                            {CAFE_CONFIG.currencySymbol}{it.dish.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals & Payment */}
                  <div className="md:col-span-3 space-y-1 border-t md:border-t-0 md:border-l border-[#F5E9DA]/10 md:pl-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#C8956B] font-bold block">
                      Financials
                    </span>
                    <div className="font-mono space-y-0.5 text-[#F5E9DA]/80">
                      <div className="flex justify-between">
                        <span>Grand Total</span>
                        <span className="text-sm font-bold text-[#C8956B]">
                          {CAFE_CONFIG.currencySymbol}{order.totals.grandTotal}.00
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#F5E9DA]/60">
                        <span>Mode</span>
                        <span className="uppercase">{order.paymentMode}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Advancement Action Bar (For Live Demos) */}
                {!isCompleted && !isCancelled && (
                  <div className="pt-3 border-t border-[#F5E9DA]/10 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#F5E9DA]/60 uppercase">
                        Quick Advance:
                      </span>
                      {nextStatus && (
                        <button
                          onClick={() => handleAdvanceStatus(order)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-colors shadow-md active:scale-95 cursor-pointer"
                        >
                          <span>Move to "{nextStatus.replace(/_/g, ' ')}"</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(order.orderType === 'delivery'
                        ? ['confirmed', 'preparing', 'out_for_delivery', 'delivered']
                        : ['confirmed', 'preparing', 'ready_to_serve', 'served']
                      ).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleSetStatus(order.id, st as OrderStatus)}
                          disabled={order.status === st}
                          className={`px-2.5 py-1 min-h-[32px] text-[11px] font-mono rounded-lg border transition-colors cursor-pointer ${
                            order.status === st
                              ? 'border-[#C8956B] bg-[#2B1810] text-[#C8956B] font-bold'
                              : 'border-[#F5E9DA]/10 text-[#F5E9DA]/60 hover:border-[#C8956B]/40 hover:text-[#F5E9DA]'
                          }`}
                        >
                          {st.replace(/_/g, ' ')}
                        </button>
                      ))}

                      <button
                        onClick={() => handleSetStatus(order.id, 'cancelled')}
                        className="px-2.5 py-1 min-h-[32px] text-[11px] font-mono rounded-lg border border-red-500/30 text-red-400 hover:bg-red-950/40 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
