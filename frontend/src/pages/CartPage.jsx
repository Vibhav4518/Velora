import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PriceDisplay } from '../components/PriceDisplay';
import { EmptyState } from '../components/EmptyState';

export const CartPage = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];
  const subtotal = Number(cart.subtotal) || 0;
  const estimatedShipping = subtotal >= 100 || subtotal === 0 ? 0 : 10;
  const estimatedTax = subtotal * 0.08;
  const grandTotal = subtotal + estimatedShipping + estimatedTax;

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
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Explore our luxury collection and discover precision crafted items."
          actionLabel="Start Shopping"
          actionTo="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-1">{cart.total_items} items in your bag</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.product?.primary_image_url || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80'}
                  alt={item.product?.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                />
                <div className="space-y-1">
                  <Link to={`/products/${item.product?.slug}`} className="font-bold text-gray-900 hover:text-emerald-600 text-sm line-clamp-1">
                    {item.product?.name}
                  </Link>
                  <p className="text-xs text-gray-400">SKU: {item.product?.sku}</p>
                  <PriceDisplay price={item.unit_price} className="text-sm" />
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-xl bg-white font-bold hover:bg-gray-100 flex items-center justify-center text-sm shadow-2xs"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-white font-bold hover:bg-gray-100 flex items-center justify-center text-sm shadow-2xs"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${(Number(item.total_price) || 0).toFixed(2)}</p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all"
                  title="Remove Item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-600 pt-4">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6 sticky top-28">
            <h3 className="font-serif text-xl font-bold text-gray-900 pb-4 border-b border-gray-100">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Est. Shipping</span>
                <span className="font-semibold text-gray-900">
                  {estimatedShipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${estimatedShipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Est. Tax (8%)</span>
                <span className="font-semibold text-gray-900">${estimatedTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-emerald-600">${grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
