import React from 'react';

export const PriceDisplay = ({ price, discountPrice, className = '' }) => {
  const numPrice = Number(price) || 0;
  const numDiscount = discountPrice !== null && discountPrice !== undefined ? Number(discountPrice) : null;

  if (numDiscount !== null && numDiscount < numPrice) {
    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        <span className="text-lg font-bold text-emerald-600">${numDiscount.toFixed(2)}</span>
        <span className="text-sm font-normal text-gray-400 line-through">${numPrice.toFixed(2)}</span>
      </div>
    );
  }

  return <span className={`text-lg font-bold text-gray-900 ${className}`}>${numPrice.toFixed(2)}</span>;
};
