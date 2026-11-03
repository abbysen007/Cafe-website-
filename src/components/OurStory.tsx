import React, { useState, useEffect } from 'react';
import { Award, Compass, Heart, Coffee } from 'lucide-react';
import { CAFE_CONFIG } from '../config/cafeConfig';

export const OurStory: React.FC = () => {
  // Simple animated counters
  const [counts, setCounts] = useState({
    years: 0,
    cups: 0,
    satisfaction: 0,
    origins: 0,
  });

  useEffect(() => {
    const duration = 2000;
    const steps = 40;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounts({
        years: Math.round(8 * progress),
        cups: Math.round(450 * progress),
        satisfaction: Math.round(98 * progress),
        origins: Math.round(14 * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="story" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Big Editorial Image Column (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[36px] overflow-hidden border border-[#C8956B]/30 shadow-2xl bg-[#1F120B]">
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80"
                alt="Master barista pour-over at BREW"
                referrerPolicy="no-referrer"
                className="w-full h-[480px] sm:h-[540px] object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-transparent to-transparent opacity-80" />

              {/* Floating Story Stamp */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#140A06]/85 backdrop-blur-md border border-[#C8956B]/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#C8956B]/20 text-[#C8956B]">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-serif font-bold text-[#F5E9DA] block">
                      The Roastery Chamber
                    </span>
                    <span className="text-[11px] text-[#F5E9DA]/60">
                      Bengaluru, Karnataka • Roasting Micro-Lots
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative gold hairline corner frame */}
            <div className="hidden sm:block absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#C8956B]/40 rounded-tl-3xl pointer-events-none" />
            <div className="hidden sm:block absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-[#C8956B]/40 rounded-br-3xl pointer-events-none" />
          </div>

          {/* Prose & Quantitative Counter Column (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#C8956B]">
                Origins & Legacy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#F5E9DA] leading-[1.1] font-normal">
                Born from an Obsession with Single Origins.
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#F5E9DA]/75 font-light leading-relaxed">
              <p>
                {CAFE_CONFIG.brandName} began with a simple conviction: coffee is not an ordinary commodity,
                but an agricultural work of art. We work directly with smallholder estates across Ethiopia,
                Guatemala, Panama, and the Western Ghats to curate lots with certified cup scores above 87+.
              </p>
              <p>
                Inside our espresso bar and roastery, science meets sensory tranquility. From 24-hour slow drip
                towers to 27-layer lamination pastries baked before sunrise, everything is produced with
                architectural intentionality.
              </p>
            </div>

            {/* Animated Counters (Reference 3) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-[#F5E9DA]/10">
              
              <div className="space-y-1">
                <div className="font-mono text-3xl sm:text-4xl font-bold text-[#C8956B]">
                  {counts.years}+
                </div>
                <div className="text-xs uppercase tracking-wider text-[#F5E9DA]/60">
                  Years of Roasting
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-mono text-3xl sm:text-4xl font-bold text-[#F5E9DA]">
                  {counts.cups}K+
                </div>
                <div className="text-xs uppercase tracking-wider text-[#F5E9DA]/60">
                  Cups Extracted
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-mono text-3xl sm:text-4xl font-bold text-[#C8956B]">
                  {counts.satisfaction}%
                </div>
                <div className="text-xs uppercase tracking-wider text-[#F5E9DA]/60">
                  Happy Patrons
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-mono text-3xl sm:text-4xl font-bold text-[#F5E9DA]">
                  {counts.origins}
                </div>
                <div className="text-xs uppercase tracking-wider text-[#F5E9DA]/60">
                  Direct Origin Farms
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
