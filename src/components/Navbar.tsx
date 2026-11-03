import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Calendar, Menu as MenuIcon, X, ArrowUpRight } from 'lucide-react';
import { CAFE_CONFIG } from '../config/cafeConfig';

interface NavbarProps {
  cartCount: number;
  cartBouncing?: boolean;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenTrackLookup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartBouncing = false,
  onOpenCart,
  onOpenSearch,
  onScrollToSection,
  onOpenTrackLookup,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', id: 'hero' },
    { name: 'Categories', id: 'categories' },
    { name: 'Menu', id: 'menu' },
    { name: 'Our Story', id: 'story' },
    { name: 'Reservation', id: 'reservation' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(id);
  };

  return (
    <>
      {/* Fixed Navbar with height 64px (+ safe-area-inset-top) */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-40 h-16 pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${
          isScrolled
            ? 'bg-[#140A06]/92 backdrop-blur-xl border-b border-[#C8956B]/20 shadow-xl shadow-black/40'
            : 'bg-[#140A06]/60 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-4">
            
            {/* Brand Logo */}
            <button
              onClick={() => handleNavClick('hero')}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none min-h-[44px]"
              aria-label="BREW Home"
            >
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5E9DA] transition-colors group-hover:text-[#C8956B]">
                {CAFE_CONFIG.brandName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8956B] opacity-80" />
            </button>

            {/* Desktop Nav Links (Hidden under 768px) */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-[#F5E9DA]/80">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="hover:text-[#F5E9DA] relative py-1 transition-colors group cursor-pointer focus:outline-none whitespace-nowrap min-h-[44px] flex items-center"
                >
                  <span>{link.name}</span>
                  <span className="absolute bottom-1 left-0 w-0 h-[1.5px] bg-[#C8956B] transition-all duration-300 group-hover:w-full" />
                </button>
              ))}

              {/* Track Order Entry in Navbar (Requirement 1) */}
              <button
                onClick={onOpenTrackLookup}
                className="hover:text-[#C8956B] text-[#C8956B]/90 relative py-1 transition-colors group cursor-pointer focus:outline-none whitespace-nowrap min-h-[44px] flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
              >
                <span>Track Order</span>
                <span className="absolute bottom-1 left-0 w-0 h-[1.5px] bg-[#C8956B] transition-all duration-300 group-hover:w-full" />
              </button>
            </nav>

            {/* Right Action Bar (All 44px circular buttons, aligned on center line) */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Quick Search on Desktop */}
              <button
                onClick={onOpenSearch}
                className="hidden md:flex w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-[#F5E9DA]/80 hover:text-[#F5E9DA] hover:bg-[#F5E9DA]/10 transition-colors cursor-pointer border border-[#F5E9DA]/15 items-center justify-center focus:outline-none"
                aria-label="Search Dishes"
                title="Search menu (Press /)"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Shopping Cart 44px Circular Button with Bouncing Badge */}
              <motion.button
                id="navbar-cart-button"
                onClick={onOpenCart}
                animate={cartBouncing ? { scale: [1, 1.25, 0.95, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.45 }}
                className="relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-[#F5E9DA]/90 hover:text-[#F5E9DA] hover:bg-[#F5E9DA]/10 transition-colors cursor-pointer border border-[#F5E9DA]/15 flex items-center justify-center focus:outline-none"
                aria-label={`Shopping Cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C8956B] text-[#140A06] text-[11px] font-bold flex items-center justify-center font-mono shadow-md"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Desktop Reserve Button */}
              <button
                onClick={() => handleNavClick('reservation')}
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-xs font-semibold tracking-wider uppercase text-[#140A06] bg-[#F5E9DA] hover:bg-[#C8956B] rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#C8956B]/20 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reserve a Table</span>
              </button>

              {/* Mobile Hamburger 44px Circular Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-[#F5E9DA] hover:bg-[#F5E9DA]/10 border border-[#F5E9DA]/15 cursor-pointer focus:outline-none flex items-center justify-center"
                aria-label="Open navigation menu"
              >
                <MenuIcon className="w-5 h-5 text-[#F5E9DA]" />
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Full-Screen Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className="md:hidden fixed inset-0 z-50 bg-[#120804]/98 backdrop-blur-2xl flex flex-col justify-between p-6"
          >
            {/* Top Bar inside Overlay */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F5E9DA]/10">
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#F5E9DA]">
                  {CAFE_CONFIG.brandName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8956B]" />
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[#F5E9DA]/20 text-[#F5E9DA] hover:bg-[#C8956B] hover:text-[#140A06] transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1.5 my-auto py-3">
              {navLinks.map((link, idx) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="flex items-center justify-between py-3 px-4 min-h-[48px] rounded-2xl hover:bg-[#C8956B]/15 text-left group transition-all"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[#C8956B] font-bold">
                      0{idx + 1}
                    </span>
                    <span className="font-serif text-2xl text-[#F5E9DA] group-hover:text-[#C8956B] transition-colors">
                      {link.name}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#C8956B] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}

              {/* Track Order Entry in Mobile Navigation (Requirement 1) */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrackLookup();
                }}
                className="flex items-center justify-between py-3 px-4 min-h-[48px] rounded-2xl bg-[#C8956B]/10 hover:bg-[#C8956B]/20 border border-[#C8956B]/30 text-left group transition-all"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-[#C8956B] font-bold">06</span>
                  <span className="font-serif text-2xl text-[#C8956B]">Track Order</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#C8956B]" />
              </button>
            </nav>

            {/* Bottom Actions inside Overlay */}
            <div className="pt-4 border-t border-[#F5E9DA]/10 space-y-2.5">
              <button
                onClick={() => handleNavClick('reservation')}
                className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[48px] text-xs font-bold tracking-wider uppercase text-[#140A06] bg-[#C8956B] hover:bg-[#F5E9DA] rounded-full shadow-lg transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve a Table</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] text-xs font-semibold text-[#F5E9DA] border border-[#F5E9DA]/20 rounded-full transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#C8956B]" />
                <span>Search Coffee & Dishes</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
