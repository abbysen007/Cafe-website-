import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarqueeTicker } from './components/MarqueeTicker';
import { WhyChooseUs } from './components/WhyChooseUs';
import { ExploreCategories } from './components/ExploreCategories';
import { MenuSection } from './components/MenuSection';
import { PromoBanners } from './components/PromoBanners';
import { OurStory } from './components/OurStory';
import { Testimonials } from './components/Testimonials';
import { ReservationSection } from './components/ReservationSection';
import { Footer } from './components/Footer';
import { ARModal } from './components/ARModal';
import { CartDrawer } from './components/CartDrawer';
import { DishSearchModal } from './components/DishSearchModal';
import { OrderLookupModal } from './components/OrderLookupModal';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { DISHES } from './config/cafeConfig';
import { Dish, DishCategory, CartItem } from './types/cafe';
import { normalizeOrderId } from './services/orderService';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [activeARDish, setActiveARDish] = useState<Dish | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | 'All'>('All');
  const [couponCode, setCouponCode] = useState<string>('');
  const [cartBouncing, setCartBouncing] = useState(false);

  // Routing State: 'home' | 'tracking' | 'admin'
  const [currentView, setCurrentView] = useState<'home' | 'tracking' | 'admin'>('home');
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  // Custom Cursor and flashlight follower coordinates for desktop
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [cursorHovered, setCursorHovered] = useState(false);

  // Soft cursor follower spring (stiffness: 150, damping: 20)
  const followerX = useSpring(-200, { stiffness: 150, damping: 20 });
  const followerY = useSpring(-200, { stiffness: 150, damping: 20 });

  // Unified Hash & Query Routing: #/track/BRW-7977, #/admin, ?dish=id
  useEffect(() => {
    const handleUrlRouting = () => {
      const hash = window.location.hash || '';

      // Check for Admin console route (#/admin)
      if (/^#\/?admin/i.test(hash)) {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Check for Order Tracking route (#/track/:id or #/track)
      const trackMatch = hash.match(/^#\/?track(?:\/([^/?#]+))?/i);
      if (trackMatch) {
        const orderIdParam = trackMatch[1];
        if (orderIdParam) {
          setTrackingOrderId(normalizeOrderId(orderIdParam));
          setCurrentView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        } else {
          // #/track with no order ID: open lookup modal
          setCurrentView('home');
          setIsLookupOpen(true);
        }
      } else {
        // Reset to home view if not on tracking or admin
        setCurrentView('home');
      }

      // Check URL query and hash for standalone AR view (?dish=id or #/ar/:dishId)
      const params = new URLSearchParams(window.location.search);
      let dishParam = params.get('dish');

      if (!dishParam && hash) {
        const hashQueryMatch = hash.match(/[?&]dish=([^&]+)/);
        const hashPathMatch = hash.match(/#\/?ar\/([^?&/]+)/);
        if (hashQueryMatch) dishParam = hashQueryMatch[1];
        else if (hashPathMatch) dishParam = hashPathMatch[1];
      }

      if (dishParam) {
        const found = DISHES.find(
          (d) => d.id.toLowerCase() === dishParam!.toLowerCase()
        );
        if (found) {
          setActiveARDish(found);
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    window.addEventListener('hashchange', handleUrlRouting);
    return () => {
      window.removeEventListener('popstate', handleUrlRouting);
      window.removeEventListener('hashchange', handleUrlRouting);
    };
  }, []);

  // Detect touch device, reduced motion & setup desktop cursor follower
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    if (!hasTouch) {
      const handleMouseMove = (e: MouseEvent) => {
        setCursorPos({ x: e.clientX, y: e.clientY });
        followerX.set(e.clientX - 100);
        followerY.set(e.clientY - 100);

        const target = e.target as HTMLElement;
        const isClickable =
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('[role="button"]');
        setCursorHovered(!!isClickable);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        mediaQuery.removeEventListener('change', handleMotionChange);
      };
    }

    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, [followerX, followerY]);

  // Cart operations
  const handleAddToCart = (dish: Dish) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const triggerCartBounce = () => {
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 550);
  };

  const handleUpdateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(dishId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.dish.id === dishId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (dishId: string) => {
    setCartItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Reorder operation (adds previous items to cart and opens cart drawer)
  const handleReorder = (itemsToReorder: CartItem[]) => {
    setCartItems((prev) => {
      const newItems = [...prev];
      itemsToReorder.forEach((rItem) => {
        const found = newItems.find((i) => i.dish.id === rItem.dish.id);
        if (found) {
          found.quantity += rItem.quantity;
        } else {
          newItems.push({ ...rItem });
        }
      });
      return newItems;
    });

    setIsCartOpen(true);
    triggerCartBounce();
  };

  // Scroll helper
  const handleScrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      window.location.hash = `#${sectionId}`;
      setCurrentView('home');
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Category selection handler (from Explore Categories section)
  const handleSelectCategoryFromGrid = (cat: DishCategory) => {
    setSelectedCategory(cat);
    handleScrollToSection('menu');
  };

  // AR modal trigger & URL sync
  const handleOpenAR = (dish: Dish) => {
    setActiveARDish(dish);
    const url = new URL(window.location.href);
    url.searchParams.set('dish', dish.id);
    window.history.pushState({}, '', url.toString());
  };

  const handleCloseAR = () => {
    setActiveARDish(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('dish');
    window.history.pushState({}, '', url.toString());
  };

  // Navigate to Order Tracking (#/track/BRW-7977)
  const handleNavigateToTrack = (orderId: string) => {
    const cleanId = normalizeOrderId(orderId);
    setTrackingOrderId(cleanId);
    window.location.hash = `#/track/${cleanId}`;
    setCurrentView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Menu from Tracking or Admin
  const handleBackToMenu = () => {
    window.location.hash = '#menu';
    setCurrentView('home');
    setTimeout(() => {
      handleScrollToSection('menu');
    }, 100);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative min-h-screen bg-[#140A06] text-[#F5E9DA] bg-grain overflow-x-hidden">
      
      {/* Static Film-Grain Overlay across the page (SVG feTurbulence filter at 0.05 opacity) */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-30 opacity-[0.05] mix-blend-screen"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="film-grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain-filter)" />
      </svg>

      {/* Desktop Cursor Follower: soft 200px caramel radial light following mouse with slight lag */}
      {!isTouchDevice && !prefersReducedMotion && (
        <motion.div
          className="fixed pointer-events-none z-20 w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(200,149,107,0.12)_0%,transparent_70%)] blur-md will-change-transform"
          style={{
            x: followerX,
            y: followerY,
          }}
        />
      )}

      {/* Custom Cursor Ring for Desktop */}
      {!isTouchDevice && (
        <div
          className={`fixed pointer-events-none z-50 rounded-full transition-transform duration-100 ease-out -translate-x-1/2 -translate-y-1/2 border border-[#C8956B]/70 ${
            cursorHovered
              ? 'w-11 h-11 bg-[#C8956B]/15 scale-110 shadow-lg shadow-[#C8956B]/20'
              : 'w-6 h-6 bg-transparent'
          }`}
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
          }}
        >
          <div className="w-1 h-1 rounded-full bg-[#C8956B] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* Fixed 64px Glass Navbar with bouncing cart badge and Track Order menu */}
      <Navbar
        cartCount={totalCartCount}
        cartBouncing={cartBouncing}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onScrollToSection={handleScrollToSection}
        onOpenTrackLookup={() => setIsLookupOpen(true)}
      />

      {/* Main View Switch based on Hash Routing: 'home' | 'tracking' | 'admin' */}
      {currentView === 'tracking' ? (
        <main>
          <OrderTrackingPage
            orderId={trackingOrderId}
            onBackToMenu={handleBackToMenu}
            onReorder={handleReorder}
            onOpenLookup={() => setIsLookupOpen(true)}
          />
        </main>
      ) : currentView === 'admin' ? (
        <main>
          <AdminDashboardPage
            onBackToMenu={handleBackToMenu}
            onOpenOrderTracking={handleNavigateToTrack}
          />
        </main>
      ) : (
        /* Regular Home Page Content */
        <main>
          {/* Redesigned Hero Section */}
          <Hero
            onOpenAR={handleOpenAR}
            onAddToCart={handleAddToCart}
            onExploreMenu={() => handleScrollToSection('menu')}
            onTriggerCartBounce={triggerCartBounce}
          />

          {/* Marquee Ticker with Scroll Velocity Acceleration */}
          <MarqueeTicker />

          {/* Why Choose Us */}
          <WhyChooseUs />

          {/* Explore Categories (Arch Pill Cards) */}
          <ExploreCategories
            activeCategory={selectedCategory}
            onSelectCategory={handleSelectCategoryFromGrid}
          />

          {/* Menu Section with 12+ Dish Cards & Filterable Grid */}
          <MenuSection
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onOpenAR={handleOpenAR}
            onAddToCart={handleAddToCart}
          />

          {/* Promo Banners */}
          <PromoBanners
            onApplyCoupon={(code) => {
              setCouponCode(code);
              setIsCartOpen(true);
            }}
            onAddToCart={handleAddToCart}
            onExploreMenu={() => handleScrollToSection('menu')}
          />

          {/* Our Story with Animated Counters */}
          <OurStory />

          {/* Testimonials Carousel */}
          <Testimonials />

          {/* Reservation Section */}
          <ReservationSection />
        </main>
      )}

      {/* Footer */}
      <Footer />

      {/* Full-Screen AR 3D Modal with <model-viewer> */}
      <ARModal
        dish={activeARDish}
        onClose={handleCloseAR}
        onSelectDish={(d) => handleOpenAR(d)}
        onAddToCart={handleAddToCart}
      />

      {/* Sliding Cart Drawer with "Track My Order" on confirmation */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        couponCode={couponCode}
        onApplyCoupon={setCouponCode}
        onTrackOrder={handleNavigateToTrack}
      />

      {/* Quick Search Dialog */}
      <DishSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectDish={(dish) => {
          setSelectedCategory(dish.category);
          handleScrollToSection('menu');
        }}
        onOpenAR={handleOpenAR}
      />

      {/* Order Lookup Modal (Order ID + 10-digit Phone) */}
      <OrderLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onOrderFound={handleNavigateToTrack}
      />

    </div>
  );
}
