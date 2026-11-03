import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Tag,
  Phone,
  MapPin,
  User,
  MessageCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Order } from '../types/cafe';
import { CAFE_CONFIG, ORDER_TRACKING_CONFIG, DELIVERY_CONFIG } from '../config/cafeConfig';
import { saveOrder } from '../services/orderService';
import {
  DeliveryLocationPicker,
  DeliveryLocationState,
} from './DeliveryLocationPicker';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearCart: () => void;
  couponCode: string;
  onApplyCoupon: (code: string) => void;
  onTrackOrder: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  couponCode,
  onApplyCoupon,
  onTrackOrder,
}) => {
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableOrAddress, setTableOrAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');

  // Delivery Location State (GPS / Map Pin / Nominatim / Distance)
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocationState>({
    coords: null,
    accuracy: null,
    address: '',
    landmark: '',
    distanceKm: null,
    fee: null,
    isOutOfZone: false,
  });

  // Inline validation errors (Requirement B.8 & Location requirements)
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    tableOrAddress?: string;
    address?: string;
    landmark?: string;
    location?: string;
  }>({});

  // Generated Order Details
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [savedOrderSummary, setSavedOrderSummary] = useState<{
    name: string;
    phone: string;
    destination: string;
    landmark?: string;
    distanceKm?: number;
    accuracy?: number | 'manual';
    googleMapsUrl?: string;
    items: CartItem[];
    total: number;
    payment: string;
    orderType: 'dine-in' | 'delivery';
  } | null>(null);

  if (!isOpen) return null;

  // Total quantity and grammar
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsLabel = totalItemCount === 1 ? '1 item' : `${totalItemCount} items`;

  // Accurate math: sum of price x quantity (Requirement B.12)
  const subtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const isDiscountApplied = couponCode.toUpperCase() === CAFE_CONFIG.promos.firstOrderCode;
  const discountAmount = isDiscountApplied
    ? Math.round(subtotal * (CAFE_CONFIG.promos.firstOrderDiscountPercent / 100))
    : 0;

  // Dynamic Delivery Fee based on distance:
  // 0-2km: ₹30, 2-4km: ₹50, 4-6km: ₹70, >6km: unavailable (Requirement 4)
  const deliveryFee =
    orderType === 'delivery'
      ? subtotal === 0
        ? 0
        : deliveryLocation.fee !== null
        ? deliveryLocation.fee
        : 40 // default initial fee before pin is placed
      : 0;

  const tax = Math.round((subtotal - discountAmount) * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee + tax);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim().toUpperCase() === CAFE_CONFIG.promos.firstOrderCode) {
      onApplyCoupon(inputCoupon.trim().toUpperCase());
      setCouponError('');
      setInputCoupon('');
    } else {
      setCouponError('Invalid code. Try "BREW20" for 20% off!');
    }
  };

  // Validation function (Requirements 1, 4, 7 & B.8)
  const validateForm = () => {
    const newErrors: {
      name?: string;
      phone?: string;
      tableOrAddress?: string;
      address?: string;
      landmark?: string;
      location?: string;
    } = {};

    if (customerName.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      newErrors.phone = 'Phone number must have exactly 10 digits.';
    }

    if (orderType === 'dine-in') {
      if (tableOrAddress.trim().length < 2) {
        newErrors.tableOrAddress =
          'Please specify table details (e.g. Table 4 or Barista Counter).';
      }
    } else {
      // Delivery validation
      if (deliveryLocation.isOutOfZone) {
        newErrors.location =
          'Your location is outside our 6 km delivery radius. Please choose Dine-In or counter pickup.';
      } else if (!deliveryLocation.coords && !deliveryLocation.address.trim()) {
        newErrors.location =
          'Please drop your pin or search your delivery locality.';
      }

      if (!deliveryLocation.address || deliveryLocation.address.trim().length < 5) {
        newErrors.address = 'Please specify a street or area address (min 5 characters).';
      }

      if (!deliveryLocation.landmark || deliveryLocation.landmark.trim().length < 2) {
        newErrors.landmark = 'Flat / House / Landmark is required (e.g. 2nd floor, Apt 402).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderId = `BRW-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedOrderId(orderId);

    const resolvedDestination =
      orderType === 'delivery'
        ? deliveryLocation.address.trim()
        : tableOrAddress.trim();

    const deliveryCoords =
      orderType === 'delivery' && deliveryLocation.coords
        ? {
            lat: deliveryLocation.coords.lat,
            lng: deliveryLocation.coords.lng,
            accuracy: deliveryLocation.accuracy || 'manual',
          }
        : orderType === 'delivery'
        ? ORDER_TRACKING_CONFIG.defaultCustomerCoords
        : undefined;

    const googleMapsUrl = deliveryCoords
      ? `https://www.google.com/maps?q=${deliveryCoords.lat},${deliveryCoords.lng}`
      : undefined;

    const newOrder: Order = {
      id: orderId,
      createdAt: Date.now(),
      orderType,
      status: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: Date.now(),
          title: 'Order Placed',
          description:
            orderType === 'delivery'
              ? 'Your order has been received by our roastery'
              : 'Your table order has been received',
        },
      ],
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
      },
      destination: resolvedDestination,
      landmark: orderType === 'delivery' ? deliveryLocation.landmark.trim() : undefined,
      distanceKm:
        orderType === 'delivery' && deliveryLocation.distanceKm !== null
          ? deliveryLocation.distanceKm
          : undefined,
      accuracy: orderType === 'delivery' ? deliveryLocation.accuracy || 'manual' : undefined,
      googleMapsUrl,
      coordinates: deliveryCoords,
      items: [...items],
      totals: {
        subtotal,
        discount: discountAmount,
        deliveryFee,
        tax,
        grandTotal,
      },
      paymentMode: paymentMethod,
      estimatedMinutes: orderType === 'delivery' ? 15 : 8,
      rider: orderType === 'delivery' ? ORDER_TRACKING_CONFIG.defaultRider : undefined,
    };

    // Save order in localStorage so it survives refresh (Requirement 1 & 6)
    saveOrder(newOrder);

    setSavedOrderSummary({
      name: customerName,
      phone: customerPhone,
      destination: resolvedDestination,
      landmark: orderType === 'delivery' ? deliveryLocation.landmark.trim() : undefined,
      distanceKm:
        orderType === 'delivery' && deliveryLocation.distanceKm !== null
          ? deliveryLocation.distanceKm
          : undefined,
      accuracy: orderType === 'delivery' ? deliveryLocation.accuracy || 'manual' : undefined,
      googleMapsUrl,
      items: [...items],
      total: grandTotal,
      payment: paymentMethod,
      orderType,
    });

    setOrderComplete(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C8956B', '#F5E9DA', '#FFFFFF'],
      });
    } catch (e) {
      // safe fallback
    }
  };

  const resetAndClose = () => {
    setOrderComplete(false);
    setIsCheckingOut(false);
    setErrors({});
    onClearCart();
    onClose();
  };

  // WhatsApp pre-filled order link with exact Google Maps Pin & Landmark (Requirement 6 & B.10)
  const getWhatsAppLink = () => {
    if (!savedOrderSummary) return '#';
    const itemsText = savedOrderSummary.items
      .map((i) => `• ${i.dish.name} x${i.quantity} (₹${i.dish.price * i.quantity})`)
      .join('\n');

    let destinationText = '';
    if (savedOrderSummary.orderType === 'delivery') {
      destinationText = `*Delivery Destination:* ${savedOrderSummary.destination}
*Flat / House / Landmark:* ${savedOrderSummary.landmark || 'N/A'}
*Distance from Roastery:* ${savedOrderSummary.distanceKm ? `${savedOrderSummary.distanceKm} km` : '6 km zone'}
*Google Maps Pin:* ${savedOrderSummary.googleMapsUrl || 'Available on receipt'}`;
    } else {
      destinationText = `*Table Seating:* Serving at Table ${savedOrderSummary.destination.replace(/table\s*/i, '')}`;
    }

    const message = `*BREW. Roastery Order Confirmation*
Order ID: #${confirmedOrderId}
Customer: ${savedOrderSummary.name}
Phone: ${savedOrderSummary.phone}
Type: ${savedOrderSummary.orderType === 'dine-in' ? 'Dine-In Table' : 'Specialty Delivery'}

${destinationText}

*Items Ordered:*
${itemsText}

*Grand Total:* ₹${savedOrderSummary.total}.00
*Payment Mode:* ${savedOrderSummary.payment.toUpperCase()}
*Estimated Preparation:* 8–15 mins`;

    return `https://wa.me/${CAFE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart and Order Drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      {/* Full-width (100vw) on mobile and full-height (100dvh) (Requirement B.6 & B.11) */}
      <div className="relative w-full sm:max-w-md w-screen h-[100dvh] bg-[#180E07] border-l border-[#C8956B]/30 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Drawer Header (Fixed at top) */}
        <div className="shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-[#F5E9DA]/10 bg-[#140A06]/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C8956B]/20 text-[#C8956B]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl text-[#F5E9DA]">
                {orderComplete
                  ? 'Order Confirmed'
                  : isCheckingOut
                  ? 'Review & Confirm Order'
                  : 'Your Coffee Bag'}
              </h2>
              {/* Correct grammar: 1 item vs 2 items (Requirement B.7) */}
              {!orderComplete && (
                <span className="text-xs text-[#F5E9DA]/60 font-mono">
                  {itemsLabel}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={orderComplete ? resetAndClose : onClose}
            className="p-2.5 min-w-[44px] min-h-[44px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] hover:bg-[#C8956B] transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Close cart drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================================
            STATE 1: ORDER CONFIRMED SCREEN (Requirement 1 & 5)
            Centered vertically with "Track My Order" primary button above WhatsApp
           ========================================================================= */}
        {orderComplete && savedOrderSummary ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col justify-center my-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#C8956B]/20 text-[#C8956B] border border-[#C8956B]/40 flex items-center justify-center mx-auto shrink-0 shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C8956B] font-bold">
                Order #{confirmedOrderId}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-[#F5E9DA]">
                Thank you, {savedOrderSummary.name}!
              </h3>
              {/* Corrected destination text: "Delivering to {address}" or "Serving at Table {n}" */}
              <div className="space-y-1">
                <p className="text-xs text-[#F5E9DA]/80 max-w-xs mx-auto leading-relaxed">
                  {savedOrderSummary.orderType === 'delivery'
                    ? `Delivering to ${savedOrderSummary.destination}`
                    : `Serving at Table ${savedOrderSummary.destination.replace(/table\s*/i, '')}`}
                </p>
                {savedOrderSummary.landmark && (
                  <p className="text-[11px] font-mono text-[#C8956B]">
                    Landmark: {savedOrderSummary.landmark}
                  </p>
                )}
                {savedOrderSummary.googleMapsUrl && (
                  <a
                    href={savedOrderSummary.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#C8956B] hover:underline"
                  >
                    <span>View Delivery Pin on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Item List & Specs Summary */}
            <div className="p-4 rounded-2xl bg-[#140A06] border border-[#F5E9DA]/10 text-xs font-mono space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-[#C8956B] font-bold border-b border-[#F5E9DA]/10 pb-1 flex justify-between">
                <span>Order Receipt</span>
                <span className="text-emerald-400">Paid / Verified</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {savedOrderSummary.items.map((it) => (
                  <div key={it.dish.id} className="flex justify-between text-[#F5E9DA]/90">
                    <span className="truncate pr-2">
                      {it.dish.name} <span className="text-[#C8956B]">x{it.quantity}</span>
                    </span>
                    <span className="shrink-0 font-bold">
                      {CAFE_CONFIG.currencySymbol}{it.dish.price * it.quantity}.00
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown matching checkout */}
              <div className="pt-2 border-t border-[#F5E9DA]/10 space-y-1">
                <div className="flex justify-between text-[#F5E9DA]/70">
                  <span>Subtotal</span>
                  <span>{CAFE_CONFIG.currencySymbol}{subtotal}.00</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount (20%)</span>
                    <span>-{CAFE_CONFIG.currencySymbol}{discountAmount}.00</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-[#F5E9DA]/70">
                    <span>Delivery</span>
                    <span>{CAFE_CONFIG.currencySymbol}{deliveryFee}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-[#F5E9DA]/70">
                  <span>Taxes (5% GST)</span>
                  <span>{CAFE_CONFIG.currencySymbol}{tax}.00</span>
                </div>
                <div className="flex justify-between text-[#F5E9DA] font-bold pt-1 text-sm border-t border-[#F5E9DA]/10">
                  <span>Grand Total</span>
                  <span className="text-[#C8956B]">
                    {CAFE_CONFIG.currencySymbol}{savedOrderSummary.total}.00
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Primary "Track My Order", WhatsApp & Back to Menu (Requirement 1) */}
            <div className="space-y-2.5 pt-1">
              {/* PRIMARY BUTTON: Track My Order above WhatsApp */}
              <button
                onClick={() => {
                  onTrackOrder(confirmedOrderId);
                  resetAndClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xl active:scale-95"
              >
                <Clock className="w-4 h-4" />
                <span>Track My Order</span>
              </button>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Order on WhatsApp</span>
              </a>

              <button
                onClick={resetAndClose}
                className="w-full py-3 min-h-[44px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Back to Menu
              </button>
            </div>
          </div>
        ) : isCheckingOut ? (
          /* =========================================================================
             STATE 2: CHECKOUT FORM (Requirement B.6 & B.8)
             Scrollable body with padding for mobile keyboard, sticky Confirm button
             ========================================================================= */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-28">
              
              <div className="flex items-center justify-between pb-2 border-b border-[#F5E9DA]/10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C8956B]">
                  Customer & Service Details
                </span>
                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs text-[#F5E9DA]/60 hover:text-[#C8956B] underline cursor-pointer"
                >
                  Edit Cart
                </button>
              </div>

              {/* Form with required validation */}
              <div className="space-y-3.5">
                {/* Name Field */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
                    <User className="w-3.5 h-3.5 text-[#C8956B]" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Rao"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#140A06] border text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none ${
                      errors.name ? 'border-red-500' : 'border-[#F5E9DA]/15 focus:border-[#C8956B]'
                    }`}
                  />
                  {errors.name && (
                    <span className="text-[11px] text-red-400 block">{errors.name}</span>
                  )}
                </div>

                {/* Phone Number Field (Requirement B.8) */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-[#C8956B]" />
                    <span>10-Digit Mobile Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setCustomerPhone(digits);
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#140A06] border text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none font-mono ${
                      errors.phone ? 'border-red-500' : 'border-[#F5E9DA]/15 focus:border-[#C8956B]'
                    }`}
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-red-400 block">{errors.phone}</span>
                  )}
                </div>

                {/* Dining Option Choice: Dine-In Table vs Delivery (Requirement 1) */}
                <div className="space-y-3">
                  <div className="flex p-1 rounded-xl bg-[#140A06] border border-[#F5E9DA]/10">
                    <button
                      type="button"
                      onClick={() => setOrderType('dine-in')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        orderType === 'dine-in'
                          ? 'bg-[#C8956B] text-[#140A06] font-bold shadow-sm'
                          : 'text-[#F5E9DA]/70 hover:text-[#F5E9DA]'
                      }`}
                    >
                      Dine-In Table
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        orderType === 'delivery'
                          ? 'bg-[#C8956B] text-[#140A06] font-bold shadow-sm'
                          : 'text-[#F5E9DA]/70 hover:text-[#F5E9DA]'
                      }`}
                    >
                      Delivery
                    </button>
                  </div>

                  {/* 1. Dine-In Seating (Shown when Dine-In is selected) */}
                  {orderType === 'dine-in' ? (
                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#C8956B]" />
                        <span>Table Number or Seating Area *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Table 4 / Barista Counter"
                        value={tableOrAddress}
                        onChange={(e) => {
                          setTableOrAddress(e.target.value);
                          if (errors.tableOrAddress) setErrors({ ...errors, tableOrAddress: undefined });
                        }}
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#140A06] border text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none ${
                          errors.tableOrAddress
                            ? 'border-red-500'
                            : 'border-[#F5E9DA]/15 focus:border-[#C8956B]'
                        }`}
                      />
                      {errors.tableOrAddress && (
                        <span className="text-[11px] text-red-400 block">
                          {errors.tableOrAddress}
                        </span>
                      )}
                    </div>
                  ) : (
                    /* 2. Accurate Delivery Location Detection & Map (Shown when Delivery is selected) (Requirement 1–5) */
                    <div className="space-y-2">
                      <DeliveryLocationPicker
                        locationState={deliveryLocation}
                        onChange={setDeliveryLocation}
                        errors={{
                          location: errors.location,
                          address: errors.address,
                          landmark: errors.landmark,
                        }}
                      />
                      {errors.location && (
                        <span className="text-[11px] text-red-400 block font-mono">
                          {errors.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Option */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[11px] uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['upi', 'card', 'counter'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 text-[11px] font-mono rounded-xl border uppercase transition-colors cursor-pointer ${
                          paymentMethod === method
                            ? 'border-[#C8956B] bg-[#C8956B] text-[#140A06] font-bold'
                            : 'border-[#F5E9DA]/10 text-[#F5E9DA]/70 hover:border-[#C8956B]/30'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Breakdown (Updated dynamically based on distance & tier fee) (Requirement 4) */}
                <div className="p-3.5 rounded-2xl bg-[#140A06] border border-[#F5E9DA]/10 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-[#F5E9DA]/60">
                    <span>Subtotal ({itemsLabel})</span>
                    <span>{CAFE_CONFIG.currencySymbol}{subtotal}.00</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount (20%)</span>
                      <span>-{CAFE_CONFIG.currencySymbol}{discountAmount}.00</span>
                    </div>
                  )}
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-[#F5E9DA]/80">
                      <span className="flex items-center gap-1">
                        <span>Delivery Fee</span>
                        {deliveryLocation.distanceKm !== null && (
                          <span className="text-[#C8956B]">
                            ({deliveryLocation.distanceKm} km)
                          </span>
                        )}
                      </span>
                      <span className="text-[#C8956B]">
                        {deliveryFee === 0 ? 'FREE' : `${CAFE_CONFIG.currencySymbol}${deliveryFee}.00`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#F5E9DA]/60">
                    <span>Taxes (5% GST)</span>
                    <span>{CAFE_CONFIG.currencySymbol}{tax}.00</span>
                  </div>
                  <div className="pt-2 border-t border-[#F5E9DA]/10 flex justify-between font-bold text-[#F5E9DA] text-sm">
                    <span>Final Amount</span>
                    <span className="text-[#C8956B]">
                      {CAFE_CONFIG.currencySymbol}{grandTotal}.00
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Sticky "Confirm Order" Button at Bottom: >= 52px Touch Target (Requirements 4, 7 & B.6) */}
            <div className="shrink-0 p-4 sm:p-5 border-t border-[#F5E9DA]/15 bg-[#140A06] shadow-2xl z-20">
              <button
                type="button"
                disabled={orderType === 'delivery' && deliveryLocation.isOutOfZone}
                onClick={handlePlaceOrder}
                className={`w-full flex items-center justify-center gap-2 py-3.5 min-h-[52px] rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xl ${
                  orderType === 'delivery' && deliveryLocation.isOutOfZone
                    ? 'bg-red-950/80 border border-red-500/50 text-red-300 cursor-not-allowed opacity-80'
                    : 'bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] cursor-pointer active:scale-95'
                }`}
              >
                {orderType === 'delivery' && deliveryLocation.isOutOfZone ? (
                  <span>Delivery Unavailable Beyond 6 km</span>
                ) : (
                  <>
                    <span>Confirm Order • {CAFE_CONFIG.currencySymbol}{grandTotal}.00</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* =========================================================================
             STATE 3: EMPTY CART
             ========================================================================= */
          <div className="p-8 my-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#2B1810] text-[#C8956B] flex items-center justify-center mx-auto border border-[#C8956B]/20">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl text-[#F5E9DA]">Your Coffee Bag is Empty</h3>
              <p className="text-xs text-[#F5E9DA]/60 max-w-xs mx-auto">
                Explore our single origin pour-overs and fresh bakes to start your order.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 min-h-[44px] rounded-full bg-[#C8956B] text-[#140A06] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          /* =========================================================================
             STATE 4: REGULAR CART VIEW
             ========================================================================= */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* Order Mode Switch */}
              <div className="flex p-1 rounded-xl bg-[#140A06] border border-[#F5E9DA]/10">
                <button
                  type="button"
                  onClick={() => setOrderType('dine-in')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    orderType === 'dine-in'
                      ? 'bg-[#C8956B] text-[#140A06] font-bold shadow-sm'
                      : 'text-[#F5E9DA]/70'
                  }`}
                >
                  Dine-In Table
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    orderType === 'delivery'
                      ? 'bg-[#C8956B] text-[#140A06] font-bold shadow-sm'
                      : 'text-[#F5E9DA]/70'
                  }`}
                >
                  Delivery
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.dish.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#140A06]/70 border border-[#F5E9DA]/10"
                  >
                    <img
                      src={item.dish.image}
                      alt={item.dish.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className="text-xs font-medium text-[#F5E9DA] truncate">
                        {item.dish.name}
                      </h4>
                      <span className="font-mono text-xs font-bold text-[#C8956B] block mt-0.5">
                        {CAFE_CONFIG.currencySymbol}{item.dish.price}.00
                      </span>
                    </div>

                    {/* Stepper with >= 44px tap targets */}
                    <div className="flex items-center gap-1 bg-[#2B1810] px-1 py-0.5 rounded-xl border border-[#C8956B]/30 shrink-0">
                      <button
                        onClick={() => onUpdateQuantity(item.dish.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:text-[#C8956B] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-xs font-bold px-1.5 text-center min-w-[20px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:text-[#C8956B] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveItem(item.dish.id)}
                      className="p-2 text-[#F5E9DA]/40 hover:text-red-400 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-1">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#C8956B]" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. BREW20)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] uppercase placeholder:normal-case focus:outline-none focus:border-[#C8956B] font-mono min-h-[44px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 min-h-[44px] rounded-xl bg-[#2B1810] hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
                {isDiscountApplied && (
                  <span className="text-[11px] text-emerald-400 block mt-1">
                    ✦ 20% First order discount active!
                  </span>
                )}
                {couponError && (
                  <span className="text-[11px] text-red-400 block mt-1">
                    {couponError}
                  </span>
                )}
              </div>
            </div>

            {/* Footer Checkout Summary (Requirement B.12) */}
            <div className="shrink-0 p-4 sm:p-6 border-t border-[#F5E9DA]/10 bg-[#140A06] space-y-3 z-20">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#F5E9DA]/70">
                  <span>Subtotal ({itemsLabel})</span>
                  <span>{CAFE_CONFIG.currencySymbol}{subtotal}.00</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount (20%)</span>
                    <span>-{CAFE_CONFIG.currencySymbol}{discountAmount}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-[#F5E9DA]/70">
                  <span>Taxes (5% GST)</span>
                  <span>{CAFE_CONFIG.currencySymbol}{tax}.00</span>
                </div>
                <div className="pt-2 border-t border-[#F5E9DA]/10 flex justify-between font-bold text-base text-[#F5E9DA]">
                  <span>Total Amount</span>
                  <span className="text-[#C8956B]">
                    {CAFE_CONFIG.currencySymbol}{grandTotal}.00
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xl active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
