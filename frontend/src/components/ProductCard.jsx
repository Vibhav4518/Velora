import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { PriceDisplay } from './PriceDisplay';
import { Rating } from './Rating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80';
  const imageUrl = imgError || !product.primary_image_url ? fallbackImage : product.primary_image_url;
  const inWish = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/products/${product.slug}`}>
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md">
            -{product.discount_percentage}% OFF
          </div>
        )}

        {/* Stock Status */}
        {product.stock_quantity <= 0 ? (
          <div className="absolute bottom-3 left-3 bg-gray-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
            Out of Stock
          </div>
        ) : product.stock_quantity <= (product.low_stock_threshold || 5) ? (
          <div className="absolute bottom-3 left-3 bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
            Only {product.stock_quantity} left
          </div>
        ) : null}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all duration-200 ${
            inWish
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/80 hover:bg-white text-gray-600 hover:text-rose-600'
          }`}
          title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-600' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">
            {product.brand_detail?.name || product.category_detail?.name || 'Velora'}
          </div>

          {/* Name */}
          <Link
            to={`/products/${product.slug}`}
            className="font-semibold text-gray-900 hover:text-emerald-600 line-clamp-2 transition-colors mb-2"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <Rating rating={product.rating} count={product.review_count} className="mb-3" />
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <PriceDisplay price={product.price} discountPrice={product.discount_price} />

          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0 || adding}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm ${
              product.stock_quantity <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 hover:bg-emerald-600 text-white hover:shadow-emerald-200 hover:shadow-lg'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{adding ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
