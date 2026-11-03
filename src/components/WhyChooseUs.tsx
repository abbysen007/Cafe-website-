import React from 'react';
import { Sparkles, Flame, Wheat, Box } from 'lucide-react';
import { FEATURES_DATA } from '../config/cafeConfig';

export const WhyChooseUs: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Wheat':
        return <Wheat className="w-5 h-5" />;
      case 'Box':
        return <Box className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#C8956B]">
            <span>The BREW Philosophy</span>
            <span>·</span>
            <span>Uncompromising Standard</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F5E9DA] tracking-tight">
            Crafted for the Discerning Palate
          </h2>
          <p className="text-sm sm:text-base text-[#F5E9DA]/70 font-light">
            Every cup and bake is the convergence of single-origin provenance, calibrated science, and warm hospitality.
          </p>
        </div>

        {/* 4 Arch / Rounded Outline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_DATA.map((feature, idx) => (
            <div
              key={feature.id}
              className="group relative p-7 rounded-[28px] bg-gradient-to-b from-[#1F120B] to-[#140A06] border border-[#F5E9DA]/10 hover:border-[#C8956B]/50 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#C8956B]/10 flex flex-col justify-between"
            >
              {/* Subtle top-right index */}
              <div className="flex items-center justify-between mb-8">
                <div className="p-3.5 rounded-2xl bg-[#2B1810] text-[#C8956B] border border-[#C8956B]/20 group-hover:scale-110 group-hover:bg-[#C8956B] group-hover:text-[#140A06] transition-all duration-300">
                  {getIcon(feature.icon)}
                </div>
                <span className="font-mono text-xs text-[#F5E9DA]/30 font-semibold">
                  0{idx + 1}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold tracking-widest uppercase text-[#C8956B]">
                  {feature.subtitle}
                </div>
                <h3 className="font-serif text-xl font-medium text-[#F5E9DA] group-hover:text-[#C8956B] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#F5E9DA]/65 leading-relaxed pt-1">
                  {feature.description}
                </p>
              </div>

              {/* Bottom decorative hairline */}
              <div className="mt-6 pt-4 border-t border-[#F5E9DA]/5 flex items-center justify-between text-[11px] text-[#F5E9DA]/40">
                <span>Verified Quality</span>
                <span className="text-[#C8956B] opacity-0 group-hover:opacity-100 transition-opacity">
                  ✦
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
