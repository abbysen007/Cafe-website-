import React, { useState, useEffect, useRef } from 'react';
import { CAFE_CONFIG } from '../config/cafeConfig';

export const MarqueeTicker: React.FC = () => {
  const [speedDuration, setSpeedDuration] = useState(32);
  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());
  const velocityRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(1, now - lastTime.current);
      const dy = Math.abs(window.scrollY - lastScrollY.current);
      const instantVelocity = dy / dt; // pixels per ms

      velocityRef.current = Math.min(2.5, velocityRef.current * 0.7 + instantVelocity * 0.3);
      lastScrollY.current = window.scrollY;
      lastTime.current = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Smoothly decay velocity and update animation duration
    const tick = () => {
      velocityRef.current *= 0.94; // friction decay
      // Normal duration: 32s; at peak velocity: drops down to 10s
      const calculatedDuration = Math.max(10, 32 - velocityRef.current * 9);
      setSpeedDuration(calculatedDuration);
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const items = [
    CAFE_CONFIG.brandName,
    'SPECIALTY COFFEE',
    'SINGLE ORIGIN ESPRESSO',
    '24H COLD DRIP',
    'ARTISAN BAKERY',
    'TABLE AR PREVIEW',
    'EST. 2018',
    'ETHICALLY ROASTED',
    'FRENCH BUTTER CROISSANTS',
    'MICRO-LOT ARCHIVES',
  ];

  // Repeat for continuous seamless marquee
  const stream = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden py-4 sm:py-5 border-y border-[#C8956B]/20 bg-[#1A0F0A]/80 backdrop-blur-md">
      {/* Edge gradient smooth fades */}
      <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-28 bg-gradient-to-r from-[#140A06] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-28 bg-gradient-to-l from-[#140A06] to-transparent z-10 pointer-events-none" />

      <div
        className="animate-marquee flex items-center gap-8 whitespace-nowrap will-change-transform"
        style={{ animationDuration: `${speedDuration}s` }}
      >
        {stream.map((text, idx) => (
          <div key={idx} className="flex items-center gap-8">
            <span
              className={`text-xs sm:text-sm uppercase tracking-[0.25em] font-medium ${
                text === CAFE_CONFIG.brandName
                  ? 'font-serif font-bold text-[#C8956B] text-sm sm:text-base tracking-[0.3em]'
                  : 'text-[#F5E9DA]/70 font-sans'
              }`}
            >
              {text}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8956B]/40" />
          </div>
        ))}
      </div>
    </div>
  );
};
