import React from 'react';
import { Star } from 'lucide-react';

export const Rating = ({ rating = 0, count, className = '' }) => {
  const numRating = Number(rating) || 0;

  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(numRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="font-semibold text-gray-700 ml-1">{numRating.toFixed(1)}</span>
      {count !== undefined && <span className="text-gray-400 text-xs">({count})</span>}
    </div>
  );
};
