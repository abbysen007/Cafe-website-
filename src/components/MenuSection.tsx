import React, { useState, useEffect, useRef } from 'react';
import { Box, Plus, Star, Filter, Check } from 'lucide-react';
import { DISHES, CAFE_CONFIG } from '../config/cafeConfig';
import { Dish, DishCategory } from '../types/cafe';

interface MenuSectionProps {
  selectedCategory: DishCategory | 'All';
  onCategoryChange: (category: DishCategory | 'All') => void;
  onOpenAR: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  selectedCategory,
  onCategoryChange,
  onOpenAR,
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'price-asc' | 'price-desc'>('featured');
  const [addedDishId, setAddedDishId] = useState<string | null>(null);
  const [showARHint, setShowARHint] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const categories: (DishCategory | 'All')[] = [
    'All',
    'Coffee',
    'Cold Drinks',
    'Bakery',
    'Breakfast',
    'Desserts',
    'Snacks',
  ];

  // Show "Try AR" floating hint when menu scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowARHint(true);
        }
      },
      { threshold: 0.1 }
    );

    if (menuRef.current) {
      observer.observe(menuRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll active category into view (Requirement C.16)
  useEffect(() => {
    const activeEl = tabRefs.current[selectedCategory];
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  const handleAddWithFeedback = (dish: Dish) => {
    onAddToCart(dish);
    setAddedDishId(dish.id);
    setTimeout(() => setAddedDishId(null), 1200);
  };

  // Filter and sort dishes
  const filteredDishes = DISHES.filter((dish) => {
    const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.tastingNotes.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // featured
  });

  return (
    <section ref={menuRef} id="menu" className="pt-6 pb-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Stacked cleanly vertically on mobile without overlap (Requirement C.15) */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C8956B]">
              Curated Roastery & Kitchen
            </span>
            {showARHint && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8956B] text-[#140A06] text-xs font-bold shadow-md animate-fade-in">
                <Box className="w-3.5 h-3.5" />
                <span>Try AR Preview on your table!</span>
              </div>
            )}
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F5E9DA] tracking-tight">
            Popular Dishes & Brews
          </h2>

          <p className="text-xs sm:text-sm text-[#F5E9DA]/75 max-w-xl font-light leading-relaxed">
            Every dish is available for tabletop 3D Augmented Reality visualization. Tap
            the <span className="text-[#C8956B] font-medium">"View in AR"</span> button to project onto your real-world surface.
          </p>
        </div>

        {/* Filter Bar: Tabs scroll horizontally with active centered, Search & Sort full-width below on mobile (Requirement C.16) */}
        <div className="flex flex-col gap-3.5 mb-8 p-3 rounded-2xl bg-[#1A0F0A]/80 border border-[#F5E9DA]/10 backdrop-blur-md">
          {/* Horizontally Scrollable Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  ref={(el) => {
                    tabRefs.current[cat] = el;
                  }}
                  onClick={() => onCategoryChange(cat)}
                  className={`px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 flex items-center justify-center ${
                    isActive
                      ? 'bg-[#C8956B] text-[#140A06] shadow-md font-bold'
                      : 'text-[#F5E9DA]/75 hover:text-[#F5E9DA] hover:bg-[#F5E9DA]/5'
                  }`}
                  aria-label={`Filter by ${cat}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box and Sort Dropdown: Stacked full-width on mobile (Requirement C.16) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full pt-1 border-t border-[#F5E9DA]/10">
            {/* Quick Filter Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coffee or flavor..."
              className="w-full sm:flex-1 px-4 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] placeholder:text-[#F5E9DA]/40 focus:outline-none focus:border-[#C8956B]"
            />

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 min-h-[44px] w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#C8956B] shrink-0 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-[#140A06] border border-[#F5E9DA]/15 rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm text-[#F5E9DA] focus:outline-none focus:border-[#C8956B] cursor-pointer"
                aria-label="Sort dishes"
              >
                <option value="featured">Sort: Featured</option>
                <option value="rating">Sort: Top Rated</option>
                <option value="price-asc">Sort: Price (Low to High)</option>
                <option value="price-desc">Sort: Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dish Cards Grid: 1 card per row on phones, 2 on tablets (Requirement C.17) */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-[#1A0F0A]/40 border border-[#F5E9DA]/10 p-6">
            <p className="text-base text-[#F5E9DA]/70 font-serif">No dishes found matching "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                onCategoryChange('All');
              }}
              className="mt-4 px-6 py-2.5 min-h-[44px] text-xs font-semibold uppercase tracking-wider text-[#140A06] bg-[#C8956B] rounded-full cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => {
              const isAdded = addedDishId === dish.id;

              return (
                <div
                  key={dish.id}
                  className="group relative flex flex-col justify-between rounded-[28px] overflow-hidden bg-gradient-to-b from-[#1C1009] to-[#120804] border border-[#F5E9DA]/10 hover:border-[#C8956B]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#C8956B]/10"
                >
                  {/* Fixed Image Height of ~220px with object-fit: cover (Requirement C.17) */}
                  <div className="relative h-[220px] w-full overflow-hidden bg-[#24130C] shrink-0">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-[220px] object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1009] via-transparent to-black/30 pointer-events-none" />

                    {/* Tag */}
                    {dish.tag && (
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span
                          className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${
                            dish.tag === 'Bestseller'
                              ? 'bg-[#C8956B] text-[#140A06] border-[#C8956B]'
                              : dish.tag === "Chef's Special"
                              ? 'bg-[#2B1810]/95 text-[#F5E9DA] border-[#C8956B]/40'
                              : 'bg-[#140A06]/85 text-[#F5E9DA] border-[#F5E9DA]/20'
                          }`}
                        >
                          {dish.tag}
                        </span>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#140A06]/90 backdrop-blur-md border border-[#F5E9DA]/15 text-xs font-mono font-medium text-[#F5E9DA]">
                      <Star className="w-3.5 h-3.5 fill-[#C8956B] text-[#C8956B]" />
                      <span>{dish.rating}</span>
                      <span className="text-[#F5E9DA]/50 text-[10px]">({dish.reviewsCount})</span>
                    </div>

                    {dish.roastOrigin && (
                      <div className="absolute bottom-3 left-3 z-10 max-w-[85%] truncate text-[10px] font-medium text-[#F5E9DA]/90 bg-[#140A06]/80 px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                        {dish.roastOrigin}
                      </div>
                    )}
                  </div>

                  {/* Card Content with larger text sizes (Requirement C.17) */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#C8956B] font-semibold">
                        <span>{dish.category}</span>
                        {dish.prepTime && (
                          <span className="font-mono text-[#F5E9DA]/50">{dish.prepTime}</span>
                        )}
                      </div>

                      {/* Name: 18px+ (Requirement C.17) */}
                      <h3 className="font-serif text-[19px] sm:text-xl font-medium text-[#F5E9DA] group-hover:text-[#C8956B] transition-colors leading-snug">
                        {dish.name}
                      </h3>

                      {/* Description: 14px+ (Requirement C.17) */}
                      <p className="text-[14px] text-[#F5E9DA]/75 line-clamp-3 leading-relaxed font-light">
                        {dish.description}
                      </p>

                      {/* Tasting Notes */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dish.tastingNotes.map((note, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] text-[#F5E9DA]/60 hover:text-[#C8956B] transition-colors"
                          >
                            #{note}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="pt-3 border-t border-[#F5E9DA]/10 flex flex-col gap-3">
                      {/* Price & Quick Add Button with >=44px tap target (Requirement C.18) */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#F5E9DA]/50 block">
                            Price
                          </span>
                          <span className="font-mono text-2xl font-bold text-[#F5E9DA]">
                            {CAFE_CONFIG.currencySymbol}{dish.price}
                            <sup className="text-xs font-normal text-[#C8956B]">.00</sup>
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddWithFeedback(dish)}
                          className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white scale-105'
                              : 'bg-[#F5E9DA]/15 hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06]'
                          }`}
                          aria-label={`Add ${dish.name} to order`}
                          title="Add to order"
                        >
                          {isAdded ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Full-width "View in AR" button with min-h-[48px] (Requirement C.17) */}
                      <button
                        onClick={() => onOpenAR(dish)}
                        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 min-h-[48px] rounded-xl border border-[#C8956B]/40 hover:border-[#C8956B] bg-[#2B1810]/40 hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer active:scale-95 group/ar"
                        aria-label={`View ${dish.name} in 3D Augmented Reality`}
                      >
                        <Box className="w-4 h-4 text-[#C8956B] group-hover/ar:text-[#140A06] transition-colors" />
                        <span>View in AR</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#C8956B]/20 group-hover/ar:bg-[#140A06]/20 transition-colors">
                          3D
                        </span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
