import React, { useState } from 'react';
import { Star, CheckCircle, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types/cafe';
import { saveOrderRating } from '../services/orderService';

interface RatingReviewCardProps {
  order: Order;
  onRatingSaved?: () => void;
}

export const RatingReviewCard: React.FC<RatingReviewCardProps> = ({
  order,
  onRatingSaved,
}) => {
  const isCompleted = order.status === 'delivered' || order.status === 'served';
  const existingRating = order.rating;

  const [rating, setRating] = useState<number>(existingRating?.stars || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingRating?.comment || '');
  const [submitted, setSubmitted] = useState<boolean>(!!existingRating);

  if (!isCompleted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveOrderRating(order.id, rating, comment);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#C8956B', '#F5E9DA', '#FFFFFF'],
      });
    } catch (e) {
      // safe fallback
    }

    if (onRatingSaved) onRatingSaved();
  };

  return (
    <div className="w-full p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#2B1810]/85 via-[#1A0F0A] to-[#140A06] border border-[#C8956B]/40 shadow-2xl text-center space-y-4">
      {/* Celebratory badge */}
      <div className="w-12 h-12 rounded-full bg-[#C8956B]/20 text-[#C8956B] border border-[#C8956B]/40 flex items-center justify-center mx-auto shadow-lg">
        <Sparkles className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C8956B] font-bold">
          Celebratory Milestone
        </span>
        <h3 className="font-serif text-2xl text-[#F5E9DA]">
          {order.orderType === 'delivery'
            ? 'Order Delivered Successfully!'
            : 'Served to Your Table!'}
        </h3>
        <p className="text-xs text-[#F5E9DA]/75 max-w-sm mx-auto leading-relaxed">
          We hope your specialty roast and fresh bakes hit every single tasting note. How was your experience with BREW.?
        </p>
      </div>

      {submitted ? (
        <div className="p-4 rounded-2xl bg-[#140A06] border border-[#C8956B]/30 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
            <CheckCircle className="w-4 h-4" />
            <span>Thank you for your rating!</span>
          </div>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= (existingRating?.stars || rating)
                    ? 'fill-[#C8956B] text-[#C8956B]'
                    : 'text-[#F5E9DA]/20'
                }`}
              />
            ))}
          </div>
          {comment && (
            <p className="text-xs text-[#F5E9DA]/80 italic pt-1 max-w-xs mx-auto">
              "{comment}"
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1 max-w-md mx-auto">
          {/* Interactive 5 Star Selector */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-[#C8956B] text-[#C8956B]'
                      : 'text-[#F5E9DA]/25 hover:text-[#C8956B]/60'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Optional comment text */}
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share quick tasting notes or barista feedback (optional)..."
            className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#140A06] border border-[#F5E9DA]/15 text-[#F5E9DA] placeholder:text-[#F5E9DA]/35 focus:outline-none focus:border-[#C8956B] resize-none"
          />

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-colors shadow-lg active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Submit Review</span>
          </button>
        </form>
      )}
    </div>
  );
};
