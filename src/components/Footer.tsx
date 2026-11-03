import React, { useState } from 'react';
import { ArrowRight, Check, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { CAFE_CONFIG } from '../config/cafeConfig';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="pt-20 pb-12 border-t border-[#C8956B]/20 bg-[#0F0704] text-[#F5E9DA] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-[#F5E9DA]/10">
          
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2">
              <span className="font-serif text-3xl font-bold tracking-tight text-[#F5E9DA]">
                {CAFE_CONFIG.brandName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8956B]" />
            </div>

            <p className="text-xs sm:text-sm text-[#F5E9DA]/70 max-w-sm font-light leading-relaxed">
              {CAFE_CONFIG.subheading} Direct trade single origins, slow convective roasts, and an interactive tabletop augmented reality menu.
            </p>

            {/* Newsletter Input */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-[#C8956B] mb-2">
                Join the Roasters Journal
              </span>
              <form onSubmit={handleSubscribe} className="flex max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs rounded-l-full bg-[#1A0F0A] border border-[#F5E9DA]/20 text-[#F5E9DA] placeholder:text-[#F5E9DA]/40 focus:outline-none focus:border-[#C8956B]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-r-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] text-xs font-semibold tracking-wider transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  {subscribed ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              {subscribed && (
                <span className="text-[11px] text-emerald-400 mt-1.5 block">
                  Thank you! You're on our private tasting dispatch list.
                </span>
              )}
            </div>
          </div>

          {/* Column 2: Roastery Hours */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#C8956B]">
              Opening Hours
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F5E9DA]/70 font-mono">
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#C8956B] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[#F5E9DA]">Monday – Friday</div>
                  <div>{CAFE_CONFIG.contact.hoursWeekday}</div>
                </div>
              </li>
              <li className="flex items-start gap-2 pt-2">
                <Clock className="w-3.5 h-3.5 text-[#C8956B] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[#F5E9DA]">Saturday – Sunday</div>
                  <div>{CAFE_CONFIG.contact.hoursWeekend}</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 3: Location & Concierge */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#C8956B]">
              Location & Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F5E9DA]/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C8956B] mt-0.5 shrink-0" />
                <span>{CAFE_CONFIG.contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C8956B] shrink-0" />
                <span className="font-mono">{CAFE_CONFIG.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C8956B] shrink-0" />
                <span>{CAFE_CONFIG.contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Links & Social */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#C8956B]">
              Digital & Social
            </h4>
            <ul className="space-y-2 text-xs text-[#F5E9DA]/70">
              {CAFE_CONFIG.socials.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#C8956B] transition-colors flex items-center justify-between"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] text-[#F5E9DA]/40">{s.handle}</span>
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href="#hero"
                  className="text-[#C8956B] hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>Back to Top</span>
                  <span>↑</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5E9DA]/40 font-mono">
          <div>
            © {new Date().getFullYear()} {CAFE_CONFIG.brandName} All rights reserved.
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            <a href="#/track" className="hover:text-[#C8956B] transition-colors">
              Track Order
            </a>
            <span>·</span>
            <a href="#/admin" className="hover:text-[#C8956B] transition-colors">
              Operator Console
            </a>
            <span>·</span>
            <span>WebXR Enabled</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
