import React, { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { CAFE_CONFIG, DISHES } from '../config/cafeConfig';
import { Dish } from '../types/cafe';

interface PromoBannersProps {
  onApplyCoupon: (code: string) => void;
  onAddToCart: (dish: Dish) => void;
  onExploreMenu: () => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({
  onApplyCoupon,
  onAddToCart,
  onExploreMenu,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CAFE_CONFIG.promos.firstOrderCode);
    onApplyCoupon(CAFE_CONFIG.promos.firstOrderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddBrunchCombo = () => {
    // Add V60 Pour-over + French Butter Croissant
    const v60 = DISHES.find((d) => d.id === 'single-origin-v60-pourover') || DISHES[0];
    const croissant = DISHES.find((d) => d.id === 'artisan-butter-croissant') || DISHES[2];
    onAddToCart(v60);
    onAddToCart(croissant);
  };

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Flat 20% Off First Order */}
          <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-10 bg-gradient-to-br from-[#2B1810] via-[#1C1009] to-[#140A06] border border-[#C8956B]/30 shadow-2xl flex flex-col justify-between group">
            {/* Background ambient pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C8956B]/10 blur-3xl pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8956B]/20 text-[#C8956B] text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Special Welcome Offer</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl text-[#F5E9DA] leading-tight">
                Flat 20% Off <br />
                <span className="italic text-[#C8956B]">Your First Order</span>
              </h3>

              <p className="text-xs sm:text-sm text-[#F5E9DA]/70 max-w-sm font-light">
                Order any specialty coffee or artisanal bake online. Tap below to copy and apply code immediately at checkout.
              </p>
            </div>

            <div className="pt-8 relative z-10 flex flex-wrap items-center gap-4">
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Code Applied!' : `Code: ${CAFE_CONFIG.promos.firstOrderCode}`}</span>
              </button>
              <span className="text-[11px] text-[#F5E9DA]/50 font-mono">
                Min. cart value ₹300
              </span>
            </div>
          </div>

          {/* Card 2: Weekend Roaster's Brunch Combo */}
          <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-10 bg-gradient-to-br from-[#24150D] via-[#1A0E08] to-[#120804] border border-[#F5E9DA]/10 hover:border-[#C8956B]/40 shadow-2xl flex flex-col justify-between group transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#F5E9DA]/5 blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5E9DA]/10 text-[#F5E9DA] text-xs font-bold tracking-wider uppercase">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#C8956B]" />
                <span>Weekend Signature Pairing</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl text-[#F5E9DA] leading-tight">
                Roaster’s Weekend <br />
                <span className="italic text-[#C8956B]">Brunch Combo</span>
              </h3>

              <p className="text-xs sm:text-sm text-[#F5E9DA]/70 max-w-sm font-light">
                Hand-poured Panama Geisha V60 paired with a warm Normandy butter croissant for an unmatched breakfast tasting.
              </p>
            </div>

            <div className="pt-8 relative z-10 flex flex-wrap items-center gap-4">
              <button
                onClick={handleAddBrunchCombo}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5E9DA] hover:bg-[#C8956B] text-[#140A06] text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer active:scale-95"
              >
                <span>Add Pair to Cart (₹499)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-[#F5E9DA]/50">
                Available Sat & Sun till 2 PM
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
