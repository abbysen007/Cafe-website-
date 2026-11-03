import React, { useState } from 'react';
import { X, Search, Phone, Hash, AlertCircle, ArrowRight } from 'lucide-react';
import { findOrderByPhoneAndId, normalizeOrderId } from '../services/orderService';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderFound: (orderId: string) => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  onOrderFound,
}) => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = normalizeOrderId(orderId);
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanId) {
      setError('Please enter a valid Order ID (e.g. BRW-7977).');
      return;
    }

    if (cleanPhone.length !== 10) {
      setError('Please enter your 10-digit mobile number.');
      return;
    }

    const order = findOrderByPhoneAndId(cleanId, cleanPhone);

    if (order) {
      onOrderFound(order.id);
      onClose();
    } else {
      setError('No order found matching this Order ID and phone number. Please check your credentials or place a new order.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Track Order Lookup"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#180E07] border border-[#C8956B]/35 shadow-2xl p-6 sm:p-7 text-left space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F5E9DA]/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C8956B]/20 text-[#C8956B]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-[#F5E9DA]">Track Your Order</h3>
              <p className="text-xs text-[#F5E9DA]/60">Enter your order credentials</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] hover:bg-[#C8956B] transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Close track order modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#F5E9DA]/70 font-semibold font-mono">
              <Hash className="w-3.5 h-3.5 text-[#C8956B]" />
              <span>Order ID *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BRW-7977"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-3 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none focus:border-[#C8956B] font-mono min-h-[48px]"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#F5E9DA]/70 font-semibold font-mono">
              <Phone className="w-3.5 h-3.5 text-[#C8956B]" />
              <span>10-Digit Mobile Number *</span>
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(digits);
                if (error) setError(null);
              }}
              className="w-full px-4 py-3 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none focus:border-[#C8956B] font-mono min-h-[48px]"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-colors shadow-xl active:scale-95 cursor-pointer mt-2"
          >
            <span>Lookup & Track Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-1">
          <p className="text-[11px] text-[#F5E9DA]/50">
            Order ID is generated upon checkout receipt or sent via WhatsApp confirmation.
          </p>
        </div>

      </div>
    </div>
  );
};
