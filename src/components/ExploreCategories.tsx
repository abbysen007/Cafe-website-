import React from 'react';
import { CAFE_CATEGORIES } from '../config/cafeConfig';
import { DishCategory } from '../types/cafe';
import { ArrowUpRight } from 'lucide-react';

interface ExploreCategoriesProps {
  activeCategory: DishCategory | 'All';
  onSelectCategory: (category: DishCategory) => void;
}

export const ExploreCategories: React.FC<ExploreCategoriesProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <section id="categories" className="pt-12 pb-6 sm:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C8956B]">
              Origins & Collections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F5E9DA] tracking-tight">
              Explore Our Categories
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#F5E9DA]/70 max-w-md font-light">
            Select a realm below to jump directly into single-origin extractions, cold drip alchemies, and European butter pastries.
          </p>
        </div>

        {/* Arch-shaped Tall Pill Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5">
          {CAFE_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative h-64 sm:h-84 rounded-t-[80px] sm:rounded-t-[100px] rounded-b-[28px] overflow-hidden border p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-500 text-left cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'border-[#C8956B] shadow-2xl shadow-[#C8956B]/25 -translate-y-1.5'
                    : 'border-[#F5E9DA]/10 hover:border-[#C8956B]/60 hover:-translate-y-1.5 hover:shadow-xl'
                }`}
                aria-label={`View ${cat.name} category with ${cat.count} items`}
              >
                {/* Background Image with Dark Vignette */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#140A06]/40 via-[#140A06]/70 to-[#140A06]/95" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#C8956B]/15 backdrop-blur-[1px]" />
                  )}
                </div>

                {/* Top Badge: Item Count & Arch Icon */}
                <div className="relative z-10 flex items-center justify-between w-full pt-3 sm:pt-4">
                  <span className="font-mono text-[9px] sm:text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#140A06]/80 text-[#C8956B] border border-[#C8956B]/30 backdrop-blur-sm">
                    {cat.count} items
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#140A06]/80 border border-[#F5E9DA]/20 flex items-center justify-center text-[#F5E9DA] group-hover:bg-[#C8956B] group-hover:text-[#140A06] transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* Bottom Details */}
                <div className="relative z-10 space-y-1 pb-1.5">
                  <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#C8956B] font-semibold block">
                    Collection
                  </span>
                  <h3 className="font-serif text-base sm:text-xl font-medium text-[#F5E9DA] leading-tight group-hover:text-[#C8956B] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#F5E9DA]/60 line-clamp-2 font-light">
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
