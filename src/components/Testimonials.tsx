import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from '../config/cafeConfig';

export const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => {
    setActiveIndex((current) => (current === 0 ? TESTIMONIALS.length - 1 : current - 1));
  };

  const next = () => {
    setActiveIndex((current) => (current === TESTIMONIALS.length - 1 ? 0 : current + 1));
  };

  const current = TESTIMONIALS[activeIndex];

  return (
    <section className="py-20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Section Header */}
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C8956B]">
            Patron Chronicles
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#F5E9DA]">
            Words from Our Community
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="relative p-8 sm:p-12 rounded-[36px] bg-gradient-to-b from-[#1F120B] to-[#140A06] border border-[#C8956B]/30 shadow-2xl">
          <Quote className="w-12 h-12 text-[#C8956B]/20 absolute top-8 right-8 pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* 5 Stars */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C8956B] text-[#C8956B]" />
              ))}
            </div>

            {/* Quote Body */}
            <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl text-[#F5E9DA] font-normal leading-relaxed italic">
              "{current.quote}"
            </blockquote>

            {/* Author info & favorite brew */}
            <div className="pt-6 border-t border-[#F5E9DA]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={current.avatar}
                  alt={current.author}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-[#C8956B]/40"
                />
                <div>
                  <h4 className="font-serif text-base text-[#F5E9DA] font-medium">
                    {current.author}
                  </h4>
                  <p className="text-xs text-[#F5E9DA]/60">
                    {current.role}
                  </p>
                </div>
              </div>

              <div className="text-xs text-[#C8956B] font-mono bg-[#2B1810] px-3.5 py-1.5 rounded-full border border-[#C8956B]/30 self-start sm:self-center">
                Favorite: {current.favoriteDish}
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={prev}
              className="p-3 rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] hover:bg-[#C8956B] transition-colors cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-[#F5E9DA]/40">
              0{activeIndex + 1} / 0{TESTIMONIALS.length}
            </span>
            <button
              onClick={next}
              className="p-3 rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] hover:bg-[#C8956B] transition-colors cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
