import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import {
  Box,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  Award,
  Compass,
  Droplets,
  ArrowRight,
  Check,
} from 'lucide-react';
import { DISHES, CAFE_CONFIG } from '../config/cafeConfig';
import { Dish } from '../types/cafe';

interface HeroProps {
  onOpenAR: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
  onExploreMenu: () => void;
  onTriggerCartBounce?: () => void;
}

import { Variants } from 'motion/react';

// Directional Odometer Digit Component for rolling number transitions
interface OdometerProps {
  value: string | number;
  direction: number; // 1 for next, -1 for prev
  className?: string;
}

const odometerVariants: Variants = {
  initial: (dir: number) => ({
    y: dir >= 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  animate: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    y: dir >= 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Odometer: React.FC<OdometerProps> = ({ value, direction, className = '' }) => {
  return (
    <div className={`relative inline-flex overflow-hidden h-[1.18em] leading-[1.18em] ${className}`}>
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.span
          key={String(value)}
          custom={direction}
          variants={odometerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};


// Desktop Magnetic Button wrapper
interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const MagneticWrapper: React.FC<MagneticWrapperProps> = ({ children, className = '', disabled = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 18 });
  const y = useSpring(0, { stiffness: 220, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    // max displacement up to 10px
    x.set(Math.max(-10, Math.min(10, distanceX * 0.25)));
    y.set(Math.max(-10, Math.min(10, distanceY * 0.25)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const Hero: React.FC<HeroProps> = ({
  onOpenAR,
  onAddToCart,
  onExploreMenu,
  onTriggerCartBounce,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Flying dish animation state
  const [flyingDish, setFlyingDish] = useState<{
    dish: Dish;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
  } | null>(null);

  // 3D Tilt state on desktop image
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Touch device & reduced motion detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Refs for swipe & thumbnail scrolling
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const thumbnailRailRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement | null>(null);

  // Scroll animations for hero image and title
  const { scrollY } = useScroll();
  const heroImageScale = useTransform(scrollY, [0, 400], [1, 0.9]);
  const heroImageOpacity = useTransform(scrollY, [0, 350], [1, 0.35]);
  const heroTitleY = useTransform(scrollY, [0, 350], [0, -28]);

  const dishesCount = DISHES.length;
  const activeDish = DISHES[activeIndex] || DISHES[0];

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  // Preload next dish photo
  useEffect(() => {
    if (dishesCount > 1) {
      const nextIdx = (activeIndex + 1) % dishesCount;
      const nextImg = new Image();
      nextImg.src = DISHES[nextIdx].image;
    }
  }, [activeIndex, dishesCount]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev <= 0 ? dishesCount - 1 : prev - 1));
    setProgress(0);
  }, [dishesCount]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev >= dishesCount - 1 ? 0 : prev + 1));
    setProgress(0);
  }, [dishesCount]);

  // 5s Autoplay Timer with 50ms smooth SVG progress increment
  useEffect(() => {
    if (isPaused || dishesCount <= 1 || prefersReducedMotion) return;

    const intervalTime = 50;
    const totalTime = 5000;
    const step = (intervalTime / totalTime) * 100;

    const timer = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, dishesCount, handleNext, prefersReducedMotion]);

  // Auto-scroll active thumbnail into center of the rail
  useEffect(() => {
    if (activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIndex]);

  // Keyboard navigation on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const deltaX = touchStartX.current - touchEndX.current;
    if (deltaX > 45) {
      handleNext();
    } else if (deltaX < -45) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Interactive 3D tilt on desktop image
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || prefersReducedMotion || !imageFrameRef.current) return;
    const rect = imageFrameRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 14, // max 7 deg
      rotateY: x * 14,
    });
  };

  const handleImageMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Handle "Add to Order" with 500ms curved flying dish animation
  const handleAddOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    onAddToCart(activeDish);

    // Calculate source and cart target coordinates
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const imgRect = imageFrameRef.current?.getBoundingClientRect();
    const startX = imgRect ? imgRect.left + imgRect.width / 2 : buttonRect.left + buttonRect.width / 2;
    const startY = imgRect ? imgRect.top + imgRect.height / 2 : buttonRect.top;

    const cartBtn = document.getElementById('navbar-cart-button');
    const cartRect = cartBtn?.getBoundingClientRect();
    const targetX = cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth - 44;
    const targetY = cartRect ? cartRect.top + cartRect.height / 2 : 32;

    setFlyingDish({
      dish: activeDish,
      startX,
      startY,
      targetX,
      targetY,
    });

    setToastMessage(`Added "${activeDish.name}"`);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // SVG Progress Ring calculations
  // Radius = 47, Circumference = 2 * PI * 47 = 295.31
  const circleRadius = 47;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  // Formatted counter: "04" / "14"
  const formattedIndex = String(activeIndex + 1).padStart(2, '0');
  const formattedTotal = String(dishesCount).padStart(2, '0');

  // Floating particles behind the image (6 on mobile, 10 on desktop)
  const particles = [
    { top: '8%', left: '15%', size: 'w-2 h-2', delay: '0s', duration: '4.8s' },
    { top: '18%', right: '12%', size: 'w-2.5 h-2.5', delay: '1.2s', duration: '5.4s' },
    { top: '75%', left: '10%', size: 'w-1.5 h-1.5', delay: '2.1s', duration: '6.2s' },
    { top: '82%', right: '14%', size: 'w-2 h-2', delay: '0.8s', duration: '5.1s' },
    { top: '40%', left: '4%', size: 'w-2 h-2.5', delay: '1.6s', duration: '5.8s' },
    { top: '48%', right: '3%', size: 'w-2 h-2', delay: '2.8s', duration: '4.5s' },
    // Desktop extra particles
    { top: '12%', left: '48%', size: 'w-2 h-2', delay: '0.4s', duration: '6.0s', desktopOnly: true },
    { top: '88%', left: '52%', size: 'w-1.5 h-1.5', delay: '1.9s', duration: '5.6s', desktopOnly: true },
    { top: '30%', right: '22%', size: 'w-2 h-2.5', delay: '3.1s', duration: '4.9s', desktopOnly: true },
    { top: '65%', left: '22%', size: 'w-2.5 h-2.5', delay: '2.4s', duration: '6.5s', desktopOnly: true },
  ];

  return (
    <section
      id="hero"
      aria-label="Cafe Specialty Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      /* Starts strictly BELOW the 64px fixed navbar: padding-top: calc(64px + 16px) = 80px */
      className="relative min-h-[calc(100dvh-64px)] flex flex-col justify-between pt-20 pb-8 sm:pb-12 overflow-hidden"
    >
      {/* 500ms Flying Dish Animation to Navbar Cart */}
      {flyingDish && (
        <motion.div
          initial={{
            x: flyingDish.startX - 24,
            y: flyingDish.startY - 24,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: flyingDish.targetX - 16,
            y: flyingDish.targetY - 16,
            scale: 0.28,
            opacity: 0.9,
          }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={() => {
            setFlyingDish(null);
            if (onTriggerCartBounce) onTriggerCartBounce();
          }}
          className="fixed top-0 left-0 z-50 pointer-events-none w-12 h-12 rounded-full overflow-hidden shadow-2xl border-2 border-[#C8956B] bg-[#140A06]"
        >
          <img
            src={flyingDish.dish.image}
            alt=""
            className="w-full h-full object-cover rounded-full"
          />
        </motion.div>
      )}

      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[750px] h-[500px] sm:h-[750px] rounded-full radial-glow-hero opacity-60 blur-3xl" />
        <div className="absolute bottom-6 right-8 w-72 h-72 rounded-full bg-[#C8956B]/5 blur-3xl" />
      </div>

      {/* Added to Order Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#C8956B] text-[#140A06] text-xs font-bold font-sans shadow-2xl flex items-center gap-2 border border-[#F5E9DA]/20 pointer-events-none"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">

        {/* =========================================================================
            MOBILE LAYOUT (<1024px) - Designed strictly to fit above the fold on 390x800
            Vertical Rhythm:
            1. Pill
            2. Image + Progress Ring + Flanked Chevrons
            3. Title (line 1 & line 2)
            4. Short description (clamped 2 lines)
            5. Price + rating
            6. Side-by-side equal-width 52px buttons
            7. Thumbnail rail (14 dishes)
            8. Explore full menu pill
           ========================================================================= */}
        <div className="block lg:hidden w-full max-w-md mx-auto text-center">

          {/* 1. Small Category Pill (12px text, 1 line, centered) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C8956B]/30 bg-[#2B1810]/75 backdrop-blur-md text-[#C8956B] text-xs font-semibold tracking-wider uppercase mb-3"
          >
            <span className="font-mono text-[#F5E9DA]/90">{activeDish.category.toUpperCase()}</span>
            <span className="text-[#F5E9DA]/40">·</span>
            <span className="font-mono text-[#C8956B] font-bold">
              {formattedIndex}/{formattedTotal}
            </span>
          </motion.div>

          {/* 2. Main Dish Image in Concentric Circle with SVG Progress Ring */}
          {/* Sized min(72vw, 260px) so image, title, price and buttons all fit above 800px fold */}
          <div className="relative flex flex-col items-center justify-center my-0">
            
            {/* Ambient pulsing caramel glow behind active image */}
            <motion.div
              animate={prefersReducedMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-64 h-64 rounded-full bg-[#C8956B] blur-2xl pointer-events-none"
            />

            {/* Drifting specks (6 on mobile) */}
            <div className="absolute inset-0 pointer-events-none">
              {particles.slice(0, 6).map((p, idx) => (
                <div
                  key={idx}
                  className={`absolute rounded-full bg-[#C8956B]/30 blur-[0.5px] will-change-transform animate-float-bean-1 ${p.size}`}
                  style={{
                    top: p.top,
                    left: p.left,
                    right: p.right,
                    animationDuration: p.duration,
                    animationDelay: p.delay,
                  }}
                />
              ))}
            </div>

            {/* Concentric Frame with SVG Progress Ring */}
            <motion.div
              ref={imageFrameRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[min(70vw,260px)] aspect-square flex items-center justify-center"
            >
              {/* SVG 5s Autoplay Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                {/* Background Ring Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="none"
                  stroke="#C8956B"
                  strokeOpacity="0.15"
                  strokeWidth="2.5"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="none"
                  stroke="#C8956B"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-75 ease-linear"
                />
              </svg>

              {/* Concentric Circle Image with equal inset (12px) all around */}
              <div className="absolute inset-3 rounded-full overflow-hidden border border-[#C8956B]/40 shadow-2xl bg-[#1F120B]">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={activeDish.id}
                    custom={direction}
                    initial={{
                      clipPath: prefersReducedMotion ? undefined : 'circle(0% at 50% 50%)',
                      opacity: 0,
                      scale: 0.96,
                    }}
                    animate={{
                      clipPath: prefersReducedMotion ? undefined : 'circle(75% at 50% 50%)',
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.04,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 w-full h-full rounded-full overflow-hidden"
                  >
                    <img
                      src={activeDish.image}
                      alt={activeDish.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover select-none"
                    />
                    {/* Dark-brown overlay (rgba(26, 15, 10, 0.25)) for dark background harmony */}
                    <div className="absolute inset-0 bg-[#1A0F0A]/25 pointer-events-none" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Prev/Next Chevrons (44px touch targets) FLANKING the counter BELOW the image */}
            <div className="flex items-center justify-center gap-4 mt-2.5 mb-1 z-20">
              <button
                onClick={handlePrev}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#140A06]/90 hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] border border-[#F5E9DA]/20 hover:border-[#C8956B] transition-colors flex items-center justify-center cursor-pointer active:scale-95 shadow-md"
                aria-label="Previous dish"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Rolling Odometer Counter (e.g. 04 / 14) */}
              <div className="flex items-center font-mono text-xs font-bold tracking-wider text-[#C8956B] px-2">
                <Odometer value={formattedIndex} direction={direction} />
                <span className="mx-1 text-[#F5E9DA]/40">/</span>
                <span className="text-[#F5E9DA]/70">{formattedTotal}</span>
              </div>

              <button
                onClick={handleNext}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#140A06]/90 hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] border border-[#F5E9DA]/20 hover:border-[#C8956B] transition-colors flex items-center justify-center cursor-pointer active:scale-95 shadow-md"
                aria-label="Next dish"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* 3. Dish Title (2 lines, clamp(2rem, 8vw, 3.2rem), line-height: 1.05) */}
          <div className="overflow-hidden mt-3 sm:mt-4 min-h-[64px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeDish.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif tracking-tight"
                style={{
                  lineHeight: 1.05,
                  fontSize: 'clamp(2rem, 8vw, 3.2rem)',
                }}
              >
                <span className="block text-[#F5E9DA] font-normal leading-[1.05]">
                  {activeDish.heroTitle.line1}
                </span>
                <span className="block italic text-[#C8956B] drop-shadow-sm font-serif leading-[1.05]">
                  {activeDish.heroTitle.line2}
                </span>
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* 4. Short Description clamped to 2 lines (15px, 12px gap from title) */}
          <div className="mt-2.5 min-h-[40px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${activeDish.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[15px] text-[#F5E9DA]/80 font-light leading-snug line-clamp-2 max-w-sm mx-auto"
              >
                {activeDish.description}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* 5. Price + Rating on one row (16px gap from description) */}
          <div className="flex items-center justify-center gap-4 mt-3 py-0.5">
            {/* Space Grotesk tabular price with small .00 */}
            <div className="flex items-baseline font-mono text-2xl font-bold text-[#F5E9DA]">
              <span>{CAFE_CONFIG.currencySymbol}</span>
              <Odometer value={activeDish.price} direction={direction} />
              <sup className="text-xs font-normal text-[#C8956B]">.00</sup>
            </div>

            <div className="h-4 w-[1px] bg-[#F5E9DA]/20" />

            {/* Rating pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2B1810]/70 border border-[#C8956B]/25 text-xs font-mono">
              <Star className="w-3.5 h-3.5 fill-[#C8956B] text-[#C8956B]" />
              <span className="font-bold text-[#F5E9DA]">{activeDish.rating}</span>
              <span className="text-[#F5E9DA]/50 text-[11px]">({activeDish.reviewsCount})</span>
            </div>
          </div>

          {/* 6. Two Equal-Width Buttons Side by Side (52px high, 12px gap, 20px padding) */}
          <div className="flex items-center gap-3 mt-4 px-2 w-full">
            {/* Add to Order (filled caramel with shimmer) */}
            <button
              onClick={handleAddOrder}
              className="relative flex-1 h-[52px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 px-5 transition-transform duration-150 active:scale-95 overflow-hidden cursor-pointer whitespace-nowrap"
              aria-label={`Add ${activeDish.name} to order`}
            >
              {/* Shimmer light sweep every 4s */}
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Add to Order</span>
            </button>

            {/* View in AR (outlined with 3D tag) */}
            <button
              onClick={() => onOpenAR(activeDish)}
              className="group flex-1 h-[52px] rounded-full border border-[#C8956B]/60 hover:border-[#C8956B] bg-[#2B1810]/50 hover:bg-[#2B1810]/90 text-[#F5E9DA] font-semibold text-xs uppercase tracking-wider backdrop-blur-md shadow-md flex items-center justify-center gap-2 px-5 transition-transform duration-150 active:scale-95 cursor-pointer whitespace-nowrap"
              aria-label={`View ${activeDish.name} in 3D AR`}
            >
              <Box className="w-4 h-4 text-[#C8956B] shrink-0" />
              <span>View in AR</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#C8956B]/20 text-[#C8956B] group-hover:scale-105 transition-transform">
                3D
              </span>
            </button>
          </div>

          {/* 7. Thumbnail Rail (All 14 Dishes, Horizontal Scroll-Snap) */}
          <div className="mt-6 pt-3 border-t border-[#F5E9DA]/10 w-full text-left">
            <div
              ref={thumbnailRailRef}
              className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
            >
              {DISHES.map((dish, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={dish.id}
                    ref={isActive ? activeThumbnailRef : null}
                    onClick={() => {
                      setDirection(idx > activeIndex ? 1 : -1);
                      setActiveIndex(idx);
                      setProgress(0);
                    }}
                    className={`relative group snap-center shrink-0 flex items-center gap-2.5 p-2 rounded-2xl border transition-all duration-200 cursor-pointer min-h-[58px] ${
                      isActive
                        ? 'border-[#C8956B] bg-[#2B1810] shadow-md shadow-[#C8956B]/20'
                        : 'border-[#F5E9DA]/10 hover:border-[#C8956B]/40 bg-[#1A0F0A]/60 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Select ${dish.name}`}
                  >
                    {/* Framer Motion layoutId active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeThumbMobile"
                        className="absolute inset-0 rounded-2xl border-2 border-[#C8956B] pointer-events-none"
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}

                    <img
                      src={dish.image}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                      loading="lazy"
                    />

                    <div className="w-28 pr-1">
                      <span className="block text-[11px] font-medium text-[#F5E9DA] leading-tight line-clamp-2">
                        {dish.name}
                      </span>
                      <span className="block font-mono text-[10px] font-bold text-[#C8956B] mt-0.5">
                        {CAFE_CONFIG.currencySymbol}{dish.price}.00
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8. Small "Explore full menu" pill below thumbnail rail */}
          <div className="mt-3 flex justify-center">
            <button
              onClick={onExploreMenu}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C8956B]/35 bg-[#1A0F0A]/80 text-[#F5E9DA]/85 hover:text-[#C8956B] hover:border-[#C8956B] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Explore full menu</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C8956B]" />
            </button>
          </div>

          {/* Mobile Origin Card */}
          <div className="mt-4 w-full text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`origin-mobile-${activeDish.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-2xl bg-[#1A0F0A]/90 border border-[#C8956B]/30 backdrop-blur-md shadow-md flex items-center gap-3 w-full"
              >
                <div className="p-2 rounded-xl bg-[#C8956B]/20 text-[#C8956B] shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#C8956B] block">
                    Single-Origin Spec
                  </span>
                  <p className="text-xs text-[#F5E9DA]/90 font-mono leading-tight truncate">
                    {activeDish.origin}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* =========================================================================
            DESKTOP LAYOUT (>=1024px) - Two Columns, fits inside 100dvh
           ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-10 xl:gap-14 items-center">

          {/* Left Column (6 cols): Text & Action Controls */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-5">
            
            {/* Category Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#C8956B]/30 bg-[#2B1810]/75 backdrop-blur-md text-[#C8956B] text-xs font-semibold tracking-wider uppercase"
            >
              <span className="font-mono text-[#F5E9DA]/90">{activeDish.category.toUpperCase()}</span>
              <span className="text-[#F5E9DA]/40">·</span>
              <span className="font-mono text-[#C8956B] font-bold">
                {formattedIndex}/{formattedTotal}
              </span>
              <span className="text-[#F5E9DA]/40">·</span>
              <span className="text-[#F5E9DA]/75 lowercase first-letter:uppercase font-sans">
                {activeDish.shortTagline}
              </span>
            </motion.div>

            {/* Two-Line Headline with Parallax Drift & Overflow Mask */}
            <motion.div style={{ y: heroTitleY }} className="overflow-hidden w-full h-[145px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={activeDish.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="font-serif text-5xl xl:text-6xl font-normal tracking-tight text-[#F5E9DA]"
                  style={{
                    lineHeight: 1.05,
                    fontSize: 'clamp(2.5rem, 4.2vw, 4.2rem)',
                  }}
                >
                  <span className="block text-[#F5E9DA] leading-[1.05]">
                    {activeDish.heroTitle.line1}
                  </span>
                  <span className="block italic text-[#C8956B] drop-shadow-sm font-serif leading-[1.05]">
                    {activeDish.heroTitle.line2}
                  </span>
                </motion.h1>
              </AnimatePresence>
            </motion.div>

            {/* 2-line Description */}
            <div className="h-[48px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`desc-desk-${activeDish.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm xl:text-base text-[#F5E9DA]/80 font-light leading-relaxed max-w-lg line-clamp-2"
                >
                  {activeDish.description}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Price + Rating Row */}
            <div className="flex items-center gap-5 py-1">
              <div className="flex items-baseline font-mono text-3xl font-bold text-[#F5E9DA]">
                <span>{CAFE_CONFIG.currencySymbol}</span>
                <Odometer value={activeDish.price} direction={direction} />
                <sup className="text-sm font-normal text-[#C8956B]">.00</sup>
              </div>

              <div className="h-5 w-[1px] bg-[#F5E9DA]/20" />

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2B1810]/70 border border-[#C8956B]/25 text-xs font-mono">
                <Star className="w-3.5 h-3.5 fill-[#C8956B] text-[#C8956B]" />
                <span className="font-bold text-[#F5E9DA]">{activeDish.rating}</span>
                <span className="text-[#F5E9DA]/50 text-[11px]">({activeDish.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Side-by-Side 52px Buttons with Magnetic Hover on Desktop */}
            <div className="flex items-center gap-3.5 pt-1 w-full">
              <MagneticWrapper disabled={isTouchDevice || prefersReducedMotion}>
                <button
                  onClick={handleAddOrder}
                  className="relative h-[52px] px-7 rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-transform duration-150 hover:scale-[1.02] active:scale-95 overflow-hidden cursor-pointer whitespace-nowrap"
                  aria-label={`Add ${activeDish.name} to order`}
                >
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>Add to Order</span>
                </button>
              </MagneticWrapper>

              <MagneticWrapper disabled={isTouchDevice || prefersReducedMotion}>
                <button
                  onClick={() => onOpenAR(activeDish)}
                  className="group h-[52px] px-6 rounded-full border border-[#C8956B]/60 hover:border-[#C8956B] bg-[#2B1810]/50 hover:bg-[#2B1810]/90 text-[#F5E9DA] font-semibold text-xs uppercase tracking-wider backdrop-blur-md shadow-md flex items-center justify-center gap-2 transition-transform duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
                  aria-label={`View ${activeDish.name} in 3D AR`}
                >
                  <Box className="w-4 h-4 text-[#C8956B] shrink-0" />
                  <span>View in AR</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#C8956B]/20 text-[#C8956B] group-hover:scale-110 transition-transform">
                    3D
                  </span>
                </button>
              </MagneticWrapper>
            </div>

            {/* Desktop Origin Card */}
            <div className="w-full max-w-lg pt-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`origin-desk-${activeDish.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="p-3.5 rounded-2xl bg-[#1A0F0A]/90 border border-[#C8956B]/30 backdrop-blur-md shadow-xl flex items-center gap-3.5"
                >
                  <div className="p-2.5 rounded-xl bg-[#C8956B]/20 text-[#C8956B] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#C8956B] block">
                      Single-Origin Spec
                    </span>
                    <p className="text-xs text-[#F5E9DA]/90 font-mono truncate">
                      {activeDish.origin}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column (6 cols): Large Concentric Dish Image with 3D Tilt + Controls */}
          <div className="lg:col-span-6 flex flex-col items-center relative">
            
            {/* Ambient Pulsing Glow behind active image */}
            <motion.div
              animate={prefersReducedMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-[380px] h-[380px] rounded-full bg-[#C8956B] blur-3xl pointer-events-none"
            />

            {/* Drifting specks in background (10 on desktop) */}
            <div className="absolute inset-0 pointer-events-none">
              {particles.map((p, idx) => (
                <div
                  key={idx}
                  className={`absolute rounded-full bg-[#C8956B]/25 blur-[0.5px] will-change-transform animate-float-bean-1 ${p.size}`}
                  style={{
                    top: p.top,
                    left: p.left,
                    right: p.right,
                    animationDuration: p.duration,
                    animationDelay: p.delay,
                  }}
                />
              ))}
            </div>

            {/* Concentric Frame Container with Scroll Scale & Parallax Fade */}
            <motion.div
              ref={imageFrameRef}
              style={{
                scale: heroImageScale,
                opacity: heroImageOpacity,
                transform: `perspective(900px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
              className="relative w-[360px] xl:w-[410px] aspect-square flex items-center justify-center cursor-pointer"
            >
              {/* SVG 5s Autoplay Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="none"
                  stroke="#C8956B"
                  strokeOpacity="0.15"
                  strokeWidth="2.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="none"
                  stroke="#C8956B"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-75 ease-linear"
                />
              </svg>

              {/* Concentric Circle Image (inset 14px, rounded-full) */}
              <div className="absolute inset-3.5 rounded-full overflow-hidden border border-[#C8956B]/40 shadow-2xl shadow-[#C8956B]/20 bg-[#1F120B]">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={activeDish.id}
                    custom={direction}
                    initial={{
                      clipPath: prefersReducedMotion ? undefined : 'circle(0% at 50% 50%)',
                      opacity: 0,
                      scale: 0.96,
                    }}
                    animate={{
                      clipPath: prefersReducedMotion ? undefined : 'circle(75% at 50% 50%)',
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.04,
                    }}
                    transition={{
                      duration: 0.42,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 w-full h-full rounded-full overflow-hidden"
                  >
                    <img
                      src={activeDish.image}
                      alt={activeDish.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover select-none"
                    />
                    {/* Dark brown overlay (rgba(26, 15, 10, 0.25)) */}
                    <div className="absolute inset-0 bg-[#1A0F0A]/25 pointer-events-none" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Prev/Next Chevrons (44px) flanking the counter ("04 / 14") BELOW the image */}
            <div className="flex items-center justify-center gap-5 mt-4 z-20">
              <button
                onClick={handlePrev}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#140A06]/90 hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] border border-[#F5E9DA]/20 hover:border-[#C8956B] transition-colors flex items-center justify-center cursor-pointer active:scale-95 shadow-lg"
                aria-label="Previous dish"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center font-mono text-sm font-bold tracking-wider text-[#C8956B] px-3">
                <Odometer value={formattedIndex} direction={direction} />
                <span className="mx-1 text-[#F5E9DA]/40">/</span>
                <span className="text-[#F5E9DA]/70">{formattedTotal}</span>
              </div>

              <button
                onClick={handleNext}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#140A06]/90 hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] border border-[#F5E9DA]/20 hover:border-[#C8956B] transition-colors flex items-center justify-center cursor-pointer active:scale-95 shadow-lg"
                aria-label="Next dish"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

        {/* =========================================================================
            DESKTOP THUMBNAIL RAIL (All 14 Dishes, Horizontal Scroll with Active Indicator)
           ========================================================================= */}
        <div className="hidden lg:block mt-8 pt-4 border-t border-[#F5E9DA]/10 w-full space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs uppercase tracking-widest text-[#C8956B] font-mono font-bold">
              Menu Portfolio ({dishesCount} Specialties)
            </span>

            {/* "Explore full menu" pill */}
            <button
              onClick={onExploreMenu}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C8956B]/30 hover:border-[#C8956B] bg-[#1A0F0A]/70 text-[#F5E9DA]/80 hover:text-[#C8956B] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Explore full menu</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C8956B]" />
            </button>
          </div>

          <div
            ref={thumbnailRailRef}
            className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {DISHES.map((dish, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={dish.id}
                  ref={isActive ? activeThumbnailRef : null}
                  onClick={() => {
                    setDirection(idx > activeIndex ? 1 : -1);
                    setActiveIndex(idx);
                    setProgress(0);
                  }}
                  className={`relative group snap-center shrink-0 flex items-center gap-2.5 p-2 rounded-2xl border text-left transition-all duration-200 cursor-pointer min-h-[58px] ${
                    isActive
                      ? 'border-[#C8956B] bg-[#2B1810] shadow-md shadow-[#C8956B]/20'
                      : 'border-[#F5E9DA]/10 hover:border-[#C8956B]/40 bg-[#1A0F0A]/60 opacity-70 hover:opacity-100 hover:-translate-y-0.5'
                  }`}
                  aria-label={`Select ${dish.name}`}
                >
                  {/* Framer Motion layoutId active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeThumbDesktop"
                      className="absolute inset-0 rounded-2xl border-2 border-[#C8956B] pointer-events-none"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}

                  <img
                    src={dish.image}
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                    loading="lazy"
                  />

                  <div className="w-28 xl:w-32 pr-1">
                    <span className="block text-xs font-medium text-[#F5E9DA] leading-tight line-clamp-2">
                      {dish.name}
                    </span>
                    <span className="block font-mono text-[11px] font-bold text-[#C8956B] mt-0.5">
                      {CAFE_CONFIG.currencySymbol}{dish.price}.00
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Cards Strip below the Hero: 1 column on mobile, 3 columns on desktop */}
        {/* Animated with whileInView stagger */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-[#F5E9DA]/10 grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#1A0F0A]/60 border border-[#F5E9DA]/10 backdrop-blur-sm"
          >
            <div className="p-2.5 rounded-xl bg-[#C8956B]/15 text-[#C8956B] shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5E9DA]">
                Direct Trade Origin
              </h4>
              <p className="text-xs text-[#F5E9DA]/65 mt-0.5">
                Ethically sourced directly from micro-lot estates
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#1A0F0A]/60 border border-[#F5E9DA]/10 backdrop-blur-sm"
          >
            <div className="p-2.5 rounded-xl bg-[#C8956B]/15 text-[#C8956B] shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5E9DA]">
                Fresh Convection Roasts
              </h4>
              <p className="text-xs text-[#F5E9DA]/65 mt-0.5">
                Roasted in small 12kg batches every morning
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#1A0F0A]/60 border border-[#F5E9DA]/10 backdrop-blur-sm"
          >
            <div className="p-2.5 rounded-xl bg-[#C8956B]/15 text-[#C8956B] shrink-0">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5E9DA]">
                Table-Ready 3D AR
              </h4>
              <p className="text-xs text-[#F5E9DA]/65 mt-0.5">
                Inspect scale & aesthetics in your space before ordering
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
