import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReservationData } from '../types/cafe';

export const ReservationSection: React.FC = () => {
  const [formData, setFormData] = useState<ReservationData>({
    name: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    guests: 2,
    seating: 'Barista Counter',
    specialRequests: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const timeSlots = [
    '08:30 AM',
    '10:00 AM',
    '11:30 AM',
    '01:00 PM',
    '03:30 PM',
    '05:00 PM',
    '06:30 PM',
    '08:00 PM',
  ];

  const seatingOptions: ReservationData['seating'][] = [
    'Barista Counter',
    'Sunlit Garden',
    'Library Nook',
    'Main Roastery Hall',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    setIsSubmitted(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#C8956B', '#F5E9DA', '#FFFFFF'],
      });
    } catch (e) {
      // safe fallback if canvas is restricted
    }
  };

  return (
    <section id="reservation" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C8956B]">
            Table & Cupping Sessions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F5E9DA]">
            Reserve Your Experience
          </h2>
          <p className="text-sm text-[#F5E9DA]/70 max-w-lg mx-auto font-light">
            Book an intimate pour-over tasting at our Barista Counter or a quiet afternoon table in the Garden.
          </p>
        </div>

        {/* Card Container */}
        <div className="relative p-6 sm:p-10 rounded-[36px] bg-gradient-to-b from-[#1F120B] to-[#140A06] border border-[#C8956B]/30 shadow-2xl">
          
          {isSubmitted ? (
            <div className="py-12 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#C8956B]/20 text-[#C8956B] flex items-center justify-center mx-auto border border-[#C8956B]/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#F5E9DA]">
                  Table Reserved for {formData.name}
                </h3>
                <p className="text-sm text-[#F5E9DA]/70 max-w-md mx-auto">
                  A concierge confirmation has been sent to <span className="text-[#C8956B]">{formData.email}</span>. We look forward to hosting you on{' '}
                  <span className="text-[#F5E9DA] font-medium">{formData.date}</span> at{' '}
                  <span className="text-[#F5E9DA] font-medium">{formData.time}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#140A06]/80 border border-[#F5E9DA]/10 max-w-sm mx-auto text-xs text-left space-y-1.5 font-mono">
                <div className="flex justify-between text-[#F5E9DA]/60">
                  <span>Guests:</span>
                  <span className="text-[#F5E9DA]">{formData.guests} Persons</span>
                </div>
                <div className="flex justify-between text-[#F5E9DA]/60">
                  <span>Seating:</span>
                  <span className="text-[#F5E9DA]">{formData.seating}</span>
                </div>
                <div className="flex justify-between text-[#F5E9DA]/60">
                  <span>Contact:</span>
                  <span className="text-[#F5E9DA]">{formData.phone}</span>
                </div>
              </div>

              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 rounded-full border border-[#C8956B]/40 text-xs font-semibold uppercase tracking-wider text-[#F5E9DA] hover:bg-[#C8956B] hover:text-[#140A06] transition-colors cursor-pointer"
              >
                Book Another Table
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Guests & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Guest Count */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
                    Party Size
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 6, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({ ...formData, guests: num })}
                        className={`flex-1 py-2.5 text-xs font-mono font-medium rounded-xl border transition-all cursor-pointer ${
                          formData.guests === num
                            ? 'border-[#C8956B] bg-[#C8956B] text-[#140A06] font-bold shadow-md'
                            : 'border-[#F5E9DA]/10 hover:border-[#C8956B]/40 text-[#F5E9DA]'
                        }`}
                      >
                        {num}{num === 8 ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
                    Reservation Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] focus:outline-none focus:border-[#C8956B] font-mono cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Time Slots */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {timeSlots.map((slot) => {
                    const isSelected = formData.time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({ ...formData, time: slot })}
                        className={`py-2 text-xs font-mono rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#C8956B] bg-[#C8956B] text-[#140A06] font-bold'
                            : 'border-[#F5E9DA]/10 hover:border-[#C8956B]/40 text-[#F5E9DA]/80'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Seating Preference */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[#F5E9DA]/70 font-semibold">
                  Seating Experience
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {seatingOptions.map((opt) => {
                    const isSelected = formData.seating === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData({ ...formData, seating: opt })}
                        className={`p-2.5 text-xs text-left rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#C8956B] bg-[#2B1810] text-[#C8956B] font-semibold'
                            : 'border-[#F5E9DA]/10 hover:border-[#C8956B]/40 text-[#F5E9DA]/70'
                        }`}
                      >
                        <span className="block">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-[#F5E9DA]/60">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Elena Rostova"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none focus:border-[#C8956B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-[#F5E9DA]/60">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="elena@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none focus:border-[#C8956B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-[#F5E9DA]/60">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none focus:border-[#C8956B]"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-[#F5E9DA]/60">
                  Tasting Notes or Dietary Preferences (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Celebrating an anniversary, prefer oat milk pour-over..."
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] placeholder:text-[#F5E9DA]/30 focus:outline-none focus:border-[#C8956B]"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#F5E9DA] hover:bg-[#C8956B] text-[#140A06] font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl cursor-pointer active:scale-[0.99]"
                >
                  Confirm Table Reservation
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
