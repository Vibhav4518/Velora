import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { PriceDisplay } from '../components/PriceDisplay';
import { EmptyState } from '../components/EmptyState';

export const WishlistPage = () => {
  const { wishlist, loading, moveToCart, toggleWishlist } = useWishlist();
  const items = wishlist.items || [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save items you love to view or purchase them later."
          actionLabel="Explore Catalog"
          actionTo="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} saved item(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const product = item.product;
          if (!product) return null;

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 border border-gray-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Product Image */}
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100">
                  <img
                    src={product.primary_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.discount_percentage > 0 && (
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      {product.discount_percentage}% OFF
                    </span>
                  )}
                </div>

                {/* Product Meta */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    {product.brand_detail?.name || 'Velora'}
                  </span>
                  <Link to={`/products/${product.slug}`} className="block font-bold text-gray-900 hover:text-emerald-600 text-sm line-clamp-1">
                    {product.name}
                  </Link>
                  <div className="mt-1">
                    <PriceDisplay price={product.price} discountPrice={product.discount_price} size="sm" />
                  </div>
                </div>
              </div>

              {/* Unique Actions: Move to Cart & Remove */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => moveToCart(product.id)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
