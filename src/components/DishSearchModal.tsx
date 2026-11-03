import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Box, ArrowRight, Star } from 'lucide-react';
import { DISHES, CAFE_CONFIG } from '../config/cafeConfig';
import { Dish } from '../types/cafe';

interface DishSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDish: (dish: Dish) => void;
  onOpenAR: (dish: Dish) => void;
}

export const DishSearchModal: React.FC<DishSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDish,
  onOpenAR,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
      // Global shortcut '/' to open search
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        // Trigger open search
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const results = DISHES.filter((d) => {
    const q = query.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.tastingNotes.some((n) => n.toLowerCase().includes(q)) ||
      (d.roastOrigin && d.roastOrigin.toLowerCase().includes(q))
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-2xl bg-[#1A0F0A] border border-[#C8956B]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-[#F5E9DA]/10 bg-[#140A06]">
          <Search className="w-5 h-5 text-[#C8956B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search single origins, croissants, cold brew, flavor notes..."
            className="w-full bg-transparent text-sm sm:text-base text-[#F5E9DA] placeholder:text-[#F5E9DA]/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#F5E9DA]/40 hover:text-[#F5E9DA] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono text-[#F5E9DA]/50 hover:text-[#F5E9DA] border border-[#F5E9DA]/10 rounded-lg cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-2 flex-1">
          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#F5E9DA]/50">
              No matching items found for "{query}". Try "Ethiopia", "Croissant", or "Cold Brew".
            </div>
          ) : (
            results.map((dish) => (
              <div
                key={dish.id}
                className="group flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-[#2B1810]/70 transition-colors border border-transparent hover:border-[#C8956B]/30"
              >
                <div
                  onClick={() => {
                    onSelectDish(dish);
                    onClose();
                  }}
                  className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#C8956B]">
                        {dish.category}
                      </span>
                      {dish.tag && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C8956B]/20 text-[#C8956B] font-mono">
                          {dish.tag}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-[#F5E9DA] truncate group-hover:text-[#C8956B] transition-colors">
                      {dish.name}
                    </h4>
                    <span className="font-mono text-xs text-[#F5E9DA]/70 font-bold">
                      {CAFE_CONFIG.currencySymbol}{dish.price}.00
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onOpenAR(dish);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C8956B]/40 bg-[#140A06] hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    title="View in 3D / AR"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>AR</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
