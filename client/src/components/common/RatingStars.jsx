import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 5.0, count = null, size = 16, showNumber = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1.5 text-amber-500">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={`${
              i < fullStars
                ? 'fill-amber-400 text-amber-400'
                : i === fullStars && hasHalfStar
                ? 'fill-amber-200 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 ml-0.5">
          {Number(rating).toFixed(1)}
          {count !== null && (
            <span className="font-normal text-slate-400 ml-1">({count})</span>
          )}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
